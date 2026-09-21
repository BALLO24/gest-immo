const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const express = require('express');
const agenceController = require('../controller/agence.controller');
const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), agenceController.getAllAgences);
router.get('/:id', authenticateToken, authorizeRoles('admin'), agenceController.getAgenceById); // AJOUT
router.post('/new', authenticateToken, authorizeRoles('admin'), agenceController.addAgence);
router.put('/update/:id', authenticateToken, authorizeRoles('admin'), agenceController.updateAgence);
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), agenceController.deleteAgence);

module.exports = router;
