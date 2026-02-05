import { useState,useEffect } from "react";
import MaisonCard from "../cards/MaisonCard";
import AppartementCard from "../cards/AppartementCard";
import MagasinCard from "../cards/MagasinCard";
import API from "../../api/API";

export default function ListeMaisons() {
  const [habitations,setHabitations]=useState([])

    const fetchHabitations = async (filtre) => {
    try {
      const data = await API.getHabitations(filtre);
      console.log("data data",data);
      setHabitations(data);
      console.log("habitations : ", habitations);

    } catch (error) {
      console.error('Erreur lors de la récupération des habitations:', error);
    }
  };
  useEffect(() => {
    const initialFiltre = {limit: 6};
    fetchHabitations(initialFiltre);
  }, []);

  return (
  <>
<section className="bg-maliSand/20 py-10 px-4 sm:px-8 lg:px-12">
  <div className="container mx-auto max-w-7xl">
    {/* Titre avec design centré */}
    <div className="flex flex-col items-center mb-8 space-y-2">
      <h2 className="text-4xl sm:text-4xl font-extrabold text-center text-maliGreen tracking-tight">
        Nos <span className="text-maliOrange">meilleures offres</span>
      </h2>
      <div className="flex gap-1">
        <span className="w-8 h-1 bg-maliOrange rounded-full"></span>
        <span className="w-2 h-1 bg-maliGreen rounded-full"></span>
      </div>
    </div>

    {/* Grille de cartes parfaitement centrée */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center place-content-center">
      {habitations.map((habitation) => (
        <div 
          key={habitation._id} 
          className="w-full flex justify-center "
        >
          {(() => {
            switch (habitation.__t) {
              case 'maison':
                return <MaisonCard maison={habitation} />;
              case 'appartement':
                return (
                  <AppartementCard 
                    appartement={habitation} 
                    typePaiementAppart="journalier" 
                  />
                );
              case 'magasin':
                return <MagasinCard magasin={habitation} />;
              default:
                return null;
            }
          })()}
        </div>
      ))}
    </div>

    {/* Optionnel : Bouton "Voir plus" si tu as beaucoup de biens */}
    {habitations.length > 0 && (
      <div className="mt-16 text-center">
        <button className="px-8 py-3 bg-transparent border-2 border-maliGreen text-maliGreen font-bold rounded-full hover:bg-maliGreen hover:text-white transition-all duration-300">
          Découvrir toutes les offres
        </button>
      </div>
    )}
  </div>
</section>
</>
);
}
