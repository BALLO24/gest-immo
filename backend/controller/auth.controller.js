const mongoose = require('mongoose');
const crypto = require('crypto');
const Agence = require('../model/agence.model');
const User = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const { emailTemplate, FRONTEND_URL } = require('../utils/emailTemplate');
const { capitalizeWords, slugify } = require('../utils/formatText');

// AJOUT : durée de validité du lien de réinitialisation de mot de passe.
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

// CORRIGÉ : auto-inscription publique d'une agence -> crée Agence + User liés.
// Différence volontaire avec agence.controller.addAgence (créé par un admin) :
// ici l'agence démarre avec statut 'inactive', en attente de validation par un
// admin, puisque n'importe qui peut soumettre ce formulaire publiquement.
// AJOUT : version des CGU/Politique de Confidentialité en vigueur au moment
// de l'inscription — sert de référence datée en cas de litige. À incrémenter
// manuellement (et mettre à jour la date affichée sur /cgu et /confidentialite
// en même temps) à chaque modification substantielle de ces documents.
const CGU_VERSION = "1.0";

module.exports.registerAgence = async (req, res) => {
    const { nom_agence, nom_proprietaire, numero_telephone, email, password } = req.body;
    if (!nom_agence || !nom_proprietaire || !numero_telephone || !password) {
        return res.status(400).json({ success: false, message: "Tous les champs obligatoires doivent être remplis !" });
    }

    const nomAgenceFormate = capitalizeWords(nom_agence);
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const existingAgence = await Agence.findOne({ nom_agence: nomAgenceFormate }).session(session);
        if (existingAgence) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Une agence avec ce nom existe déjà !" });
        }

        const [newAgence] = await Agence.create(
            [
                {
                    nom_agence: nomAgenceFormate,
                    nom_proprietaire,
                    slug: slugify(nomAgenceFormate),
                    statut: 'inactive', // en attente de validation par un admin
                    // AJOUT : la case à cocher côté frontend bloque déjà la
                    // soumission sans acceptation — on enregistre ici la
                    // preuve elle-même (version + horodatage serveur, pas
                    // une valeur envoyée par le client, pour éviter toute
                    // falsification de la date).
                    cguAcceptees: { version: CGU_VERSION, dateAcceptation: new Date() },
                },
            ],
            { session }
        );

        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUser] = await User.create(
            [
                {
                    nom: nom_proprietaire,
                    numero_telephone,
                    email,
                    password: hashedPassword,
                    role: 'agence',
                    agence: newAgence._id,
                },
            ],
            { session }
        );

        await session.commitTransaction();

        // AJOUT : on ne bloque pas la réponse si l'envoi d'email échoue (SMTP en
        // panne, etc.) — l'inscription en base a déjà réussi et ne doit pas être
        // remise en cause pour un souci de notification.
        sendMail(
            "Bienvenue chez Gest-Immo !",
            emailTemplate({
                title: "Nouvelle inscription d'agence",
                bodyHtml: `<p>L'agence <strong>${nomAgenceFormate}</strong>, de propriétaire "${nom_proprietaire}" (numéro de téléphone ${numero_telephone}), vient de s'inscrire et est en attente de validation.</p>`,
                ctaText: "Voir les agences en attente",
                ctaUrl: `${FRONTEND_URL}/dashboard/agences`,
            }),
            "b2techno.manager@gmail.com"
        ).catch((mailErr) => console.error("Erreur d'envoi d'email (non bloquante) :", mailErr));

        // AJOUT : avant, seul l'admin était notifié de la nouvelle inscription —
        // l'agence elle-même n'avait aucune confirmation par email que sa
        // demande avait bien été reçue. Envoyé seulement si un email a été
        // fourni (il reste optionnel à l'inscription, l'identifiant principal
        // ici est le numéro de téléphone).
        if (email) {
            const dateAcceptation = newAgence.cguAcceptees.dateAcceptation.toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            sendMail(
                "Votre inscription sur Gest-Immo",
                emailTemplate({
                    title: "Inscription reçue",
                    bodyHtml: `<p>Bonjour ${nom_proprietaire},</p>
                        <p>Votre agence <strong>${nomAgenceFormate}</strong> a bien été enregistrée sur Gest-Immo.</p>
                        <p>Elle est actuellement <strong>en attente de validation</strong> par un administrateur. Vous recevrez un email dès que votre compte sera activé et que vous pourrez vous connecter.</p>
                        <p style="margin-top:20px; padding-top:16px; border-top:1px solid #eee; font-size:13px; color:#6b7280;">
                            En vous inscrivant, vous avez accepté nos
                            <a href="${FRONTEND_URL}/cgu">Conditions Générales d'Utilisation</a> et notre
                            <a href="${FRONTEND_URL}/confidentialite">Politique de Confidentialité</a>
                            (version ${CGU_VERSION}, le ${dateAcceptation}). Conservez cet email comme preuve de cette acceptation.
                        </p>
                        <p>Merci de votre confiance.</p>`,
                }),
                email
            ).catch((mailErr) => console.error("Erreur d'envoi d'email à l'agence (non bloquante) :", mailErr));
        }

        res.status(201).json({ success: true, message: "Agence enregistrée avec succès ! Elle sera activée après validation." });
    } catch (err) {
        await session.abortTransaction();
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Numéro de téléphone ou email déjà utilisé !" });
        }
        console.error("Erreur lors de l'enregistrement de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'enregistrement de l'agence !" });
    } finally {
        session.endSession();
    }
};

