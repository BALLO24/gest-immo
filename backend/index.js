const express = require("express");
const path = require('path');
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, './.env') });

// AJOUT : on échoue vite et fort si une variable d'environnement critique
// manque, plutôt que de laisser le serveur démarrer dans un état à moitié
// cassé (ex: JWT jamais vérifiable, DB jamais connectée) et découvrir le
// problème seulement à la première requête en prod.
const requiredEnvVars = ['MONGO_URI', 'ACCESS_TOKEN_SECRET'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
	console.error(`❌ Variables d'environnement manquantes : ${missingEnvVars.join(', ')}`);
	process.exit(1);
}

require('./config/db'); // CORRIGÉ : plus besoin de récupérer une valeur de retour (voir config/db.js)

const helmet = require('helmet'); // npm install helmet
const rateLimit = require('express-rate-limit'); // npm install express-rate-limit
const bodyParser = require("body-parser");
const cors = require("cors");

// Imports des routes
// RENOMMÉ : habitation -> propriete, agence.router -> agence.route (cohérence
// de nommage avec les autres fichiers de routes, tous en "*.route.js")
const proprieteRoutes = require("./route/propriete.route");
const agencesRoutes = require("./route/agence.route");
const villeRoutes = require("./route/ville.route");
const quartierRoutes = require("./route/quartier.route");
const authRoutes = require("./route/auth.route");
const contactRoutes = require("./route/contact.route"); // AJOUT : remplace l'ancienne route /api/send-mail
const userRoutes = require("./route/user.route"); // AJOUT : gestion des comptes (dashboard admin)
const statsRoutes = require("./route/stats.route"); // AJOUT : statistiques du dashboard admin
const demandeVisiteRoutes = require("./route/demandeVisite.route"); // AJOUT : demandes de visite
const signalementRoutes = require("./route/signalementAnnonce.route"); // AJOUT : signalement d'annonces

const app = express();
const PORT = process.env.PORT || 5000;

// AJOUT : nécessaire si l'app tourne derrière un reverse proxy (Render,
// Railway, Nginx...) pour que express-rate-limit et req.ip lisent la vraie IP
// du client via X-Forwarded-For plutôt que celle du proxy.
app.set('trust proxy', 1);

// --- MIDDLEWARES DE BASE ---
app.use(helmet()); // AJOUT : en-têtes de sécurité HTTP standards (CSP basique, no-sniff, etc.)

// CORRIGÉ : `origin: true` reflète n'importe quelle origine, combiné à
// `credentials: true` c'est une configuration risquée si un jour vous
// utilisez des cookies de session. L'app utilise des tokens Bearer (pas de
// cookie), donc credentials n'est pas nécessaire ici. L'origine autorisée se
// configure via une variable d'environnement plutôt qu'en dur dans le code.
const allowedOrigins = (process.env.CORS_ORIGINS || "").split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
	origin: allowedOrigins.length > 0 ? allowedOrigins : true, // fallback permissif si non configuré, à restreindre en prod
	credentials: false,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));

// CORRIGÉ : 50mb sur du JSON est excessif ici — les images passent par
// multer (multipart/form-data), pas par le body JSON. Une limite aussi large
// sur express.json() est une porte ouverte à des requêtes énormes qui
// saturent la mémoire du serveur avant même d'être validées. Augmentez au cas
// par cas si un endpoint précis en a réellement besoin.
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));

// AJOUT : limite globale de requêtes par IP, filet de sécurité en plus des
// limites spécifiques déjà posées sur /api/auth/login et /api/contact.
app.use(rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
}));

// --- ROUTES ---
// CORRIGÉ : la protection (authenticateToken/authorizeRoles) est maintenant
// posée route par route à l'intérieur de chaque fichier de route (voir
// route/*.route.js), plutôt que suggérée en commentaire ici sans être
// réellement appliquée. Chaque routeur ci-dessous mélange donc des endpoints
// publics (lecture) et protégés (écriture) en fonction du besoin réel.
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/quartiers", quartierRoutes);
app.use("/api/proprietes", proprieteRoutes);
app.use("/api/agences", agencesRoutes);
app.use("/api/villes", villeRoutes);
app.use("/api/demandes-visite", demandeVisiteRoutes); // AJOUT
app.use("/api/signalements", signalementRoutes); // AJOUT

// AJOUT :404 explicite pour toute route non trouvée (avant, une route
// inexistante tombait dans le vide sans réponse JSON exploitable côté client)
app.use((req, res) => {
	res.status(404).json({ success: false, message: "Route non trouvée" });
});

// AJOUT : gestionnaire d'erreurs centralisé — filet de sécurité si une erreur
// non attrapée remonte jusqu'ici (évite qu'Express renvoie une stack trace
// HTML brute au client en production).
app.use((err, req, res, next) => {
	console.error("Erreur non gérée :", err);
	res.status(err.status || 500).json({
		success: false,
		message: process.env.NODE_ENV === 'production' ? "Erreur serveur" : err.message,
	});
});

const server = app.listen(PORT, "0.0.0.0", () =>
	console.log(`Le serveur tourne sur le port ${PORT}`)
);

// AJOUT : arrêt propre (utile en conteneur/orchestrateur qui envoie SIGTERM
// avant de tuer le process) — laisse les requêtes en cours se terminer et
// ferme la connexion MongoDB proprement plutôt que de couper brutalement.
process.on('SIGTERM', () => {
	console.log('SIGTERM reçu, arrêt propre du serveur...');
	server.close(() => {
		// CORRIGÉ (à nouveau) : connection.close(force, callback) est
		// l'ancienne API — cette version de Mongoose ne l'accepte plus et
		// lève une erreur au lieu de fermer proprement. close() retourne
		// désormais une Promise.
		require('mongoose').connection.close()
			.then(() => process.exit(0))
			.catch(() => process.exit(1));
	});
});
