const Ville=require('../model/ville.model');
module.exports.addVille=async(req,res)=>{
    try{
        if(!req.body.nom){
            return res.status(400).json({success:false,message:"Le nom de la ville est requis !"});
        }
        const { nom } = req.body;
        console.log("nom",nom);
        
        const nomCapitalized=nom.trim().charAt(0).toUpperCase() + nom.trim().slice(1).toLowerCase();
        
        const isExist=await Ville.findOne({nom:nomCapitalized});
        if(isExist){
            return  res.status(400).json({success:false,message:"Une ville avec ce nom existe déjà !"});
        }
        const newVille=new Ville({nom:nomCapitalized});
        await newVille.save();
        res.status(201).json({success:true,message:"Ville ajoutée avec succès !",ville:newVille});
    }   catch(err){
        console.error("Erreur lors de l'ajout de la ville :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de l'ajout de la ville !"});
    }   
};

// Récupérer toutes les villes
module.exports.getAllVilles=async(req,res)=>{
    try{
        const villes=await Ville.find().sort({nom:1});
        res.status(200).json({success:true,villes});
    }   catch(err){
        console.error("Erreur lors de la récupération des villes :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de la récupération des villes"});
    }   
};

module.exports.deleteVille=async(req,res)=>{
    try{
        const villeId=req.params.id;    
        const deletedVille=await Ville.findByIdAndDelete(villeId);
        if(!deletedVille){
            return res.status(404).json({success:false,message:"Ville non trouvée"});
        }
        res.status(200).json({success:true,message:"Ville supprimée avec succès",ville:deletedVille});
    }   catch(err){
        console.error("Erreur lors de la suppression de la ville :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de la suppression de la ville"});
    }   
};