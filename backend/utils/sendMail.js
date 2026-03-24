require('dotenv').config();
const nodemailer = require("nodemailer");


async function sendMail(objet, message, destinataire) {
  // Récupération des variables d'environnement
const USER_EMAIL = process.env.EMAIL_USER;
const APP_PASSWORD = process.env.EMAIL_APP_PASSWORD; 

  try {
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: USER_EMAIL,
    pass: APP_PASSWORD,
  },
  // On force le timeout et la résolution DNS en IPv4
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  dnsLookup: (hostname, options, callback) => {
    require('dns').lookup(hostname, { family: 4 }, callback);
  }
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