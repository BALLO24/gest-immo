// AJOUT : petites fonctions de formatage de texte, utilisées par plusieurs
// controllers (ville, quartier, agence). Centralisées ici pour éviter que
// chaque controller réimplémente sa propre version légèrement différente.

// "san pedro" -> "San Pedro" (capitalise chaque mot, pas seulement le premier)
function capitalizeWords(str) {
	if (!str || typeof str !== 'string') return str;
	return str
		.trim()
		.toLowerCase()
		.split(/\s+/)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

// "Immo Mali & Co" -> "immo-mali-co" (pour URLs publiques / SEO)
function slugify(str) {
	if (!str || typeof str !== 'string') return '';
	return str
		.toString()
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // retire les accents
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-+|-+$)/g, '');
}

module.exports = { capitalizeWords, slugify };
