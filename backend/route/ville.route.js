const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const express = require('express');
const villeController=require('../controller/ville.controller');
const router=express.Router();
router.post('/new', villeController.addVille);
router.get('/', villeController.getAllVilles);
router.delete('/delete/:id',villeController.deleteVille);
module.exports=router;