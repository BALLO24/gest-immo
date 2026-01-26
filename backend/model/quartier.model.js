const mongoose=require('mongoose');
const {Schema}=mongoose;
const QuartierSchema=new Schema({
    nom:{
        type:String,
        required:true,
    },
    ville:{
        type:Schema.Types.ObjectId,
        ref:'Ville',    
        required:true,
    },
   },
    {timestamps:true}
);
const Quartier=mongoose.model('Quartier',QuartierSchema);
module.exports=Quartier;