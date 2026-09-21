const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuartierSchema = new Schema(
    {
        nom: {
            type: String,
            required: true,
            trim: true,
        },
        ville: {
            type: Schema.Types.ObjectId,
            ref: 'Ville',
            required: true,
        },
    },
    { timestamps: true }
);

// AJOUT : garantit au niveau base de données qu'un même quartier
// ne peut pas être créé deux fois dans la même ville
// (le controller le vérifiait déjà côté applicatif, ceci est un filet de sécurité)
QuartierSchema.index({ nom: 1, ville: 1 }, { unique: true });

const Quartier = mongoose.model('Quartier', QuartierSchema);
module.exports = Quartier;
