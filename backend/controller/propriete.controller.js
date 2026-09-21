const { Propriete, Maison, Appartement, Magasin, Terrain } = require('../model/propriete.model');
const Quartier = require('../model/quartier.model');
const { uploadToImageKit, deleteFromImageKit, urlImageKit, PREFIXE_IMAGEKIT } = require('../utils/imagekit');
// CORRIGÉ (migration ImageKit) : uploadToDrive n'est plus utilisé pour les
// nouveaux biens, mais deleteFromDrive reste nécessaire pour purger
// proprement les biens créés AVANT la migration (voir purgerPropriete).
const { deleteFromDrive } = require('../utils/deleteFromDrive');
const { construireSlugBien, extraireIdDepuisSlug } = require('../utils/proprieteSlug'); // AJOUT
const sharp = require('sharp');

const modelMap = {
    maison: Maison,
    appartement: Appartement,
    terrain: Terrain,
    magasin: Magasin,
};

// AJOUT : transforme les IDs Google Drive en URLs d'affichage, et ajoute un
// slug décoratif (SEO/lisibilité) construit à partir du type de bien, du
// quartier et de la ville. Nécessite que "quartier" (et "quartier.ville")
// soient populés — c'est déjà le cas partout où withImageUrls est appelé.
// Le slug n'est jamais utilisé pour retrouver le document : seul l'_id compte.
function withImageUrls(propriete) {
    const obj = { ...propriete };
    if (obj.images && obj.images.length > 0) {
        // CORRIGÉ (migration ImageKit) : les biens créés avant la migration
        // stockent un fileId Google Drive brut ; ceux créés après stockent un
        // identifiant composite ImageKit (préfixé "imagekit:"). On construit
        // l'URL adaptée selon le format détecté, pour que l'affichage reste
        // correct pour les deux générations de biens sans script de migration.
        obj.images = obj.images.map((imageId) =>
            imageId.startsWith(PREFIXE_IMAGEKIT)
                ? urlImageKit(imageId) // f_auto + qualité 80 + largeur plafonnée
                : "https://lh3.googleusercontent.com/d/" + imageId // ancien format, inchangé
        );
    }
    obj.slug = construireSlugBien(obj);
    return obj;
}

// AJOUT : convertit lat/lng séparés (probable format encore envoyé par le
// frontend) vers le GeoJSON Point attendu par le nouveau schéma. À retirer
// une fois le frontend mis à jour pour envoyer directement { lat, lng } ->
// laissez cette fonction telle quelle, elle ne fait rien si les champs
// GeoJSON sont déjà envoyés au bon format.
function normaliserLocalisation(data) {
    if (data.lat !== undefined && data.lng !== undefined && data.lat !== '' && data.lng !== '') {
        const lat = Number(data.lat);
        const lng = Number(data.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
            data.localisation = { type: 'Point', coordinates: [lng, lat] };
        }
        delete data.lat;
        delete data.lng;
    }
    return data;
}

