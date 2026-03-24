const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail(objet, message, destinataire) {
  try {
    const data = await resend.emails.send({
      from: 'Admin Gest Immo <onboarding@resend.dev>', // Tu pourras changer ça plus tard
      to: destinataire,
      subject: objet,
      html: message,
    });
    console.log("✅ Email envoyé via API:", data);
    return data;
  } catch (error) {
    console.error("❌ Erreur API:", error);
    throw error;
  }
}

module.exports = sendMail;