// CORRIGÉ : login désormais basé sur User (plus sur Agence, qui n'a plus
// d'identifiants). Vérifie le statut du User ET, si c'est un compte agence,
// le statut de l'Agence rattachée (les deux doivent être 'active') — c'était
// un point manquant dans la version précédente.
// CORRIGÉ (bug) : signe le token avec ACCESS_TOKEN_SECRET, la même variable
// que celle utilisée par middleware/auth.js pour le vérifier (avant : signé
// avec JWT_SECRET, vérifié avec ACCESS_TOKEN_SECRET -> échec systématique
// si ces deux variables d'environnement diffèrent).
module.exports.login = async (req, res) => {
    try {
        const { nomUtilisateur, password } = req.body;
        if (!nomUtilisateur || !password) {
            return res.status(400).json({ success: false, message: "Nom d'utilisateur et mot de passe requis !" });
        }

        const user = await User.findOne({
            $or: [{ numero_telephone: nomUtilisateur }, { email: nomUtilisateur }],
        }).populate('agence');

        if (!user) {
            return res.status(400).json({ success: false, message: "Nom d'utilisateur ou mot de passe incorrect !" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Nom d'utilisateur ou mot de passe incorrect !" });
        }

        if (user.statut !== 'active') {
            return res.status(403).json({ success: false, message: "Ce compte est désactivé. Contactez l'administrateur." });
        }
        if (user.role === 'agence' && (!user.agence || user.agence.statut !== 'active')) {
            return res.status(403).json({ success: false, message: "Cette agence est désactivée ou en attente de validation." });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                agenceId: user.agence ? user.agence._id : null,
                nom: user.nom,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ success: true, message: "Connexion réussie !", token });
    } catch (err) {
        console.error("Erreur lors de la connexion :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la connexion !" });
    }
};

// CORRIGÉ : lit req.user (posé par middleware/auth.js), plus req.agenceId qui
// n'était jamais défini — ce qui explique pourquoi ces routes étaient
// commentées dans auth.route.js.
module.exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password').populate('agence');
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error("Erreur lors de la récupération du profil :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération du profil" });
    }
};

