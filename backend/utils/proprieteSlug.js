// RENOMMÉ : utils.js -> proprieteSlug.js (le nom "utils.js" était trop
// générique pour ce que fait réellement ce fichier, et son en-tête d'origine
// disait même "// utils/slug.js" — un nom de fichier différent de celui
// utilisé, reliquat d'un renommage antérieur).
//
// CORRIGÉ : slugify() était dupliqué ici ET dans formatText.js, avec une
// logique équivalente mais écrite différemment (deux implémentations à
// maintenir en parallèle, avec un risque qu'elles divergent silencieusement
// un jour). formatText.js est déjà la version utilisée par agence.controller.js
// — on la réutilise ici plutôt que d'en garder une deuxième.
const { slugify } = require('./formatText');

// Construit le slug public d'un bien : "__t + typeOffre + quartier + ville"
// suivi de l'_id MongoDB. Le slug est purement DÉCORATIF (SEO + lisibilité) :
// la résolution côté API se fait TOUJOURS par l'_id, jamais par le slug.
//
// Prérequis : le document doit avoir été peuplé via
//   .populate({ path: 'quartier', select: 'nom ville',
//               populate: { path: 'ville', select: 'nom' } })
// Sinon les segments quartier/ville sont simplement omis (le slug reste
// valide, seul l'_id compte pour la résolution).
function construireSlugBien(bien) {
	if (!bien || !bien._id) return '';

	const morceaux = [
		bien.__t,                  // 'maison', 'appartement', 'magasin', 'terrain'
		bien.typeOffre,            // 'location', 'vente'
		bien.quartier?.nom,        // nécessite populate('quartier')
		bien.quartier?.ville?.nom, // nécessite populate imbriqué
	].filter(Boolean);

	const base = slugify(morceaux.join(' '));
	return base ? `${base}-${bien._id}` : String(bien._id);
}

// Extrait l'_id depuis un paramètre d'URL qui peut être :
//   - un _id brut            : "6712a8f3e4b0c9d1e2f3a4b5"
//   - un slug hybride        : "maison-location-badalabougou-bamako-6712a8f3e4b0c9d1e2f3a4b5"
// Retourne l'_id, ou null si rien de valide n'est trouvé.
// Permet à la route GET /proprietes/:id d'accepter les deux formes sans branche.
function extraireIdDepuisSlug(param) {
	if (!param) return null;
	const match = String(param).match(/[a-f0-9]{24}$/i);
	return match ? match[0] : null;
}

module.exports = { construireSlugBien, extraireIdDepuisSlug };
