const mongoose = require('mongoose');
const { Schema } = mongoose;

// AJOUT : jusqu'ici, une demande de visite se faisait uniquement via
// WhatsApp — rien n'était jamais enregistré côté plateforme. Sans ce
// modèle, le mécanisme de commission décrit dans les CGU (500 FCFA sur
// 2000 FCFA de frais de visite) n'a rigoureusement aucun moyen d'être
// appliqué : il faut au minimum une trace de "cette visite a été demandée
// via ImmoMali" avant de pouvoir un jour y associer un paiement.
const DemandeVisiteSchema = new Schema(
    {
        propriete: {
            type: Schema.Types.ObjectId,
            ref: 'Propriete',
            required: true,
        },
        // Dénormalisé volontairement : même si l'agence change ou si le bien
        // est supprimé plus tard, on garde une trace de qui devait organiser
        // cette visite au moment de la demande.
        agence: {
            type: Schema.Types.ObjectId,
            ref: 'Agence',
            required: true,
        },
        nomClient: {
            type: String,
            required: true,
            trim: true,
        },
        telephoneClient: {
            type: String,
            required: true,
            trim: true,
        },
        emailClient: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        dateSouhaitee: {
            type: Date,
            default: null,
        },
        message: {
            type: String,
            trim: true,
            default: null,
        },
        // AJOUT : statut de la demande, géré par l'agence ou l'admin.
        // "effectuee" est l'état qui, plus tard, pourra déclencher la
        // facturation du frais de visite (2000 FCFA / 500 FCFA plateforme) —
        // pas encore implémenté ici, volontairement (nécessite une intégration
        // de paiement mobile réelle, hors périmètre de ce chantier).
        statut: {
            type: String,
            enum: ['en_attente', 'confirmee', 'effectuee', 'annulee'],
            default: 'en_attente',
        },
    },
    { timestamps: true }
);

DemandeVisiteSchema.index({ agence: 1, statut: 1 });
DemandeVisiteSchema.index({ propriete: 1 });

const DemandeVisite = mongoose.model('DemandeVisite', DemandeVisiteSchema);
module.exports = DemandeVisite;