module.exports.addPropriete = async (req, res) => {
    try {
        const { type, ...proprieteData } = req.body;

        if (!modelMap[type]) {
            return res.status(400).json({ success: false, message: "Type de bien invalide" });
        }

        // CORRIGÉ (bug) : cette vérification bloquait TOTALEMENT les admins,
        // qui n'ont jamais d'agenceId sur leur compte par design (un admin
        // n'est rattaché à aucune agence — voir user.model.js). Le frontend
        // prévoyait pourtant un sélecteur d'agence pour ce cas précis
        // (AddHouseModal affiche un menu déroulant "Agence" quand agenceId
        // n'est pas fourni en prop), mais le backend rejetait la requête
        // avant même d'arriver à l'utiliser — l'ajout de bien était donc
        // totalement cassé pour les admins, sur les 4 types de biens.
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentification requise." });
        }
        if (req.user.role === 'admin') {
            // Un admin choisit explicitement l'agence via le formulaire —
            // on valide juste qu'une valeur a bien été sélectionnée.
            if (!proprieteData.agence) {
                return res.status(400).json({ success: false, message: "Veuillez sélectionner une agence." });
            }
        } else if (req.user.role === 'agence' && req.user.agenceId) {
            // CORRIGÉ (sécurité — IDOR) : l'agence propriétaire est dérivée
            // du token d'authentification pour un compte agence, jamais du
            // corps de la requête — sinon elle pourrait publier au nom d'une
            // AUTRE agence en changeant simplement ce champ.
            proprieteData.agence = req.user.agenceId;
        } else {
            return res.status(403).json({ success: false, message: "Seul un compte agence ou administrateur peut publier un bien." });
        }
        proprieteData.creePar = req.user.userId;

        normaliserLocalisation(proprieteData);

        // CORRIGÉ (performance) : les images étaient traitées une par une
        // (compression Sharp + upload Drive séquentiels), donc le temps total
        // était la SOMME du temps de chaque image. Aucune de ces opérations
        // ne dépend des autres — on les lance maintenant en parallèle, le
        // temps total devient celui de la plus lente des images, pas la somme
        // de toutes. Avec 3 photos, ça peut diviser le temps d'attente par 3.
        // Promise.allSettled (pas Promise.all) pour garder le comportement
        // actuel : une image qui échoue ne bloque pas les autres.
        const files = req.files?.images || req.files || [];
        const uploadResults = await Promise.allSettled(
            files.map(async (file) => {
                const nameWithoutExt = file.originalname.split('.')[0].replace(/\s+/g, "_").replace(/[^\w-]/g, "");
                // CORRIGÉ : l'extension d'origine doit être conservée dans le
                // nom de fichier envoyé à ImageKit — le buffer redimensionné
                // garde le format d'origine (plus de conversion forcée en
                // webp), ImageKit s'appuie sur l'extension pour le détecter.
                const extension = file.originalname.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
                const safeName = `${Date.now()}-${nameWithoutExt}.${extension}`;
                // CORRIGÉ : la conversion forcée en WebP ici devenait contre-
                // productive avec Cloudinary — celui-ci choisit déjà le
                // meilleur format PAR NAVIGATEUR au moment de la livraison
                // (f_auto : WebP, AVIF...). Convertir en WebP à l'avance
                // l'empêcherait de proposer un format encore plus efficace à
                // un navigateur qui le supporterait. On se contente de
                // plafonner la largeur, pour ne pas stocker inutilement une
                // photo de smartphone à pleine résolution.
                const resizedBuffer = await sharp(file.buffer).resize({ width: 1600, withoutEnlargement: true }).toBuffer();
                return uploadToImageKit(resizedBuffer, safeName);
            })
        );
        const imageIds = [];
        uploadResults.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                imageIds.push(result.value);
            } else {
                console.error(`Erreur de traitement pour ${files[i]?.originalname}:`, result.reason);
            }
        });
        proprieteData.images = imageIds;

        const newPropriete = new modelMap[type](proprieteData);
        await newPropriete.save();

        res.status(201).json({ success: true, propriete: newPropriete });
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un bien:", error);
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

