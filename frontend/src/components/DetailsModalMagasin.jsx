import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Map, Locate, Bath, Zap, Droplets, Wallet, MessageCircle,Phone, X } from "lucide-react";

export default function DetailsModalMagasin({ item, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const telephoneProprio = "+22382083814";
  
  if (!item) return null;

  const infos = [
    { Icon: MapPin, label: "Ville", value: item.quartier?.ville.nom },
    { Icon: Map, label: "Quartier", value: item.quartier?.nom },
    { Icon: Locate, label: "Position", value: item.position },
    { Icon: Bath, label: "Toilette interne", value: item.toiletteInterne, status: item.toiletteInterne },
    { Icon: Zap, label: "Compteurs EDM Separés", value: item.compteurEDMSepare, status: item.compteurEDMSepare },
    { Icon: Droplets, label: "Compteurs eau Separés", value: item.compteurEauSepare, status: item.compteurEauSepare},
  ];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[98vh] overflow-hidden flex flex-col" initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}>
          
          {/* HEADER */}
          <div className="flex justify-between items-center p-2 border-b">
          <h3 className="text-md font-bold text-maliGreen mb-1">N° {item._id ? item._id.slice(-5).toUpperCase() : "N/A"}</h3>
            <button onClick={onClose} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg text-sm transition"><X className="w-4 h-4" />Fermer</button>
          </div>

          {/* CONTENU */}
          <div className="overflow-y-auto flex-1">
            {/* SLIDER */}
            <div className="relative">
              <img src={item.images[currentIndex]} className="w-full h-72 object-cover" />
              <div className="flex gap-2 justify-center p-2 bg-white/80">
                {item.images.map((img, index) => (
                  <img key={index} src={img} onClick={() => setCurrentIndex(index)} className={`h-10 w-16 rounded object-cover cursor-pointer border-2 transition ${currentIndex === index ? "border-black scale-105" : "border-gray-300"}`} />
                ))}
              </div>
            </div>

            {/* DESCRIPTION & INFOS */}
            <div className="p-3">
              <p className="text-gray-600 text-sm mb-1 line-clamp-2">{item.description}</p>
              
              {/* INFOS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-1">
                {infos.map((info, idx) => (
                  <InfoCompact key={idx} {...info} />
                ))}
              </div>

              {/* PRIX ET WHATSAPP */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-2 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-gray-700" />
                    <span className="text-lg font-bold text-gray-800">{item.prix?.toLocaleString()} XOF / mois</span>
                  </div>
                </div>
                <a href={`https://wa.me/${telephoneProprio}?text=Bonjour,%20je%20suis%20intéressé%20par%20le%20bien%20${item.titre}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-sm transition">
                  <MessageCircle className="w-4 h-4" />Contacter sur WhatsApp
                </a>
              </div>
                <div className="mt-2 pt-1 border-t border-gray-100 font-bold font-italic">
                <span className="text-sm text-gray-600 mb-1">Appelez nous directement au : </span>
                <a 
                    href={`tel:${telephoneProprio}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition group"
                >
                    <Phone className="w-4 h-4" />
                    <span className="font-semibold">(+223) 82 08 38 14</span>
                </a>
                </div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* Composant Info Compact */
function InfoCompact({ Icon, label, value, status }) {
  const isBoolean = typeof status === "boolean";
  const valueText = isBoolean ? (value ? "Oui" : "Non") : value;
  
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-200 text-center min-h-[40px]">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-4 h-4 text-gray-600" />
        <p className="text-xs font-semibold text-gray-600">{label}</p>
      </div>
      <p className={`text-sm font-medium ${isBoolean ? value ? "text-green-600" : "text-red-600" : "text-gray-800"}`}>{valueText}</p>
    </div>
  );
}