const mongoose = require('mongoose');
const { Schema } = mongoose;

// RENOMMÉ : Habitation -> Propriete. Le modèle parent couvre aussi les terrains,
// qui ne sont pas des "habitations" — "Propriete" est plus juste métier pour
// englober maison / appartement / magasin / terrain.
const ProprieteSchema = new Schema(
	{
		quartier: {
			type: Schema.Types.ObjectId,
			ref: 'Quartier',
			required: true,
		},

		description: String,

		// "prix" est toujours obligatoire, quel que soit le type de bien
		// et le type d'offre. Pour un appartement, des tarifs courte durée
		// optionnels (prixParHeure / prixParJour) peuvent venir en complément
		// — voir le discriminator Appartement ci-dessous.
		prix: {
			type: Number,
			required: [true, "Le prix est obligatoire"],
		},
		// AJOUT : devise, pour anticiper une couverture multi-pays (Ville.pays
		// existe déjà). XOF par défaut vu le contexte actuel.
		devise: {
			type: String,
			default: 'XOF',
			trim: true,
		},

		images: [{ type: String }],

		// CORRIGÉ : remplace le booléen "aLouer" par un enum explicite.
		typeOffre: {
			type: String,
			enum: ['location', 'vente'],
			required: true,
		},

		// RENOMMÉ : hot -> misEnAvant (plus explicite que "hot" sans contexte).
		// Sert à mettre un bien en avant en page d'accueil / recherche.
		misEnAvant: { type: Boolean, default: false },

		statut: {
			type: String,
			enum: ['disponible', 'nonDisponible', 'reserve'],
			default: 'disponible',
		},

		datePublication: { type: Date, default: Date.now },

		agence: {
			type: Schema.Types.ObjectId,
			ref: 'Agence',
			required: true,
		},

		creePar: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},

		vues: { type: Number, default: 0 },

		// Référence publique optionnelle. Index partiel unique (voir plus bas)
		// pour éviter le piège duplicate-key sur les valeurs null.
		codeReference: { type: String, default: null, trim: true },

		// AJOUT : soft delete — une annonce supprimée reste consultable en
		// historique/statistiques plutôt que d'être détruite (hard delete).
		deletedAt: { type: Date, default: null },

		// CORRIGÉ : format GeoJSON standard (au lieu de {lat, lng}) pour permettre
		// les requêtes géospatiales natives de MongoDB ($near, $geoWithin...).
		// coordinates = [longitude, latitude] (attention à l'ordre).
		// NOTE sur le _id : ce pattern (objet brut avec une clé "type" imbriquée,
		// pas une Schema à part) est le pattern officiel Mongoose pour le GeoJSON
		// et NE crée PAS de sous-document avec _id — Mongoose n'ajoute un _id que
		// lorsque le type d'un champ est une véritable instance de Schema.
		// CORRIGÉ (le vrai risque) : les "default" ont été retirés. Avec
		// type.default:'Point' mais coordinates sans default, un document
		// pouvait se retrouver avec localisation.type='Point' SANS coordinates
		// (Mongoose applique les defaults par chemin, indépendamment du
		// parent) — GeoJSON invalide qui fait échouer l'indexation 2dsphere.
		// Le validateur ci-dessous garantit que type et coordinates sont soit
		// tous les deux absents, soit tous les deux présents.
		localisation: {
			type: {
				type: String,
				enum: ['Point'],
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
			},
		},
	},
	{
		discriminatorKey: '__t',
		collection: 'proprietes',
		timestamps: true,
	}
);

// AJOUT : garantit qu'on n'enregistre jamais un Point GeoJSON à moitié rempli.
ProprieteSchema.pre('validate', function (next) {
	const loc = this.localisation;
	const aType = !!(loc && loc.type);
	const aCoords = !!(loc && Array.isArray(loc.coordinates) && loc.coordinates.length === 2);
	if (aType !== aCoords) {
		return next(new Error("localisation : 'type' et 'coordinates' doivent être fournis ensemble ou pas du tout."));
	}
	if (loc && !aType && !aCoords) {
		this.localisation = undefined;
	}
	next();
});

// CORRIGÉ : un seul index composé couvre le parcours de recherche principal
// (quartier -> type de bien -> type d'offre -> statut -> tri/filtre par prix).
// Si vos utilisateurs filtrent souvent par type SANS quartier, inversez
// l'ordre des deux premiers champs.
ProprieteSchema.index({ quartier: 1, __t: 1, typeOffre: 1, statut: 1, prix: 1 });
ProprieteSchema.index({ agence: 1 });
// AJOUT : index géospatial pour recherche par proximité/rayon ou carte.
ProprieteSchema.index({ localisation: '2dsphere' });
// AJOUT : dashboard "mes biens" (annonces créées par un user donné).
ProprieteSchema.index({ creePar: 1 });
// AJOUT : tri "plus récents".
ProprieteSchema.index({ datePublication: -1 });
// AJOUT : filtrage rapide des annonces non supprimées.
ProprieteSchema.index({ deletedAt: 1 });
// AJOUT : référence publique unique quand elle est renseignée, via index
// partiel pour éviter le piège duplicate-key sur les valeurs par défaut null.
ProprieteSchema.index(
	{ codeReference: 1 },
	{ unique: true, partialFilterExpression: { codeReference: { $type: 'string' } } }
);

