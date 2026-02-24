require('dotenv').config();
const nodemailer = require("nodemailer");


async function sendMail(objet, message, destinataire) {
  // Récupération des variables d'environnement
const USER_EMAIL = process.env.EMAIL_USER;
const APP_PASSWORD = process.env.EMAIL_APP_PASSWORD; 

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: USER_EMAIL,
        pass: APP_PASSWORD, 
      },
      port: 465,
      secure: true,
      family: 4,
      connectionTimeout: 10000, 

    });

    const info = await transporter.sendMail({
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