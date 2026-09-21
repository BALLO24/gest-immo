const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const express = require('express');
const villeController = require('../controller/ville.controller');
const router = express.Router();

router.get('/', villeController.getAllVilles);
// AJOUT : mutations réservées à l'admin (auparavant sans protection du tout)
router.post('/new', authenticateToken, authorizeRoles('admin'), villeController.addVille);
router.put('/update/:id', authenticateToken, authorizeRoles('admin'), villeController.updateVille); // AJOUT
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), villeController.deleteVille);

module.exports = router;
