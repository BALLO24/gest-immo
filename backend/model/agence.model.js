const mongoose=require('mongoose');
const {Schema}=mongoose;
const AgenceSchema = new Schema({
    nom_agence: {
        type: String,
        required: true,
        unique: true,
        undefined: false,
    },
    nom_proprietaire: {
        type: String,
        required: true,
    },

    numero_telephone: {
        type: String,
        required: true,
    },
    nomUtilisateur:{
        type:String,
        required:true,
        unique:true,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    statut:{
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    role:{
        type:String,
        enum:['admin','agence'],
        default: 'agence',
    },
},
    {timestamps:true}
);
const Agence=mongoose.model('Agence',AgenceSchema);
module.exports=Agence;