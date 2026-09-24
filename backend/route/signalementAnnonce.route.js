const express = require("express");
const router = express.Router();
const signalementController = require("../controller/signalementAnnonce.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.post("/", signalementController.creerSignalement); // public, depuis la fiche d'un bien
router.get("/", authenticateToken, authorizeRoles('admin'), signalementController.getSignalements);
router.put("/:id/statut", authenticateToken, authorizeRoles('admin'), signalementController.updateStatutSignalement);

module.exports = router;
