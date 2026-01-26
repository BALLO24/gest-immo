import { useEffect,useState } from "react";
import API from "../../api/API";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import TerrainCard from "../cards/TerrainCard";

export default function FilterList() {
  const [habitations,setHabitations]=useState([])
  const [filterVisible,setFilterVisible]=useState(false);
  const [ville,setVille]=useState([]);
  const [villeSelected,setVilleSelected]=useState()
  const [quartiers,setQuartiers]=useState([]);
  const [quartierSelected,setQuartierSelected]=useState("tous");
  const [type,setType]=useState("tous");
  const [prixMin,setPrixMin]=useState(0);
  const [prixMax,setPrixMax]=useState(Infinity);
  const [magasin,setMagasin]=useState("tous");
  const [documentTerrain,setDocumentTerrain]=useState("tous");  
  const [nbreSalon,setNbreSalon]=useState();
  const [nbreChambres,setNbreChambres]=useState();
  const [nombreDouche,setNombreDouche]=useState();
 


  const fetchHabitations = async (filtre) => {
    try {
      const data = await API.getHabitations(filtre);
      console.log("data data",data);
      setHabitations(data);
      console.log("habitations : ", habitations);

    } catch (error) {
      console.error('Erreur lors de la récupération des habitations:', error);
    }
  };

  // Ne pas relancer automatiquement à chaque changement d'état ici (on utilise le submit)
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchVilles = async () => {
    try {
      const data = await API.getVilles();
      setVille(data);
      //console.log("Villes récupérées :", data);
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
    }
  };

  const fetchQuartiers = async () => {
    try {
      const data = await API.getQuartiers();
      setQuartiers(data);
     // console.log("Quartiers récupérés :", data);
    } catch (error) {
      console.error('Erreur lors de la récupération des quartiers:', error);
    }
  };

    const manageBtnFilterVisibility = (filterVisible) => {
    setFilterVisible(!filterVisible);
     if(filterVisible){
      setMagasin("tous"); 
      
    }
  }

  useEffect(() => {
    const initialFiltre = {villeSelected,quartier: quartierSelected, aLouer:false, type, prixMin, prixMax, magasin,nbreSalon,nbreChambres,nombreDouche, };
    fetchHabitations(initialFiltre);
    fetchVilles();
    fetchQuartiers();
  }, []);

  

  const handleSubmit = (e) => {
    e.preventDefault();
    const filtre = {
      villeSelected,
      type,
      quartier: quartierSelected,
      aLouer:false,
      prixMin: Number(prixMin),
      prixMax: prixMax === Infinity ? null : Number(prixMax),
      magasin : magasin !== "tous" ? magasin : "tous",
      documentTerrain : documentTerrain !== "tous" ? documentTerrain : "tous",
      nbreSalon : nbreSalon !== "tous" ? Number(nbreSalon) : "tous",
      nbreChambres : nbreChambres !== "tous" ? Number(nbreChambres) : "tous",
      nombreDouche : nombreDouche !== "tous" ? Number(nombreDouche) : "tous",

    };
    fetchHabitations(filtre);
  };

  return (
    <>
      <section className="w-full bg-gradient-to-r from-maliGreen/90 to-maliOrange/80 py-6 sm:py-8 shadow-md">
      <div className="container mx-auto px-4">
        {/* Titre et bouton de visibilité */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg">
            Trouvez la location parfaite 🏠
          </h2>
          {
            (type !== "tous") &&   <button
                type="button"
                onClick={() => manageBtnFilterVisibility(filterVisible)}
                className="py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 transition-all duration-300"
          >
            {filterVisible ? 'Masquer les filtres avancés' : 'Afficher les filtres avancés'}
          </button>
          }

        </div>

        {/* Formulaire de filtres */}
          <form onSubmit={handleSubmit} className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm sm:text-base">
          {/* Villes   */}
            <div>
              <label className="block text-white font-semibold mb-1">Ville</label>
              <select 
                    name="villeSelected"
                    className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                    onChange={(e)=>{setVilleSelected(e.target.value)
                                    setQuartierSelected("tous")
                    }}>
                {/* <option className="bg-maliGreen/60 font-semibold" value="" aria-disabled disabled >Veuillez choisir une ville</option> */}
                {
                  ville.map(ville=> (<option className="bg-maliGreen/60 font-semibold" key={ville._id} value={ville._id}>{ville.nom}</option>))
                }
              </select>
            </div>

            {/* Quartier   */}
            <div>
              <label className="block text-white font-semibold mb-1">Quartier</label>
              <select
                    name="quartier"
                    className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                    onChange={(e)=>setQuartierSelected(e.target.value)}>
                <option className="bg-maliGreen/60 font-semibold" value="tous">Peu importe</option>
                {Array.isArray(quartiers) && quartiers.length > 0 ? (
                  quartiers
                    .filter(q => q.ville._id === villeSelected)
                    .map(q => (
                      <option key={q._id} value={q._id}>
                        {q.nom}
                      </option>
                    ))
                ) : (
                  <option disabled>Aucun quartier disponible</option>
                )}
                
              </select>
            </div>


            {/* Type de bien */}
            <div>
              <label className="block text-white font-semibold mb-1">Type</label>
              <select 
                    name="type"
                    className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                    onChange={(e)=>setType(e.target.value)}>
                <option value="tous" className="bg-maliGreen/60 font-semibold">Peu importe</option>
                <option className="bg-maliGreen/60 font-semibold" value="maison">Maison</option>
                <option className="bg-maliGreen/60 font-semibold" value="magasin">Magasin</option>
                <option className="bg-maliGreen/60 font-semibold" value="terrain">Terrain d'habitation</option>
                <option className="bg-maliGreen/60 font-semibold" value="champ">Champ</option>
              </select>
            </div>



            <div>
              <label className="block text-white font-semibold mb-1">Prix min (FCFA)</label>
              <input 
                name="prixMin"
                type="number"
                placeholder="Ex: 100000"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setPrixMin(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-1">Prix max (FCFA)</label>
              <input
                name="prixMax"
                type="number"
                placeholder="Ex: 500000"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setPrixMax(e.target.value)}
              />
            </div>

            {/* Nombre de salons */}
            {(filterVisible && type==="maison") ? <div>
              <label className="block text-white font-semibold mb-1">Salon</label>
              <input
                defaultValue="tous"
                name="nbreSalon"
                type="number"
                placeholder="Ex: 1"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setNbreSalon(e.target.value)}
              />
            </div> : null}

            {/* Nombre de chambres */}
            {(filterVisible && type==="maison") ? <div>
              <label className="block text-white font-semibold mb-1">Chambres</label>
              <input
                defaultValue="tous"
                name="nbreChambres"
                type="number"
                placeholder="Ex: 2"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setNbreChambres(e.target.value)}
              />
            </div> : null}


            {/* Nombre de douches */}
            {(filterVisible && type==="maison") ? <div>
              <label className="block text-white font-semibold mb-1">Toilettes</label>
              <select 
                name="nombreDouche" 
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setNombreDouche(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div> : null}

            {/* Magasin */}
            {(filterVisible && type==="maison" )  ? <div>
              <label className="block text-white font-semibold mb-1">Magasin</label>
              <select 
                  name="magasin" 
                  className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  onChange={(e)=>setMagasin(e.target.value)}
              >
                <option value="tous" className="bg-maliOrange/60">Peu importe</option>
                <option value={true} className="bg-maliOrange/60" >Oui</option>
                <option value={false} className="bg-maliOrange/60" >Non</option>
              </select>
            </div> : null}


            {/* Document terrain */}
            {(filterVisible &&  ((type==="maison") || (type==="magasin"))) || (type==="terrain") || (type==="champ") ? <div>
              <label className="block text-white font-semibold mb-1">Document terrain</label>
              <select 
                  name="documentTerrain" 
                  className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  onChange={(e)=>setDocumentTerrain(e.target.value)}
              >
                <option value="tous" className="bg-maliOrange/60">Peu importe</option>
                <option value="Titre Foncier" className="bg-maliOrange/60" >Titre Foncier</option>
                <option value="Titre Provisoire" className="bg-maliOrange/60" >Titre Provisoire</option>
                <option value="Permis" className="bg-maliOrange/60" >Permis</option>
                <option value="Bulletin" className="bg-maliOrange/60" >Bulletin</option>
                <option value="Lettre d'attribution" className="bg-maliOrange/60" >Lettre d'attribution</option>
                <option value="Autre" className="bg-maliOrange/60" >Autre</option>
              </select>
            </div> : null}



            {/* Bouton Rechercher */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-maliOrange hover:bg-maliOcre text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
              >
                Rechercher
              </button>
            </div>
          </form>
      </div>
    </section>

    <section className="w-full bg-gradient-to-b from-white via-maliSand/10 to-maliGreen/10 py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
          Biens disponibles à la location
        </h2>

        {habitations.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-10">
            Aucun résultat trouvé 😕  
            <p className="text-sm text-gray-500">
              Essayez de modifier vos filtres de recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitations.map((habitation) => {
              switch (habitation.__t) {
                case 'maison':
                  return <MaisonCard key={habitation._id} maison={habitation} />;
                case 'magasin':
                  return <MagasinCard key={habitation._id} magasin={habitation} />;
                case 'terrain':
                  return <TerrainCard key={habitation._id} terrain={habitation} />;
                // Ajouter d'autres cas pour différents types de biens si nécessaire
                default:
                  return null;
              }
            })}
          </div>
        )}
      </div>
    </section>
    </>
  );
}