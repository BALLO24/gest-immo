import { useState } from "react";
import { 
  MapPin, BedDouble, Bath, ChevronLeft, ChevronRight, 
  House, MapPinHouse, Trash2, MoreVertical, Pencil 
} from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
import DetailsModalMaison from "../DetailsModalMaison";
import ModifHouseModal from "../ModifHouseModal";
import ConfirmSuppression from "../ConfirmSuppression"; // Ajouté
import API from "../../api/API"; // Ajouté

export default function MaisonCard({ maison, onUpdate }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isSuppressionModalOpen, setIsSuppressionModalOpen] = useState(false); // Ajouté
  const [isDeleting, setIsDeleting] = useState(false); // Ajouté

  const token = localStorage.getItem("authToken");
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

  const handleUpdateSuccess = (updatedMaison) => {
    setShowEdit(false);
    toast.success("Maison mise à jour avec succès !", {
      style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
    if (onUpdate) {
      onUpdate(updatedMaison);
    }
  };

  // LOGIQUE DE SUPPRESSION AJOUTÉE
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await API.deleteHabitation(maison._id);
      
      if (result) {
        setIsSuppressionModalOpen(false);
        setShowStatusMenu(false);
        // On notifie le Dashboard pour retirer la carte de la liste
        if (onUpdate) {
          onUpdate({ ...maison, isDeleted: true });
        }
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
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
        <div className="relative w-full h-56 overflow-hidden">
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-maliOrange border border-maliOrange/30 shadow-sm z-10 flex items-center gap-1">
            <House className="w-3.5 h-3.5" /> Maison
          </div>

          {canEditStatus && (
            <div className="absolute top-3 right-3 z-20">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowStatusMenu(!showStatusMenu); }}
                className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md text-gray-700 hover:text-maliOrange transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <button 
                    onClick={() => { setShowEdit(true); setShowStatusMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={16} /> Modifier
                  </button>
                  <button 
                    onClick={() => { setIsSuppressionModalOpen(true); setShowStatusMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
          
          <img src={maison.images[currentImage]} alt={maison.titre} className="w-full h-full object-cover" />

          {maison.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-maliGreen hover:text-white p-2 rounded-full transition"><ChevronLeft size={18} /></button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-maliGreen hover:text-white p-2 rounded-full transition"><ChevronRight size={18} /></button>
            </>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-md font-bold text-maliGreen mb-1">N° {maison._id?.slice(-6).toUpperCase()}</h3>
          <div className="flex items-center text-gray-600 text-sm mb-2 font-medium">
            <MapPin className="w-4 h-4 mr-1 text-maliOrange" /> {maison.quartier?.ville?.nom}
          </div>
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPinHouse className="w-4 h-4 mr-1 text-maliOrange" /> {maison?.quartier?.nom}
          </div>

          <div className="flex justify-between text-gray-700 text-sm mb-4">
            <span className="flex items-center gap-1">Salon<House className="w-4 h-4 text-maliGreen" /> {maison.nombreSalon}</span>
            <span className="flex items-center gap-1">Chambre<BedDouble className="w-4 h-4 text-maliGreen" /> {maison.nombreChambres}</span>
            <span className="flex items-center gap-1">Toilette<Bath className="w-4 h-4 text-maliGreen" /> {maison.nombreSallesBain}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-maliOrange">{maison?.prix?.toLocaleString()} XOF</span>
            <button 
              className="px-4 py-2 bg-maliGreen text-white text-sm font-semibold rounded-full hover:bg-maliOrange transition-all"
              onClick={() => setShowDetails(true)}
            >
              Voir plus
            </button>
          </div>
        </div>
      </motion.div>

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