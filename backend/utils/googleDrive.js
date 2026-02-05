const { google } = require('googleapis');
const stream = require('stream');

// Initialisation du client Google Drive
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Upload un buffer vers Google Drive et le rend public
 */
exports.uploadToDrive = async (fileBuffer, fileName, mimeType) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: mimeType,
      body: bufferStream,
    },
    fields: 'id, webViewLink',
  });

  // OPTIONNEL : Rendre le fichier lisible par tout le monde (pour l'afficher sur votre site)
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return response.data.id; // On retourne l'ID pour la base de données
};