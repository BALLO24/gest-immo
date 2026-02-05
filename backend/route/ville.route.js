const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const express = require('express');
const villeController=require('../controller/ville.controller');
const router=express.Router();
router.post('/new',authenticateToken, authorizeRoles("admin"), villeController.addVille);
router.get('/', villeController.getAllVilles);
router.delete('/delete/:id',authenticateToken, authorizeRoles("admin"), villeController.deleteVille);
module.exports=router;