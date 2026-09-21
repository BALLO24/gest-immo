import { useState, useEffect } from "react";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import TerrainCard from "../cards/TerrainCard";
import API from "../../api/API";
import { Link } from "react-router-dom";

export default function ListeMaisons() {
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(false);

  const fetchHabitations = async () => {
    setLoading(true);
    setErreur(false);
    try {
      // CORRIGÉ (cohérence) : la section s'appelle "Nos meilleures offres" —
      // avant, le filtre ne triait que par disponibilité (les 6 plus
      // récentes), sans jamais utiliser misEnAvant, le champ conçu
      // précisément pour marquer des biens mis en avant. On privilégie
      // maintenant les biens "en vedette", avec un repli sur les plus
      // récents si aucun (ou pas assez) n'est marqué comme tel — pour ne
      // jamais afficher une section vide alors que des biens existent.
      let data = await API.getHabitations({ statut: "disponible", misEnAvant: true, limit: 6 });
      if (!data || data.length < 3) {
        data = await API.getHabitations({ statut: "disponible", limit: 6 });
      }
      setHabitations(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des habitations:', error);
      setErreur(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitations();
  }, []);

  return (
    <section 
      className="bg-maliSand/20 py-10 px-4 sm:px-8 lg:px-12"
      aria-labelledby="titre-offres"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center mb-8 space-y-2">
          <h2 id="titre-offres" className="text-4xl font-extrabold text-center text-maliGreen tracking-tight">
            Nos <span className="text-maliOrange">meilleures offres</span>
          </h2>
          <div className="flex gap-1" aria-hidden="true">
            <span className="w-8 h-1 bg-maliOrange rounded-full"></span>
            <span className="w-2 h-1 bg-maliGreen rounded-full"></span>
          </div>
        </div>

        <div aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-full h-80 bg-gray-200 animate-pulse rounded-2xl" aria-hidden="true"></div>
              ))}
              <span className="sr-only">Chargement des meilleures offres...</span>
            </div>
          ) : erreur ? (
            <p className="text-center text-gray-500 py-10" role="status">
              Impossible de charger les offres pour le moment. Réessayez plus tard.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center" role="list">
              {habitations.length > 0 ? (
                habitations.map((habitation) => (
                  <div key={habitation._id} className="w-full flex justify-center" role="listitem">
                    {habitation.__t === 'maison' && <MaisonCard maison={habitation} />}
                    {habitation.__t === 'appartement' && <AppartementCard appartement={habitation} typePaiementAppart="journalier" />}
                    {habitation.__t === 'magasin' && <MagasinCard magasin={habitation} />}
                    {/* CORRIGÉ (bug) : TerrainCard n'était ni importé ni géré
                        ici — un terrain récupéré par le filtre était rendu
                        invisible (aucun cas ne correspondait dans l'ancien
                        switch). */}
                    {habitation.__t === 'terrain' && <TerrainCard terrain={habitation} />}
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

        {!loading && habitations.length > 0 && (
          <div className="mt-16 text-center">
            <Link 
              to="/location" 
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
