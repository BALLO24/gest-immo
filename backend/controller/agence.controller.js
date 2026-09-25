const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Agence = require('../model/agence.model');
const User = require('../model/user.model');
const { Propriete } = require('../model/propriete.model');
const { capitalizeWords, slugify } = require('../utils/formatText');
const sendMail = require('../utils/sendMail');
const { emailTemplate, FRONTEND_URL } = require('../utils/emailTemplate');

// CORRIGÉ EN PROFONDEUR : depuis la séparation Agence/User, créer une agence
// depuis le panneau admin doit créer DEUX documents liés (Agence + User) de
// façon atomique — soit les deux réussissent, soit aucun n'est enregistré.
// On utilise une transaction Mongoose pour ça (nécessite MongoDB en replica
// set, ce qui est le cas par défaut sur Atlas ; en local avec un mongod seul,
// les transactions échoueront — dans ce cas, retirez session/transaction et
// acceptez le risque d'incohérence partielle en cas de crash entre les deux
// créations, ou passez en replica set local à un seul nœud).
module.exports.addAgence = async (req, res) => {
    const {
        nom_agence,
        nom_proprietaire,
        prenom_proprietaire, // AJOUT : addAgenceModal.jsx envoie prénom/nom séparément
        telephonePublic,
        emailPublic,
        description,
        // identifiants de connexion (-> User)
        nomUtilisateur,
        numero_telephone,
        email,
        password,
    } = req.body;

    if (!nom_agence || !nom_proprietaire || !numero_telephone || !password || !nomUtilisateur) {
        return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs obligatoires !" });
    }

    // Le modèle Agence n'a qu'un seul champ "nom_proprietaire" (nom complet).
    // On fusionne prénom + nom ici plutôt que d'ajouter un champ séparé au
    // modèle pour une distinction qui n'est utile qu'à la saisie.
    const nomProprietaireComplet = prenom_proprietaire
        ? `${prenom_proprietaire.trim()} ${nom_proprietaire.trim()}`.trim()
        : nom_proprietaire.trim();

    const nomAgenceFormate = capitalizeWords(nom_agence);
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const isExist = await Agence.findOne({ nom_agence: nomAgenceFormate }).session(session);
        if (isExist) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Une agence avec ce nom existe déjà !" });
        }

        const [newAgence] = await Agence.create(
            [
                {
                    nom_agence: nomAgenceFormate,
                    nom_proprietaire: nomProprietaireComplet,
                    telephonePublic,
                    emailPublic,
                    description,
                    slug: slugify(nomAgenceFormate),
                    // Une agence créée directement par un admin est considérée
                    // approuvée d'emblée (contrairement à l'auto-inscription
                    // publique, voir auth.controller.registerAgence -> 'inactive').
                    statut: 'active',
                },
            ],
            { session }
        );

        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUser] = await User.create(
            [
                {
                    nom: nomUtilisateur,
                    numero_telephone,
                    email,
                    password: hashedPassword,
                    role: 'agence',
                    agence: newAgence._id,
                    statut: 'active',
                },
            ],
            { session }
        );

        await session.commitTransaction();
        res.status(201).json({
            success: true,
            message: "Agence ajoutée avec succès !",
            agence: newAgence,
            user: { _id: newUser._id, nom: newUser.nom, role: newUser.role },
        });
    } catch (err) {
        await session.abortTransaction();
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Nom d'agence, numéro de téléphone, email ou nom d'utilisateur déjà utilisé.",
            });
        }
        console.error("Erreur lors de l'ajout de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'ajout de l'agence !" });
    } finally {
        session.endSession();
    }
};

// Récupérer toutes les agences
// AJOUT : filtre optionnel par statut (?statut=active) pour un panneau admin
module.exports.getAllAgences = async (req, res) => {
    try {
        const filtre = {};
        if (req.query.statut) filtre.statut = req.query.statut;
        const agences = await Agence.find(filtre).sort({ nom_agence: 1 });
        res.status(200).json({ success: true, agences });
    } catch (err) {
        console.error("Erreur lors de la récupération des agences :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des agences" });
    }
};

// AJOUT : le détail d'une agence, avec son compte User associé (sans le mot
// de passe) — absent du controller d'origine.
module.exports.getAgenceById = async (req, res) => {
    try {
        const agence = await Agence.findById(req.params.id);
        if (!agence) {
            return res.status(404).json({ success: false, message: "Agence non trouvée" });
        }
        const user = await User.findOne({ agence: agence._id }).select('-password');
        res.status(200).json({ success: true, agence, user });
    } catch (err) {
        console.error("Erreur lors de la récupération de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération de l'agence" });
    }
};

