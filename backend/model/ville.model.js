const mongoose = require('mongoose');
const { Schema } = mongoose;

const VilleSchema = new Schema(
    {
        nom: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // AJOUT : utile si vous couvrez plusieurs pays un jour, sinon laissez la valeur par défaut
        pays: {
            type: String,
            default: 'Mali',
            trim: true,
        },
    },
    { timestamps: true } // AJOUT : cohérence avec Agence/Quartier
);

const Ville = mongoose.model('Ville', VilleSchema);
module.exports = Ville;
