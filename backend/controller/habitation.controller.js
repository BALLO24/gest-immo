const {Habitation, Maison, Appartement, Magasin,Terrain} = require('../model/habitation.model');
const Quartier=require("../model/quartier.model");
const minioClient = require('../config/minio');
const { uploadToDrive } = require('../utils/googleDrive');
const {deleteFromDrive} = require("../utils/deleteFromDrive");

const sharp = require('sharp'); // N'oublie pas de faire : npm install sharp

module.exports.addHabitation = async (req, res) => {
  try {
    const { type, ...habitationData } = req.body;
    
    // Récupération des fichiers (gestion de multer)
    const files = req.files?.images || req.files || [];
    const imageIds = [];

    // On boucle sur les fichiers
    for (const file of files) {
      // 1. On prépare le nom sécurisé avec l'extension .webp
      const nameWithoutExt = file.originalname.split('.')[0].replace(/\s+/g, "_").replace(/[^\w-]/g, "");
      const safeName = `${Date.now()}-${nameWithoutExt}.webp`;

      try {
        // 2. Conversion en WebP avec Sharp
        // On utilise le buffer fourni par multer
        const webpBuffer = await sharp(file.buffer)
          .webp({ quality: 80 }) // Compression optimisée
          .toBuffer();

        // 3. Appel de la fonction utilitaire avec le nouveau buffer WebP
        // On force le mimetype à 'image/webp'
        const fileId = await uploadToDrive(webpBuffer, safeName, 'image/webp');
        imageIds.push(fileId);
      } catch (sharpError) {
        console.error(`Erreur de conversion Sharp pour ${file.originalname}:`, sharpError);
        // Optionnel : si Sharp échoue, on peut décider d'uploader le fichier original en secours
        // const fileId = await uploadToDrive(file.buffer, safeName, file.mimetype);
        // imageIds.push(fileId);
      }
    }

    // On assigne les IDs Drive au document
    habitationData.images = imageIds;

    // Mapping des modèles
    const modelMap = { 
      maison: Maison, 
      appartement: Appartement, 
      terrain: Terrain, 
      magasin: Magasin 
    };

    if (!modelMap[type]) {
      return res.status(400).json({ message: "Type d'habitation invalide" });
    }

    const newHabitation = new modelMap[type](habitationData);
    await newHabitation.save();

    res.status(201).json({ success: true, newHabitation });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une habitation:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
module.exports.getAllHabitations = async (req, res) => {
  try {    
    const filtre = req.body; // Récupérer les filtres depuis le corps de la requête
    const limit = filtre?.limit ? parseInt(filtre.limit) : null;    
    
    async function buildCriteria(f) {
      const critere = {};
      if (!f) return critere;
      if (f.type && f.type !== "tous") critere.__t = f.type;
      if (f.quartier && f.quartier !== "tous") critere.quartier = f.quartier;
      if ((!f.quartier || f.quartier === "tous") && f.villeSelected) {
        const quartiersVille = await Quartier.find({ ville: f.villeSelected });
        critere.quartier = { $in: quartiersVille.map(q => q._id) };
      }
      if (f.aLouer !== undefined && f.aLouer !== null && f.aLouer !== "" && f.aLouer !== "tous") {
        critere.aLouer = f.aLouer;
      }
      if ((!f.typePaiementAppart || f.typePaiementAppart === "mensuel") && f.prixMin !== undefined && f.prixMin !== null && f.prixMin !== 0 && f.prixMin !== "" ) {
        const min = Number(f.prixMin);
        if (!isNaN(min)) critere.prix = { ...(critere.prix || {}), $gte: min }
      }
      else if (f.typePaiementAppart && f.typePaiementAppart && f.typePaiementAppart === "journalier") {
        const min = Number(f.prixMin);
        if (!isNaN(min)) critere.prixParJour = { ...(critere.prixParJour || {}), $gte: min }
      }
      else if (f.typePaiementAppart === "horaire") {
        const min = Number(f.prixMin);
        if (!isNaN(min)) critere.prixParHeure = { ...(critere.prixParHeure || {}), $gte: min }
      }

      if ((!f.typePaiementAppart || f.typePaiementAppart === "mensuel") && f.prixMax !== undefined && f.prixMax !== null && f.prixMax !== 0 && f.prixMax !== "") {
          const max = Number(f.prixMax);
          if (!isNaN(max)) critere.prix = { ...(critere.prix || {}), $lte: max }
      }
      else if (f.typePaiementAppart && f.typePaiementAppart === "journalier") {
          const max = Number(f.prixMax);
          if (!isNaN(max)) critere.prixParJour = { ...(critere.prixParJour || {}), $lte: max }
      } 
      else if (f.typePaiementAppart === "horaire") {
          const max = Number(f.prixMax);
          if (!isNaN(max)) critere.prixParHeure = { ...(critere.prixParHeure || {}), $lte: max }
      }

      if (f.position !== undefined && f.position !== null && f.position !== "") {
        const nd = Number(f.position);
        if (!isNaN(nd)) critere.position = { $lte: nd };
      }

      if (f.nbreSalon !== undefined && f.nbreSalon !== null && f.nbreSalon !== 0 && f.nbreSalon !== "" && f.nbreSalon !== "tous") {
        const nd = Number(f.nbreSalon);
        if (!isNaN(nd)) critere.nombreSalon = f.nbreSalon;
      }

      if (f.nbreChambres !== undefined && f.nbreChambres !== null && f.nbreChambres !== 0 && f.nbreChambres !== "" && f.nbreChambres !== "tous") {
        const nd = Number(f.nbreChambres);
        if (!isNaN(nd)) critere.nombreChambres = f.nbreChambres;
      }

      if (f.nombreDouche !== undefined && f.nombreDouche !== null && f.nombreDouche !== 0 && f.nombreDouche !== "" && f.nombreDouche !== "tous") {
        const nd = Number(f.nombreDouche);
        if (!isNaN(nd)) critere.nombreSallesBain = f.nombreDouche;
      }
      if (f.magasin && f.magasin !== "tous") critere.magasin = f.magasin;
      if (f.cuisine && f.cuisine !== "tous") critere.cuisine = f.cuisine;
      if (f.coursUnique && f.coursUnique !== "tous") critere.coursUnique = f.coursUnique;
      if (f.compteurEDMSepare && f.compteurEDMSepare !== "tous") critere.compteurEDMSepare = f.compteurEDMSepare;
      if (f.compteurEauSepare && f.compteurEauSepare !== "tous") critere.compteurEauSepare = f.compteurEauSepare;
      if (f.parking && f.parking !== "tous") critere.motoParking = f.parking;
      if (f.meuble && f.meuble !== "tous") critere.meuble = f.meuble;
      if (f.climatisation && f.climatisation !== "tous") critere.climatisation = f.climatisation;
      if (f.connexionInternet && f.connexionInternet !== "tous") critere.connexionInternet = f.connexionInternet;
      if (f.energieSecours && f.energieSecours !== "tous") critere.energieSecours = f.energieSecours;
      if (f.toiletteInterne && f.toiletteInterne !== "tous") critere.toiletteInterne = f.toiletteInterne;
      if (f.documentTerrain && f.documentTerrain !== "tous") critere.documentTerrain = f.documentTerrain;
      if (f.hot) critere.hot = f.hot;
      if(f.statut && f.statut === "disponible") critere.statut = "disponible";
      return critere;
    }

    const filtreFinal = await buildCriteria(filtre);

    // Récupération des habitations
    const habitations = await Habitation.find(filtreFinal)
      .populate({
      path: "quartier",
      populate: {
        path: "ville",
      }
    }).limit(limit || 0).lean();
    
    // Transformation des IDs Google Drive en URLs d'affichage
    const habitationsAvecUrls = habitations.map((hab) => {
      const habObj = hab;

      if (habObj.images && habObj.images.length > 0) {
        // On transforme chaque ID de fichier en URL publique directe
        habObj.images = habObj.images.map((fileId) => {
          // Utilisation de l'URL de rendu direct de Google Drive
          // return `https://drive.google.com/uc?export=view&id=${fileId}`;
          return "https://lh3.googleusercontent.com/d/" + fileId;
        });
      }
      return habObj;
    });    
    res.status(200).json(habitationsAvecUrls);
  } catch (error) {
    console.error("Erreur lors de la récupération des habitations:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
}
module.exports.updateHabitation = async (req, res) => {
  try {
    const habitationId = req.params.id;
    const habitation = await Habitation.findById(habitationId);

    if (!habitation) {
      return res.status(404).json({ message: "Habitation non trouvée" });
    }

    habitation.set(req.body);
    const savedHabitation = await habitation.save();
    const updatedHabitation = await Habitation.findById(savedHabitation._id)
      .populate({
        path: 'quartier',
        populate: { path: 'ville' }
      })
      .lean(); // lean() pour avoir un objet JS simple
        res.status(200).json(updatedHabitation);

  } catch (error) {
    console.error("Erreur Update:", error);
    res.status(400).json({ message: "Erreur de validation", error: error.message });
  }
};// Assure-tu d'importer ta fonction de suppression Drive
// const { deleteFromDrive } = require("../utils/googleDriveUtils"); 

module.exports.deleteHabitation = async (req, res) => {
  try {
    const habitationId = req.params.id;
    
    // 1. Trouver l'habitation pour récupérer les IDs des images
    const habitation = await Habitation.findById(habitationId);
    
    if (!habitation) {
      return res.status(404).json({ message: "Habitation non trouvée" });
    }

    // 2. Supprimer les fichiers de Google Drive
    // On vérifie que habitation.images existe et est un tableau
    if (habitation.images && habitation.images.length > 0) {
      const deletePromises = habitation.images.map(async (fileId) => {
        try {
          // On appelle la fonction de suppression Drive pour chaque ID
          // Si l'URL contient plus que l'ID, extrais l'ID uniquement ici
          await deleteFromDrive(fileId);
        } catch (imgError) {
          // On log l'erreur mais on continue pour ne pas bloquer la suppression du document
          console.error(`Erreur suppression image Drive (${fileId}):`, imgError.message);
        }
      });

      // On attend que toutes les tentatives de suppression soient terminées
      await Promise.all(deletePromises);
    }

    // 3. Supprimer le document de la base de données
    await Habitation.findByIdAndDelete(habitationId);

    res.status(200).json({ 
      success: true, 
      message: "Habitation et images associées supprimées avec succès" 
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de l'habitation:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Récupérer les habitations d'une agence
module.exports.getHabitationsByAgence = async (req, res) => {
  try {
    const { agenceId } = req.params;
    const habitations = await Habitation.find({ agence: agenceId })
     
      
      .populate({
        path: "quartier",
        populate: { path: "ville" }
      })
      .lean();

    const habitationsAvecUrls = habitations.map((hab) => {
      const habObj = { ...hab };
      if (habObj.images && habObj.images.length > 0) {
        habObj.images = habObj.images.map((fileId) => {
          return "https://lh3.googleusercontent.com/d/" + fileId;
        });
      }
      return habObj;
    });

    res.status(200).json({ habitations: habitationsAvecUrls });
  } catch (error) {
    console.error("Erreur agence:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
