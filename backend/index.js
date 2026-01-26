const express=require("express");
const mongoose =require('./config/db');
const bodyParser = require("body-parser");
const dotenv=require("dotenv");
const path = require('path');
const cors=require("cors");
const habitationRoutes=require("./route/habitation.route");
const villeRoutes=require("./route/ville.route");
const quartierRoutes=require("./route/quartier.route");

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors({
    origin:true,
    credentials:true,
    
}));

app.use("/api/habitations", habitationRoutes);
app.use("/api/villes", villeRoutes);
app.use("/api/quartiers",quartierRoutes);

app.listen(PORT,"0.0.0.0",()=>console.log(`Le serveur express tourne sur le port : ${PORT}`)
);