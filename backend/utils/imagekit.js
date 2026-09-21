const ImageKitModule = require('@imagekit/nodejs');
const ImageKit = ImageKitModule.default || ImageKitModule;

// AJOUT : remplace Google Drive (usage détourné, pas un vrai CDN d'images)
// comme hébergeur d'images. Cloudinary a été essayé en premier mais bloque
// les inscriptions depuis le Mali ("services not available in your
// country") — ImageKit fonctionne et offre les mêmes bénéfices de
// performance (f_auto équivalent, redimensionnement à la volée, vrai CDN).
//
// Utilise le SDK officiel @imagekit/nodejs (le paquet "imagekit" historique
// est désormais marqué déprécié par ImageKit lui-même).
const client = new ImageKit({
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

// Nécessaire pour construire les URLs de livraison (le SDK ne le lit pas
// depuis la config du client, il faut le repasser à chaque construction d'URL).
const URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT; // ex: https://ik.imagekit.io/xxxxx

const DOSSIER_IMAGEKIT = 'gest-immo/proprietes';

// AJOUT : contrairement à Cloudinary où un seul identifiant (public_id) sert
// à la fois à supprimer ET à reconstruire l'URL, ImageKit sépare les deux :
// fileId (pour supprimer) et filePath (pour l'URL). Le schéma stocke les
// images comme un simple tableau de chaînes — on encode donc les deux
// informations dans une seule chaîne composite, préfixée pour la distinguer
// d'un ancien fileId Google Drive stocké avant cette migration.
const PREFIXE = 'imagekit:';

exports.PREFIXE_IMAGEKIT = PREFIXE;

exports.uploadToImageKit = async (fileBuffer, fileName) => {
	const result = await client.files.upload({
		file: fileBuffer.toString('base64'),
		fileName,
		folder: DOSSIER_IMAGEKIT,
	});
	return `${PREFIXE}${result.fileId}::${result.filePath}`;
};

exports.deleteFromImageKit = async (compositeId) => {
	try {
		const fileId = compositeId.slice(PREFIXE.length).split('::')[0];
		await client.files.delete(fileId);
		return true;
	} catch (error) {
		console.error(`Erreur suppression ImageKit (${compositeId}):`, error.message);
		return true; // ne bloque jamais la suppression du bien pour un souci de nettoyage d'image
	}
};

// AJOUT : URL de livraison optimisée — format automatique selon le
// navigateur (WebP/AVIF), qualité 80 (bon compromis poids/netteté), largeur
// plafonnée (les cartes/fiches du site n'ont jamais besoin de plus large).
exports.urlImageKit = (compositeId, largeur = 800) => {
	const filePath = compositeId.slice(PREFIXE.length).split('::')[1];
	return client.helper.buildSrc({
		src: filePath,
		urlEndpoint: URL_ENDPOINT,
		transformation: [{ width: largeur, quality: 80, format: 'auto' }],
	});
};
