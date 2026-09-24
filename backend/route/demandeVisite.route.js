const express = require("express");
const router = express.Router();
const demandeVisiteController = require("../controller/demandeVisite.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.post("/", demandeVisiteController.creerDemandeVisite); // public, depuis la fiche d'un bien
router.get("/", authenticateToken, authorizeRoles('admin', 'agence'), demandeVisiteController.getDemandesVisite);
router.put("/:id/statut", authenticateToken, authorizeRoles('admin', 'agence'), demandeVisiteController.updateStatutDemandeVisite);

module.exports = router;
