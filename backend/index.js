const express = require("express");
const path = require('path');
const dotenv = require("dotenv");

// Configuration dotenv AVANT les imports de routes si elles utilisent des variables d'env
dotenv.config({ path: path.resolve(__dirname, './.env') });

const mongoose = require('./config/db');
const bodyParser = require("body-parser");
const cors = require("cors");

// Imports des routes
const habitationRoutes = require("./route/habitation.route");
const agencesRoutes = require("./route/agence.router");
const villeRoutes = require("./route/ville.route");
const quartierRoutes = require("./route/quartier.route");
const authRoutes = require("./route/auth.route");
const sendMail = require("./utils/sendMail");
const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARES DE BASE ---
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));



// Routes Publiques
app.use("/api/auth", authRoutes); 
app.use("/api/quartiers", quartierRoutes); // Public ? Sinon ajoute authenticateToken
app.post("/api/send-mail", async (req, res) => {
  const { objet, message, destinataire } = req.body;
  try {
    await sendMail(objet, message, destinataire);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes Protégées (Ordre : Auth -> Role -> Route)
app.use("/api/habitations", habitationRoutes);
app.use("/api/agences", agencesRoutes);
app.use("/api/villes", villeRoutes);



app.listen(PORT, "0.0.0.0", () =>
  console.log(`Le serveur tourne sur : http://localhost:${PORT}`)
);