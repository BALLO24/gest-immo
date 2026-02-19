const { google } = require('googleapis');

// 1. On initialise le client une seule fois
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// 2. On exporte la fonction de suppression
module.exports.deleteFromDrive = async (fileId) => {
  try {
    await drive.files.delete({ fileId: fileId });
    return true;
  } catch (error) {
    // Si le fichier est déjà supprimé, on ne bloque pas
    if (error.code === 404) return true; 
    throw error;
  }
};