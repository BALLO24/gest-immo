import { useState } from "react";
import { 
  MapPin, Bath, ChevronLeft, ChevronRight, House, 
  MapPinHouse, Building2, MoreVertical, CheckCircle, 
  Trash2, Pencil, MessageCircle 
} from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
import DetailsModalAppart from "../DetailsModalAppart";
import ModifAppartementModal from "../ModifAppartementModal";
import ConfirmSuppression from "../ConfirmSuppression";
import API from "../../api/API";

export default function AppartementCard({ appartement, onUpdate, typePaiementAppart = "journalier" }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedAppart, setSelectedAppart] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuppressionModalOpen, setIsSuppressionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  

  const token = localStorage.getItem("authToken");
  const role = token ? jwtDecode(token).role : null;
  let canEditStatus = false;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const agenceId = appartement.agence?._id || appartement.agence;
      canEditStatus = decoded.role === "admin" || decoded.agenceId === agenceId;
    } catch (e) {
      console.error("Erreur décodage token", e);
    }
  }

  const handleUpdateSuccess = (updatedAppart) => {
    setIsEditModalOpen(false);
    toast.success("Appartement mis à jour avec succès !", {
      style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
    if (onUpdate) {
      onUpdate(updatedAppart);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await API.deleteHabitation(appartement._id);
      if (result) {
        setIsSuppressionModalOpen(false);
        setShowStatusMenu(false);
        if (onUpdate) {
          onUpdate({ ...appartement, isDeleted: true });
        }
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % appartement.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) =>
      prev === 0 ? appartement.images.length - 1 : prev - 1
    );
  };

  const idCourt = appartement._id ? appartement._id.slice(-5).toUpperCase() : "N/A";

  return (
    <>
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out w-full max-w-[400px] mx-auto"
      >
        {/* Image / Galerie */}
        <div className="relative w-full h-56 overflow-hidden" role="region" aria-label={`Galerie photos de l'appartement ${idCourt}`}>
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-maliOrange border border-maliOrange/30 shadow-sm z-10 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
            Appartement
          </div>

          {canEditStatus && (
            <div className="absolute top-3 right-3 z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowStatusMenu(!showStatusMenu); }}
                aria-haspopup="menu"
                aria-expanded={showStatusMenu}
                aria-label="Options de gestion de l'annonce"
                className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md text-gray-700 hover:text-maliOrange transition-colors focus:ring-2 focus:ring-maliOrange outline-none"
              >
                <MoreVertical size={20} aria-hidden="true" />
              </button>
              
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden" role="menu">
                  <button 
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditModalOpen(true);
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={16} aria-hidden="true" /> Modifier
                  </button>
                  <button 
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSuppressionModalOpen(true);
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                  >
                    <Trash2 size={16} aria-hidden="true" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
          
          <img
            src={appartement.images[currentImage]}
            alt={`Vue ${currentImage + 1} de l'appartement à ${appartement.quartier?.nom}`}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out"
          />

          {appartement.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Image précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-maliGreen hover:text-white text-gray-700 p-2 rounded-full shadow-md transition outline-none focus:ring-2 focus:ring-maliGreen"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Image suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-maliGreen hover:text-white text-gray-700 p-2 rounded-full shadow-md transition outline-none focus:ring-2 focus:ring-maliGreen"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </>
          )}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1" role="tablist" aria-label="Points de navigation">
            {appartement.images.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === currentImage}
                aria-label={`Voir l'image ${i + 1}`}
                onClick={() => setCurrentImage(i)}
                className={`w-2 h-2 rounded-full ${
                  i === currentImage ? "bg-maliOrange" : "bg-white/70 hover:bg-maliOrange/60"
                } transition-all duration-300`}
              ></button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="text-md font-bold text-maliGreen mb-1">N° {idCourt}</h3>
          <div className="flex items-center text-gray-600 text-sm mb-3 font-medium">
            <MapPin className="w-4 h-4 mr-1 text-maliOrange" aria-hidden="true" />
            <span>Ville : {appartement.quartier?.ville?.nom}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPinHouse className="w-4 h-4 mr-1 text-maliOrange" aria-hidden="true" />
            <span>Quartier : {appartement.quartier?.nom}</span>
          </div>

          <div className="flex justify-between text-gray-700 text-sm mb-4">
            <span className="flex items-center gap-1">
              <House className="w-4 h-4 text-maliGreen" aria-hidden="true" /> Meublé : {appartement.meuble ? 'Oui' : 'Non'}
            </span>
            <span className="flex items-center gap-1">
              <House className="w-4 h-4 text-maliGreen" aria-hidden="true" /> Clim : {appartement.climatisation ? 'Oui' : 'Non'}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-maliGreen" aria-hidden="true" /> Secours : {appartement.energieSecours ? 'Oui' : 'Non'} 
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-maliOrange" aria-label="Prix">
              {typePaiementAppart === "mensuel" && `${appartement?.prix?.toLocaleString()} XOF / mois`}
              {typePaiementAppart === "journalier" && `${appartement?.prixParJour?.toLocaleString()} XOF / jour`}
              {typePaiementAppart === "horaire" && `${appartement?.prixParHeure?.toLocaleString()} XOF / heure`}
            </span>
            
            <div className="flex gap-2">
              <a 
                href={`https://wa.me/${import.meta.env.VITE_NUMERO_WHATSAPP}?text=Bonjour, je suis intéressé par l'appartement N° ${idCourt} à ${appartement.quartier?.nom} (${typePaiementAppart})`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Contacter par WhatsApp pour l'appartement ${idCourt} (ouvre une nouvelle fenêtre)`}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-md flex items-center justify-center focus:ring-2 focus:ring-green-400 outline-none"
              >
                <MessageCircle size={20} aria-hidden="true" />
              </a>

              <button 
                className="px-4 py-2 bg-maliGreen text-white text-sm font-semibold rounded-full hover:bg-maliOrange transition-all duration-300 focus:ring-2 focus:ring-maliOrange outline-none"
                onClick={() => setSelectedAppart(appartement)}
                aria-label={`Voir les détails de l'appartement ${idCourt}`}
              >
                Détails
              </button>
            </div>
          </div>
          {role === "admin" ? <p>{appartement.agence?.nom_agence}</p> : "null"}
        </div>
      </motion.div>

      {/* Modals */}
      <DetailsModalAppart item={selectedAppart} onClose={() => setSelectedAppart(null)}/>
      
      <ModifAppartementModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        appartement={appartement}
        onSuccess={handleUpdateSuccess}
      />

      <ConfirmSuppression
        isOpen={isSuppressionModalOpen}
        onClose={() => setIsSuppressionModalOpen(false)}
        isDeleting={isDeleting} 
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}