// CORRIGÉ : sépare clairement ce qui touche au User (numero_telephone/email)
// de ce qui touche à l'Agence (nom_agence/nom_proprietaire/description...),
// puisque ce sont deux documents distincts désormais.
module.exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        const { nom, numero_telephone, email, nom_agence, nom_proprietaire, description, telephonePublic, emailPublic, adresse, logo } = req.body;

        if (nom) user.nom = nom; // CORRIGÉ : oublié initialement, seul le téléphone/email du User était modifiable
        if (numero_telephone) user.numero_telephone = numero_telephone;
        if (email) user.email = email;
        // CORRIGÉ : validateModifiedOnly — voir commentaire dans changePassword.
        await user.save({ validateModifiedOnly: true });

        if (user.role === 'agence' && user.agence) {
            const agenceUpdates = {};
            if (nom_agence) agenceUpdates.nom_agence = capitalizeWords(nom_agence);
            if (nom_proprietaire) agenceUpdates.nom_proprietaire = nom_proprietaire;
            if (description) agenceUpdates.description = description;
            if (telephonePublic) agenceUpdates.telephonePublic = telephonePublic;
            if (emailPublic) agenceUpdates.emailPublic = emailPublic;
            if (adresse) agenceUpdates.adresse = adresse; // CORRIGÉ : oublié initialement
            if (logo) agenceUpdates.logo = logo;           // CORRIGÉ : oublié initialement
            if (Object.keys(agenceUpdates).length > 0) {
                await Agence.findByIdAndUpdate(user.agence, agenceUpdates, { runValidators: true });
            }
        }

        res.status(200).json({ success: true, message: "Profil mis à jour avec succès !" });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Numéro de téléphone, email ou nom d'agence déjà utilisé." });
        }
        console.error("Erreur lors de la mise à jour du profil :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour du profil !" });
    }
};

// AJOUT : changement de mot de passe — fonctionnalité de base manquante dans
// le controller d'origine (il n'y avait aucun moyen pour un user connecté de
// changer son propre mot de passe sans passer par l'admin).
module.exports.changePassword = async (req, res) => {
    try {
        const { ancienMotDePasse, nouveauMotDePasse } = req.body;
        if (!ancienMotDePasse || !nouveauMotDePasse) {
            return res.status(400).json({ success: false, message: "Ancien et nouveau mot de passe requis !" });
        }
        if (nouveauMotDePasse.length < 8) {
            // CORRIGÉ (point soulevé précédemment) : la longueur minimale se
            // valide ICI, sur le mot de passe en clair, avant hachage — jamais
            // dans le schéma Mongoose où seul le hash (~60 caractères) est stocké.
            return res.status(400).json({ success: false, message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
        }
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }
        const isValid = await bcrypt.compare(ancienMotDePasse, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Ancien mot de passe incorrect !" });
        }
        user.password = await bcrypt.hash(nouveauMotDePasse, 10);
        // CORRIGÉ : validateModifiedOnly évite de revalider tout le document
        // (role/agence...) alors que seul le mot de passe change ici — un
        // compte admin issu d'une promotion manuelle en base (role='admin'
        // mais champ "agence" resté renseigné) faisait échouer ce save() à
        // cause du hook pre('validate') global, sur un champ qu'on ne touche
        // même pas.
        await user.save({ validateModifiedOnly: true });

        // AJOUT : notification de sécurité standard — prévenir la personne
        // qu'un changement a eu lieu, pour qu'elle puisse réagir si ce n'était
        // pas elle. Non bloquant, et seulement si un email est renseigné
        // (optionnel dans ce système, l'identifiant principal est le téléphone).
        if (user.email) {
            sendMail(
                "Votre mot de passe a été modifié",
                emailTemplate({
                    title: "Mot de passe modifié",
                    bodyHtml: `<p>Bonjour ${user.nom},</p>
                        <p>Le mot de passe de votre compte Gest-Immo vient d'être modifié.</p>
                        <p>Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.</p>`,
                    ctaText: "Se connecter",
                    ctaUrl: `${FRONTEND_URL}/login`,
                }),
                user.email
            ).catch((mailErr) => console.error("Erreur d'envoi d'email de confirmation (non bloquante) :", mailErr));
        }

        res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès !" });
    } catch (err) {
        console.error("Erreur lors du changement de mot de passe :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors du changement de mot de passe !" });
    }
};

