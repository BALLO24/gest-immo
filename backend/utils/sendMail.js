const nodemailer = require('nodemailer');
const dns = require('dns');

// CORRIGÉ : remplace Resend par Nodemailer + Gmail SMTP. Resend, comme la
// plupart des services transactionnels (SendGrid, Mailgun...), bloque
// l'envoi à un destinataire tiers tant qu'aucun domaine n'est vérifié — une
// protection anti-spam standard chez eux, pas un bug. Gmail SMTP n'a pas
// cette restriction : ton compte a déjà une réputation d'envoi établie
// auprès de Google, donc tu peux envoyer à n'importe qui immédiatement.
//
// LIMITES À CONNAÎTRE (voir aussi la discussion qui a mené à ce choix) :
// - ~500 emails/jour maximum pour un compte Gmail personnel.
// - Google peut suspecter un compte en cas de volume/pattern automatisé
//   inhabituel. Si l'app grossit, prévoir un vrai service transactionnel
//   avec domaine vérifié (Resend, SendGrid...) pour la fiabilité à long terme.
//
// CONFIGURATION REQUISE dans le .env du backend :
//   EMAIL_USER=tonadresse@gmail.com
//   EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
// EMAIL_APP_PASSWORD n'est PAS le mot de passe du compte Google — c'est un
// "mot de passe d'application" à générer séparément (nécessite la
// validation en 2 étapes activée sur le compte) :
// https://myaccount.google.com/apppasswords

// CORRIGÉ : l'ancienne version codait en dur une IP Gmail (173.194.76.108)
// pour contourner un souci de résolution IPv6 sur certains hébergeurs
// (Render notamment). Une IP figée est fragile — les IPs de Google tournent,
// ça peut casser sans prévenir. La bonne pratique est de forcer la
// résolution DNS en IPv4 plutôt que de viser une IP précise.
if (typeof dns.setDefaultResultOrder === 'function') {
	dns.setDefaultResultOrder('ipv4first');
}

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_APP_PASSWORD,
	},
	// Filet de sécurité supplémentaire : force IPv4 même si le système
	// d'exploitation préférait IPv6 par défaut.
	family: 4,
});

// Signature IDENTIQUE à l'ancienne version (Resend) — aucun appelant
// (auth.controller.js, contact.controller.js...) n'a besoin d'être modifié.
async function sendMail(objet, message, destinataire) {
	try {
		const info = await transporter.sendMail({
			from: `"ImmoMali" <${process.env.EMAIL_USER}>`,
			to: destinataire,
			subject: objet,
			html: message,
		});
		console.log("✅ Email envoyé :", info.messageId);
		return info;
	} catch (error) {
		// CORRIGÉ : plus de debug:true/logger:true sur le transporteur — ça
		// afficherait le détail de la négociation SMTP (potentiellement
		// sensible) dans les logs à chaque envoi, y compris en production.
		// Le log d'erreur ci-dessous reste suffisant pour diagnostiquer un
		// souci sans exposer ce niveau de détail en continu.
		console.error("❌ Erreur d'envoi d'email :", error.message);
		throw error;
	}
}

module.exports = sendMail;
