require('dotenv').config();
const nodemailer = require("nodemailer");

// Récupération des variables d'environnement
const USER_EMAIL = process.env.EMAIL_USER;
const APP_PASSWORD = process.env.EMAIL_APP_PASSWORD; // Le code de 16 caractères

async function sendMail(objet, message, destinataire) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: USER_EMAIL,
        pass: APP_PASSWORD, 
      },
      port: 587,
      secure: false,
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