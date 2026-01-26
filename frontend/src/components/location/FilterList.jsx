import { useEffect,useState } from "react";
import API from "../../api/API";
import BienCard from "../cards/BienCard";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import DetailsModal from "../DetailsModalMaison";

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
  const [position,setPosition]=useState("tous");
  const [coursUnique,setCoursUnique]=useState("tous");
  const [magasin,setMagasin]=useState("tous");
  const [cuisine,setCuisine]=useState("tous");
  const [nbreSalon,setNbreSalon]=useState();
  const [nbreChambres,setNbreChambres]=useState();
  const [nombreDouche,setNombreDouche]=useState();
  const [parking,setParking]=useState("tous");
  const [compteurEDMSepare,setCompteurEDMSepare]=useState("tous");
  const [compteurEauSepare,setCompteurEauSepare]=useState("tous");
  const [meuble,setMeuble]=useState("tous");
  const [climatisation,setClimatisation]=useState("tous");
  const [connexionInternet,setConnexionInternet]=useState("tous");
  const [energieSecours,setEnergieSecours]=useState("tous");
  const [typePaiementAppart,setTypePaiementAppart]=useState("mensuel");
  const [toiletteInterne,setToiletteInterne]=useState("tous");


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
      console.error('Erreur lors de la récupération des quartiers : ', error);
    }
  };

  const manageBtnFilterVisibility = (filterVisible) => {
    setFilterVisible(!filterVisible);
     if(filterVisible){
      setMagasin("tous"); 
      setCuisine("tous");
      setParking("tous");
      setCoursUnique("tous");
      setCompteurEDMSepare("tous");
      setCompteurEauSepare("tous");
      setMeuble("tous");
      setClimatisation("tous");
      setConnexionInternet("tous");
      setEnergieSecours("tous");
    }
  }
  useEffect(() => {
    const initialFiltre = {villeSelected,quartier: quartierSelected, aLouer:true, type, prixMin, prixMax, position, magasin,cuisine,nbreSalon,nbreChambres,nombreDouche, parking,coursUnique ,meuble,climatisation,connexionInternet,energieSecours, toiletteInterne };
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
      aLouer:true,
      typePaiementAppart,
      prixMin: Number(prixMin),
      prixMax: prixMax === Infinity ? null : Number(prixMax),
      position : position !== "tous" ? Number(position) : "tous",
      coursUnique : coursUnique !=="tous" ? coursUnique : "tous",
      magasin : magasin !== "tous" ? magasin : "tous",
      cuisine : cuisine !== "tous" ? cuisine : "tous",
      nbreSalon : nbreSalon !== "tous" ? Number(nbreSalon) : "tous",
      nbreChambres : nbreChambres !== "tous" ? Number(nbreChambres) : "tous",
      nombreDouche : nombreDouche !== "tous" ? Number(nombreDouche) : "tous",
      parking:parking !=="tous" ? parking : "tous",
      compteurEDMSepare : compteurEDMSepare !=="tous" ? compteurEDMSepare : "tous",
      compteurEauSepare : compteurEauSepare !=="tous" ? compteurEauSepare : "tous",
      meuble  : meuble !=="tous" ? meuble : "tous",
      climatisation : climatisation !=="tous" ? climatisation : "tous",
      connexionInternet : connexionInternet !=="tous" ? connexionInternet : "tous",
      energieSecours : energieSecours !="tous" ? energieSecours :"tous",
      toiletteInterne : toiletteInterne !="tous" ? toiletteInterne :"tous",

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
        {/* {filterVisible && ( */}
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
                <option className="bg-maliGreen/60 font-semibold" value="appartement">Appartement</option>
                <option className="bg-maliGreen/60 font-semibold" value="magasin">Magasin</option>
              </select>
            </div>

              {/* Type de paiement */}
              {
                type==="appartement" && <div>
              <label className="block text-white font-semibold mb-1">Paiement</label>
              <select 
                    name="typePaiementAppart"
                    className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-maliOrange"
                    onChange={(e)=>setTypePaiementAppart(e.target.value)}>
                <option className="bg-maliGreen/60 font-semibold" value="mensuel">Par mois</option>
                <option className="bg-maliGreen/60 font-semibold" value="journalier">Par jour</option>
                <option className="bg-maliGreen/60 font-semibold" value="horaire">Par heure</option>
              </select>
            </div>
              }


            {/* Prix minimum par mois*/}
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

            {/* Prix maximum par mois */}
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
            {(type==="maison" || type==="appartement") ? <div>
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
            {(type==="maison" || type==="appartement") ? <div>
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
            {(type==="maison" || type==="appartement") ? <div>
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
            {(filterVisible && (type==="maison" || type==="appartement"))  ? <div>
              <label className="block text-white font-semibold mb-1">Magasin</label>
              <select 
                  name="position" 
                  className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  onChange={(e)=>setMagasin(e.target.value)}
              >
                <option value="tous" className="bg-maliOrange/60">Peu importe</option>
                <option value={true} className="bg-maliOrange/60" >Oui</option>
                <option value={false} className="bg-maliOrange/60" >Non</option>
              </select>
            </div> : null}

            {/* Cuisine */}
            {(filterVisible && (type==="maison" || type==="appartement"))  ? <div>
              <label className="block text-white font-semibold mb-1">Cuisine</label>
              <select 
                  name="cuisine" 
                  className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  onChange={(e)=>setCuisine(e.target.value)}
              >
                <option value="tous" className="bg-maliOrange/60">Peu importe</option>
                <option value={true} className="bg-maliOrange/60" >Oui</option>
                <option value={false} className="bg-maliOrange/60" >Non</option>
              </select>
            </div> : null}


            {/* Position */}
            <div>
              <label className="block text-white font-semibold mb-1">Position</label>
              <select 
                  name="position" 
                  className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  onChange={(e)=>setPosition(e.target.value)}
              >
                <option value="tous" className="bg-maliOrange/60">Peu importe</option>
                <option value={0} className="bg-maliOrange/60">Rez-de-chaussée</option>
                <option value={1} className="bg-maliOrange/60">Premier étage au maximum</option>
                <option value={2} className="bg-maliOrange/60">Deuxième étage au maximum</option>
                <option value={3} className="bg-maliOrange/60">Troisième étage au maximum</option>
                <option value={4} className="bg-maliOrange/60">Quatrième étage au maximum</option>
              </select>
            </div>


            {/* Parking */}
            {(filterVisible && (type==="maison" || type==="appartement")) ? <div>
              <label className="block text-white font-semibold mb-1">Parking</label>
              <select 
                name="parking"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setParking(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true}>Oui</option>
                <option value={false}>Non</option>
              </select>
            </div> : null}

            {/* Cours unique*/}
            {(filterVisible && (type==="maison" || type==="appartement"))  ? <div>
              <label className="block text-white font-semibold mb-1">Cours unique</label>
              <select 
                name="compteurEDMSepare"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setCoursUnique(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true}>Oui</option>
                <option value={false}>Non</option>
              </select>
            </div> : null}

            {/* Compteurs EDM Séparés */}
            {(filterVisible && (type==="maison" || type==="magasin")) ? <div>
              <label className="block text-white font-semibold mb-1">Compteurs EDM Séparés</label>
              <select 
                name="compteurEDMSepare"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setCompteurEDMSepare(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true}>Oui</option>
                <option value={false}>Non</option>
              </select>
            </div> : null}
            {/* Compteurs EDM Séparés */}
            { (filterVisible && (type==="maison" || type==="magasin")) ? <div>
              <label className="block text-white font-semibold mb-1">Compteurs eau Séparés</label>
              <select 
                name="compteurEauSepare"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setCompteurEauSepare(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true}>Oui</option>
                <option value={false}>Non</option>
              </select>
            </div> : null}

            {/* Meublé */}
            {(filterVisible && (type==="appartement")) ? <div>
              <label className="block text-white font-semibold mb-1">Meublé</label>
              <select 
                name="meuble"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setMeuble(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true} className="bg-maliOrange/70 font-semibold">Oui</option>
                <option value={false} className="bg-maliOrange/70 font-semibold">Non</option>
              </select>
            </div>: null}

            {/* Climatisation */}
            {(filterVisible && (type==="appartement")) ? <div>
              <label className="block text-white font-semibold mb-1">Climatisation</label>
              <select 
                name="climatisation"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setClimatisation(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true} className="bg-maliOrange/70 font-semibold">Oui</option>
                <option value={false} className="bg-maliOrange/70 font-semibold">Non</option>
              </select>
            </div> : null}

            {/* Connexion internet */}
            {(filterVisible && (type==="appartement")) ? <div>
              <label className="block text-white font-semibold mb-1">Connexion internet</label>
              <select 
                name="connexionInternet"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setConnexionInternet(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true} className="bg-maliOrange/70 font-semibold">Oui</option>
                <option value={false} className="bg-maliOrange/70 font-semibold">Non</option>
              </select>
            </div> : null}
            
            {/* Energie sécours */}
            {(filterVisible && (type==="appartement")) ? <div>
              <label className="block text-white font-semibold mb-1">Energie sécours</label>
              <select 
                name="energieSecours"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setEnergieSecours(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true} className="bg-maliOrange/70 font-semibold">Oui</option>
                <option value={false} className="bg-maliOrange/70 font-semibold">Non</option>
              </select>
            </div> : null}

            {/* Toilette interne */}
            {type==="magasin" ? <div>
              <label className="block text-white font-semibold mb-1">Toilette interne</label>
              <select 
                name="toiletteInterne"
                className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onChange={(e)=>setToiletteInterne(e.target.value)}>
                <option value="tous">Peu importe</option>
                <option value={true} className="bg-maliOrange/70 font-semibold">Oui</option>
                <option value={false} className="bg-maliOrange/70 font-semibold">Non</option>
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
        {/* )} */}
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
                case 'appartement':
                  return <AppartementCard key={habitation._id} appartement={habitation} typePaiementAppart={typePaiementAppart} />;
                case 'magasin':
                  return <MagasinCard key={habitation._id} magasin={habitation}/>
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