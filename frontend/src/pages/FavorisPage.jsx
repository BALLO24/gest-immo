import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, Loader2 } from "lucide-react";
import API from "../api/API";
import { useListeFavoris } from "../utils/useFavoris";
import MaisonCard from "../components/cards/MaisonCard";
import AppartementCard from "../components/cards/AppartementCard";
import MagasinCard from "../components/cards/MagasinCard";
import TerrainCard from "../components/cards/TerrainCard";

// AJOUT : page entièrement nouvelle — les favoris sont stockés côté
// navigateur (voir utils/favoris.js), cette page se contente de récupérer
// les biens correspondants et de les afficher avec les mêmes cartes que
// partout ailleurs sur le site.
export default function FavorisPage() {
  const idsFavoris = useListeFavoris();
  const [proprietes, setProprietes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let annule = false;
    setLoading(true);
    API.getProprietesParIds(idsFavoris).then((data) => {
      if (!annule) {
        setProprietes(data);
        setLoading(false);
      }
    });
    return () => { annule = true; };
  }, [idsFavoris.join(",")]);

  return (
    <>
      <Helmet>
        <title>Mes favoris | ImmoMali</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500" size={22} /> Mes favoris
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Les biens que vous avez enregistrés, conservés sur cet appareil.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-maliOrange" size={28} />
          </div>
        ) : proprietes.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="mx-auto text-gray-200 mb-3" size={48} />
            <p className="text-gray-400 mb-4">Vous n'avez pas encore de favoris.</p>
            <Link to="/location" className="text-maliGreen font-semibold hover:underline">
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proprietes.map((item) => (
              <div key={item._id}>
                {item.__t === "maison" && <MaisonCard maison={item} />}
                {item.__t === "appartement" && <AppartementCard appartement={item} />}
                {item.__t === "magasin" && <MagasinCard magasin={item} />}
                {item.__t === "terrain" && <TerrainCard terrain={item} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
