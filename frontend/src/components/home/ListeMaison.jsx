import { useState, useEffect } from "react";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import API from "../../api/API";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function ListeMaisons() {
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabitations = async (filtre) => {
    try {
      setLoading(true);
      const data = await API.getHabitations(filtre);
      const formattedData = data.map(item => ({
        ...item,
        images: item.images.map(img =>
          img.startsWith('http') ? img : `${BASE_URL}/${img}`
        )
      }));
      setHabitations(formattedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des habitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialFiltre = { statut: "disponible", limit: 6 };
    fetchHabitations(initialFiltre);
  }, []);

  return (
    <section
      className="mx-2 mb-2"
      aria-labelledby="titre-offres"
      style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}
    >
      {/* === OUTER WINDOW === */}
      <div className="win-window">

        {/* Title bar */}
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">📋</span>
            <h2 id="titre-offres">Nos meilleures offres</h2>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>_</button>
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>□</button>
            <button className="win-btn !px-1.5 !py-0 text-xs font-black leading-none" style={{ minWidth: '18px', minHeight: '16px', color: '#CC0000' }}>✕</button>
          </div>
        </div>

        {/* Menu bar for the list */}
        <div className="win-menubar">
          <span className="win-menuitem"><u>F</u>ichier</span>
          <span className="win-menuitem"><u>E</u>dition</span>
          <span className="win-menuitem"><u>A</u>ffichage</span>
          <span className="win-menuitem"><u>T</u>rier</span>
          <div style={{ width: '1px', height: '14px', backgroundColor: '#808080', borderRight: '1px solid #FFFFFF', margin: '0 4px' }} aria-hidden="true"></div>
          <span className="text-xs" style={{ color: '#808080' }}>
            {loading ? 'Chargement...' : `${habitations.length} biens trouvés`}
          </span>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-1 px-2 py-1 flex-wrap"
          style={{ backgroundColor: '#D4D0C8', borderBottom: '1px solid #808080' }}
          role="toolbar"
          aria-label="Outils d&apos;affichage"
        >
          <button className="win-btn text-xs !px-2 !py-0.5" title="Vue liste" aria-label="Vue liste">☰</button>
          <button className="win-btn text-xs !px-2 !py-0.5" title="Vue grille" aria-label="Vue grille">⊞</button>
          <button className="win-btn text-xs !px-2 !py-0.5" title="Vue grandes icônes" aria-label="Vue grandes icônes">⊟</button>
          <div style={{ width: '1px', height: '14px', backgroundColor: '#808080', borderRight: '1px solid #FFFFFF', margin: '0 4px' }} aria-hidden="true"></div>
          <button className="win-btn text-xs !px-2 !py-0.5" aria-label="Actualiser les annonces">↻ Actualiser</button>
          <Link to="./location">
            <button className="win-btn text-xs !px-2 !py-0.5 font-bold" style={{ color: '#000080' }} aria-label="Chercher des biens">🔍 Chercher</button>
          </Link>
        </div>

        {/* Content area */}
        <div
          className="p-3"
          style={{ backgroundColor: '#D4D0C8' }}
          aria-live="polite"
          aria-busy={loading}
        >
          {loading ? (
            <div>
              {/* Loading progress bar like Windows */}
              <div className="win-inset p-3 mb-2 text-center">
                <p className="text-xs mb-2" style={{ color: '#000080' }}>
                  ⏳ Chargement des annonces en cours...
                </p>
                <div className="win-progress-bar mx-auto" style={{ maxWidth: '300px' }}>
                  <div
                    className="win-progress-fill animate-pulse"
                    style={{ width: '60%', transition: 'width 0.5s' }}
                    role="progressbar"
                    aria-valuenow={60}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: '#808080' }}>Veuillez patienter...</p>
              </div>
              <span className="sr-only">Chargement des meilleures offres...</span>
            </div>
          ) : (
            <>
              {habitations.length === 0 ? (
                /* Windows-style "No items" dialog */
                <div className="win-window mx-auto" style={{ maxWidth: '400px' }}>
                  <div className="win-titlebar text-xs">
                    <span>⚠️ Information</span>
                  </div>
                  <div className="p-4 flex gap-3 items-start" style={{ backgroundColor: '#D4D0C8' }}>
                    <div
                      style={{ fontSize: '24px', flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      ℹ️
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-1" style={{ color: '#000080' }}>
                        Aucune offre disponible
                      </p>
                      <p className="text-xs">
                        Il n&apos;y a pas d&apos;annonces disponibles pour le moment. Veuillez revenir ultérieurement.
                      </p>
                      <div className="mt-3">
                        <button className="win-btn text-xs" onClick={() => fetchHabitations({ statut: "disponible", limit: 6 })}>
                          ↻ Réessayer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Grid of property cards */
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  role="list"
                  aria-label="Liste des propriétés disponibles"
                >
                  {habitations.map((habitation) => (
                    <div
                      key={habitation._id}
                      className="win-window"
                      role="listitem"
                    >
                      {/* Mini icon title for each card */}
                      <div
                        className="px-2 py-0.5 text-xs flex items-center gap-1"
                        style={{
                          background: 'linear-gradient(to right, #000080, #1084d0)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                        }}
                      >
                        <span aria-hidden="true">
                          {habitation.__t === 'maison' ? '🏠' : habitation.__t === 'appartement' ? '🏢' : '🏪'}
                        </span>
                        <span className="capitalize">{habitation.__t || 'Bien'}</span>
                        <span style={{ marginLeft: 'auto', color: '#ccc', fontSize: '9px' }}>
                          #{habitation._id?.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ backgroundColor: '#D4D0C8', padding: '2px' }}>
                        {(() => {
                          switch (habitation.__t) {
                            case 'maison':
                              return <MaisonCard maison={habitation} />;
                            case 'appartement':
                              return <AppartementCard appartement={habitation} typePaiementAppart="journalier" />;
                            case 'magasin':
                              return <MagasinCard magasin={habitation} />;
                            default:
                              return null;
                          }
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* "See more" button in Win2k style */}
              {habitations.length > 0 && (
                <div className="mt-4 flex justify-center gap-2">
                  <Link to="./location">
                    <button className="win-btn font-bold text-xs" style={{ color: '#000080' }}>
                      📂 Découvrir toutes les offres
                    </button>
                  </Link>
                  <button className="win-btn text-xs" onClick={() => fetchHabitations({ statut: "disponible", limit: 6 })}>
                    ↻ Actualiser
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status bar */}
        <div className="win-statusbar">
          <div className="win-status-panel">
            {loading ? 'Chargement...' : `${habitations.length} objet(s)`}
          </div>
          <div className="win-status-panel" style={{ maxWidth: '200px' }}>
            Bamako, Mali
          </div>
          <div style={{ marginLeft: 'auto', color: '#808080', fontSize: '10px' }} aria-hidden="true">◢</div>
        </div>

      </div>
    </section>
  );
}
