const User = require('../model/user.model');

// AJOUT : n'existait pas du tout — la sidebar admin promettait un lien
// "Utilisateurs" vers une route qui n'a jamais été construite (404
// garantie). Vue en lecture (+ statut) sur TOUS les comptes de connexion,
// admins et agences confondus — utile pour repérer/suspendre un compte
// précis sans toucher au profil public de l'agence entière.

// Lister tous les comptes (admin only)
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('agence', 'nom_agence statut')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, users });
    } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des utilisateurs" });
    }
};

// Changer le statut d'UN compte précis (pas celui de toute l'agence)
module.exports.updateUserStatut = async (req, res) => {
    try {
        const { statut } = req.body;
        if (!['active', 'inactive', 'suspendue'].includes(statut)) {
            return res.status(400).json({ success: false, message: "Statut invalide." });
        }
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { statut },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ success: true, message: "Statut mis à jour avec succès", user });
    } catch (err) {
        console.error("Erreur lors de la mise à jour du statut :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour du statut" });
    }
};
