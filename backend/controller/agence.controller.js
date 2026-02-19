const Agence=require('../model/agence.model');
module.exports.addAgence=async(req,res)=>{
    try {
        
        const { nom_agence, nom_proprietaire, prenom_proprietaire, numero_telephone, email,nomUtilisateur,password } = req.body;
        if (!nom_agence || !nom_proprietaire || !prenom_proprietaire || !numero_telephone || !nomUtilisateur || !password) {
            
            
            return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs obligatoires !" });
        }
        const nomCapitalized=nom_agence.trim().charAt(0).toUpperCase() + nom_agence.trim().slice(1).toLowerCase();
        
        const isExist=await Agence.findOne({nom_agence:nomCapitalized});
        if(isExist){
            return  res.status(400).json({success:false,message:"Une agence avec ce nom existe déjà !"});
        }
        const newAgence=new Agence({nom_agence:nomCapitalized,nom_proprietaire,prenom_proprietaire,numero_telephone,email,nomUtilisateur,password});
        await newAgence.save();
        res.status(201).json({success:true,message:"Agence ajoutée avec succès !",agence:newAgence});
    }   catch(err){
        console.error("Erreur lors de l'ajout de l'agence :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de l'ajout de l'agence !"});
    }   
};

// Récupérer toutes les agences
module.exports.getAllAgences=async(req,res)=>{
    try{
        const agences=await Agence.find().sort({nom_agence:1});
        res.status(200).json({success:true,agences});
    }   catch(err){
        console.error("Erreur lors de la récupération des agences :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de la récupération des agences"});
    }   
};
module.exports.updateAgence=async(req,res)=>{
    try{
        const agenceId = req.params.id;
        const { nom_agence, nom_proprietaire, prenom_proprietaire, numero_telephone, email, nomUtilisateur, password, description } = req.body;
        if (!nom_agence || !nom_proprietaire || !numero_telephone || !nomUtilisateur) {
            return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs obligatoires !" });
        }
        const nomCapitalized=nom_agence.trim().charAt(0).toUpperCase() + nom_agence.trim().slice(1).toLowerCase();
        const existingAgence = await Agence.findOne({ nom_agence: nomCapitalized, _id: { $ne: agenceId } });
        if (existingAgence) {
            return res.status(400).json({ success: false, message: "Une autre agence avec ce nom existe déjà !" });
        }
        const updatedAgence = await Agence.findByIdAndUpdate(agenceId, {
            nom_agence: nomCapitalized,
            nom_proprietaire,
            prenom_proprietaire,
            numero_telephone,
            email,
            nomUtilisateur,
            password,
            description
        }, { new: true });
        if (!updatedAgence) {
            return res.status(404).json({ success: false, message: "Agence non trouvée" });
        }
        res.status(200).json({ success: true, message: "Agence mise à jour avec succès", agence: updatedAgence });
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour de l'agence" });
    }
};

module.exports.deleteAgence=async(req,res)=>{
    try{
        const agenceId=req.params.id;    
        const deletedAgence=await Agence.findByIdAndDelete(agenceId);
        if(!deletedAgence){
            return res.status(404).json({success:false,message:"Agence non trouvée"});
        }
        res.status(200).json({success:true,message:"Agence supprimée avec succès",agence:deletedAgence});
    }   catch(err){
        console.error("Erreur lors de la suppression de l'agence :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de la suppression de l'agence"});
    }   
};