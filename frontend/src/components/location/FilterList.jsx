import { useEffect, useState, useCallback } from "react";
import API from "../../api/API";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import { SelectField, NumberField, PEU_IMPORTE_OUI_NON } from "../common/FilterFields";

const TYPE_OPTIONS = [
  { value: "tous", label: "Peu importe" },
  { value: "maison", label: "Maison" },
  { value: "appartement", label: "Appartement" },
  { value: "magasin", label: "Magasin" },
];

const PAIEMENT_OPTIONS = [
  { value: "mensuel", label: "Par mois" },
  { value: "journalier", label: "Par jour" },
  { value: "horaire", label: "Par heure" },
];

const ETAGE_OPTIONS = [
  { value: "tous", label: "Peu importe" },
  { value: "0", label: "Rez-de-chaussée" },
  { value: "1", label: "1er étage max" },
  { value: "2", label: "2ème étage max" },
  { value: "3", label: "3ème étage max" },
  { value: "4", label: "4ème étage max" },
];

const DOUCHE_OPTIONS = [
  { value: "", label: "Peu importe" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
];

const RESULTS_LIMIT = 20;

export default function FilterList() {
  const [habitations, setHabitations] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [ville, setVille] = useState([]);
  const [villeSelected, setVilleSelected] = useState("");
  const [quartiers, setQuartiers] = useState([]);
  const [quartierSelected, setQuartierSelected] = useState("tous");
  const [type, setType] = useState("tous");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [position, setPosition] = useState("tous");
  const [coursUnique, setCoursUnique] = useState("tous");
  const [magasin, setMagasin] = useState("tous");
  const [cuisine, setCuisine] = useState("tous");
  const [nbreSalon, setNbreSalon] = useState("");
  const [nbreChambres, setNbreChambres] = useState("");
  const [nombreDouche, setNombreDouche] = useState("");
  const [parking, setParking] = useState("tous");
  const [compteurEDMSepare, setCompteurEDMSepare] = useState("tous");
  const [compteurEauSepare, setCompteurEauSepare] = useState("tous");
  const [meuble, setMeuble] = useState("tous");
  const [climatisation, setClimatisation] = useState("tous");
  const [connexionInternet, setConnexionInternet] = useState("tous");
  const [energieSecours, setEnergieSecours] = useState("tous");
  const [typePaiementAppart, setTypePaiementAppart] = useState("mensuel");
  const [toiletteInterne, setToiletteInterne] = useState("tous");
  const [isLoading, setIsLoading] = useState(false);
  const [filtreActif, setFiltreActif] = useState(false);

  const buildFiltre = useCallback(() => {
    return {
      statut: "disponible",
      // AJOUT : oubliée dans la version d'origine — seule la recherche
      // initiale limitait à 20 résultats ; toute recherche filtrée derrière
      // partait sans aucune limite.
      limit: RESULTS_LIMIT,
      villeSelected: villeSelected || undefined,
      type: type !== "tous" ? type : undefined,
      quartier: quartierSelected !== "tous" ? quartierSelected : undefined,
      typeOffre: "location",
      typePaiementAppart: type === "appartement" ? typePaiementAppart : undefined,
      prixMin: prixMin ? Number(prixMin) : undefined,
      prixMax: prixMax ? Number(prixMax) : undefined,
      etage: position !== "tous" ? Number(position) : undefined,
      coursUnique: coursUnique !== "tous" ? coursUnique : undefined,
      magasin: magasin !== "tous" ? magasin : undefined,
      cuisine: cuisine !== "tous" ? cuisine : undefined,
      nbreSalon: nbreSalon ? Number(nbreSalon) : undefined,
      nbreChambres: nbreChambres ? Number(nbreChambres) : undefined,
      nombreDouche: nombreDouche ? Number(nombreDouche) : undefined,
      parking: parking !== "tous" ? parking : undefined,
      compteurEDMSepare: compteurEDMSepare !== "tous" ? compteurEDMSepare : undefined,
      compteurEauSepare: compteurEauSepare !== "tous" ? compteurEauSepare : undefined,
      meuble: meuble !== "tous" ? meuble : undefined,
      climatisation: climatisation !== "tous" ? climatisation : undefined,
      connexionInternet: connexionInternet !== "tous" ? connexionInternet : undefined,
      energieSecours: energieSecours !== "tous" ? energieSecours : undefined,
      toiletteInterne: toiletteInterne !== "tous" ? toiletteInterne : undefined,
    };
  }, [
    villeSelected, type, quartierSelected, typePaiementAppart, prixMin, prixMax,
    position, coursUnique, magasin, cuisine, nbreSalon, nbreChambres, nombreDouche,
    parking, compteurEDMSepare, compteurEauSepare, meuble, climatisation,
    connexionInternet, energieSecours, toiletteInterne,
  ]);

  const checkFiltreActif = useCallback(() => {
    const filtre = buildFiltre();
    const { statut, typeOffre, limit, ...filtresReels } = filtre;
    return Object.values(filtresReels).some((value) => value !== undefined && value !== "");
  }, [buildFiltre]);

  useEffect(() => {
    setFiltreActif(checkFiltreActif());
  }, [checkFiltreActif]);

  const fetchHabitations = async (filtre) => {
    setIsLoading(true);
    try {
      const filtrePropre = Object.fromEntries(
        Object.entries(filtre).filter(([_, value]) => value !== undefined && value !== "")
      );
      const data = await API.getHabitations(filtrePropre);
      setHabitations(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des habitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVilles = async () => {
    try {
      setVille(await API.getVilles());
    } catch (error) {
      console.error("Erreur lors de la récupération des villes:", error);
    }
  };

  const fetchQuartiers = async () => {
    try {
      setQuartiers(await API.getQuartiers());
    } catch (error) {
      console.error("Erreur lors de la récupération des quartiers : ", error);
    }
  };

  const resetAdvancedFilters = () => {
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
    setToiletteInterne("tous");
    setNbreSalon("");
    setNbreChambres("");
    setNombreDouche("");
  };

  const manageBtnFilterVisibility = () => {
    if (filterVisible) resetAdvancedFilters();
    setFilterVisible(!filterVisible);
  };

  const toggleMobileFilter = () => setShowMobileFilter((s) => !s);

  useEffect(() => {
    fetchHabitations({ statut: "disponible", typeOffre: "location", limit: RESULTS_LIMIT });
    fetchVilles();
    fetchQuartiers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHabitations(buildFiltre());
    if (window.innerWidth < 768) setShowMobileFilter(false);
  };

  const resetAllFilters = () => {
    setVilleSelected("");
    setQuartierSelected("tous");
    setType("tous");
    setPrixMin("");
    setPrixMax("");
    setPosition("tous");
    resetAdvancedFilters();
    setTypePaiementAppart("mensuel");
  };

  // AJOUT : configuration déclarative des filtres Oui/Non/Peu-importe —
  // c'est ce bloc qui remplace la dizaine de <select> quasi identiques
  // dupliqués deux fois (mobile + desktop) dans la version d'origine.
  const amenityFields = [
    { key: "magasin", label: "Magasin", types: ["maison", "appartement"], value: magasin, onChange: setMagasin },
    { key: "cuisine", label: "Cuisine", types: ["maison", "appartement"], value: cuisine, onChange: setCuisine },
    { key: "parking", label: "Parking", types: ["maison", "appartement"], value: parking, onChange: setParking },
    { key: "coursUnique", label: "Cours Unique", types: ["maison", "appartement"], value: coursUnique, onChange: setCoursUnique },
    { key: "toiletteInterne", label: "Toilette interne", types: ["magasin"], value: toiletteInterne, onChange: setToiletteInterne },
    { key: "compteurEDMSepare", label: "EDM Séparé", types: ["maison", "magasin"], value: compteurEDMSepare, onChange: setCompteurEDMSepare },
    { key: "compteurEauSepare", label: "Eau Séparé", types: ["maison", "magasin"], value: compteurEauSepare, onChange: setCompteurEauSepare },
    { key: "meuble", label: "Meublé", types: ["appartement"], value: meuble, onChange: setMeuble },
    { key: "climatisation", label: "Climatisation", types: ["appartement"], value: climatisation, onChange: setClimatisation },
    { key: "connexionInternet", label: "Internet", types: ["appartement"], value: connexionInternet, onChange: setConnexionInternet },
    { key: "energieSecours", label: "Énergie secours", types: ["appartement"], value: energieSecours, onChange: setEnergieSecours },
  ].filter((f) => f.types.includes(type));

  // AJOUT : ce fragment est LE seul jeu de champs, rendu à la fois dans le
  // panneau mobile et dans la barre desktop — avant, il existait en deux
  // copies distinctes (~700 lignes chacune) avec le risque qu'un correctif
  // appliqué à l'une soit oublié sur l'autre.
  const champsPrincipaux = (
    <>
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
        disabled={!villeSelected}
        hint={!villeSelected ? "Choisissez d'abord une ville" : undefined}
        options={[
          { value: "tous", label: "Peu importe" },
          ...quartiers.filter((q) => q.ville?._id === villeSelected).map((q) => ({ value: q._id, label: q.nom })),
        ]}
      />

      <SelectField
        label="Type"
        value={type}
        onChange={(v) => { setType(v); if (v === "tous") setFilterVisible(false); }}
        options={TYPE_OPTIONS}
      />

      {type === "appartement" && (
        <div className="animate-in fade-in slide-in-from-top-1">
          <SelectField label="Paiement" value={typePaiementAppart} onChange={setTypePaiementAppart} options={PAIEMENT_OPTIONS} />
        </div>
      )}

      <NumberField label="Prix Min (FCFA)" value={prixMin} onChange={setPrixMin} placeholder="Ex: 100000" />
      <NumberField label="Prix Max (FCFA)" value={prixMax} onChange={setPrixMax} placeholder="Ex: 500000" />

      {(type === "maison" || type === "appartement") && (
        <>
          <div className="animate-in fade-in"><NumberField label="Salon" value={nbreSalon} onChange={setNbreSalon} placeholder="Ex: 1" /></div>
          <div className="animate-in fade-in"><NumberField label="Chambres" value={nbreChambres} onChange={setNbreChambres} placeholder="Ex: 2" /></div>
          <div className="animate-in fade-in"><SelectField label="Toilettes" value={nombreDouche} onChange={setNombreDouche} options={DOUCHE_OPTIONS} /></div>
        </>
      )}

      <SelectField label="Position / Étage" value={position} onChange={setPosition} options={ETAGE_OPTIONS} />

      {filterVisible && type !== "tous" && amenityFields.map((f) => (
        <div key={f.key} className="animate-in fade-in">
          <SelectField label={f.label} value={f.value} onChange={f.onChange} options={PEU_IMPORTE_OUI_NON} />
        </div>
      ))}
    </>
  );

  const AdvancedToggleButton = ({ className }) => (
    <button
      type="button"
      onClick={manageBtnFilterVisibility}
      aria-expanded={filterVisible}
      aria-label={filterVisible ? "Masquer les filtres avancés" : "Afficher les filtres avancés"}
      className={className}
    >
      <span className={`w-2 h-2 rounded-full ${filterVisible ? "bg-red-400" : "bg-green-400 animate-pulse"}`} role="presentation"></span>
      {filterVisible ? "Masquer les filtres" : "Filtres avancés"}
    </button>
  );

  return (
    <>
      <section className="w-full bg-gradient-to-br from-maliGreen via-maliGreen/90 to-maliOrange/90 py-8 sm:py-12 shadow-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h2 className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg">
                Trouvez la location parfaite <span className="inline-block hover:animate-bounce" aria-hidden="true">🏠</span>
              </h2>
              <p className="text-white/80 text-sm sm:text-base font-medium">Recherchez parmi les meilleures offres disponibles</p>
            </div>

            <div className="flex gap-3" role="group" aria-label="Contrôles des filtres">
              <button
                type="button"
                onClick={toggleMobileFilter}
                aria-expanded={showMobileFilter}
                aria-controls="mobile-filter-menu"
                className="md:hidden flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Afficher filtre
              </button>

              {type !== "tous" && (
                <AdvancedToggleButton className="hidden md:flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg" />
              )}

              {filtreActif && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  aria-label="Réinitialiser tous les filtres de recherche"
                  className="hidden md:flex items-center justify-center gap-2 py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full border border-white/30 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {showMobileFilter && (
            <div className="fixed inset-0 z-50 md:hidden" id="mobile-filter-menu">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobileFilter}></div>
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-br from-maliGreen via-maliGreen/95 to-maliOrange/95 p-6 rounded-b-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white text-xl font-bold">Filtres de recherche</h3>
                  <button onClick={toggleMobileFilter} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors" aria-label="Fermer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">{champsPrincipaux}</div>

                  {type !== "tous" && (
                    <div className="pt-2">
                      <AdvancedToggleButton className="w-full flex items-center justify-center gap-2 py-2.5 text-white/90 hover:text-white font-medium" />
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <button
                      type="submit"
                      className="w-full h-12 bg-maliOrange hover:bg-maliOrange/90 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(232,119,34,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Appliquer les filtres
                    </button>

                    {filtreActif && (
                      <button
                        type="button"
                        onClick={resetAllFilters}
                        className="w-full h-11 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all duration-300"
                      >
                        Réinitialiser tous les filtres
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="hidden md:grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {champsPrincipaux}
            <div className="flex items-end col-span-2 sm:col-span-2 md:col-span-1">
              <button
                type="submit"
                className="w-full h-11 bg-maliOrange hover:bg-maliOrange/90 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(232,119,34,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Rechercher</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="w-full bg-gradient-to-b from-white via-gray-50 to-maliGreen/5 py-12 sm:py-20 min-h-[400px]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
              Biens disponibles <span className="text-maliGreen">au Mali</span>
            </h2>
            <div className="w-20 h-1.5 bg-maliOrange rounded-full" aria-hidden="true"></div>
            {!isLoading && (
              <p className="text-sm text-gray-400 mt-2" aria-live="polite">
                {habitations.length} résultat{habitations.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-maliOrange"></div>
              <span className="sr-only">Chargement des biens...</span>
            </div>
          ) : habitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200" role="region" aria-labelledby="no-results-title">
              <div className="text-6xl animate-bounce" aria-hidden="true">🔍</div>
              <h3 id="no-results-title" className="text-xl font-bold text-gray-700">Aucun résultat trouvé</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Désolé, nous n'avons pas trouvé de biens correspondant à vos critères actuels.</p>
              <button onClick={resetAllFilters} className="mt-2 text-maliOrange font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-maliOrange rounded-lg px-2">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center" aria-label="Liste des biens immobiliers">
              {habitations.map((habitation) => (
                <div key={habitation._id} className="w-full flex justify-center">
                  {habitation.__t === "maison" && <MaisonCard maison={habitation} />}
                  {habitation.__t === "appartement" && <AppartementCard appartement={habitation} typePaiementAppart={typePaiementAppart} />}
                  {habitation.__t === "magasin" && <MagasinCard magasin={habitation} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
