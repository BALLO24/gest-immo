const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const express = require('express');
const quartierController = require('../controller/quartier.controller');
const router = express.Router();

router.get('/', quartierController.getAllQuartiers);
router.get('/ville/:villeId', quartierController.getQuartiersByVille); // AJOUT
router.post('/new', authenticateToken, authorizeRoles('admin'), quartierController.addQuartier);
router.put('/update/:id', authenticateToken, authorizeRoles('admin'), quartierController.updateQuartier); // AJOUT
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), quartierController.deleteQuartier);

module.exports = router;
