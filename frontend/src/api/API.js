
export default {

    //API pour l'authentification des agences
    async login(credentials){
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials),
        });
        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.message || 'Échec de la connexion' };
        }   
    },

    async register(agenceData) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agenceData),
        });
        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.message || "Échec de l'inscription" };
        }
    },




    /*****************API pour les habitations**************************/
    async addHabitation(habitationData){
        //await new Promise(resolve=>setTimeout(resolve,800));
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch('http://localhost:5000/api/habitations/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 2. L'envoyer ici
            },
            body: habitationData,
        });
        if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
          
           return result.success === true;
    },
async getHabitations(filtre) {
    const response = await fetch('http://localhost:5000/api/habitations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filtre),
    });

    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        // Si 401 ou 403, tu pourrais rediriger vers login ici
        return [];
    }
    },
    async getHabitationsByAgence(agenceId) {
            const token = localStorage.getItem("authToken"); // 1. Récupérer le token
              agenceId=agenceId||"6979f3de87c5ab26e43dcdb1";
        const response = await fetch(`http://localhost:5000/api/habitations/agence/${agenceId}`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
        });
        if(response.ok){
            const data=await response.json();
            return data.habitations;
         }
        else{
            return [];
         }
    },

     
    async deleteHabitation(habitationId) {
    const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`http://localhost:5000/api/habitations/delete/${habitationId}`, {
            method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
},
        });
        if (!response.ok) return false;
        const result = await response.json()
        console.log(result);
        return result;
    },

    //  *****************API pour les agences**************************
    async addAgence(agenceData) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        // await new Promise(resolve=>setTimeout(resolve,800));
        const response = await fetch('http://localhost:5000/api/agences/new', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
            method: 'POST',
            body: JSON.stringify(agenceData),
        });
       // if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
           //return result.success === true;
           return result;
    },
    async getAllAgences() {
        const token= localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch('http://localhost:5000/api/agences', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
            
        }); 
        if(response.ok){
            const data=await response.json();
            return data.agences;
        }
        else{
            return [];
        }       
    },
    async deleteAgence(agenceId) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`http://localhost:5000/api/agences/delete/${agenceId}`, {
            method: 'DELETE',
                    headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },

        }); 
        if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
           return result;
    },

     
     
     
    // *************************API pour les villes**************************
    async addVille(villeData) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        await new Promise(resolve=>setTimeout(resolve,800));
        const response = await fetch('http://localhost:5000/api/villes/new', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
            method: 'POST',
            body: JSON.stringify(villeData),
        });
       // if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
           //return result.success === true;
           return result;
    },
    async getVilles(){
        const response = await fetch('http://localhost:5000/api/villes', {
            method: 'GET',
        }); 
        if(response.ok){
            const data=await response.json();
            return data.villes;
        }
        else{
            return [];
        }       
    },
    async deleteVille(villeId) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`http://localhost:5000/api/villes/delete/${villeId}`, {
            method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
        }); 
        if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
           return result;
    },

    // *************************API pour les quartiers**************************
    async addQuartier(quartierData){
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch('http://localhost:5000/api/quartiers/new', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
            method: 'POST',
            body: JSON.stringify(quartierData),
        });
          const result=await response.json()
          console.log(result);
           return result;
    },
        async getQuartiers(){
        const response = await fetch('http://localhost:5000/api/quartiers', {
            method: 'GET',
        }); 
        if(response.ok){
            const data=await response.json();
            return data.quartiers;
        }
        else{
            return [];
        }       
    },
    async deleteQuartier(quartierId) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`http://localhost:5000/api/quartiers/delete/${quartierId}`, {
            method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
        }); 
        if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
           return result;
    },
    }   
