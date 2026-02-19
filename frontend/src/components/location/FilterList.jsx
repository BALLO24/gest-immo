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
  const [showMobileFilter, setShowMobileFilter] = useState(false);
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
  const [toiletteInterne, setToiletteInterne] = useState("tous");
  const [statut,setStatut]=useState("disponible");


  const fetchHabitations = async (filtre) => {
    try {
      const data = await API.getHabitations(filtre);
      setHabitations(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des habitations:', error);
    }
  };

  const fetchVilles = async () => {
    try {
      const data = await API.getVilles();
      //data.unshift({_id:"12345", value:"tous", nom:"Peu importe"});
      setVille(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
    }
  };

  const fetchQuartiers = async () => {
    try {
      const data = await API.getQuartiers();
      setQuartiers(data);
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
      setStatut("disponible")
    }
  }

  const toggleMobileFilter = () => {
    setShowMobileFilter(!showMobileFilter);
  };

  useEffect(() => {
    const initialFiltre = {statut:"disponible",villeSelected,quartier: quartierSelected, aLouer:true, hot:true, limit:0, type, prixMin, prixMax, position, magasin,cuisine,nbreSalon,nbreChambres,nombreDouche, parking,coursUnique ,meuble,climatisation,connexionInternet,energieSecours, toiletteInterne };
    fetchHabitations(initialFiltre);
    fetchVilles();
    fetchQuartiers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filtre = {
      statut:"disponible",
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
    // Fermer le filtre mobile après soumission
    if (window.innerWidth < 768) {
      setShowMobileFilter(false);
    }
  };

  return (
    <>
<section className="w-full bg-gradient-to-br from-maliGreen via-maliGreen/90 to-maliOrange/90 py-8 sm:py-12 shadow-xl border-b border-white/10">
  <div className="container mx-auto px-4">
    {/* Titre et bouton de visibilité */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
      <div className="space-y-1">
        <h2 className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg">
          Trouvez la location parfaite <span className="inline-block hover:animate-bounce">🏠</span>
        </h2>
        <p className="text-white/80 text-sm sm:text-base font-medium">Recherchez parmi les meilleures offres disponibles</p>
      </div>

      {/* Bouton "Afficher filtre" pour mobile */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={toggleMobileFilter}
          className="md:hidden flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Afficher filtre
        </button>

        {/* Bouton "Filtres avancés" pour desktop - SEULEMENT quand type !== "tous" */}
        {type !== "tous" && (
          <button
            type="button"
            onClick={() => manageBtnFilterVisibility(filterVisible)}
            className="hidden md:flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg"
          >
            <span className={`w-2 h-2 rounded-full ${filterVisible ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`}></span>
            {filterVisible ? 'Masquer les filtres' : 'Filtres avancés'}
          </button>
        )}
      </div>
    </div>

    {/* Overlay pour mobile */}
    {showMobileFilter && (
      <div className="fixed inset-0 z-50 md:hidden">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={toggleMobileFilter}
        ></div>
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-br from-maliGreen via-maliGreen/95 to-maliOrange/95 p-6 rounded-b-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-xl font-bold">Filtres de recherche</h3>
            <button
              onClick={toggleMobileFilter}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Formulaire dans le modal mobile avec 2 champs par ligne */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ligne 1: Ville et Quartier */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Ville</label>
                <div className="relative">
                  <input name="statut" value="disponible" type="hidden"/>
                  <select 
                    name="villeSelected"
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all appearance-none cursor-pointer"
                    onChange={(e) => {
                      setVilleSelected(e.target.value);
                      setQuartierSelected("tous");
                    }}
                        >
                    
                    {ville.map(v => (
                      <option className="text-gray-900" key={v._id} value={v._id}>{v.nom}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Quartier</label>
                <div className="relative">
                  <select
                    name="quartier"
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all cursor-pointer appearance-none"
                    onChange={(e) => setQuartierSelected(e.target.value)}
                  >
                    <option className="text-gray-900" value="tous">Peu importe</option>
                    {Array.isArray(quartiers) && quartiers.length > 0 ? (
                      quartiers
                        .filter(q => q.ville._id === villeSelected)
                        .map(q => <option className="text-gray-900" key={q._id} value={q._id}>{q.nom}</option>)
                    ) : (
                      <option disabled>Aucun disponible</option>
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Ligne 2: Type et Type de paiement (conditionnel) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Type</label>
                <div className="relative">
                  <select 
                    name="type"
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:ring-2 focus:ring-maliOrange outline-none transition-all appearance-none"
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option className="text-gray-900" value="tous">Peu importe</option>
                    <option className="text-gray-900" value="maison">Maison</option>
                    <option className="text-gray-900" value="appartement">Appartement</option>
                    <option className="text-gray-900" value="magasin">Magasin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {type === "appartement" && (
                <div className="flex flex-col animate-in fade-in slide-in-from-top-1">
                  <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Paiement</label>
                  <div className="relative">
                    <select 
                      name="typePaiementAppart"
                      className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all appearance-none"
                      onChange={(e) => setTypePaiementAppart(e.target.value)}
                    >
                      <option className="text-gray-900" value="mensuel">Par mois</option>
                      <option className="text-gray-900" value="journalier">Par jour</option>
                      <option className="text-gray-900" value="horaire">Par heure</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ligne 3: Prix Min et Prix Max */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Prix Min (FCFA)</label>
                <input 
                  name="prixMin"
                  type="number"
                  placeholder="Ex: 100000"
                  className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all"
                  onChange={(e) => setPrixMin(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Prix Max (FCFA)</label>
                <input
                  name="prixMax"
                  type="number"
                  placeholder="Ex: 500000"
                  className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all"
                  onChange={(e) => setPrixMax(e.target.value)}
                />
              </div>
            </div>

            {/* Ligne 4: Salons et Chambres (conditionnel) */}
            {(type === "maison" || type === "appartement") && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col animate-in fade-in">
                  <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Salon</label>
                  <input
                    name="nbreSalon"
                    type="number"
                    placeholder="Ex: 1"
                    className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all"
                    onChange={(e) => setNbreSalon(e.target.value)}
                  />
                </div>

                <div className="flex flex-col animate-in fade-in">
                  <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Chambres</label>
                  <input
                    name="nbreChambres"
                    type="number"
                    placeholder="Ex: 2"
                    className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all"
                    onChange={(e) => setNbreChambres(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Ligne 5: Toilettes (conditionnel) et Position */}
            <div className="grid grid-cols-2 gap-3">
              {(type === "maison" || type === "appartement") && (
                <div className="flex flex-col animate-in fade-in">
                  <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Toilettes</label>
                  <div className="relative">
                    <select 
                      name="nombreDouche" 
                      className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all appearance-none"
                      onChange={(e) => setNombreDouche(e.target.value)}
                    >
                      <option value="tous">Peu importe</option>
                      {[1, 2, 3, 4].map(n => <option key={n} className="text-gray-900" value={n}>{n}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Position / Étage</label>
                <div className="relative">
                  <select 
                    name="position" 
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all appearance-none"
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="tous" className="text-gray-900">Peu importe</option>
                    <option value={0} className="text-gray-900">Rez-de-chaussée</option>
                    <option value={1} className="text-gray-900">1er étage max</option>
                    <option value={2} className="text-gray-900">2ème étage max</option>
                    <option value={3} className="text-gray-900">3ème étage max</option>
                    <option value={4} className="text-gray-900">4ème étage max</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton pour afficher/masquer les filtres avancés - SEULEMENT quand type !== "tous" */}
            {type !== "tous" && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setFilterVisible(!filterVisible)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-white/90 hover:text-white font-medium"
                >
                  <span className={`w-2 h-2 rounded-full ${filterVisible ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`}></span>
                  {filterVisible ? 'Masquer les filtres avancés' : 'Afficher les filtres avancés'}
                  <svg 
                    className={`w-4 h-4 transition-transform ${filterVisible ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            )}

            {/* Filtres Avancés (Masqués par défaut) - Même logique que desktop */}
            {filterVisible && type !== "tous" && (
              <div className="space-y-4 pt-4 border-t border-white/20 animate-in fade-in">
                {(type === "maison" || type === "appartement") && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col animate-in fade-in">
                        <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Magasin</label>
                        <div className="relative">
                          <select 
                            className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                            onChange={(e) => setMagasin(e.target.value)}
                          >
                            <option value="tous" className="text-gray-900">Peu importe</option>
                            <option value="true" className="text-gray-900">Oui</option>
                            <option value="false" className="text-gray-900">Non</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col animate-in fade-in">
                        <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Cuisine</label>
                        <div className="relative">
                          <select 
                            className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                            onChange={(e) => setCuisine(e.target.value)}
                          >
                            <option value="tous" className="text-gray-900">Peu importe</option>
                            <option value="true" className="text-gray-900">Oui</option>
                            <option value="false" className="text-gray-900">Non</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ligne 2: Parking et Cours Unique */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col animate-in fade-in">
                        <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Parking</label>
                        <div className="relative">
                          <select 
                            className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                            onChange={(e) => setParking(e.target.value)}
                          >
                            <option value="tous" className="text-gray-900">Peu importe</option>
                            <option value="true" className="text-gray-900">Oui</option>
                            <option value="false" className="text-gray-900">Non</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col animate-in fade-in">
                        <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Cours Unique</label>
                        <div className="relative">
                          <select 
                            className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                            onChange={(e) => setCoursUnique(e.target.value)}
                          >
                            <option value="tous" className="text-gray-900">Peu importe</option>
                            <option value="true" className="text-gray-900">Oui</option>
                            <option value="false" className="text-gray-900">Non</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Toilette interne (Magasin uniquement) */}
                {type === "magasin" && (
                  <div className="flex flex-col animate-in fade-in">
                    <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Toilette interne</label>
                    <div className="relative">
                      <select 
                        name="toiletteInterne"
                        className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                        onChange={(e) => setToiletteInterne(e.target.value)}
                      >
                        <option value="tous" className="text-gray-900">Peu importe</option>
                        <option value="true" className="text-gray-900">Oui</option>
                        <option value="false" className="text-gray-900">Non</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compteurs EDM/Eau (Maison ou Magasin) */}
                {(type === "maison" || type === "magasin") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col animate-in fade-in">
                      <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">EDM Séparé</label>
                      <div className="relative">
                        <select 
                          className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                          onChange={(e) => setCompteurEDMSepare(e.target.value)}
                        >
                          <option value="tous" className="text-gray-900">Peu importe</option>
                          <option value="true" className="text-gray-900">Oui</option>
                          <option value="false" className="text-gray-900">Non</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col animate-in fade-in">
                      <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Eau Séparé</label>
                      <div className="relative">
                        <select 
                          className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                          onChange={(e) => setCompteurEauSepare(e.target.value)}
                        >
                          <option value="tous" className="text-gray-900">Peu importe</option>
                          <option value="true" className="text-gray-900">Oui</option>
                          <option value="false" className="text-gray-900">Non</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meublé, Climatisation, etc. */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col animate-in fade-in">
                    <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Meublé</label>
                    <div className="relative">
                      <select 
                        className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                        onChange={(e) => setMeuble(e.target.value)}
                      >
                        <option value="tous" className="text-gray-900">Peu importe</option>
                        <option value="true" className="text-gray-900">Oui</option>
                        <option value="false" className="text-gray-900">Non</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col animate-in fade-in">
                    <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Climatisation</label>
                    <div className="relative">
                      <select 
                        className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                        onChange={(e) => setClimatisation(e.target.value)}
                      >
                        <option value="tous" className="text-gray-900">Peu importe</option>
                        <option value="true" className="text-gray-900">Oui</option>
                        <option value="false" className="text-gray-900">Non</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connexion Internet, Energie Secours */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col animate-in fade-in">
                    <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Internet</label>
                    <div className="relative">
                      <select 
                        className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                        onChange={(e) => setConnexionInternet(e.target.value)}
                      >
                        <option value="tous" className="text-gray-900">Peu importe</option>
                        <option value="true" className="text-gray-900">Oui</option>
                        <option value="false" className="text-gray-900">Non</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col animate-in fade-in">
                    <label className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Énergie secours</label>
                    <div className="relative">
                      <select 
                        className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                        onChange={(e) => setEnergieSecours(e.target.value)}
                      >
                        <option value="tous" className="text-gray-900">Peu importe</option>
                        <option value="true" className="text-gray-900">Oui</option>
                        <option value="false" className="text-gray-900">Non</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton Rechercher dans le modal */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full h-12 bg-maliOrange hover:bg-maliOrange/90 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(232,119,34,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Appliquer les filtres
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Formulaire de filtres original pour desktop - masqué sur mobile */}
    <form onSubmit={handleSubmit} className="hidden md:grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
      
      {/* Villes */}
      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Ville</label>
        <div className="relative">
          <select 
            name="villeSelected"
            className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all appearance-none cursor-pointer"
            onChange={(e) => {
              setVilleSelected(e.target.value);
              setQuartierSelected("tous");
            }}
          >
            <option className="text-gray-900" value="">Peu importe</option>
            {ville.map(v => (
                <option className="text-gray-900" key={v._id} value={v._id}>{v.nom}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Quartier */}
      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Quartier</label>
        <div className="relative">
          <select
            name="quartier"
            className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all cursor-pointer appearance-none"
            onChange={(e) => setQuartierSelected(e.target.value)}
          >
            <option className="text-gray-900" value="tous">Peu importe</option>
            {Array.isArray(quartiers) && quartiers.length > 0 ? (
              quartiers
                .filter(q => q.ville._id === villeSelected)
                .map(q => <option className="text-gray-900" key={q._id} value={q._id}>{q.nom}</option>)
            ) : (
              <option disabled>Aucun disponible</option>
            )}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Type de bien */}
      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Type</label>
        <div className="relative">
          <select 
            name="type"
            className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:ring-2 focus:ring-maliOrange outline-none transition-all appearance-none"
            onChange={(e) => setType(e.target.value)}
          >
            <option className="text-gray-900" value="tous">Peu importe</option>
            <option className="text-gray-900" value="maison">Maison</option>
            <option className="text-gray-900" value="appartement">Appartement</option>
            <option className="text-gray-900" value="magasin">Magasin</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Type de paiement (Conditionnel Appart) */}
      {type === "appartement" && (
        <div className="flex flex-col animate-in fade-in slide-in-from-top-1">
          <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Paiement</label>
          <div className="relative">
            <select 
              name="typePaiementAppart"
              className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all appearance-none"
              onChange={(e) => setTypePaiementAppart(e.target.value)}
            >
              <option className="text-gray-900" value="mensuel">Par mois</option>
              <option className="text-gray-900" value="journalier">Par jour</option>
              <option className="text-gray-900" value="horaire">Par heure</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Prix Min */}
      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Prix Min (FCFA)</label>
        <input 
          name="prixMin"
          type="number"
          placeholder="Ex: 100000"
          className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all"
          onChange={(e) => setPrixMin(e.target.value)}
        />
      </div>

      {/* Prix Max */}
      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Prix Max (FCFA)</label>
        <input
          name="prixMax"
          type="number"
          placeholder="Ex: 500000"
          className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all"
          onChange={(e) => setPrixMax(e.target.value)}
        />
      </div>

      {/* Salons (Conditionnel) */}
      {(type === "maison" || type === "appartement") && (
        <div className="flex flex-col animate-in fade-in">
          <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Salon</label>
          <input
            name="nbreSalon"
            type="number"
            placeholder="Ex: 1"
            className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all"
            onChange={(e) => setNbreSalon(e.target.value)}
          />
        </div>
      )}

      {/* Chambres (Conditionnel) */}
      {(type === "maison" || type === "appartement") && (
        <div className="flex flex-col animate-in fade-in">
          <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Chambres</label>
          <input
            name="nbreChambres"
            type="number"
            placeholder="Ex: 2"
            className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all"
            onChange={(e) => setNbreChambres(e.target.value)}
          />
        </div>
      )}

      {/* Toilettes (Conditionnel) */}
      {(type === "maison" || type === "appartement") && (
        <div className="flex flex-col animate-in fade-in">
          <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Toilettes</label>
          <div className="relative">
            <select 
              name="nombreDouche" 
              className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all appearance-none"
              onChange={(e) => setNombreDouche(e.target.value)}
            >
              <option value="tous">Peu importe</option>
              {[1, 2, 3, 4].map(n => <option key={n} className="text-gray-900" value={n}>{n}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Position / Étage</label>
        <div className="relative">
          <select 
            name="position" 
            className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all appearance-none"
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="tous" className="text-gray-900">Peu importe</option>
            <option value={0} className="text-gray-900">Rez-de-chaussée</option>
            <option value={1} className="text-gray-900">1er étage max</option>
            <option value={2} className="text-gray-900">2ème étage max</option>
            <option value={3} className="text-gray-900">3ème étage max</option>
            <option value={4} className="text-gray-900">4ème étage max</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Filtres Avancés (Masqués par défaut) - Même condition que mobile */}
      {filterVisible && type !== "tous" && (
        <>
          {(type === "maison" || type === "appartement") && (
            <>
              <div className="flex flex-col animate-in fade-in">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Magasin</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                    onChange={(e) => setMagasin(e.target.value)}
                  >
                    <option value="tous" className="text-gray-900">Peu importe</option>
                    <option value="true" className="text-gray-900">Oui</option>
                    <option value="false" className="text-gray-900">Non</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col animate-in fade-in">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Cuisine</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                    onChange={(e) => setCuisine(e.target.value)}
                  >
                    <option value="tous" className="text-gray-900">Peu importe</option>
                    <option value="true" className="text-gray-900">Oui</option>
                    <option value="false" className="text-gray-900">Non</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col animate-in fade-in">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Parking</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                    onChange={(e) => setParking(e.target.value)}
                  >
                    <option value="tous" className="text-gray-900">Peu importe</option>
                    <option value="true" className="text-gray-900">Oui</option>
                    <option value="false" className="text-gray-900">Non</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col animate-in fade-in">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Cours Unique</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                    onChange={(e) => setCoursUnique(e.target.value)}
                  >
                    <option value="tous" className="text-gray-900">Peu importe</option>
                    <option value="true" className="text-gray-900">Oui</option>
                    <option value="false" className="text-gray-900">Non</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Toilette interne (Magasin uniquement) */}
          {type === "magasin" && (
            <div className="flex flex-col animate-in fade-in">
              <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Toilette interne</label>
              <div className="relative">
                <select 
                  name="toiletteInterne"
                  className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                  onChange={(e) => setToiletteInterne(e.target.value)}
                >
                  <option value="tous" className="text-gray-900">Peu importe</option>
                  <option value="true" className="text-gray-900">Oui</option>
                  <option value="false" className="text-gray-900">Non</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Compteurs EDM/Eau (Maison ou Magasin) */}
          {(type === "maison" || type === "magasin") && (
            <>
              <div className="flex flex-col animate-in fade-in">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">EDM Séparé</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                    onChange={(e) => setCompteurEDMSepare(e.target.value)}
                  >
                    <option value="tous" className="text-gray-900">Peu importe</option>
                    <option value="true" className="text-gray-900">Oui</option>
                    <option value="false" className="text-gray-900">Non</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col animate-in fade-in">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Eau Séparé</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                    onChange={(e) => setCompteurEauSepare(e.target.value)}
                  >
                    <option value="tous" className="text-gray-900">Peu importe</option>
                    <option value="true" className="text-gray-900">Oui</option>
                    <option value="false" className="text-gray-900">Non</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Meublé, Climatisation, etc. */}
          <div className="flex flex-col animate-in fade-in">
            <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Meublé</label>
            <div className="relative">
              <select 
                className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                onChange={(e) => setMeuble(e.target.value)}
              >
                <option value="tous" className="text-gray-900">Peu importe</option>
                <option value="true" className="text-gray-900">Oui</option>
                <option value="false" className="text-gray-900">Non</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col animate-in fade-in">
            <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Climatisation</label>
            <div className="relative">
              <select 
                className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                onChange={(e) => setClimatisation(e.target.value)}
              >
                <option value="tous" className="text-gray-900">Peu importe</option>
                <option value="true" className="text-gray-900">Oui</option>
                <option value="false" className="text-gray-900">Non</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col animate-in fade-in">
            <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Internet</label>
            <div className="relative">
              <select 
                className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                onChange={(e) => setConnexionInternet(e.target.value)}
              >
                <option value="tous" className="text-gray-900">Peu importe</option>
                <option value="true" className="text-gray-900">Oui</option>
                <option value="false" className="text-gray-900">Non</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col animate-in fade-in">
            <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Énergie secours</label>
            <div className="relative">
              <select 
                className="w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange appearance-none"
                onChange={(e) => setEnergieSecours(e.target.value)}
              >
                <option value="tous" className="text-gray-900">Peu importe</option>
                <option value="true" className="text-gray-900">Oui</option>
                <option value="false" className="text-gray-900">Non</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bouton Rechercher */}
      <div className="flex items-end col-span-2 sm:col-span-2 md:col-span-1">
        <button
          type="submit"
          className="w-full h-11 bg-maliOrange hover:bg-maliOrange/90 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(232,119,34,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Rechercher
        </button>
      </div>
    </form>
  </div>
</section>

<section className="w-full bg-gradient-to-b from-white via-gray-50 to-maliGreen/5 py-12 sm:py-20 min-h-[400px]">
  <div className="container mx-auto px-4 max-w-7xl">
    {/* En-tête de section avec ligne décorative */}
    <div className="flex flex-col items-center mb-12">
      <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
        Biens disponibles <span className="text-maliGreen">au Mali</span>
      </h2>
      <div className="w-20 h-1.5 bg-maliOrange rounded-full"></div>
    </div>

    {habitations.length === 0 ? (
      /* État vide centré verticalement et horizontalement */
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
        <div className="text-6xl animate-bounce">🔍</div>
        <h3 className="text-xl font-bold text-gray-700">Aucun résultat trouvé</h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          Désolé, nous n'avons pas trouvé de biens correspondant à vos critères actuels.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-maliOrange font-semibold hover:underline"
        >
          Réinitialiser les filtres
        </button>
      </div>
    ) : (
      /* Grille centrée sur tous types d'écrans */
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {habitations.map((habitation) => {
          return (
            <div key={habitation._id} className="w-full flex justify-center">
              {(() => {
                switch (habitation.__t) {
                  case 'maison':
                    return <MaisonCard maison={habitation} />;
                  case 'appartement':
                    return <AppartementCard appartement={habitation} typePaiementAppart={typePaiementAppart} />;
                  case 'magasin':
                    return <MagasinCard magasin={habitation} />;
                  default:
                    return null;
                }
              })()}
            </div>
          );
        })}
      </div>
    )}
  </div>
      </section>
    </>
  );
}