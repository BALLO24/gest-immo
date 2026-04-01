import { useState } from "react";
import { 
  MapPin, BedDouble, Bath, ChevronLeft, ChevronRight, 
  House, MapPinHouse, Trash2, MoreVertical, Pencil,
  MessageCircle 
} from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
import DetailsModalMaison from "../DetailsModalMaison";
import ModifHouseModal from "../ModifHouseModal";
import ConfirmSuppression from "../ConfirmSuppression";
import API from "../../api/API";

export default function MaisonCard({ maison, onUpdate }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isSuppressionModalOpen, setIsSuppressionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem("authToken");
  const role = token ? jwtDecode(token).role : null;
  let canEditStatus = false;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const maisonAgenceId = maison.agence?._id || maison.agence;
      canEditStatus = decoded.role === "admin" || decoded.agenceId === maisonAgenceId;
    } catch (e) {
      console.error("Erreur décodage token", e);
    }
  }

  const idCourt = maison._id?.slice(-6).toUpperCase() || "N/A";

  const handleUpdateSuccess = (updatedMaison) => {
    setShowEdit(false);
    toast.success("Maison mise à jour avec succès !", {
      style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
    if (onUpdate) onUpdate(updatedMaison);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await API.deleteHabitation(maison._id);
      if (result) {
        setIsSuppressionModalOpen(false);
        setShowStatusMenu(false);
        if (onUpdate) onUpdate({ ...maison, isDeleted: true });
      }
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % maison.images.length);
  const prevImage = () => setCurrentImage((prev) => prev === 0 ? maison.images.length - 1 : prev - 1);

  return (
    <>
      <Toaster position="top-center"/>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out w-full max-w-[400px] mx-auto"
      >
        {/* Galerie Photo */}
        <div className="relative w-full h-56 overflow-hidden" role="region" aria-label={`Photos de la maison ${idCourt}`}>
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-maliOrange border border-maliOrange/30 shadow-sm z-10 flex items-center gap-1">
            <House className="w-3.5 h-3.5" aria-hidden="true" /> 
            Maison
          </div>

          {canEditStatus && (
            <div className="absolute top-3 right-3 z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowStatusMenu(!showStatusMenu); }}
                aria-haspopup="menu"
                aria-expanded={showStatusMenu}
                aria-label="Menu de gestion"
                className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md text-gray-700 hover:text-maliOrange transition-colors focus:outline-none focus:ring-2 focus:ring-maliOrange"
              >
                <MoreVertical size={20} aria-hidden="true" />
              </button>
              
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden" role="menu">
                  <button 
                    role="menuitem"
                    onClick={() => { setShowEdit(true); setShowStatusMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={16} aria-hidden="true" /> Modifier
                  </button>
                  <button 
                    role="menuitem"
                    onClick={() => { setIsSuppressionModalOpen(true); setShowStatusMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                  >
                    <Trash2 size={16} aria-hidden="true" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div aria-live="polite" className="w-full h-full">
            <img 
              src={maison.images[currentImage]} 
              alt={`Vue ${currentImage + 1} de la maison située à ${maison.quartier?.nom}`} 
              className="w-full h-full object-cover transition-all duration-700 ease-in-out" 
            />
          </div>

          {maison.images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }} 
                aria-label="Image précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-maliGreen hover:text-white p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-maliGreen"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }} 
                aria-label="Image suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-maliGreen hover:text-white p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-maliGreen"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1" role="tablist" aria-label="Points de navigation">
                {maison.images.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === currentImage}
                    aria-label={`Voir l'image ${i + 1}`}
                    onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
                    className={`w-2 h-2 rounded-full ${
                      i === currentImage ? "bg-maliOrange" : "bg-white/70 hover:bg-maliOrange/60"
                    } transition-all duration-300`}
                  ></button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Détails */}
        <div className="p-4">
          <h3 className="text-md font-bold text-maliGreen mb-1">N° {idCourt}</h3>
          <div className="flex items-center text-gray-600 text-sm mb-2 font-medium">
            <MapPin className="w-4 h-4 mr-1 text-maliOrange" aria-hidden="true" /> 
            <span>Ville : {maison.quartier?.ville?.nom}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPinHouse className="w-4 h-4 mr-1 text-maliOrange" aria-hidden="true" /> 
            <span>Quartier : {maison?.quartier?.nom}</span>
          </div>

          <div className="flex justify-between text-gray-700 text-sm mb-4" aria-label="Caractéristiques de la maison">
            <span className="flex items-center gap-1">
              <House className="w-4 h-4 text-maliGreen" aria-hidden="true" /> 
              {maison.nombreSalon} {maison.nombreSalon > 1 ? 'Salons' : 'Salon'}
            </span>
            <span className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-maliGreen" aria-hidden="true" /> 
              {maison.nombreChambres} {maison.nombreChambres > 1 ? 'Chambres' : 'Chambre'}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-maliGreen" aria-hidden="true" /> 
              {maison.nombreSallesBain} {maison.nombreSallesBain > 1 ? 'Toilettes' : 'Toilette'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-maliOrange" aria-label="Prix du loyer">
              {maison?.prix?.toLocaleString()} XOF / mois
            </span>
            <div className="flex gap-2">
              <a 
                href={`https://wa.me/${import.meta.env.VITE_NUMERO_WHATSAPP}?text=Bonjour, je suis intéressé par la maison N° ${idCourt}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Contacter sur WhatsApp pour la maison ${idCourt} (ouvre un nouvel onglet)`}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <MessageCircle size={20} aria-hidden="true" />
              </a>
              
              <button 
                className="px-4 py-2 bg-maliGreen text-white text-sm font-semibold rounded-full hover:bg-maliOrange transition-all focus:outline-none focus:ring-2 focus:ring-maliOrange"
                onClick={() => setShowDetails(true)}
                aria-label={`Voir les détails complets de la maison ${idCourt}`}
              >
                Détails
              </button>
            </div>
          </div>
          {role === "admin" ? <p>{maison.agence?.nom_agence}</p> : "null"}
        </div>
      </motion.div>

      {/* Modals */}
      <ModifHouseModal 
        isOpen={showEdit} 
        onClose={() => setShowEdit(false)} 
        onSuccess={handleUpdateSuccess} 
        maison={maison} 
      />            

      <DetailsModalMaison item={showDetails ? maison : null} onClose={() => setShowDetails(false)} />

      <ConfirmSuppression
        isOpen={isSuppressionModalOpen}
        onClose={() => setIsSuppressionModalOpen(false)}
        isDeleting={isDeleting} 
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}