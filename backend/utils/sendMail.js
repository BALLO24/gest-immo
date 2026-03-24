require('dotenv').config();
const nodemailer = require("nodemailer");


async function sendMail(objet, message, destinataire) {
  // Récupération des variables d'environnement
const USER_EMAIL = process.env.EMAIL_USER;
const APP_PASSWORD = process.env.EMAIL_APP_PASSWORD; 

  try {
const transporter = nodemailer.createTransport({
      // On garde l'IP pour éviter l'erreur IPv6 (ENETUNREACH)
      host: "173.194.76.108", 
      // ON CHANGE LE PORT : 587 est plus "ouvert" sur Render
      port: 587,
      secure: false, // OBLIGATOIRE pour le port 587 (STARTTLS)
      auth: {
        user: USER_EMAIL,
        pass: APP_PASSWORD,
      },
      tls: {
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      debug: true, // Pour voir la progression dans les logs
      logger: true 
    });    const info = await transporter.sendMail({
      from: `"Admin Gest Immo" <${USER_EMAIL}>`,
      to: destinataire,
      subject: objet,
      html: message,
    });

    console.log(" Email envoyé:", info.messageId);
    return info;

  } catch (err) {
    console.error(" Erreur d'envoi:", err);
    throw err;
  }
}

module.exports = sendMail;