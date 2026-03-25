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
    const initialFiltre = { statut:"disponible", limit: 6 };
    fetchHabitations(initialFiltre);
  }, []);

  return (
    <section 
      className="bg-maliSand/20 py-10 px-4 sm:px-8 lg:px-12"
      aria-labelledby="titre-offres"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Titre */}
        <div className="flex flex-col items-center mb-8 space-y-2">
          <h2 id="titre-offres" className="text-4xl font-extrabold text-center text-maliGreen tracking-tight">
            Nos <span className="text-maliOrange">meilleures offres</span>
          </h2>
          <div className="flex gap-1" aria-hidden="true">
            <span className="w-8 h-1 bg-maliOrange rounded-full"></span>
            <span className="w-2 h-1 bg-maliGreen rounded-full"></span>
          </div>
        </div>

        {/* Zone de contenu avec gestion d'état pour lecteurs d'écran */}
        <div 
          aria-live="polite" 
          aria-busy={loading}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div 
                  key={n} 
                  className="w-full h-80 bg-gray-200 animate-pulse rounded-2xl"
                  aria-hidden="true"
                ></div>
              ))}
              <span className="sr-only">Chargement des meilleures offres...</span>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
              role="list"
            >
              {habitations.length > 0 ? (
                habitations.map((habitation) => (
                  <div 
                    key={habitation._id} 
                    className="w-full flex justify-center"
                    role="listitem"
                  >
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
                ))
              ) : (
                <p className="col-span-full text-gray-500" role="status">
                  Aucune offre disponible pour le moment.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bouton Voir plus */}
        {!loading && habitations.length > 0 && (
          <div className="mt-16 text-center">
            <Link 
              to="./location" 
              className="px-8 py-3 border-2 border-maliGreen text-maliGreen font-bold rounded-full hover:bg-maliGreen hover:text-white transition-all duration-300 focus:ring-4 focus:ring-maliGreen/30 outline-none"
              aria-label="Découvrir toutes les offres immobilières"
            >
              Découvrir toutes les offres
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}