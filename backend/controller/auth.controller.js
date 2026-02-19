const Agence=require('../model/agence.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');

// Enregistrement d'une nouvelle agence
module.exports.registerAgence=async(req,res)=>{
    try{
        const { nom_agence, nom_proprietaire, numero_telephone, email, nomUtilisateur, password } = req.body;
        if (!nom_agence || !nom_proprietaire || !numero_telephone || !password) {
            return res.status(400).json({ success: false, message: "Tous les champs obligatoires doivent être remplis !" });
        }
        const existingAgence = await Agence.findOne({ nom_agence });
        if (existingAgence) {
            return res.status(400).json({ success: false, message: "Une agence avec ce nom existe déjà !" });
        }
        const existingUser = await Agence.findOne({ nomUtilisateur });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Nom d'utilisateur déjà pris !" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAgence = new Agence({
            nom_agence, 
            nom_proprietaire, 
            numero_telephone, 
            email,
            nomUtilisateur,
            password: hashedPassword
        });
        await newAgence.save();
        await sendMail(
            "Bienvenue chez Gest-Immo !",
            `<p>L'agence ${nom_agence},</p><p>de propriétaire "${nom_proprietaire}" a été enregistrée avec succès !.</p>`,
            "balloabdoul64@gmail.com"
        );
        res.status(201).json({ success: true, message: "Agence enregistrée avec succès !" });
    }   catch(err){
        console.error("Erreur lors de l'enregistrement de l'agence :",err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'enregistrement de l'agence !" });
    }   
};
// Connexion d'une agence
module.exports.loginAgence=async(req,res)=>{
    try {    
        const { nomUtilisateur, password } = req.body;
        if (!nomUtilisateur || !password) {
            return res.status(400).json({ success: false, message: "Nom d'utilisateur et mot de passe requis !" });
        }   
        const agence = await Agence.findOne({ nomUtilisateur });
        if (!agence) {
            return res.status(400).json({ success: false, message: "Nom d'utilisateur ou mot de passe incorrect !" });
        }
        const isPasswordValid = await bcrypt.compare(password, agence.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Nom d'utilisateur ou mot de passe incorrect !" });
        }   
        const token = jwt.sign(
            { agenceId: agence._id, nom_agence: agence.nom_agence, role: agence.role },
            
            process.env.JWT_SECRET || 'votre_cle_secrete',         
            { expiresIn: '7d' }
        ); 

        res.status(200).json({ success: true, message: "Connexion réussie !", token });
    }   catch (err) {
        console.error("Erreur lors de la connexion de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la connexion de l'agence !" });
    }   
};

// Récupérer les informations de l'agence connectée 
module.exports.getAgenceProfile=async(req,res)=>{
    try{
        const agenceId=req.agenceId;
        const agence=await Agence.findById(agenceId).select('-password');
        if(!agence){
            return res.status(404).json({success:false,message:"Agence non trouvée"});
        }   
        res.status(200).json({success:true,agence});
    }
    catch(err){
        console.error("Erreur lors de la récupération du profil de l'agence :",err);
        res.status(500).json({success:false,message:"Erreur serveur lors de la récupération du profil de l'agence"});
    }   
};
// Mettre à jour les informations de l'agence
module.exports.updateAgenceProfile=async(req,res)=>{
    try {    
        const agenceId = req.agenceId;
        const { nom_agence, nom_proprietaire, numero_telephone, email, description } = req.body;
        const agence = await Agence.findById(agenceId);
        if (!agence) {
            return res.status(404).json({ success: false, message: "Agence non trouvée" });
        }   
        if (nom_agence) agence.nom_agence = nom_agence;
        if (nom_proprietaire) agence.nom_proprietaire = nom_proprietaire;
        if (numero_telephone) agence.numero_telephone = numero_telephone;
        if (email) agence.email = email;
        if (description) agence.description = description;
        await agence.save();
        res.status(200).json({ success: true, message: "Profil de l'agence mis à jour avec succès !" });
    } catch (err) {
        console.error("Erreur lors de la mise à jour du profil de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour du profil de l'agence !" });
    }
};
// Supprimer une agence
module.exports.deleteAgence=async(req,res)=>{
    try {    
        const agenceId = req.agenceId;
        const deletedAgence = await Agence.findByIdAndDelete(agenceId);
        if (!deletedAgence) {   
            return res.status(404).json({ success: false, message: "Agence non trouvée" });
        }   
        res.status(200).json({ success: true, message: "Agence supprimée avec succès !" });
    } catch (err) {
        console.error("Erreur lors de la suppression de l'agence :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression de l'agence !" });
    }
};