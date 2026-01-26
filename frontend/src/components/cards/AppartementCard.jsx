import { useState } from "react";
import { MapPin, BedDouble, Bath, Square, ChevronLeft, ChevronRight, House, MapPinHouse } from "lucide-react";
import { motion } from "framer-motion";
import DetailsModalAppart from "../DetailsModalAppart";

export default function AppartementCard({ appartement, typePaiementAppart }) {
  const [currentImage, setCurrentImage] = useState(0);
    const [selectedAppart, setSelectedAppart] = useState(null);
  
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % appartement.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? appartement.images.length - 1 : prev - 1
    );
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out w-[22rem] sm:w-[24rem]"
    >
      {/* Image */}
      <div className="relative w-full h-56 overflow-hidden">
        <img
          src={appartement.images[currentImage]}
          alt={appartement.titre}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />

        {/* Flèches */}
        {appartement.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-maliGreen hover:text-white text-gray-700 p-2 rounded-full shadow-md transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-maliGreen hover:text-white text-gray-700 p-2 rounded-full shadow-md transition"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Indicateurs */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {appartement.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`w-2 h-2 rounded-full ${
                i === currentImage
                  ? "bg-maliOrange"
                  : "bg-white/70 hover:bg-maliOrange/60"
              } transition-all duration-300`}
            ></button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-maliGreen mb-1">{appartement.titre}</h3>
        <div className="flex items-center text-gray-600 text-sm mb-3 font-medium">
          <MapPin className="w-4 h-4 mr-1 text-maliOrange" />
          {appartement.quartier?.ville.nom}
        </div>
          
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPinHouse className="w-4 h-4 mr-1 text-maliOrange" />
          {appartement.quartier?.nom}
        </div>

        <div className="flex justify-between text-gray-700 text-sm mb-4">
          <span className="flex items-center gap-1">
            <House className="w-4 h-4 text-maliGreen" /> Meublé : {appartement.meuble ? '\u2705' : '\u274c'} |
          </span>
          <span className="flex items-center gap-1">
            <House className="w-4 h-4 text-maliGreen" /> Clim : {appartement.climatisation ? '\u2705' : '\u274c'} |
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-maliGreen" />EDM secours : {appartement.energieSecours ? '\u2705' : '\u274c'} 
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-maliOrange">
            {/* {appartement?.prix?.toLocaleString() || "test"} XOF par heure */}
            {typePaiementAppart === "mensuel" && (
              <>
                {appartement?.prix?.toLocaleString() || "N/A"} XOF / mois
              </>
            )}
            {typePaiementAppart === "journalier" && (
              <>
                {appartement?.prixParJour?.toLocaleString() || "N/A"} XOF / jour
              </>
            )}
            {typePaiementAppart === "horaire" && (
              <>
                {appartement?.prixParHeure?.toLocaleString() || "N/A"} XOF / heure
              </>
            )}
          </span>
          <button className="px-4 py-2 bg-maliGreen text-white text-sm font-semibold rounded-full hover:bg-maliOrange transition-all duration-300"
          onClick={() => setSelectedAppart(appartement)}
          >
            Voir plus
          </button>
        </div>
      </div>
    </motion.div>
    <DetailsModalAppart item={selectedAppart} onClose={()=>setSelectedAppart(null)}/>
    </>
  );
}
