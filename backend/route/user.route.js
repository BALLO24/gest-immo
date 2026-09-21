const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const userController = require('../controller/user.controller');
const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), userController.getAllUsers);
router.put('/:userId/statut', authenticateToken, authorizeRoles('admin'), userController.updateUserStatut);

module.exports = router;