// AJOUT : demande de réinitialisation de mot de passe — jusqu'ici, une agence
// qui oubliait son mot de passe n'avait aucun moyen de le récupérer elle-même,
// il fallait qu'un admin intervienne manuellement.
// Répond toujours avec le même message générique, que le compte existe ou
// non et qu'il ait un email ou non, pour ne jamais révéler si un identifiant
// donné correspond à un compte existant (énumération de comptes).
module.exports.forgotPassword = async (req, res) => {
    try {
        const { nomUtilisateur } = req.body;
        if (!nomUtilisateur) {
            return res.status(400).json({ success: false, message: "Numéro de téléphone ou email requis !" });
        }

        const genericMessage = "Si un compte associé à ces informations existe et possède un email, un lien de réinitialisation vient de lui être envoyé.";

        const user = await User.findOne({
            $or: [{ numero_telephone: nomUtilisateur }, { email: nomUtilisateur }],
        });

        if (user && user.email) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
            // CORRIGÉ : validateModifiedOnly — voir commentaire dans changePassword.
            await user.save({ validateModifiedOnly: true });

            sendMail(
                "Réinitialisation de votre mot de passe",
                emailTemplate({
                    title: "Réinitialisation de mot de passe",
                    bodyHtml: `<p>Bonjour ${user.nom},</p>
                        <p>Vous avez demandé la réinitialisation du mot de passe de votre compte Gest-Immo. Ce lien est valable 1 heure.</p>
                        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe actuel reste inchangé.</p>`,
                    ctaText: "Réinitialiser mon mot de passe",
                    ctaUrl: `${FRONTEND_URL}/reset-password/${rawToken}`,
                }),
                user.email
            ).catch((mailErr) => console.error("Erreur d'envoi d'email de réinitialisation (non bloquante) :", mailErr));
        }

        res.status(200).json({ success: true, message: genericMessage });
    } catch (err) {
        console.error("Erreur lors de la demande de réinitialisation :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la demande de réinitialisation !" });
    }
};

// AJOUT : finalise la réinitialisation à partir du token reçu par email.
module.exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { nouveauMotDePasse } = req.body;
        if (!token || !nouveauMotDePasse) {
            return res.status(400).json({ success: false, message: "Token et nouveau mot de passe requis !" });
        }
        if (nouveauMotDePasse.length < 8) {
            return res.status(400).json({ success: false, message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ success: false, message: "Ce lien de réinitialisation est invalide ou a expiré." });
        }

        user.password = await bcrypt.hash(nouveauMotDePasse, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        // CORRIGÉ : validateModifiedOnly — voir commentaire dans changePassword.
        await user.save({ validateModifiedOnly: true });

        if (user.email) {
            sendMail(
                "Votre mot de passe a été réinitialisé",
                emailTemplate({
                    title: "Mot de passe réinitialisé",
                    bodyHtml: `<p>Bonjour ${user.nom},</p>
                        <p>Le mot de passe de votre compte Gest-Immo vient d'être réinitialisé.</p>
                        <p>Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.</p>`,
                    ctaText: "Se connecter",
                    ctaUrl: `${FRONTEND_URL}/login`,
                }),
                user.email
            ).catch((mailErr) => console.error("Erreur d'envoi d'email de confirmation (non bloquante) :", mailErr));
        }

        res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter." });
    } catch (err) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la réinitialisation du mot de passe !" });
    }
};

// CORRIGÉ : suppression en cascade (User + Agence + archivage des Proprietes),
// cohérent avec agence.controller.deleteAgence. Un compte 'admin' n'a pas
// d'agence à supprimer, seul le User est retiré dans ce cas.
module.exports.deleteMyAccount = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const user = await User.findById(req.user.userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        if (user.role === 'agence' && user.agence) {
            const { Propriete } = require('../model/propriete.model');
            await Propriete.updateMany(
                { agence: user.agence, deletedAt: null },
                { deletedAt: new Date(), statut: 'nonDisponible' }
            ).session(session);
            await Agence.findByIdAndDelete(user.agence).session(session);
        }
        await User.findByIdAndDelete(user._id).session(session);

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Compte supprimé avec succès !" });
    } catch (err) {
        await session.abortTransaction();
        console.error("Erreur lors de la suppression du compte :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression du compte !" });
    } finally {
        session.endSession();
    }
};
