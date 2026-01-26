const {Habitation, Maison, Appartement, Magasin,Terrain} = require('../model/habitation.model');
const Quartier=require("../model/quartier.model");
const minioClient = require('../config/minio');
// Ajouter une nouvelle habitation  

  module.exports.addHabitation = async (req, res) => {
  try {
    const { type, ...habitationData } = req.body;
    const bucketName = process.env.MINIO_BUCKET;

    console.log("body files", req.files);
    console.log("bucket", bucketName);

    // Vérifie que le bucket existe
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // Upload des images dans MinIO
    const imageFileNames = [];

    // ⚠️ Certains middlewares multer renvoient req.files directement comme tableau
    const files = req.files?.images || req.files || [];

    for (const file of files) {
      // Nettoyer le nom du fichier (remplacer les espaces et caractères spéciaux)
      const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
      const fileName = `${Date.now()}-${safeName}`;

      // Upload vers MinIO
      await minioClient.putObject(bucketName, fileName, file.buffer, {
        "Content-Type": file.mimetype,
      });

      //On stocke SEULEMENT le nom du fichier
      imageFileNames.push(fileName);
    }

    // Associer les noms d'images au document
    habitationData.images = imageFileNames;

    // Création selon le type
    let newHabitation;
    switch (type) {
      case "maison":
        newHabitation = new Maison(habitationData);
        break;
      case "appartement":
        newHabitation = new Appartement(habitationData);
        break;
      case "terrain":
        newHabitation = new Terrain(habitationData);
        break;
      case "magasin":
        newHabitation = new Magasin(habitationData);
        break;
      default:
        return res.status(400).json({ message: "Type d'habitation invalide" });
    }

    await newHabitation.save();
    res.status(201).json({success:true,newHabitation});
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une habitation:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
},


module.exports.getAllHabitations = async (req, res) => {
  try {    
    const filtre = req.body; // Récupérer les filtres depuis le corps de la requête
    // console.log("filtre : ", filtre || "Aucun filtre fourni");
    const limit = filtre.limit ? parseInt(filtre.limit) : null;
    console.log("limit : ",limit);
    
    async function buildCriteria(f) {
      const critere = {};
      if (!f) return critere;
      if (f.type && f.type !== "tous") critere.__t = f.type;
      if(f.quartier && f.quartier!=="tous") critere.quartier=f.quartier;//probleme a ce niveau
      if ((!f.quartier || f.quartier === "tous") && f.villeSelected) {
        const quartiersVille = await Quartier.find({ ville: f.villeSelected });
        critere.quartier = { $in: quartiersVille.map(q => q._id) };
      }
      if(f.aLouer !== undefined && f.aLouer !== null && f.aLouer !== "" && f.aLouer !== "tous") {
        critere.aLouer = f.aLouer;
      }
      if((!f.typePaiementAppart || f.typePaiementAppart === "mensuel") && f.prixMin !== undefined && f.prixMin !== null && f.prixMin !== 0 && f.prixMin !== "" ){
        const min = Number(f.prixMin);
        if (!isNaN(min)) critere.prix = { ...(critere.prix || {}), $gte: min }
      }
      else if(f.typePaiementAppart && f.typePaiementAppart &&  f.typePaiementAppart==="journalier") {
        const min = Number(f.prixMin);
        if (!isNaN(min)) critere.prixParJour = { ...(critere.prixParJour || {}), $gte: min }
      }
      else if(f.typePaiementAppart==="horaire") {
        const min = Number(f.prixMin);
        if (!isNaN(min)) critere.prixParHeure = { ...(critere.prixParHeure || {}), $gte: min }
      }

      if((!f.typePaiementAppart || f.typePaiementAppart === "mensuel") && f.prixMax !== undefined && f.prixMax !== null && f.prixMax !==0 && f.prixMax !== "") {
          const max = Number(f.prixMax);
          if (!isNaN(max)) critere.prix = { ...(critere.prix || {}), $lte: max }
      }
      else if(f.typePaiementAppart &&  f.typePaiementAppart==="journalier") {
          const max = Number(f.prixMax);
          if (!isNaN(max)) critere.prixParJour = { ...(critere.prixParJour || {}), $lte: max }
      } 
      else if(f.typePaiementAppart==="horaire") {
          const max = Number(f.prixMax);
          if (!isNaN(max)) critere.prixParHeure = { ...(critere.prixParHeure || {}), $lte: max }
      }

      if(f.position !== undefined && f.position !== null && f.position !== "") {
        const nd=Number(f.position);
        if(!isNaN(nd)) critere.position={ $lte: nd };
      }

      if(f.nbreSalon !== undefined && f.nbreSalon !== null && f.nbreSalon !==0 && f.nbreSalon !== "" && f.nbreSalon !== "tous") {
        const nd=Number(f.nbreSalon);
        if(!isNaN(nd)) critere.nombreSalon=f.nbreSalon;
      }

      if(f.nbreChambres !== undefined && f.nbreChambres !== null && f.nbreChambres !==0 && f.nbreChambres !== "" && f.nbreChambres !== "tous") {
        const nd=Number(f.nbreChambres);
        if(!isNaN(nd)) critere.nombreChambres=f.nbreChambres;
      }

      
      if (f.nombreDouche !== undefined && f.nombreDouche !== null && f.nombreDouche !==0 && f.nombreDouche !=="" && f.nombreDouche !== "tous") {
        const nd = Number(f.nombreDouche);
        // if (!isNaN(nd)) critere.nombreSallesBain = { $gte: nd };
        if (!isNaN(nd)) critere.nombreSallesBain = f.nombreDouche;
      }
      if(f.magasin && f.magasin !== "tous") critere.magasin = f.magasin;
      if(f.cuisine && f.cuisine !== "tous") critere.cuisine = f.cuisine;
      if (f.coursUnique && f.coursUnique !== "tous") critere.coursUnique = f.coursUnique;
      if (f.compteurEDMSepare && f.compteurEDMSepare !== "tous") critere.compteurEDMSepare = f.compteurEDMSepare;
      if (f.compteurEauSepare && f.compteurEauSepare !== "tous") critere.compteurEauSepare = f.compteurEauSepare;
      if (f.parking && f.parking !== "tous") critere.motoParking = f.parking;
      if (f.meuble && f.meuble !== "tous") critere.meuble = f.meuble;
      if (f.climatisation && f.climatisation !== "tous") critere.climatisation = f.climatisation;
      if (f.connexionInternet && f.connexionInternet !== "tous") critere.connexionInternet = f.connexionInternet;
      if (f.energieSecours && f.energieSecours !== "tous") critere.energieSecours = f.energieSecours;
      if(f.toiletteInterne && f.toiletteInterne !== "tous") critere.toiletteInterne=f.toiletteInterne;
      if (f.documentTerrain && f.documentTerrain !== "tous") critere.documentTerrain = f.documentTerrain;

      return critere;
    }
    const villeSelected=filtre.villeSelected
    const filtreFinal =await buildCriteria(filtre);
    console.log("filtre final ",{...filtreFinal});

    const bucketName = process.env.MINIO_BUCKET;
    const habitations = await Habitation.find(filtreFinal).populate({
      path:"quartier",
      populate:{
        path:"ville",
      }
      }).limit(limit || 0).lean();
    
    const habitationsAvecUrls = await Promise.all(
      habitations.map(async (hab) => {
        const habObj = hab;

        if (habObj.images && habObj.images.length > 0) {
          //Ne pas préfixer ou encoder à nouveau
          habObj.images = await Promise.all(
            habObj.images.map(async (fileName) => {
              const url = await minioClient.presignedGetObject(bucketName, fileName, 60 * 60);
              return url; // garder tel quel
            })
          );
        }
        return habObj;
      })
    );

    res.status(200).json(habitationsAvecUrls);
  } catch (error) {
    console.error("Erreur lors de la récupération des habitations:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
}
