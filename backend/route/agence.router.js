const express=require('express');
const agenceController=require('../controller/agence.controller');
const router=express.Router();
router.post('/new',agenceController.addAgence);
router.get('/', agenceController.getAllAgences);
router.put('/update/:id',agenceController.updateAgence);
router.delete('/delete/:id',agenceController.deleteAgence);
module.exports=router;