// CORRIGÉ (retour en arrière) : je les avais séparés en deux endpoints par
// souci de séparation des responsabilités, mais UpdateAgenceModal.jsx envoie
// tout (profil agence + identifiants) en un seul appel PUT. Plutôt que
// d'imposer au frontend d'appeler deux endpoints, un seul endpoint répartit
// en interne les champs entre Agence et User — même résultat, sans casser
// l'UI existante.
module.exports.updateAgence = async (req, res) => {
    try {
        const agenceId = req.params.id;
        const {
            nom_agence,
            nom_proprietaire,
            telephonePublic,
            emailPublic,
            adresse, // CORRIGÉ : oublié lors de la première écriture de cet endpoint
            logo,    // CORRIGÉ : idem — le champ existe dans le modèle depuis le début
            description,
            statut,
            // identifiants de connexion (-> User)
            nomUtilisateur,
            numero_telephone,
            email,
            password,
        } = req.body;

        if (!nom_agence || !nom_proprietaire) {
            return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs obligatoires !" });
        }
        const nomAgenceFormate = capitalizeWords(nom_agence);
        const existingAgence = await Agence.findOne({ nom_agence: nomAgenceFormate, _id: { $ne: agenceId } });
        if (existingAgence) {
            return res.status(400).json({ success: false, message: "Une autre agence avec ce nom existe déjà !" });
        }

        // AJOUT : on lit le statut AVANT modification, pour ne notifier
        // l'agence que lors d'une vraie transition vers 'active' — pas à
        // chaque fois qu'un admin enregistre le formulaire alors qu'elle
        // était déjà active.
        const agenceAvant = await Agence.findById(agenceId).select('statut');
        if (!agenceAvant) {
            return res.status(404).json({ success: false, message: "Agence non trouvée" });
        }
        const vientDetreActivee = agenceAvant.statut !== 'active' && statut === 'active';

        const updatedAgence = await Agence.findByIdAndUpdate(
            agenceId,
            {
                nom_agence: nomAgenceFormate,
                nom_proprietaire,
                telephonePublic,
                emailPublic,
                adresse,
                logo,
                description,
                slug: slugify(nomAgenceFormate),
                ...(statut && { statut }),
            },
            { new: true, runValidators: true }
        );
        if (!updatedAgence) {
            return res.status(404).json({ success: false, message: "Agence non trouvée" });
        }

        // AJOUT : avant, une agence activée n'était prévenue de rien — elle
        // devait deviner en réessayant de se connecter. Envoyé seulement si
        // le compte de connexion a un email (optionnel dans ce système).
        if (vientDetreActivee) {
            const compteUser = await User.findOne({ agence: agenceId });
            if (compteUser?.email) {
                sendMail(
                    "Votre compte ImmoMali est activé !",
                    emailTemplate({
                        title: "Compte activé 🎉",
                        bodyHtml: `<p>Bonjour ${compteUser.nom},</p>
                            <p>Bonne nouvelle : votre agence <strong>${updatedAgence.nom_agence}</strong> vient d'être validée.</p>
                            <p>Vous pouvez dès maintenant vous connecter et publier vos annonces.</p>`,
                        ctaText: "Se connecter",
                        ctaUrl: `${FRONTEND_URL}/login`,
                    }),
                    compteUser.email
                ).catch((mailErr) => console.error("Erreur d'envoi d'email d'activation (non bloquante) :", mailErr));
            }
        }

        // Si des identifiants de connexion sont fournis dans le même formulaire,
        // on met aussi à jour le User lié — silencieusement ignoré si aucun de
        // ces champs n'est présent dans la requête.
        if (nomUtilisateur || numero_telephone || email || password) {
            const user = await User.findOne({ agence: agenceId });
            if (user) {
                if (nomUtilisateur) user.nom = nomUtilisateur;
                if (numero_telephone) user.numero_telephone = numero_telephone;
                if (email) user.email = email;
                if (password) user.password = await bcrypt.hash(password, 10);
                await user.save();
            }
        }

        res.status(200).json({ success: true, message: "Agence mise à jour avec succès", agence: updatedAgence });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Nom d'agence, numéro de téléphone ou email déjà utilisé." });
        }
        console.error("Erreur lors de la mise à jour de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour de l'agence" });
    }
};

// CORRIGÉ : suppression en cascade. Avant, seule l'Agence était supprimée en
// laissant le compte de connexion et toutes ses annonces orphelins en base.
// Maintenant : le User lié est supprimé, et les Proprietes de l'agence sont
// archivées (soft delete via deletedAt) plutôt que détruites, pour conserver
// l'historique. Le tout dans une transaction pour rester atomique.
module.exports.deleteAgence = async (req, res) => {
    const agenceId = req.params.id;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const deletedAgence = await Agence.findByIdAndDelete(agenceId).session(session);
        if (!deletedAgence) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Agence non trouvée" });
        }

        await User.deleteMany({ agence: agenceId }).session(session);

        await Propriete.updateMany(
            { agence: agenceId, deletedAt: null },
            { deletedAt: new Date(), statut: 'nonDisponible' }
        ).session(session);

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Agence supprimée avec succès", agence: deletedAgence });
    } catch (err) {
        await session.abortTransaction();
        console.error("Erreur lors de la suppression de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression de l'agence" });
    } finally {
        session.endSession();
    }
};