module.exports.getAllProprietes = async (req, res) => {
    try {
        const filtre = req.body;
        const limit = filtre?.limit ? parseInt(filtre.limit) : null;
        const skip = filtre?.skip ? parseInt(filtre.skip) : 0; // AJOUT : pagination

        async function buildCriteria(f) {
            // CORRIGÉ (important) : on exclut TOUJOURS les biens archivés
            // (soft delete). Sans ce filtre, une annonce "supprimée" continuerait
            // à apparaître publiquement — c'était un risque introduit par l'ajout
            // du champ deletedAt si le controller n'était pas mis à jour en même temps.
            const critere = { deletedAt: null };
            if (!f) return critere;

            if (f.type && f.type !== "tous") critere.__t = f.type;
            if (f.quartier && f.quartier !== "tous") critere.quartier = f.quartier;
            if ((!f.quartier || f.quartier === "tous") && f.villeSelected) {
                const quartiersVille = await Quartier.find({ ville: f.villeSelected });
                critere.quartier = { $in: quartiersVille.map((q) => q._id) };
            }
            // AJOUT : filtrer par agence — utile pour le dashboard admin
            // (voir les biens d'une agence précise), n'était possible nulle
            // part avant (seule la route dédiée getProprietesByAgence
            // existait, sans les autres critères de recherche).
            if (f.agence && f.agence !== "tous") critere.agence = f.agence;

            // CORRIGÉ : aLouer (booléen) -> typeOffre (enum 'location'/'vente')
            if (f.typeOffre && f.typeOffre !== "tous") {
                critere.typeOffre = f.typeOffre;
            }

            if ((!f.typePaiementAppart || f.typePaiementAppart === "mensuel") && f.prixMin !== undefined && f.prixMin !== null && f.prixMin !== 0 && f.prixMin !== "") {
                const min = Number(f.prixMin);
                if (!isNaN(min)) critere.prix = { ...(critere.prix || {}), $gte: min };
            } else if (f.typePaiementAppart === "journalier") {
                const min = Number(f.prixMin);
                if (!isNaN(min)) critere.prixParJour = { ...(critere.prixParJour || {}), $gte: min };
            } else if (f.typePaiementAppart === "horaire") {
                const min = Number(f.prixMin);
                if (!isNaN(min)) critere.prixParHeure = { ...(critere.prixParHeure || {}), $gte: min };
            }

            if ((!f.typePaiementAppart || f.typePaiementAppart === "mensuel") && f.prixMax !== undefined && f.prixMax !== null && f.prixMax !== 0 && f.prixMax !== "") {
                const max = Number(f.prixMax);
                if (!isNaN(max)) critere.prix = { ...(critere.prix || {}), $lte: max };
            } else if (f.typePaiementAppart === "journalier") {
                const max = Number(f.prixMax);
                if (!isNaN(max)) critere.prixParJour = { ...(critere.prixParJour || {}), $lte: max };
            } else if (f.typePaiementAppart === "horaire") {
                const max = Number(f.prixMax);
                if (!isNaN(max)) critere.prixParHeure = { ...(critere.prixParHeure || {}), $lte: max };
            }

            // CORRIGÉ : position -> etage
            if (f.etage !== undefined && f.etage !== null && f.etage !== "") {
                const nd = Number(f.etage);
                if (!isNaN(nd)) critere.etage = { $lte: nd };
            }

            // CORRIGÉ : nombreSalon -> nombreSalons (renommage du modèle)
            if (f.nbreSalon !== undefined && f.nbreSalon !== null && f.nbreSalon !== 0 && f.nbreSalon !== "" && f.nbreSalon !== "tous") {
                critere.nombreSalons = Number(f.nbreSalon);
            }
            if (f.nbreChambres !== undefined && f.nbreChambres !== null && f.nbreChambres !== 0 && f.nbreChambres !== "" && f.nbreChambres !== "tous") {
                critere.nombreChambres = Number(f.nbreChambres);
            }
            if (f.nombreDouche !== undefined && f.nombreDouche !== null && f.nombreDouche !== 0 && f.nombreDouche !== "" && f.nombreDouche !== "tous") {
                critere.nombreSallesBain = Number(f.nombreDouche);
            }
            // CORRIGÉ (bug) : ces filtres envoyaient la chaîne "true"/"false"
            // telle quelle dans le critère MongoDB, alors que les champs sont
            // de vrais Boolean dans le schéma. MongoDB compare par type
            // strict : { magasin: "true" } (String) ne correspond JAMAIS à un
            // document où magasin vaut true (Boolean) — ces filtres
            // renvoyaient donc silencieusement zéro résultat, "Oui" comme
            // "Non", depuis le début.
            const toBool = (v) => (v === 'true' ? true : v === 'false' ? false : undefined);

            if (f.magasin && f.magasin !== "tous") critere.magasin = toBool(f.magasin);
            if (f.cuisine && f.cuisine !== "tous") critere.cuisine = toBool(f.cuisine);
            if (f.coursUnique && f.coursUnique !== "tous") critere.coursUnique = toBool(f.coursUnique);
            if (f.compteurEDMSepare && f.compteurEDMSepare !== "tous") critere.compteurEDMSepare = toBool(f.compteurEDMSepare);
            if (f.compteurEauSepare && f.compteurEauSepare !== "tous") critere.compteurEauSepare = toBool(f.compteurEauSepare);
            if (f.parking && f.parking !== "tous") critere.motoParking = toBool(f.parking);
            if (f.meuble && f.meuble !== "tous") critere.meuble = toBool(f.meuble);
            if (f.climatisation && f.climatisation !== "tous") critere.climatisation = toBool(f.climatisation);
            if (f.connexionInternet && f.connexionInternet !== "tous") critere.connexionInternet = toBool(f.connexionInternet);
            if (f.energieSecours && f.energieSecours !== "tous") critere.energieSecours = toBool(f.energieSecours);
            // CORRIGÉ : toiletteInterne est un Number dans le schéma Magasin
            // (un compteur), pas un Boolean — "Oui" doit dire "au moins une",
            // pas chercher une égalité avec la chaîne "true".
            if (f.toiletteInterne && f.toiletteInterne !== "tous") {
                critere.toiletteInterne = f.toiletteInterne === 'true' ? { $gt: 0 } : 0;
            }
            if (f.typeTerrain && f.typeTerrain !== "tous") critere.typeTerrain = f.typeTerrain;
            // CORRIGÉ (retour en arrière) : "documentTerrain" est un vrai critère de
            // filtre utilisé par vente/FilterList.jsx (type de titre foncier), pas
            // un reliquat de copier-coller comme je l'avais supposé à tort.
            if (f.documentTerrain && f.documentTerrain !== "tous") critere.documentTerrain = f.documentTerrain;

            if (f.misEnAvant) critere.misEnAvant = f.misEnAvant; // RENOMMÉ : hot -> misEnAvant
            // CORRIGÉ : seul "disponible" était acceptable ici — la recherche
            // publique n'en avait pas besoin d'autre, mais le dashboard admin
            // doit pouvoir filtrer aussi sur "reserve"/"nonDisponible".
            if (f.statut && ['disponible', 'nonDisponible', 'reserve'].includes(f.statut)) {
                critere.statut = f.statut;
            }

            return critere;
        }

        const filtreFinal = await buildCriteria(filtre);

        let query = Propriete.find(filtreFinal)
            .populate([
                { path: "quartier", populate: { path: "ville" } },
                { path: "agence" },
            ])
            .sort({ datePublication: -1 }) // AJOUT : les plus récents en premier par défaut
            .skip(skip)
            .lean();

        if (limit) query = query.limit(limit);

        const proprietes = await query;
        const proprietesAvecUrls = proprietes.map(withImageUrls);

        res.status(200).json(proprietesAvecUrls);
    } catch (error) {
        console.error("Erreur lors de la récupération des biens:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// AJOUT : récupérer le détail d'un bien par son ID — manquait complètement
// dans le controller d'origine (indispensable pour une page de détail
// d'annonce). Incrémente au passage le compteur de vues.
module.exports.getProprieteById = async (req, res) => {
    try {
        // AJOUT : accepte soit un _id MongoDB brut, soit un slug hybride
        // ("maison-location-badalabougou-bamako-<id>") — pratique dès que le
        // frontend utilisera des URLs plus lisibles pour le SEO. La résolution
        // reste toujours basée sur l'_id extrait, jamais sur le texte du slug.
        const id = extraireIdDepuisSlug(req.params.id);
        if (!id) {
            return res.status(400).json({ success: false, message: "Identifiant de bien invalide" });
        }

        const propriete = await Propriete.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { $inc: { vues: 1 } },
            { new: true }
        )
            .populate([
                { path: "quartier", populate: { path: "ville" } },
                { path: "agence" },
            ])
            .lean();

        if (!propriete) {
            return res.status(404).json({ success: false, message: "Bien non trouvé" });
        }
        res.status(200).json({ success: true, propriete: withImageUrls(propriete) });
    } catch (error) {
        console.error("Erreur lors de la récupération du bien:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

module.exports.updatePropriete = async (req, res) => {
    try {
        const proprieteId = req.params.id;
        const propriete = await Propriete.findById(proprieteId);

        if (!propriete) {
            return res.status(404).json({ message: "Bien non trouvé" });
        }

        // AJOUT (sécurité — IDOR) : seule l'agence propriétaire (ou un admin)
        // peut modifier ce bien.
        if (req.user.role !== 'admin' && String(propriete.agence) !== String(req.user.agenceId)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce bien." });
        }

        const updates = { ...req.body };
        // On ne laisse jamais le client réassigner la propriété d'une annonce
        delete updates.agence;
        delete updates.creePar;
        delete updates.__t;

        normaliserLocalisation(updates);

        // AJOUT : possibilité d'ajouter de nouvelles images lors d'une mise à
        // jour (le controller d'origine ne gérait aucun upload sur update,
        // seulement sur la création).
        const files = req.files?.images || req.files || [];
        if (files.length > 0) {
            // CORRIGÉ (performance) : même correctif que sur addPropriete —
            // upload en parallèle plutôt qu'un par un.
            const uploadResults = await Promise.allSettled(
                files.map(async (file) => {
                    const nameWithoutExt = file.originalname.split('.')[0].replace(/\s+/g, "_").replace(/[^\w-]/g, "");
                    const extension = file.originalname.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
                    const safeName = `${Date.now()}-${nameWithoutExt}.${extension}`;
                    const resizedBuffer = await sharp(file.buffer).resize({ width: 1600, withoutEnlargement: true }).toBuffer();
                    return uploadToImageKit(resizedBuffer, safeName);
                })
            );
            const imageIds = [];
            uploadResults.forEach((result, i) => {
                if (result.status === 'fulfilled') {
                    imageIds.push(result.value);
                } else {
                    console.error(`Erreur de traitement pour ${files[i]?.originalname}:`, result.reason);
                }
            });
            // Ajoute aux images existantes (ne les remplace pas)
            updates.images = [...(propriete.images || []), ...imageIds];
        }

        propriete.set(updates);
        const savedPropriete = await propriete.save();
        const updatedPropriete = await Propriete.findById(savedPropriete._id)
            .populate({ path: 'quartier', populate: { path: 'ville' } })
            .lean();

        res.status(200).json(withImageUrls(updatedPropriete));
    } catch (error) {
        console.error("Erreur Update:", error);
        res.status(400).json({ message: "Erreur de validation", error: error.message });
    }
};

// CORRIGÉ : suppression douce (soft delete) au lieu d'une suppression
// définitive, cohérent avec le champ "deletedAt" ajouté au modèle. Les images
// ne sont plus supprimées de Drive à ce stade (elles le sont uniquement lors
// d'une purge définitive, voir purgerPropriete ci-dessous), pour permettre une
// restauration.
module.exports.deletePropriete = async (req, res) => {
    try {
        const proprieteId = req.params.id;
        const propriete = await Propriete.findById(proprieteId);

        if (!propriete) {
            return res.status(404).json({ message: "Bien non trouvé" });
        }
        if (req.user.role !== 'admin' && String(propriete.agence) !== String(req.user.agenceId)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce bien." });
        }

        propriete.deletedAt = new Date();
        propriete.statut = 'nonDisponible';
        await propriete.save();

        res.status(200).json({ success: true, message: "Bien archivé avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'archivage du bien:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// AJOUT : restaurer un bien archivé par erreur
module.exports.restaurerPropriete = async (req, res) => {
    try {
        const propriete = await Propriete.findById(req.params.id);
        if (!propriete) {
            return res.status(404).json({ message: "Bien non trouvé" });
        }
        if (req.user.role !== 'admin' && String(propriete.agence) !== String(req.user.agenceId)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à restaurer ce bien." });
        }
        propriete.deletedAt = null;
        propriete.statut = 'disponible';
        await propriete.save();
        res.status(200).json({ success: true, message: "Bien restauré avec succès" });
    } catch (error) {
        console.error("Erreur lors de la restauration du bien:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// AJOUT : suppression DÉFINITIVE (purge), réservée à un usage admin — reprend
// l'ancienne logique de suppression Drive + document, pour les cas où
// l'archivage ne suffit pas (RGPD, nettoyage périodique...).
module.exports.purgerPropriete = async (req, res) => {
    try {
        const proprieteId = req.params.id;
        const propriete = await Propriete.findById(proprieteId);
        if (!propriete) {
            return res.status(404).json({ message: "Bien non trouvé" });
        }

        if (propriete.images && propriete.images.length > 0) {
            // CORRIGÉ (migration Cloudinary) : les biens créés avant la
            // migration stockent encore un fileId Google Drive brut, ceux
            // créés après stockent un public_id Cloudinary (préfixé
            // "gest-immo/"). On route la suppression vers le bon service
            // selon le format, pour que la purge fonctionne pour les deux
            // générations de biens sans script de migration séparé.
            await Promise.all(
                propriete.images.map(async (imageId) => {
                    try {
                        if (imageId.startsWith(PREFIXE_IMAGEKIT)) {
                            await deleteFromImageKit(imageId);
                        } else {
                            await deleteFromDrive(imageId);
                        }
                    } catch (imgError) {
                        console.error(`Erreur suppression image (${imageId}):`, imgError.message);
                    }
                })
            );
        }

        await Propriete.findByIdAndDelete(proprieteId);
        res.status(200).json({ success: true, message: "Bien supprimé définitivement" });
    } catch (error) {
        console.error("Erreur lors de la purge du bien:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Récupérer les biens d'une agence
// AJOUT : ?includeDeleted=true permet à l'agence de voir aussi ses annonces
// archivées dans son propre tableau de bord (exclu par défaut).
module.exports.getProprietesByAgence = async (req, res) => {
    try {
        const { agenceId } = req.params;
        const includeDeleted = req.query.includeDeleted === 'true';
        const filtre = { agence: agenceId };
        if (!includeDeleted) filtre.deletedAt = null;

        const proprietes = await Propriete.find(filtre)
            .populate({ path: "quartier", populate: { path: "ville" } })
            .sort({ datePublication: -1 })
            .lean();

        res.status(200).json({ proprietes: proprietes.map(withImageUrls) });
    } catch (error) {
        console.error("Erreur agence:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// AJOUT : corbeille ADMIN — toutes les agences confondues, contrairement à
// getProprietesByAgence (une seule agence). C'est ce qui manquait pour que
// purgerPropriete (déjà construit, jamais relié à aucune UI) ait un sens :
// avant, il n'existait aucune façon de lister les biens archivés de la
// plateforme entière pour ensuite les purger.
module.exports.getCorbeilleAdmin = async (req, res) => {
    try {
        const proprietes = await Propriete.find({ deletedAt: { $ne: null } })
            .populate([
                { path: "quartier", populate: { path: "ville" } },
                { path: "agence" },
            ])
            .sort({ deletedAt: -1 })
            .lean();

        res.status(200).json({ success: true, proprietes: proprietes.map(withImageUrls) });
    } catch (error) {
        console.error("Erreur corbeille admin:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// AJOUT : endpoint dédié au sitemap dynamique — avant, sitemap.xml était un
// fichier statique de 3 URLs, ne référençant jamais aucune fiche de bien
// individuelle (là où se trouve la vraie valeur SEO : longue traîne du type
// "villa titre foncier Badalabougou"). Public (pas d'authentification, comme
// getAllProprietes), volontairement léger : seuls slug + date de mise à jour,
// sans limite (un sitemap doit lister TOUT, contrairement à la recherche
// publique plafonnée à 20 résultats).
module.exports.getSitemapData = async (req, res) => {
    try {
        const proprietes = await Propriete.find({ deletedAt: null, statut: "disponible" })
            .select("__t typeOffre quartier updatedAt")
            .populate({ path: "quartier", populate: { path: "ville" } })
            .lean();

        const data = proprietes.map((p) => ({
            slug: construireSlugBien(p),
            updatedAt: p.updatedAt,
        }));

        res.status(200).json({ success: true, proprietes: data });
    } catch (error) {
        console.error("Erreur données sitemap:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
