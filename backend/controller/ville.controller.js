const Ville = require('../model/ville.model');
const { capitalizeWords } = require('../utils/formatText');

module.exports.addVille = async (req, res) => {
    try {
        if (!req.body.nom) {
            return res.status(400).json({ success: false, message: "Le nom de la ville est requis !" });
        }
        const nomFormate = capitalizeWords(req.body.nom); // CORRIGÉ : capitalise chaque mot ("San pedro" -> "San Pedro")
        const pays = req.body.pays; // AJOUT : champ optionnel du modèle Ville

        const isExist = await Ville.findOne({ nom: nomFormate });
        if (isExist) {
            return res.status(400).json({ success: false, message: "Une ville avec ce nom existe déjà !" });
        }
        const newVille = new Ville({ nom: nomFormate, ...(pays && { pays }) });
        await newVille.save();
        res.status(201).json({ success: true, message: "Ville ajoutée avec succès !", ville: newVille });
    } catch (err) {
        // AJOUT : filet de sécurité contre une éventuelle course (deux requêtes
        // simultanées passent le check ci-dessus puis se percutent sur l'index unique)
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Une ville avec ce nom existe déjà !" });
        }
        console.error("Erreur lors de l'ajout de la ville :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'ajout de la ville !" });
    }
};

// Récupérer toutes les villes
module.exports.getAllVilles = async (req, res) => {
    try {
        const villes = await Ville.find().sort({ nom: 1 });
        res.status(200).json({ success: true, villes });
    } catch (err) {
        console.error("Erreur lors de la récupération des villes :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des villes" });
    }
};

// AJOUT : mettre à jour une ville — absent du controller d'origine (seuls add/get/delete existaient)
module.exports.updateVille = async (req, res) => {
    try {
        const villeId = req.params.id;
        if (!req.body.nom) {
            return res.status(400).json({ success: false, message: "Le nom de la ville est requis !" });
        }
        const nomFormate = capitalizeWords(req.body.nom);

        const existing = await Ville.findOne({ nom: nomFormate, _id: { $ne: villeId } });
        if (existing) {
            return res.status(400).json({ success: false, message: "Une autre ville avec ce nom existe déjà !" });
        }

        const updatedVille = await Ville.findByIdAndUpdate(
            villeId,
            { nom: nomFormate, ...(req.body.pays && { pays: req.body.pays }) },
            { new: true, runValidators: true }
        );
        if (!updatedVille) {
            return res.status(404).json({ success: false, message: "Ville non trouvée" });
        }
        res.status(200).json({ success: true, message: "Ville mise à jour avec succès", ville: updatedVille });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Une autre ville avec ce nom existe déjà !" });
        }
        console.error("Erreur lors de la mise à jour de la ville :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour de la ville" });
    }
};

module.exports.deleteVille = async (req, res) => {
    try {
        const villeId = req.params.id;
        // AJOUT : on interdit la suppression d'une ville encore utilisée par des
        // quartiers, pour ne pas laisser de Quartier avec une référence orpheline
        // (ville n'a pas de suppression en cascade ici, contrairement à Agence).
        const Quartier = require('../model/quartier.model');
        const quartierLie = await Quartier.findOne({ ville: villeId });
        if (quartierLie) {
            return res.status(400).json({
                success: false,
                message: "Impossible de supprimer cette ville : des quartiers y sont encore rattachés.",
            });
        }
        const deletedVille = await Ville.findByIdAndDelete(villeId);
        if (!deletedVille) {
            return res.status(404).json({ success: false, message: "Ville non trouvée" });
        }
        res.status(200).json({ success: true, message: "Ville supprimée avec succès", ville: deletedVille });
    } catch (err) {
        console.error("Erreur lors de la suppression de la ville :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression de la ville" });
    }
};
