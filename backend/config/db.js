const mongoose = require("mongoose");

// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gest_immo";

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI, {
})
.then(() => console.log("✅ Connexion MongoDB réussie"))
.catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

module.exports = { mongoose };
