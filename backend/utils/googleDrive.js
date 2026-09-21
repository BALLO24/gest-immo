const { google } = require('googleapis');
const stream = require('stream');

// Configuration du client OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL // http://localhost:3000 ou l'URL du playground
);

// On injecte le précieux Refresh Token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Upload un fichier sur Google Drive et retourne son ID public
 */
exports.uploadToDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    // 1. Création du fichier sur votre Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
      fields: 'id',
    });

    const fileId = response.data.id;

    // 2. Rendre le fichier public (Lecture seule pour "tous")
    // C'est ce qui permet d'afficher l'image sur votre site
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return fileId;
  } catch (error) {
    console.error("Erreur détaillée upload Google Drive:", error);
    throw error;
  }
};