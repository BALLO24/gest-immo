const { google } = require('googleapis');
const readline = require('readline');

// Tes identifiants Google (Client ID et Client Secret)
const CLIENT_ID = '773279611856-e1et3657luhpcavnvch9mn9djs92q8ij.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5000'; // Pour une application console

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Définir les droits (Scope Drive)
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Demande un Refresh Token
  prompt: 'consent',      // Force l'affichage pour garantir le Refresh Token
  scope: SCOPES,
});

console.log('1. Ouvre cette URL dans ton navigateur :\n\n', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n2. Après avoir accepté, copie le code affiché ici : ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n3. Voici tes nouveaux TOKENS :\n');
    console.log(JSON.stringify(tokens, null, 2));
    console.log('\n--- COPIE LE "refresh_token" DANS TON FICHIER .ENV ---');
  } catch (err) {
    console.error('Erreur lors de la récupération du token :', err.message);
  }
  rl.close();
});