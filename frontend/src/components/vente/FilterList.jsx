import { useEffect, useState, useCallback } from "react";
import API from "../../api/API";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import TerrainCard from "../cards/TerrainCard";
import { SelectField, NumberField } from "../common/FilterFields";

const TYPE_OPTIONS = [
  { value: "tous", label: "Peu importe" },
  { value: "maison", label: "Maison" },
  // AJOUT : "Appartement" manquait ici alors qu'un appartement peut être mis
  // en vente (voir ModifAppartementModal.jsx) — sans cette option, aucun
  // moyen de filtrer spécifiquement sur ce type depuis cette page.
  { value: "appartement", label: "Appartement" },
  { value: "magasin", label: "Magasin" },
  { value: "terrain", label: "Terrain" },
];

const TYPE_TERRAIN_OPTIONS = [
  { value: "tous", label: "Peu importe" },
  { value: "residentiel", label: "Résidentiel" },
  { value: "agricole", label: "Agricole" },
  // AJOUT : "commercial" existe dans l'enum du modèle (typeTerrain) mais
  // n'apparaissait dans aucune option de filtre.
  { value: "commercial", label: "Commercial" },
];

const DOCUMENT_OPTIONS = [
  { value: "tous", label: "Peu importe" },
  { value: "Titre Foncier", label: "Titre Foncier" },
  // AJOUT : "Titre Provisoire" existe dans l'enum du modèle (documentTerrain)
  // mais n'apparaissait dans aucune option de filtre.
  { value: "Titre Provisoire", label: "Titre Provisoire" },
  { value: "Permis", label: "Permis" },
  { value: "Bulletin", label: "Bulletin" },
  { value: "Lettre d'attribution", label: "Lettre d'attribution" },
  { value: "Autre", label: "Autre Document" },
];

const RESULTS_LIMIT = 20;

