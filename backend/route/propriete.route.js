const express = require("express");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const proprieteController = require("../controller/propriete.controller");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.post("/", proprieteController.getAllProprietes); // recherche/filtre, public
// AJOUT : doit être déclarée AVANT "/:id" ci-dessous, sinon Express
// interpréterait "admin" comme une valeur du paramètre :id.
router.get("/admin/corbeille", authenticateToken, authorizeRoles('admin'), proprieteController.getCorbeilleAdmin);
// AJOUT : idem, doit être déclarée avant "/:id" — publique (le sitemap est
// consommé par le middleware Vercel du frontend et directement par les
// robots d'indexation, sans authentification).
router.get("/sitemap-data", proprieteController.getSitemapData);
// AJOUT : idem, avant "/:id" — publique (favoris sans compte, côté navigateur).
router.get("/favoris", proprieteController.getProprietesParIds);
router.get("/:id", proprieteController.getProprieteById); // AJOUT : détail d'un bien, public
router.get("/agence/:agenceId", proprieteController.getProprietesByAgence);

// AJOUT (sécurité) : ces routes nécessitaient d'être authentifié en tant
// qu'agence — avant, n'importe qui pouvait appeler /new avec l'ID d'une
// agence de son choix dans le corps de la requête.
router.post(
    "/new",
    authenticateToken,
    authorizeRoles('agence'),
    upload.fields([
        { name: 'images', maxCount: 3 },
        { name: 'video', maxCount: 1 },
    ]),
    proprieteController.addPropriete
);
router.put(
    "/update/:id",
    authenticateToken,
    authorizeRoles('agence', 'admin'),
    upload.fields([{ name: 'images', maxCount: 3 }]),
    proprieteController.updatePropriete
);
router.delete("/delete/:id", authenticateToken, authorizeRoles('agence', 'admin'), proprieteController.deletePropriete);
router.put("/restaurer/:id", authenticateToken, authorizeRoles('agence', 'admin'), proprieteController.restaurerPropriete); // AJOUT
router.delete("/purger/:id", authenticateToken, authorizeRoles('admin'), proprieteController.purgerPropriete); // AJOUT

module.exports = router;
