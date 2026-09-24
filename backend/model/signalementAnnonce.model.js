const mongoose = require('mongoose');
const { Schema } = mongoose;

// AJOUT : jusqu'ici, aucun moyen pour un visiteur de signaler une annonce
// frauduleuse, déjà louée/vendue ailleurs, ou aux informations trompeuses —
// seul un contact direct par WhatsApp aurait pu faire remonter ça, sans
// aucune trace ni suivi de modération possible.
const SignalementAnnonceSchema = new Schema(
    {
        propriete: {
            type: Schema.Types.ObjectId,
            ref: 'Propriete',
            required: true,
        },
        // Dénormalisé volontairement, même raison que pour DemandeVisite :
        // garder une trace de l'agence concernée même si le bien est
        // supprimé ensuite (par exemple suite à ce signalement).
        agence: {
            type: Schema.Types.ObjectId,
            ref: 'Agence',
            required: true,
        },
        motif: {
            type: String,
            enum: ['fraude', 'deja_indisponible', 'informations_incorrectes', 'autre'],
            required: true,
        },
        message: {
            type: String,
            trim: true,
            required: true,
        },
        // Optionnel — un signalement anonyme reste valide, mais un contact
        // permet à l'admin de recontacter la personne si besoin de précisions.
        contactSignaleur: {
            type: String,
            trim: true,
            default: null,
        },
        statut: {
            type: String,
            enum: ['nouveau', 'en_cours', 'traite', 'rejete'],
            default: 'nouveau',
        },
    },
    { timestamps: true }
);

SignalementAnnonceSchema.index({ statut: 1 });
SignalementAnnonceSchema.index({ propriete: 1 });

const SignalementAnnonce = mongoose.model('SignalementAnnonce', SignalementAnnonceSchema);
module.exports = SignalementAnnonce;