export default function FilterList() {
  const [habitations, setHabitations] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [ville, setVille] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");
  const [quartiers, setQuartiers] = useState([]);
  const [quartierSelected, setQuartierSelected] = useState("tous");
  const [type, setType] = useState("tous");
  const [typeTerrain, setTypeTerrain] = useState("tous");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [magasin, setMagasin] = useState("tous");
  const [documentTerrain, setDocumentTerrain] = useState("tous");
  const [nbreSalon, setNbreSalon] = useState("");
  const [nbreChambres, setNbreChambres] = useState("");
  const [nombreDouche, setNombreDouche] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isQuartierDisabled = !villeSelected;

  // AJOUT : construction centralisée du filtre, réutilisée pour le
  // chargement initial ET la soumission du formulaire — avant, les deux
  // dupliquaient une logique légèrement différente (ex: prixMax initialisé
  // à Infinity, une valeur qui n'existe pas en JSON et devient silencieusement
  // `null` lors de l'envoi, contre une conversion explicite dans handleSubmit).
  const buildFiltre = useCallback(() => ({
    statut: "disponible",
    typeOffre: "vente",
    limit: RESULTS_LIMIT, // AJOUT : absent partout dans la version d'origine
    villeSelected: villeSelected || undefined,
    quartier: quartierSelected !== "tous" ? quartierSelected : undefined,
    type: type !== "tous" ? type : undefined,
    typeTerrain: type === "terrain" && typeTerrain !== "tous" ? typeTerrain : undefined,
    prixMin: prixMin ? Number(prixMin) : undefined,
    prixMax: prixMax ? Number(prixMax) : undefined,
    magasin: magasin !== "tous" ? magasin : undefined,
    documentTerrain: documentTerrain !== "tous" ? documentTerrain : undefined,
    nbreSalon: nbreSalon ? Number(nbreSalon) : undefined,
    nbreChambres: nbreChambres ? Number(nbreChambres) : undefined,
    nombreDouche: nombreDouche ? Number(nombreDouche) : undefined,
  }), [villeSelected, quartierSelected, type, typeTerrain, prixMin, prixMax, magasin, documentTerrain, nbreSalon, nbreChambres, nombreDouche]);

  // CORRIGÉ : l'ancien "isFiltered" ne regardait que ville/quartier/type/prix
  // — activer un filtre avancé (document, magasin...) sans toucher aux
  // champs principaux ne faisait jamais apparaître le bouton Réinitialiser.
  const isFiltered = useCallback(() => {
    const { statut, typeOffre, limit, ...reste } = buildFiltre();
    return Object.values(reste).some((v) => v !== undefined && v !== "");
  }, [buildFiltre]);

  const resetAllFilters = () => {
    setVilleSelected("");
    setQuartierSelected("tous");
    setType("tous");
    setTypeTerrain("tous");
    setPrixMin("");
    setPrixMax("");
    setMagasin("tous");
    setDocumentTerrain("tous");
    setNbreSalon("");
    setNbreChambres("");
    setNombreDouche("");
    setFilterVisible(false);
  };

  const fetchHabitations = async (filtre) => {
    setIsLoading(true);
    try {
      const filtrePropre = Object.fromEntries(
        Object.entries(filtre).filter(([_, value]) => value !== undefined && value !== "")
      );
      const data = await API.getHabitations(filtrePropre);
      setHabitations(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des habitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVilles = async () => {
    try {
      setVille(await API.getVilles());
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
    }
  };

  const fetchQuartiers = async () => {
    try {
      setQuartiers(await API.getQuartiers());
    } catch (error) {
      console.error('Erreur lors de la récupération des quartiers:', error);
    }
  };

  const manageBtnFilterVisibility = (visible) => {
    setFilterVisible(!visible);
    if (visible) setMagasin("tous");
  };

  useEffect(() => {
    fetchHabitations({ statut: "disponible", typeOffre: "vente", limit: RESULTS_LIMIT });
    fetchVilles();
    fetchQuartiers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHabitations(buildFiltre());
  };

  return (
    <>
      <section className="w-full bg-gradient-to-br from-maliGreen via-maliGreen/90 to-maliOrange/90 py-8 sm:py-12 shadow-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h2 className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg">
                Trouvez le bien parfait <span className="inline-block hover:animate-bounce" aria-hidden="true">🏠</span>
              </h2>
              <p className="text-white/80 text-sm sm:text-base font-medium">Explorez nos maisons, appartements, magasins et terrains disponibles</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isFiltered() && (
                <button
                  onClick={resetAllFilters}
                  className="flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all shadow-lg focus:ring-2 focus:ring-white outline-none"
                >
                  Réinitialiser
                </button>
              )}

              {type !== "tous" && (
                <button
                  type="button"
                  aria-expanded={filterVisible}
                  onClick={() => manageBtnFilterVisibility(filterVisible)}
                  className="flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg focus:ring-2 focus:ring-white outline-none"
                >
                  <span className={`w-2 h-2 rounded-full ${filterVisible ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`} aria-hidden="true"></span>
                  {filterVisible ? 'Masquer les filtres' : 'Filtres avancés'}
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            <SelectField
              label="Ville"
              value={villeSelected}
              onChange={(v) => { setVilleSelected(v); setQuartierSelected("tous"); }}
              options={[{ value: "", label: "Peu importe" }, ...ville.map((v) => ({ value: v._id, label: v.nom }))]}
            />

            <SelectField
              label="Quartier"
              value={quartierSelected}
              onChange={setQuartierSelected}
              disabled={isQuartierDisabled}
              hint={isQuartierDisabled ? "Sélectionnez une ville d'abord" : undefined}
              options={[
                { value: "tous", label: "Peu importe" },
                ...quartiers.filter((q) => q.ville?._id === villeSelected).map((q) => ({ value: q._id, label: q.nom })),
              ]}
            />

            <SelectField label="Type de bien" value={type} onChange={setType} options={TYPE_OPTIONS} />

            {type === "terrain" && (
              <div className="animate-in slide-in-from-left-2">
                <SelectField label="Type de terrain" value={typeTerrain} onChange={setTypeTerrain} options={TYPE_TERRAIN_OPTIONS} />
              </div>
            )}

            <NumberField label="Prix Min" value={prixMin} onChange={setPrixMin} placeholder="Ex: 5000000" />
            <NumberField label="Prix Max" value={prixMax} onChange={setPrixMax} placeholder="Ex: 50000000" />

            {filterVisible && (
              <>
                {(type === "maison" || type === "appartement") && (
                  <>
                    <div className="animate-in fade-in slide-in-from-top-2"><NumberField label="Salon" value={nbreSalon} onChange={setNbreSalon} placeholder="Ex: 1" /></div>
                    <div className="animate-in fade-in slide-in-from-top-2"><NumberField label="Chambres" value={nbreChambres} onChange={setNbreChambres} placeholder="Ex: 2" /></div>
                    <div className="animate-in fade-in slide-in-from-top-2"><NumberField label="Toilettes" value={nombreDouche} onChange={setNombreDouche} placeholder="Ex: 2" /></div>
                  </>
                )}
                {(type === "maison" || type === "magasin" || type === "terrain") && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <SelectField label="Document" value={documentTerrain} onChange={setDocumentTerrain} options={DOCUMENT_OPTIONS} />
                  </div>
                )}
              </>
            )}

            <div className="flex items-end col-span-2 sm:col-span-2 md:col-span-1">
              <button type="submit" className="w-full h-11 bg-maliOrange hover:bg-maliOrange/90 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">Biens disponibles à la vente</h2>
          {!isLoading && (
            <p className="text-center text-sm text-gray-400 mb-8" aria-live="polite">
              {habitations.length} résultat{habitations.length > 1 ? "s" : ""}
            </p>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20" aria-busy="true" aria-live="polite">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-maliOrange"></div>
              <span className="sr-only">Chargement des résultats...</span>
            </div>
          ) : habitations.length === 0 ? (
            <div className="text-center text-gray-600 py-10" role="status">
              Aucun résultat trouvé 😕
              <p className="text-sm text-gray-500">Modifiez vos filtres.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {habitations.map((habitation) => {
                switch (habitation.__t) {
                  case 'maison': return <MaisonCard key={habitation._id} maison={habitation} />;
                  // CORRIGÉ (bug) : AppartementCard était importé mais jamais
                  // utilisé ici — un appartement mis en vente était récupéré
                  // du backend puis rendu invisible (default: return null).
                  case 'appartement': return <AppartementCard key={habitation._id} appartement={habitation} />;
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
