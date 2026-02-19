import { useState, useEffect } from "react";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import API from "../../api/API";

// Définissez l'URL de base de votre serveur (ajustez selon votre config)
const BASE_URL = "http://localhost:5000"; 

export default function ListeMaisons() {
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true); // État de chargement

  const fetchHabitations = async (filtre) => {
    try {
      setLoading(true);
      const data = await API.getHabitations(filtre);
      
      // TRAITEMENT DES IMAGES : On s'assure que chaque image a une URL complète
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
    <section className="bg-maliSand/20 py-10 px-4 sm:px-8 lg:px-12">
      <div className="container mx-auto max-w-7xl">
        {/* Titre */}
        <div className="flex flex-col items-center mb-8 space-y-2">
          <h2 className="text-4xl font-extrabold text-center text-maliGreen tracking-tight">
            Nos <span className="text-maliOrange">meilleures offres</span>
          </h2>
          <div className="flex gap-1">
            <span className="w-8 h-1 bg-maliOrange rounded-full"></span>
            <span className="w-2 h-1 bg-maliGreen rounded-full"></span>
          </div>
        </div>

        {/* État de chargement (Skeletons) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-full h-80 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {habitations.length > 0 ? (
              habitations.map((habitation) => (
                <div key={habitation._id} className="w-full flex justify-center">
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
              <p className="col-span-full text-gray-500">Aucune offre disponible pour le moment.</p>
            )}
          </div>
        )}

        {/* Bouton Voir plus */}
        {!loading && habitations.length > 0 && (
          <div className="mt-16 text-center">
            <button className="px-8 py-3 border-2 border-maliGreen text-maliGreen font-bold rounded-full hover:bg-maliGreen hover:text-white transition-all duration-300">
              Découvrir toutes les offres
            </button>
          </div>
        )}
      </div>
    </section>
  );
}