// const API_URL = "http://localhost:5000/api";
// const API_URL = "https://ksxn2bt3-5000.euw.devtunnels.ms/api"; // URL de production (devtunnel)
const API_URL="https://immo-oy2j.onrender.com/api"
export default {

    //API pour l'authentification des agences
    async login(credentials){
        // await new Promise(resolve => setTimeout(resolve, 800));
        const response = await fetch(`${API_URL}/auth/login`, {
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
        const response = await fetch(`${API_URL}/auth/register`, {
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
        const response = await fetch(`${API_URL}/habitations/new`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'application/json',
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
    const response = await fetch(`${API_URL}/habitations`, {
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
        const response = await fetch(`${API_URL}/habitations/agence/${agenceId}`, {
            method: 'GET',
            headers: {
            // 'Content-Type': 'application/json',
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
    async updateHabitation(habitationId, updatedData) {
        // console.log("API update habitation", habitationId, updatedData);
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`${API_URL}/habitations/update/${habitationId}`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de la mise à jour");
        }
        const result = await response.json();
        console.log(result);
        return result;
    }
,
     
async deleteHabitation(habitationId) {
    const token = localStorage.getItem("authToken");
    try {
        const response = await fetch(`${API_URL}/habitations/delete/${habitationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        if (!response.ok) return false;
        
        const result = await response.json();
        console.log("Résultat suppression API:", result);
        return result; // Retourne l'objet de succès
    } catch (error) {
        console.error("Erreur API delete:", error);
        return false;
    }
},
    //  *****************API pour les agences**************************
    async addAgence(agenceData) {
        console.log("send add agence");
        
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        // await new Promise(resolve=>setTimeout(resolve,800));
        const response = await fetch(`${API_URL}/agences/new`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 2. L'envoyer ici
        },
            method: 'POST',
            body: JSON.stringify(agenceData),
        });
        console.log("send add agence 1");
       // if (!response.ok) return false;
        const result = await response.json()
        
          console.log(result);
           //return result.success === true;
           return result;
    },
    async getAllAgences() {
        const token= localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`${API_URL}/agences`, {
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
    async updateAgence(agenceId, updatedData) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`${API_URL}/agences/update/${agenceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 2. L'envoyer ici
            },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de la mise à jour");
        }
        const result = await response.json();
        console.log(result);
        return result;
    }
    ,
    async deleteAgence(agenceId) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`${API_URL}/agences/delete/${agenceId}`, {
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
        const response = await fetch(`${API_URL}/villes/new`, {
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
        const response = await fetch(`${API_URL}/villes`, {
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
        const response = await fetch(`${API_URL}/villes/delete/${villeId}`, {
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
        const response = await fetch(`${API_URL}/quartiers/new`, {
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
        const response = await fetch(`${API_URL}/quartiers`, {
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
        async updateQuartier(quartierId, updatedData) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
            const response = await fetch(`${API_URL}/quartiers/update/${quartierId}`, {
            method: 'PUT',
            headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 2. L'envoyer ici
                },
            body: JSON.stringify(updatedData),
            }); 
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de la mise à jour");
        }
        return await response.json();
    },
    async deleteQuartier(quartierId) {
        const token = localStorage.getItem("authToken"); // 1. Récupérer le token
        const response = await fetch(`${API_URL}/quartiers/delete/${quartierId}`, {
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
