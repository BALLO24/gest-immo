import { useEffect, useState } from "react";
import API from "../../api/API";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import TerrainCard from "../cards/TerrainCard";

export default function FilterList() {
  // --- TOUTES TES VARIABLES CONSERVÉES ---
  const [habitations, setHabitations] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [ville, setVille] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");
  const [quartiers, setQuartiers] = useState([]);
  const [quartierSelected, setQuartierSelected] = useState("tous");
  const [type, setType] = useState("tous");
  const [typeTerrain, setTypeTerrain] = useState("tous");
  const [prixMin, setPrixMin] = useState(0);
  const [prixMax, setPrixMax] = useState(Infinity);
  const [magasin, setMagasin] = useState("tous");
  const [documentTerrain, setDocumentTerrain] = useState("tous");
  const [nbreSalon, setNbreSalon] = useState("");
  const [nbreChambres, setNbreChambres] = useState("");
  const [nombreDouche, setNombreDouche] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    setVilleSelected("");
    setQuartierSelected("tous");
    setType("tous");
    setTypeTerrain("tous");
    setPrixMin(0);
    setPrixMax(Infinity);
    setMagasin("tous");
    setDocumentTerrain("tous");
    setNbreSalon("");
    setNbreChambres("");
    setNombreDouche("");
    setFilterVisible(false);
    
    // Recharge les données initiales
    // fetchHabitations({ statut: "disponible", aLouer: false });
  };

  // Vérifie si un filtre est différent de sa valeur par défaut pour afficher le bouton reset
  const isFiltered = villeSelected !== "" || quartierSelected !== "tous" || type !== "tous" || prixMin !== 0 || prixMax !== Infinity;

  const fetchHabitations = async (filtre) => {
    setIsLoading(true);
    try {
      const data = await API.getHabitations(filtre);
      setHabitations(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des habitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const manageBtnFilterVisibility = (visible) => {
    setFilterVisible(!visible);
    if (!visible === false) {
      setMagasin("tous");
    }
  };

  useEffect(() => {
    const initialFiltre = {
      statut: "disponible",
      villeSelected,
      quartier: quartierSelected,
      aLouer: false,
      type,
      typeTerrain,
      prixMin,
      prixMax,
      magasin,
      nbreSalon,
      nbreChambres,
      nombreDouche,
    };
    fetchHabitations(initialFiltre);
    fetchVilles();
    fetchQuartiers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filtre = {
      statut: "disponible",
      villeSelected,
      type,
      typeTerrain,
      quartier: quartierSelected,
      aLouer: false,
      prixMin: Number(prixMin),
      prixMax: prixMax === Infinity ? null : Number(prixMax),
      magasin: magasin !== "tous" ? magasin : "tous",
      documentTerrain: documentTerrain !== "tous" ? documentTerrain : "tous",
      nbreSalon: nbreSalon !== "tous" ? Number(nbreSalon) : "tous",
      nbreChambres: nbreChambres !== "tous" ? Number(nbreChambres) : "tous",
      nombreDouche: nombreDouche !== "tous" ? Number(nombreDouche) : "tous",
    };
    fetchHabitations(filtre);
  };

  return (
    <>
      <section className="w-full bg-gradient-to-br from-maliGreen via-maliGreen/90 to-maliOrange/90 py-8 sm:py-12 shadow-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h2 className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg">
                Trouvez le bien parfait <span className="inline-block hover:animate-bounce">🏠</span>
              </h2>
              <p className="text-white/80 text-sm sm:text-base font-medium">Explorez nos maisons, magasins et terrains disponibles</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Bouton Réinitialiser (visible si filtres actifs) */}
              {isFiltered && (
                <button
                  onClick={resetAllFilters}
                  className="flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all shadow-lg"
                >
                  Réinitialiser
                </button>
              )}

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
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {/* Ville */}
            <div className="flex flex-col">
              <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Ville</label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none appearance-none cursor-pointer"
                value={villeSelected}
                onChange={(e) => {
                  setVilleSelected(e.target.value);
                  setQuartierSelected("tous");
                }}
              >
                <option className="text-gray-900" value="">Peu importe</option>
                {ville.map(v => <option className="text-gray-900" key={v._id} value={v._id}>{v.nom}</option>)}
              </select>
            </div>

            {/* Quartier */}
            <div className="flex flex-col">
              <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Quartier</label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none cursor-pointer"
                onChange={(e) => setQuartierSelected(e.target.value)}
                value={quartierSelected}
              >
                <option className="text-gray-900" value="tous">Peu importe</option>
                {Array.isArray(quartiers) && quartiers.filter(q => !villeSelected || q.ville?._id === villeSelected).map(q => (
                  <option className="text-gray-900" key={q._id} value={q._id}>{q.nom}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Type de bien</label>
              <select className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="tous" className="text-gray-900">Peu importe</option>
                <option value="maison" className="text-gray-900">Maison</option>
                <option value="magasin" className="text-gray-900">Magasin</option>
                <option value="terrain" className="text-gray-900">Terrain</option>
              </select>
            </div>

            {type ==="terrain" && (
              <div className="flex flex-col animate-in slide-in-from-left-2">
                <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Type de terrain</label>
                <select className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none" value={typeTerrain} onChange={(e) => setTypeTerrain(e.target.value)}>
                  <option value="tous" className="text-gray-900">Peu importe</option>
                  <option value="residentiel" className="text-gray-900">Résidentiel</option>
                  <option value="agricole" className="text-gray-900">Agricole</option>
                </select>
              </div>
            )}

            {/* Prix Min */}
            <div className="flex flex-col">
              <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Prix Min</label>
              <input type="number" className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none" value={prixMin === 0 ? "" : prixMin} onChange={(e) => setPrixMin(e.target.value)} />
            </div>

            {/* Prix Max */}
            <div className="flex flex-col">
              <label className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">Prix Max</label>
              <input type="number" className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none" value={prixMax === Infinity ? "" : prixMax} onChange={(e) => setPrixMax(e.target.value)} />
            </div>

            {/* FILTRES AVANCÉS */}
            {filterVisible && (
              <>
                {type === "maison" && (
                  <>
                    <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
                      <label className="text-white/90 text-[10px] font-bold uppercase mb-1.5 ml-1">Salon</label>
                      <input type="number" className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none" value={nbreSalon} onChange={(e) => setNbreSalon(e.target.value)} />
                    </div>
                    <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
                      <label className="text-white/90 text-[10px] font-bold uppercase mb-1.5 ml-1">Chambres</label>
                      <input type="number" className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none" value={nbreChambres} onChange={(e) => setNbreChambres(e.target.value)} />
                    </div>
                    <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
                      <label className="text-white/90 text-[10px] font-bold uppercase mb-1.5 ml-1">Toilettes</label>
                      <input type="number" className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white outline-none" value={nombreDouche} onChange={(e) => setNombreDouche(e.target.value)} />
                    </div>
                  </>
                )}
                {(type === "maison" || type === "magasin" || type === "terrain") && (
                  <div className="flex flex-col animate-in fade-in slide-in-from-top-2">
                    <label className="text-white/90 text-[10px] font-bold uppercase mb-1.5 ml-1">Document</label>
                    <select className="w-full h-11 px-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none" value={documentTerrain} onChange={(e) => setDocumentTerrain(e.target.value)}>
                      <option value="tous" className="text-gray-900">Peu importe</option>
                      <option value="Titre Foncier" className="text-gray-900">Titre Foncier</option>
                      <option value="Permis" className="text-gray-900">Permis</option>
                      <option value="Bulletin" className="text-gray-900">Bulletin</option>
                      <option value="Lettre d'attribution" className="text-gray-900">Lettre d'attribution</option>
                      <option value="Autre" className="text-gray-900">Autre Document</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="flex items-end col-span-2 sm:col-span-2 md:col-span-1">
              <button type="submit" className="w-full h-11 bg-maliOrange hover:bg-maliOrange/90 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="w-full bg-white py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-8">Biens disponibles à la vente</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-maliOrange"></div>
            </div>
          ) : habitations.length === 0 ? (
            <div className="text-center text-gray-600 py-10">
              Aucun résultat trouvé 😕
              <p className="text-sm text-gray-500">Modifiez vos filtres.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {habitations.map((habitation) => {
                switch (habitation.__t) {
                  case 'maison': return <MaisonCard key={habitation._id} maison={habitation} />;
                  case 'magasin': return <MagasinCard key={habitation._id} magasin={habitation} />;
                  case 'terrain': return <TerrainCard key={habitation._id} terrain={habitation} />;
                  default: return null;
                }
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}