const Quartier=require('../model/quartier.model.js'); 
module.exports.addQuartier=async(req,res)=>{
    try{
        if(!req.body.nom || !req.body.ville){
            return res.status(400).json({success:false,message:"Le nom du quartier et la ville sont requis !"});
        }
        const {nom,ville}=req.body;
        const nomCapitalized=nom.trim().charAt(0).toUpperCase() + nom.trim().slice(1).toLowerCase();

        const isExist=await Quartier.findOne({nom:nomCapitalized,ville});
        if(isExist){
            return  res.status(400).json({success:false,message:"Un quartier avec ce nom existe déjà dans cette ville !"});
        }
        const newQuartier=new Quartier({nom:nomCapitalized,ville});
        await newQuartier.save();
        res.status(201).json({success:true,message:"Quartier ajouté avec succès !",quartier:newQuartier});
    }   catch(err){
        console.error("Erreur lors de l'ajout du quartier :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de l'ajout du quartier !"});
    }   
};

// Récupérer tous les quartiers
module.exports.getAllQuartiers=async(req,res)=>{
    try{
        const quartiers=await Quartier.find().populate('ville').sort({nom:1});
        res.status(200).json({success:true,quartiers});
    }   catch(err){
        console.error("Erreur lors de la récupération des quartiers :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de la récupération des quartiers"});
    }   
};
module.exports.deleteQuartier=async(req,res)=>{
    try{
        const quartierId=req.params.id;  

        const deletedQuartier=await Quartier.findByIdAndDelete(quartierId);
        if(!deletedQuartier){
            return res.status(404).json({success:false,message:"Quartier non trouvé"});      
        }
        res.status(200).json({success:true,message:"Quartier supprimé avec succès",quartier:deletedQuartier});
    }   catch(err){
        console.error("Erreur lors de la suppression du quartier :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de la suppression du quartier"});
    }   
};