const mongoose = require('mongoose');
const { Schema } = mongoose;

// AJOUT : entité d'authentification séparée de l'entité métier "Agence".
// Un "user" est soit un administrateur de la plateforme (role='admin'),
// soit le compte de connexion d'une agence (role='agence', lié via "agence").
const UserSchema = new Schema(
    {
        nom: {
            type: String,
            required: true,
            trim: true,
        },
        numero_telephone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: (v) => (v.match(/\d/g) || []).length >= 8,
                message: "Numéro de téléphone invalide (au moins 8 chiffres)",
            },
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true, // CORRIGÉ : plus de "default: null" — un champ absent est bien ignoré
            // par l'index sparse, alors qu'un champ explicitement à `null` (via default)
            // ne l'est pas et provoque une erreur de clé dupliquée dès le 2e user sans email.
            match: [/^\S+@\S+\.\S+$/, "Email invalide"],
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'agence'],
            default: 'agence',
        },
        // Rempli uniquement si role === 'agence' : l'agence que ce compte gère
        agence: {
            type: Schema.Types.ObjectId,
            ref: 'Agence',
            default: null,
        },
        statut: {
            type: String,
            enum: ['active', 'inactive', 'suspendue'],
            default: 'active',
        },
        // AJOUT : réinitialisation de mot de passe en libre-service. On ne
        // stocke jamais le token en clair (comme un mot de passe) — seul son
        // hash SHA-256 est en base, comparé au hash du token reçu dans le lien.
        resetPasswordToken: {
            type: String,
            default: null,
            select: false,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
            select: false,
        },
    },
    { timestamps: true }
);

// Un compte "agence" doit obligatoirement être rattaché à une agence
UserSchema.pre('validate', function (next) {
    if (this.role === 'agence' && !this.agence) {
        return next(new Error("Un compte de type 'agence' doit être rattaché à une agence."));
    }
    if (this.role === 'admin' && this.agence) {
        return next(new Error("Un compte 'admin' ne doit pas être rattaché à une agence."));
    }
    next();
});

// CORRIGÉ (retour en arrière) : un seul compte de connexion par agence,
// décision reconfirmée après avoir envisagé le multi-utilisateurs.
// Si vous voulez plus tard autoriser plusieurs utilisateurs pour une même
// agence (ex: employés), il suffira de retirer "unique: true" ici — et de
// remettre en place le contrôleur/la route "équipe" correspondants.
UserSchema.index({ agence: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;
