const SignalementAnnonce = require('../model/signalementAnnonce.model');
const { Propriete } = require('../model/propriete.model');
const sendMail = require('../utils/sendMail');
const { emailTemplate, FRONTEND_URL } = require('../utils/emailTemplate');

const MOTIF_LABELS = {
    fraude: "Annonce frauduleuse",
    deja_indisponible: "Bien déjà loué/vendu",
    informations_incorrectes: "Informations incorrectes",
    autre: "Autre",
};

// AJOUT : création publique — pas d'authentification requise, n'importe
// quel visiteur doit pouvoir signaler une annonce depuis sa fiche. Comme
// pour les demandes de visite, l'agence est récupérée depuis le bien
// lui-même plutôt que reçue du client (IDOR).
module.exports.creerSignalement = async (req, res) => {
    try {
        const { proprieteId, motif, message, contactSignaleur } = req.body;

        if (!proprieteId || !motif || !message?.trim()) {
            return res.status(400).json({ success: false, message: "Le bien, le motif et les détails sont obligatoires." });
        }
        if (!Object.keys(MOTIF_LABELS).includes(motif)) {
            return res.status(400).json({ success: false, message: "Motif invalide." });
        }

        const propriete = await Propriete.findOne({ _id: proprieteId, deletedAt: null }).populate('agence');
        if (!propriete) {
            return res.status(404).json({ success: false, message: "Ce bien n'existe pas ou n'est plus disponible." });
        }

        const signalement = await SignalementAnnonce.create({
            propriete: propriete._id,
            agence: propriete.agence._id,
            motif,
            message: message?.trim() || null,
            contactSignaleur: contactSignaleur?.trim() || null,
        });

        // AJOUT : notifie l'admin par email — un signalement mérite d'être
        // vu rapidement, pas découvert seulement au prochain passage sur le
        // dashboard.
        sendMail(
            "Nouveau signalement d'annonce",
            emailTemplate({
                title: "Signalement reçu",
                bodyHtml: `<p>Une annonce a été signalée : <strong>${MOTIF_LABELS[motif]}</strong>.</p>
                    <p>Agence concernée : ${propriete.agence.nom_agence}</p>
                    ${signalement.message ? `<p>Message : ${signalement.message}</p>` : ''}`,
                ctaText: "Voir les signalements",
                ctaUrl: `${FRONTEND_URL}/dashboard/signalements`,
            }),
            "b2techno.manager@gmail.com"
        ).catch((mailErr) => console.error("Erreur d'envoi d'email de signalement (non bloquante) :", mailErr));

        res.status(201).json({ success: true, message: "Merci, votre signalement a bien été transmis." });
    } catch (err) {
        console.error("Erreur lors de la création du signalement :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'envoi de votre signalement." });
    }
};

// AJOUT : réservé à l'admin — un signalement concerne la modération de la
// plateforme dans son ensemble, pas la gestion d'une agence en particulier
// (contrairement aux demandes de visite, qu'une agence doit voir pour les
// siennes).
module.exports.getSignalements = async (req, res) => {
    try {
        const signalements = await SignalementAnnonce.find()
            .populate({ path: 'propriete', select: '__t typeOffre prix quartier images statut', populate: { path: 'quartier', populate: 'ville' } })
            .populate('agence', 'nom_agence')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, signalements });
    } catch (err) {
        console.error("Erreur lors de la récupération des signalements :", err);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

module.exports.updateStatutSignalement = async (req, res) => {
    try {
        const { statut } = req.body;
        if (!['nouveau', 'en_cours', 'traite', 'rejete'].includes(statut)) {
            return res.status(400).json({ success: false, message: "Statut invalide." });
        }

        const signalement = await SignalementAnnonce.findByIdAndUpdate(
            req.params.id,
            { statut },
            { new: true, runValidators: true }
        );
        if (!signalement) {
            return res.status(404).json({ success: false, message: "Signalement introuvable." });
        }

        res.status(200).json({ success: true, message: "Statut mis à jour.", signalement });
    } catch (err) {
        console.error("Erreur lors de la mise à jour du signalement :", err);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};
