const mongoose = require('mongoose');
const { Schema } = mongoose;

const HabitationSchema = new Schema({
	titre: { type: String, required: true },
	quartier: { type:Schema.Types.ObjectId, 
				ref:"Quartier",
				required: true 
			},
	// spécifiques aux habitations
	position: {type : Number, default:null},
	coursUnique: { type: Boolean, default: null },
	description: String,
	prix: { type: Number, required: true },
	images: [{ type: String }],
	//video: { type: String },
	aLouer: { type: Boolean, default: null },
    hot: { type: Boolean, default: false },
	statut: { type: String, enum: ['disponible', 'loué', 'vendu'], default: 'disponible' },

	datePublication: { type: Date, default: Date.now },

}, { discriminatorKey: '__t', collection: 'habitations' });

const Habitation = mongoose.model('Habitation', HabitationSchema);

const MaisonSchema = new Schema({
	nombreChambres: Number,
	nombreSallesBain: Number,
	nombreSalon: Number,
	cuisine: Boolean,
    magasin: Boolean,
    compteurEDMSepare: Boolean,
    compteurEauSepare: Boolean,
    coursUnique: Boolean,
	motoParking: Boolean,
});


const AppartementSchema = new Schema({
	prixParHeure: Number,
	prixParJour: Number,
	nombreChambres: Number,
	nombreSallesBain: Number,
	nombreSalon: Number,
	coursUnique: Boolean,
	cuisine: Boolean,
	magasin: Boolean,
	meuble: Boolean,
	climatisation: Boolean,
	connexionInternet: Boolean,
	energieSecours: Boolean
});

const MagasinSchema = new Schema({
    compteurEDMSepare: Boolean,
    compteurEauSepare: Boolean,
	toiletteInterne: Boolean,
});


const TerrainSchema = new Schema({
	dimensionTerrain: { type: String, default: null },
	documentTerrain: { type: String, default: null },
	typeTerrain: { type: String, enum : ['residentiel','agricole'], default: null } ,
});

const Maison = Habitation.discriminator('maison', MaisonSchema);
const Appartement = Habitation.discriminator('appartement', AppartementSchema);
const Magasin = Habitation.discriminator('magasin', MagasinSchema);
const Terrain = Habitation.discriminator('terrain', TerrainSchema);

module.exports = { Habitation, Maison, Appartement, Magasin,Terrain };
