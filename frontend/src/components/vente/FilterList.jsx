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
      setHabitations(data);
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
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
    }
  };

  const fetchQuartiers = async () => {
    try {
      const data = await API.getQuartiers();
      setQuartiers(data);
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
    const initialFiltre = {statut:"disponible", villeSelected,quartier: quartierSelected, aLouer:false, type, prixMin, prixMax, magasin,nbreSalon,nbreChambres,nombreDouche, };
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
<section className="w-full bg-gradient-to-br from-maliGreen via-maliGreen/90 to-maliOrange/90 py-8 sm:py-12 shadow-xl border-b border-white/10">
  <div className="container mx-auto px-4">
    {/* Titre et bouton de visibilité */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
      <div className="space-y-1">
        <h2 className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg">
          Trouvez le bien parfait <span className="inline-block hover:animate-bounce">🏠</span>
        </h2>
        <p className="text-white/80 text-sm sm:text-base font-medium">Explorez nos maisons, magasins et terrains disponibles</p>
      </div>

      {type !== "tous" && (
        <button
          type="button"
          onClick={() => manageBtnFilterVisibility(filterVisible)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg"
        >
          <span className={`w-2 h-2 rounded-full ${filterVisible ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`}></span>
          {filterVisible ? 'Masquer les filtres' : 'Filtres avancés'}
        </button>
      )}
    </div>

    {/* Formulaire de filtres */}
    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
      
      {/* Villes */}
      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Ville</label>
        <select 
          name="villeSelected"
          className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all appearance-none cursor-pointer"
          onChange={(e) => {
            setVilleSelected(e.target.value);
            setQuartierSelected("tous");
          }}
              >
              <option className="text-gray-900" key={0} selected value="">Peu importe</option>
          {ville.map(v => (
            <option className="text-gray-900" key={v._id} value={v._id}>{v.nom}</option>
          ))}
        </select>
      </div>

      {/* Quartier */}
      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Quartier</label>
        <select
          name="quartier"
          className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all cursor-pointer"
          onChange={(e) => setQuartierSelected(e.target.value)}
        >
          <option className="text-gray-900" value="">Peu importe</option>
          {Array.isArray(quartiers) && quartiers.length > 0 ? (
            quartiers
              .filter(q => q.ville._id === villeSelected)
              .map(q => <option className="text-gray-900" key={q._id} value={q._id}>{q.nom}</option>)
          ) : (
            <option disabled>Aucun disponible</option>
          )}
        </select>
      </div>

      {/* Type de bien */}
      <div className="flex flex-col">
        <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Type de bien</label>
        <select 
          name="type"
          className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:ring-2 focus:ring-maliOrange outline-none transition-all"
          onChange={(e) => setType(e.target.value)}
        >
          <option value="tous" className="text-gray-900">Peu importe</option>
          <option value="maison" className="text-gray-900">Maison</option>
          <option value="magasin" className="text-gray-900">Magasin</option>
          <option value="terrain" className="text-gray-900">Terrain d'habitation</option>
          <option value="champ" className="text-gray-900">Champ</option>
        </select>
      </div>

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

      {/* FILTRES CONDITIONNELS / AVANCÉS */}
      {filterVisible && (
        <>
          {/* Section Maison uniquement */}
          {type === "maison" && (
            <>
              <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Salon</label>
                <input type="number" placeholder="Nb de salons" className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all" onChange={(e) => setNbreSalon(e.target.value)} />
              </div>
              <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Chambres</label>
                <input type="number" placeholder="Nb de chambres" className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all" onChange={(e) => setNbreChambres(e.target.value)} />
              </div>
              <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Toilettes</label>
                <select className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all" onChange={(e) => setNombreDouche(e.target.value)}>
                  <option value="tous">Peu importe</option>
                  {[1, 2, 3, 4].map(n => <option key={n} className="text-gray-900" value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Magasin</label>
                <select className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all" onChange={(e) => setMagasin(e.target.value)}>
                  <option value="tous" className="text-gray-900">Peu importe</option>
                  <option value="true" className="text-gray-900">Oui</option>
                  <option value="false" className="text-gray-900">Non</option>
                </select>
              </div>
            </>
          )}

          {/* Document Terrain (Maison, Magasin, Terrain, Champ) */}
          {(type === "maison" || type === "magasin" || type === "terrain" || type === "champ") && (
            <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
              <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Document</label>
              <select 
                className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-maliOrange transition-all"
                onChange={(e) => setDocumentTerrain(e.target.value)}
              >
                <option value="tous" className="text-gray-900">Peu importe</option>
                <option value="Titre Foncier" className="text-gray-900">Titre Foncier</option>
                <option value="Titre Provisoire" className="text-gray-900">Titre Provisoire</option>
                <option value="Permis" className="text-gray-900">Permis</option>
                <option value="Bulletin" className="text-gray-900">Bulletin</option>
                <option value="Lettre d'attribution" className="text-gray-900">Lettre d'attribution</option>
                <option value="Autre" className="text-gray-900">Autre</option>
              </select>
            </div>
          )}
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
    <section className="w-full bg-gradient-to-b from-white via-maliSand/10 to-maliGreen/10 py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
          Biens disponibles à la vente
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