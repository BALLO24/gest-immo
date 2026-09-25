// AJOUT : gabarit d'email réutilisable — avant, chaque controller construisait
// son propre petit fragment HTML à la main (juste des <p>), sans mise en
// forme ni logo. Centralisé ici pour que tous les emails de l'app aient la
// même identité visuelle (logo, couleurs de marque) sans dupliquer le
// balisage à chaque endroit.
//
// Note technique : les clients mail (Outlook en particulier) ont un support
// CSS très limité — pas de flexbox/grid fiable, CSS externe souvent ignoré.
// On utilise donc des <table> avec des styles inline, la pratique standard
// pour un HTML d'email qui s'affiche correctement partout.

// AJOUT : l'URL du logo doit être une adresse PUBLIQUEMENT accessible — les
// clients mail chargent cette image depuis Internet au moment où la
// personne ouvre l'email, exactement comme un navigateur. Ça ne fonctionnera
// PAS si FRONTEND_URL pointe vers localhost, une adresse non déployée, ou
// une adresse où le fichier logo.png n'existe pas réellement (à vérifier en
// ouvrant l'URL directement dans un navigateur avant de retester).
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://immomali.net';
const LOGO_SRC = `${FRONTEND_URL}/logo.png`;

// Mêmes couleurs que tailwind.config.js côté frontend, pour rester cohérent
// avec l'identité visuelle du site.
const COLORS = {
	green: '#1E5E48',
	orange: '#FF8C00',
	sand: '#F6EBD9',
	text: '#1f2937',
	muted: '#6b7280',
};

/**
 * Construit un email HTML stylé et responsive.
 * @param {Object} options
 * @param {string} [options.preheader] - Texte d'aperçu (invisible), affiché par certains clients mail dans la liste des messages avant l'ouverture.
 * @param {string} [options.title] - Titre affiché en haut du corps du message.
 * @param {string} options.bodyHtml - Contenu principal (paragraphes HTML simples).
 * @param {string} [options.ctaText] - Libellé du bouton d'action (optionnel).
 * @param {string} [options.ctaUrl] - Lien du bouton d'action (optionnel, ignoré sans ctaText).
 */
function emailTemplate({ preheader = '', title = '', bodyHtml, ctaText, ctaUrl }) {
	return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title || 'ImmoMali'}</title>
</head>
<body style="margin:0; padding:0; background-color:${COLORS.sand}; font-family: Arial, Helvetica, sans-serif;">
  ${preheader ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sand}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
          <!-- EN-TÊTE -->
          <tr>
            <td align="center" style="background-color:${COLORS.green}; padding: 28px 24px;">
              <img src="${LOGO_SRC}" alt="ImmoMali" width="48" height="48" style="display:block; border-radius:8px; margin: 0 auto;" />
              <p style="margin: 12px 0 0; color:#ffffff; font-size:18px; font-weight:bold; letter-spacing:0.5px; font-family: Arial, Helvetica, sans-serif;">ImmoMali</p>
            </td>
          </tr>
          <!-- CORPS -->
          <tr>
            <td style="padding: 32px 28px; color:${COLORS.text}; font-size:15px; line-height:1.6; font-family: Arial, Helvetica, sans-serif;">
              ${title ? `<h1 style="margin:0 0 16px; font-size:20px; color:${COLORS.green}; font-family: Arial, Helvetica, sans-serif;">${title}</h1>` : ''}
              ${bodyHtml}
              ${ctaText && ctaUrl ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center" style="border-radius:10px; background-color:${COLORS.orange};">
                    <a href="${ctaUrl}" target="_blank" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; font-family: Arial, Helvetica, sans-serif;">${ctaText}</a>
                  </td>
                </tr>
              </table>` : ''}
            </td>
          </tr>
          <!-- PIED DE PAGE -->
          <tr>
            <td align="center" style="background-color:${COLORS.sand}; padding: 20px 24px; color:${COLORS.muted}; font-size:12px; font-family: Arial, Helvetica, sans-serif;">
              <p style="margin:0;">Cet email a été envoyé automatiquement par ImmoMali. Merci de ne pas y répondre directement.</p>
              <p style="margin:8px 0 0;">© ${new Date().getFullYear()} ImmoMali — L'immobilier au Mali, simplifié.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { emailTemplate, FRONTEND_URL };