const Propriete = mongoose.model('Propriete', ProprieteSchema);

// AJOUT : définition partagée du champ "etage", pour les types de biens qui
// peuvent être soit autonomes (un cours entier), soit une unité au sein d'un
// ensemble plus grand (immeuble, cour partagée...) : Maison, Appartement,
// Magasin. Pas besoin d'un booléen "faitPartieDunEnsemble" séparé : etage
// reste `null` pour un bien autonome/unique, et prend une valeur réelle
// (0, 1, 2...) quand le bien fait partie d'un ensemble.
// Un seul point de définition évite de dupliquer ce champ dans les 3 schémas
// ci-dessous — si sa définition change un jour (ex: ajouter un min/max),
// il n'y a qu'un seul endroit à modifier.
const champPosition = {
	etage: { type: Number, default: null },
};

// CORRIGÉ : nombreSalon -> nombreSalons (cohérence pluriel avec nombreChambres/nombreSallesBain).
const MaisonSchema = new Schema({
	...champPosition,
	nombreChambres: Number,
	nombreSallesBain: Number,
	nombreSalons: Number,
	cuisine: Boolean,
	magasin: Boolean,
	compteurEDMSepare: Boolean,
	compteurEauSepare: Boolean,
	coursUnique: Boolean,
	motoParking: Boolean,
});

const AppartementSchema = new Schema({
	...champPosition,
	// Tarifs courte durée optionnels, pertinents UNIQUEMENT en location.
	// "prix" (défini sur Propriete) reste le seul prix qui compte pour une
	// vente. Le hook ci-dessous garantit que ces deux champs ne traînent
	// jamais en base pour un appartement en vente — même si un ancien
	// enregistrement les avait renseignés avant un changement de typeOffre,
	// ou si un client contourne le formulaire.
	prixParHeure: { type: Number, default: null },
	prixParJour: { type: Number, default: null },
	nombreChambres: Number,
	nombreSallesBain: Number,
	nombreSalons: Number,
	coursUnique: Boolean,
	cuisine: Boolean,
	magasin: Boolean,
	meuble: Boolean,
	climatisation: Boolean,
	connexionInternet: Boolean,
	energieSecours: Boolean,
});

// AJOUT : filet de sécurité data — un appartement en vente n'a pas de tarif
// horaire/journalier, ce sont des notions de location courte durée.
AppartementSchema.pre('validate', function (next) {
	if (this.typeOffre === 'vente') {
		this.prixParHeure = null;
		this.prixParJour = null;
	}
	next();
});

const MagasinSchema = new Schema({
	...champPosition,
	compteurEDMSepare: Boolean,
	compteurEauSepare: Boolean,
	toiletteInterne: Number,
});

// NOTE : pas de restriction sur typeOffre pour le magasin — il peut être
// une partie d'une maison (location uniquement en pratique) OU une propriété
// à part entière (vente possible). Les deux cas sont donc valides au niveau
// du modèle.

// CORRIGÉ (retour en arrière) : pas de discriminator "Champ" séparé — le
// formulaire existant gère l'agricole comme une simple valeur de typeTerrain,
// dans le même formulaire Terrain. Créer un discriminator dédié aurait
// nécessité une UI qui n'existe pas ; on colle à l'usage réel.
// CORRIGÉ : "documentTerrain" n'est pas une URL de fichier mais un type de
// document choisi dans une liste fermée (select) — et c'est un vrai critère
// de filtre utilisé par vente/FilterList.jsx. L'enum reprend exactement les
// valeurs du <select> du frontend.
// CORRIGÉ : "dimensionTerrain" reste une String en texte libre (ex: "20x25"),
// pas un nombre — ce n'est pas une superficie calculée mais une description
// largeur x longueur telle que saisie par l'agence.
const TerrainSchema = new Schema({
	documentTerrain: {
		type: String,
		enum: ['Titre Foncier', 'Titre Provisoire', 'Permis', 'Bulletin', "Lettre d'attribution", 'Autre'],
		default: null,
	},
	dimensionTerrain: { type: String, default: null },
	typeTerrain: { type: String, enum: ['residentiel', 'agricole', 'commercial'], default: null },
});

const Maison = Propriete.discriminator('maison', MaisonSchema);
const Appartement = Propriete.discriminator('appartement', AppartementSchema);
const Magasin = Propriete.discriminator('magasin', MagasinSchema);
const Terrain = Propriete.discriminator('terrain', TerrainSchema);

module.exports = { Propriete, Maison, Appartement, Magasin, Terrain };
