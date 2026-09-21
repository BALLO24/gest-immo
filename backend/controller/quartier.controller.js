const Quartier = require('../model/quartier.model.js');
const Propriete = require('../model/propriete.model.js').Propriete;
const { capitalizeWords } = require('../utils/formatText');

module.exports.addQuartier = async (req, res) => {
    try {
        if (!req.body.nom || !req.body.ville) {
            return res.status(400).json({ success: false, message: "Le nom du quartier et la ville sont requis !" });
        }
        const { ville } = req.body;
        const nomFormate = capitalizeWords(req.body.nom);

        const isExist = await Quartier.findOne({ nom: nomFormate, ville });
        if (isExist) {
            return res.status(400).json({ success: false, message: "Un quartier avec ce nom existe déjà dans cette ville !" });
        }
        const newQuartier = new Quartier({ nom: nomFormate, ville });
        await newQuartier.save();
        res.status(201).json({ success: true, message: "Quartier ajouté avec succès !", quartier: newQuartier });
    } catch (err) {
        // AJOUT : filet de sécurité — l'index unique composé {nom, ville} du modèle
        // peut rejeter une insertion concurrente qui aurait passé le check ci-dessus
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Un quartier avec ce nom existe déjà dans cette ville !" });
        }
        console.error("Erreur lors de l'ajout du quartier :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'ajout du quartier !" });
    }
};

// Récupérer tous les quartiers
module.exports.getAllQuartiers = async (req, res) => {
    try {
        const quartiers = await Quartier.find().populate('ville').sort({ nom: 1 });
        res.status(200).json({ success: true, quartiers });
    } catch (err) {
        console.error("Erreur lors de la récupération des quartiers :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des quartiers" });
    }
};

// AJOUT : récupérer les quartiers d'une seule ville — nécessaire pour tout menu
// déroulant en cascade "ville -> quartier" côté client, absent du controller
// d'origine (le filtre par ville n'existait que côté habitation.controller).
module.exports.getQuartiersByVille = async (req, res) => {
    try {
        const { villeId } = req.params;
        const quartiers = await Quartier.find({ ville: villeId }).sort({ nom: 1 });
        res.status(200).json({ success: true, quartiers });
    } catch (err) {
        console.error("Erreur lors de la récupération des quartiers de la ville :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des quartiers" });
    }
};

// AJOUT : mettre à jour un quartier — absent du controller d'origine
module.exports.updateQuartier = async (req, res) => {
    try {
        const quartierId = req.params.id;
        if (!req.body.nom || !req.body.ville) {
            return res.status(400).json({ success: false, message: "Le nom du quartier et la ville sont requis !" });
        }
        const { ville } = req.body;
        const nomFormate = capitalizeWords(req.body.nom);

        const existing = await Quartier.findOne({ nom: nomFormate, ville, _id: { $ne: quartierId } });
        if (existing) {
            return res.status(400).json({ success: false, message: "Un autre quartier avec ce nom existe déjà dans cette ville !" });
        }

        const updatedQuartier = await Quartier.findByIdAndUpdate(
            quartierId,
            { nom: nomFormate, ville },
            { new: true, runValidators: true }
        ).populate('ville');
        if (!updatedQuartier) {
            return res.status(404).json({ success: false, message: "Quartier non trouvé" });
        }
        res.status(200).json({ success: true, message: "Quartier mis à jour avec succès", quartier: updatedQuartier });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Un autre quartier avec ce nom existe déjà dans cette ville !" });
        }
        console.error("Erreur lors de la mise à jour du quartier :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour du quartier" });
    }
};

module.exports.deleteQuartier = async (req, res) => {
    try {
        const quartierId = req.params.id;

        // AJOUT : on interdit la suppression d'un quartier encore utilisé par des
        // biens, pour ne pas laisser de Propriete avec une référence orpheline.
        const proprieteLiee = await Propriete.findOne({ quartier: quartierId });
        if (proprieteLiee) {
            return res.status(400).json({
                success: false,
                message: "Impossible de supprimer ce quartier : des biens y sont encore rattachés.",
            });
        }

        const deletedQuartier = await Quartier.findByIdAndDelete(quartierId);
        if (!deletedQuartier) {
            return res.status(404).json({ success: false, message: "Quartier non trouvé" });
        }
        res.status(200).json({ success: true, message: "Quartier supprimé avec succès", quartier: deletedQuartier });
    } catch (err) {
        console.error("Erreur lors de la suppression du quartier :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression du quartier" });
    }
};
