const DemandeVisite = require('../model/demandeVisite.model');
const { Propriete } = require('../model/propriete.model');
const sendMail = require('../utils/sendMail');
const { emailTemplate, FRONTEND_URL } = require('../utils/emailTemplate');

// AJOUT : création publique d'une demande de visite — pas d'authentification
// requise, n'importe quel visiteur doit pouvoir la soumettre depuis la fiche
// d'un bien. On récupère l'agence directement depuis le bien plutôt que de
// faire confiance à une valeur envoyée par le client (IDOR).
module.exports.creerDemandeVisite = async (req, res) => {
    try {
        const { proprieteId, nomClient, telephoneClient, emailClient, dateSouhaitee, message } = req.body;

        if (!proprieteId || !nomClient || !telephoneClient) {
            return res.status(400).json({ success: false, message: "Le bien, votre nom et votre téléphone sont obligatoires." });
        }

        const propriete = await Propriete.findOne({ _id: proprieteId, deletedAt: null }).populate('agence');
        if (!propriete) {
            return res.status(404).json({ success: false, message: "Ce bien n'existe pas ou n'est plus disponible." });
        }

        const demande = await DemandeVisite.create({
            propriete: propriete._id,
            agence: propriete.agence._id,
            nomClient: nomClient.trim(),
            telephoneClient: telephoneClient.trim(),
            emailClient: emailClient?.trim() || null,
            dateSouhaitee: dateSouhaitee || null,
            message: message?.trim() || null,
        });

        // AJOUT : notifie l'agence par email si elle a un email public —
        // avant, elle n'aurait eu aucun moyen de savoir qu'une demande est
        // arrivée sans que le client la contacte lui-même sur WhatsApp.
        if (propriete.agence.emailPublic) {
            sendMail(
                "Nouvelle demande de visite",
                emailTemplate({
                    title: "Nouvelle demande de visite",
                    bodyHtml: `<p>Bonjour ${propriete.agence.nom_agence},</p>
                        <p><strong>${demande.nomClient}</strong> (${demande.telephoneClient}) souhaite visiter l'un de vos biens.</p>
                        ${demande.dateSouhaitee ? `<p>Date souhaitée : ${new Date(demande.dateSouhaitee).toLocaleDateString('fr-FR')}</p>` : ''}
                        ${demande.message ? `<p>Message : ${demande.message}</p>` : ''}
                        <p>Connectez-vous à votre espace pour confirmer cette visite.</p>`,
                    ctaText: "Voir mes demandes de visite",
                    ctaUrl: `${FRONTEND_URL}/agence`,
                }),
                propriete.agence.emailPublic
            ).catch((mailErr) => console.error("Erreur d'envoi d'email de demande de visite (non bloquante) :", mailErr));
        }

        res.status(201).json({ success: true, message: "Votre demande de visite a bien été envoyée à l'agence." });
    } catch (err) {
        console.error("Erreur lors de la création de la demande de visite :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'envoi de votre demande." });
    }
};

// AJOUT : liste des demandes visibles par l'agence connectée (ou toutes,
// pour un admin) — même logique de portée que le reste de l'app (une
// agence ne voit jamais les demandes d'une autre).
module.exports.getDemandesVisite = async (req, res) => {
    try {
        const filtre = req.user.role === 'admin' ? {} : { agence: req.user.agenceId };

        const demandes = await DemandeVisite.find(filtre)
            .populate({ path: 'propriete', select: '__t typeOffre prix quartier images', populate: { path: 'quartier', populate: 'ville' } })
            .populate('agence', 'nom_agence')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, demandes });
    } catch (err) {
        console.error("Erreur lors de la récupération des demandes de visite :", err);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

// AJOUT : changement de statut d'une demande — vérifie que l'agence
// connectée est bien celle concernée par la demande (sauf admin), même
// principe de contrôle d'accès que partout ailleurs dans l'app (IDOR).
module.exports.updateStatutDemandeVisite = async (req, res) => {
    try {
        const { statut } = req.body;
        if (!['en_attente', 'confirmee', 'effectuee', 'annulee'].includes(statut)) {
            return res.status(400).json({ success: false, message: "Statut invalide." });
        }

        const demande = await DemandeVisite.findById(req.params.id);
        if (!demande) {
            return res.status(404).json({ success: false, message: "Demande introuvable." });
        }

        if (req.user.role !== 'admin' && String(demande.agence) !== String(req.user.agenceId)) {
            return res.status(403).json({ success: false, message: "Cette demande ne concerne pas votre agence." });
        }

        demande.statut = statut;
        await demande.save();

        res.status(200).json({ success: true, message: "Statut mis à jour.", demande });
    } catch (err) {
        console.error("Erreur lors de la mise à jour de la demande de visite :", err);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};
