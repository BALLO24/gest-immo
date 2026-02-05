const express=require("express");
const mongoose =require('./config/db');
const bodyParser = require("body-parser");
const dotenv=require("dotenv");
const path = require('path');
const cors=require("cors");
const habitationRoutes = require("./route/habitation.route");
const agencesRoutes=require("./route/agence.router");
const villeRoutes=require("./route/ville.route");
const quartierRoutes = require("./route/quartier.route");
const authRoutes = require("./route/auth.route");

const app=express();
// Load .env from backend folder explicitly so env vars are available
dotenv.config({ path: path.resolve(__dirname, './.env') });
const PORT=process.env.PORT;
// const allowedOrigins = ["http://localhost:5173"];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Requete bloqué par CORS"));
//     }
//   },
//   credentials: true,
// }));
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. On vérifie si l'utilisateur existe (le middleware authenticateToken doit passer avant)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Utilisateur non identifié." });
    }

    // 2. On vérifie si le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accès interdit : votre rôle (${req.user.role}) ne permet pas cette action.` 
      });
    }

    // 3. Tout est bon, on continue
    next();
  };
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors({
    origin:true,
    credentials:true,
    
}));

app.use("/api/habitations", authenticateToken, authorizeRoles("admin", "agence"), habitationRoutes);
app.use("/api/agences", authorizeRoles("admin"), agencesRoutes);
app.use("/api/villes", authorizeRoles("admin"), villeRoutes);
app.use("/api/quartiers",quartierRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT,"0.0.0.0",()=>console.log(`Le serveur express tourne sur le port : ${PORT}`)
);