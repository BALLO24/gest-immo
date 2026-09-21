const sendMail = require('../utils/sendMail');
const { emailTemplate } = require('../utils/emailTemplate');
const Agence = require('../model/agence.model');

// AJOUT : remplace l'ancienne route générique "/api/send-mail" qui laissait
// n'importe quel appelant choisir librement objet/message/destinataire —
// un relais spam/phishing prêt à l'emploi. Ici, deux usages précis et sûrs :
// contacter le support de la plateforme, ou contacter une agence précise
// (dont l'email est lu en base, jamais fourni par le client).

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Un visiteur contacte le support Gest-Immo (ex: formulaire "Nous contacter")
module.exports.contacterSupport = async (req, res) => {
    try {
        const { nom, email, message } = req.body;
        if (!nom || !email || !message) {
            return res.status(400).json({ success: false, message: "Nom, email et message sont requis." });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ success: false, message: "Email invalide." });
        }
        if (message.length > 5000) {
            return res.status(400).json({ success: false, message: "Message trop long." });
        }

        await sendMail(
            `Nouveau message de contact de ${nom}`,
            emailTemplate({
                title: "Nouveau message de contact",
                bodyHtml: `<p><strong>De :</strong> ${nom} (${email})</p><p style="white-space: pre-wrap;">${message}</p>`,
                ctaText: `Répondre à ${nom}`,
                ctaUrl: `mailto:${email}`,
            }),
            process.env.SUPPORT_EMAIL || "b2techno.manager@gmail.com" // destinataire fixe, jamais fourni par le client
        );

        res.status(200).json({ success: true, message: "Message envoyé avec succès." });
    } catch (err) {
        console.error("Erreur lors de l'envoi du message de contact :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'envoi du message." });
    }
};

// Un visiteur contacte une agence précise depuis une annonce. On va lire
// l'email de l'agence en base (emailPublic) — le client ne peut pas choisir
// un destinataire arbitraire.
module.exports.contacterAgence = async (req, res) => {
    try {
        const { agenceId } = req.params;
        const { nom, email, message } = req.body;
        if (!nom || !email || !message) {
            return res.status(400).json({ success: false, message: "Nom, email et message sont requis." });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ success: false, message: "Email invalide." });
        }
        if (message.length > 5000) {
            return res.status(400).json({ success: false, message: "Message trop long." });
        }

        const agence = await Agence.findById(agenceId);
        if (!agence || !agence.emailPublic) {
            return res.status(404).json({ success: false, message: "Cette agence n'a pas d'email de contact renseigné." });
        }

        await sendMail(
            `Nouveau message via Gest-Immo de ${nom}`,
            emailTemplate({
                title: "Nouveau message via Gest-Immo",
                bodyHtml: `<p><strong>De :</strong> ${nom} (${email})</p><p style="white-space: pre-wrap;">${message}</p>`,
                ctaText: `Répondre à ${nom}`,
                ctaUrl: `mailto:${email}`,
            }),
            agence.emailPublic
        );

        res.status(200).json({ success: true, message: "Message envoyé à l'agence avec succès." });
    } catch (err) {
        console.error("Erreur lors de l'envoi du message à l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'envoi du message." });
    }
};
