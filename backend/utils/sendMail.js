require('dotenv').config();
const nodemailer = require("nodemailer");


async function sendMail(objet, message, destinataire) {
  // Récupération des variables d'environnement
const USER_EMAIL = process.env.EMAIL_USER;
const APP_PASSWORD = process.env.EMAIL_APP_PASSWORD; 

  try {
const transporter = nodemailer.createTransport({
  // On utilise l'IP fixe pour contourner le bug IPv6/ENETUNREACH de Render
  host: "173.194.76.108", 
  port: 465,
  secure: true, // Obligatoire pour le port 465
  auth: {
    user: USER_EMAIL,
    pass: APP_PASSWORD,
  },
  tls: {
    // Crucial pour que le certificat SSL de Google soit accepté malgré l'IP
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false,
    // On force une version de TLS moderne pour éviter les refus de Google
    minVersion: 'TLSv1.2'
  },
  // On augmente les délais pour laisser le temps au réseau Render de sortir
  connectionTimeout: 20000, // 20 secondes
  greetingTimeout: 20000,
  socketTimeout: 20000,
  debug: true, // Affiche plus d'infos dans tes logs Render en cas d'échec
  logger: true  // Log l'activité SMTP pour voir exactement où ça bloque
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