const Agence = require('../model/agence.model');
const User = require('../model/user.model');
const { Propriete } = require('../model/propriete.model');

// AJOUT : HomeDashboard.jsx (page d'accueil admin) était un placeholder de
// 7 lignes ("Welcome to the Home Dashboard"), sans la moindre vue
// d'ensemble — alors qu'on a construit tout ce qu'il faut pour ça (statuts
// d'agence, vues, misEnAvant, soft delete...). Agrégations MongoDB plutôt
// que de tout recalculer côté client en rapatriant des centaines de
// documents.
module.exports.getStats = async (req, res) => {
    try {
        const [
            agencesParStatut,
            proprietesParStatut,
            proprietesParType,
            proprietesArchiveesCount,
            totalUsers,
            topVues,
        ] = await Promise.all([
            Agence.aggregate([{ $group: { _id: '$statut', total: { $sum: 1 } } }]),
            Propriete.aggregate([
                { $match: { deletedAt: null } },
                { $group: { _id: '$statut', total: { $sum: 1 } } },
            ]),
            Propriete.aggregate([
                { $match: { deletedAt: null } },
                { $group: { _id: '$__t', total: { $sum: 1 } } },
            ]),
            Propriete.countDocuments({ deletedAt: { $ne: null } }),
            User.countDocuments(),
            Propriete.find({ deletedAt: null })
                .sort({ vues: -1 })
                .limit(5)
                .select('prix vues __t typeOffre')
                .populate({ path: 'quartier', select: 'nom ville', populate: { path: 'ville', select: 'nom' } })
                .lean(),
        ]);

        // Transforme les tableaux d'agrégation [{_id, total}] en objets
        // {cle: total}, plus pratiques à consommer côté frontend.
        const toObject = (arr) => arr.reduce((acc, cur) => ({ ...acc, [cur._id || 'non_renseigne']: cur.total }), {});

        res.status(200).json({
            success: true,
            agences: {
                total: agencesParStatut.reduce((s, a) => s + a.total, 0),
                parStatut: toObject(agencesParStatut),
            },
            proprietes: {
                total: proprietesParStatut.reduce((s, p) => s + p.total, 0),
                parStatut: toObject(proprietesParStatut),
                parType: toObject(proprietesParType),
                archivees: proprietesArchiveesCount,
            },
            totalUsers,
            topVues,
        });
    } catch (err) {
        console.error("Erreur lors du calcul des statistiques :", err);
        res.status(500).json({ success: false, message: "Erreur serveur lors du calcul des statistiques" });
    }
};
