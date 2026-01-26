const mongoose=require('mongoose');
const {Schema}=mongoose;
const VilleSchema=new Schema({
    nom:{
        type:String,
        required:true,
        unique:true
}});
const Ville=mongoose.model('Ville',VilleSchema);
module.exports=Ville;