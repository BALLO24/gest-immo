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
    <section className="bg-maliSand/30 py-16 px-6 sm:px-12">
      <h2 className="text-3xl font-bold text-center text-maliGreen mb-10">
        Nos <span className="text-maliOrange">meilleures offres</span>
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {habitations.map((habitation) => {
              switch (habitation.__t) {
                case 'maison':
                  return <MaisonCard key={habitation._id} maison={habitation} />;
                case 'appartement':
                  return <AppartementCard key={habitation._id} appartement={habitation} typePaiementAppart="journalier"/>;
                case 'magasin':
                  return <MagasinCard key={habitation._id} magasin={habitation}/>
                default:
                  return null;
              }
            })}
      </div>
    </section>
  );
}
