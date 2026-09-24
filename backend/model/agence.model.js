const mongoose = require('mongoose');
const { Schema } = mongoose;

// CORRIGÉ : Agence ne porte plus les champs d'authentification
// (numero_telephone, email, password, role) — déplacés vers le modèle "User".
// Ce schéma ne représente désormais que le profil métier/public de l'agence.
const AgenceSchema = new Schema(
    {
        nom_agence: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        nom_proprietaire: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        // AJOUT : contact public affiché sur les annonces, distinct des identifiants
        // de connexion (numero_telephone/email) qui vivent maintenant sur "User".
        // Un client qui consulte une annonce doit pouvoir joindre l'agence sans
        // connaître son compte de connexion.
        telephonePublic: {
            type: String,
            trim: true,
            default: null,
        },
        emailPublic: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
            match: [/^\S+@\S+\.\S+$/, "Email invalide"],
        },
        // AJOUT : identifiant lisible pour les URLs publiques (/agences/mon-agence)
        // et le référencement (SEO), généré côté controller à partir de nom_agence.
        slug: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
        },
        logo: {
            type: String,
            default: null,
        },
        adresse: {
            type: String,
            trim: true,
            default: null,
        },
        statut: {
            type: String,
            enum: ['active', 'inactive', 'suspendue'],
            default: 'active',
        },
        // AJOUT : preuve d'acceptation des CGU/Politique de Confidentialité —
        // sans ça, en cas de litige, rien ne prouve qu'une agence a
        // effectivement accepté une version donnée à une date donnée. La
        // case à cocher côté frontend bloquait déjà la soumission du
        // formulaire, mais ne laissait aucune trace persistante.
        cguAcceptees: {
            version: { type: String, default: null },
            dateAcceptation: { type: Date, default: null },
        },
    },
    { timestamps: true }
);

const Agence = mongoose.model('Agence', AgenceSchema);

// AJOUT : utile pour lister rapidement les agences actives/suspendues côté admin
AgenceSchema.index({ statut: 1 });

module.exports = Agence;
