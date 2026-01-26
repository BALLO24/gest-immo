export default {
    async addHabitation(habitationData){
        await new Promise(resolve=>setTimeout(resolve,800));
        const response = await fetch('http://localhost:5000/api/habitations/new', {
            method: 'POST',
            body: habitationData,
        });
        if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
          
           return result.success === true;
    },
     async getHabitations(filtre){
        console.log("ok");
        
        const response = await fetch('http://localhost:5000/api/habitations', {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filtre),
        });
        if(response.ok){
            const data=await response.json();
            //console.log("data",data);
            return data;
        }
        else{
            return [];
        }
    },
    async addVille(villeData){
        await new Promise(resolve=>setTimeout(resolve,800));
        const response = await fetch('http://localhost:5000/api/villes/new', {
            headers: {
            "Content-Type": "application/json"
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
    async deleteVille(villeId){
        const response = await fetch(`http://localhost:5000/api/villes/delete/${villeId}`, {
            method: 'DELETE',
        }); 
        if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
           return result;
    },

    // *************************API pour les quartiers**************************
    async addQuartier(quartierData){
        await new Promise(resolve=>setTimeout(resolve,800));
        const response = await fetch('http://localhost:5000/api/quartiers/new', {
            headers: {
            "Content-Type": "application/json"
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
        async deleteQuartier(quartierId){
        const response = await fetch(`http://localhost:5000/api/quartiers/delete/${quartierId}`, {
            method: 'DELETE',
        }); 
        if (!response.ok) return false;
          const result=await response.json()
          console.log(result);
           return result;
    },
    }   
