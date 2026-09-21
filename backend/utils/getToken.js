require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

// CORRIGÉ (sécurité) : Client ID et Client Secret étaient codés en dur dans ce
// fichier, en clair. C'est une fuite de secret dès que ce fichier atteint un
// dépôt Git, un export, ou toute autre personne. Lus depuis .env maintenant,
// comme dans googleDrive.js et deleteFromDrive.js.
//
// ACTION DE VOTRE CÔTÉ : ces identifiants ont déjà été exposés en clair dans
// la version d'origine — régénérez un nouveau Client Secret dans Google Cloud
// Console (APIs & Services > Identifiants) et mettez à jour votre .env.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL || 'http://localhost:5000';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET doivent être définis dans .env avant de lancer ce script.');
  process.exit(1);
}

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
