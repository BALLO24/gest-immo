import { useState } from "react";
import { 
  MapPin, ChevronLeft, ChevronRight, MapPinHouse, Store, 
  MoreVertical, CheckCircle, Trash2, Pencil,
  MessageCircle // Ajouté pour WhatsApp
} from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import DetailsModalMagasin from "../DetailsModalMagasin";
import ModifMagasinModal from "../ModifMagasinModal";
import ConfirmSuppression from "../ConfirmSuppression";
import API from "../../api/API";

export default function MagasinCard({ magasin, onUpdate }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedMagasin, setSelectedMagasin] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuppressionModalOpen, setIsSuppressionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem("authToken");
  let canEditStatus = false;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const agenceId = magasin.agence?._id || magasin.agence;
      canEditStatus = decoded.role === "admin" || decoded.agenceId === agenceId;
    } catch (e) {
      console.error("Erreur décodage token", e);
    }
  }

  const handleUpdateSuccess = (updatedData) => {
    setIsEditModalOpen(false);
    toast.success("Magasin mis à jour avec succès !");
    if (onUpdate) {
      onUpdate(updatedData);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await API.deleteHabitation(magasin._id);
      
      if (result) {
        setIsSuppressionModalOpen(false);
        setShowStatusMenu(false);
        if (onUpdate) {
          onUpdate({ ...magasin, isDeleted: true });
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
    setCurrentImage((prev) => (prev + 1) % magasin.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) =>
      prev === 0 ? magasin.images.length - 1 : prev - 1
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out w-full max-w-[400px] mx-auto"
      >
        <div className="relative w-full h-56 overflow-hidden">
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-maliOrange border border-maliOrange/30 shadow-sm z-10 flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            Magasin
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditModalOpen(true);
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={16} /> Modifier
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSuppressionModalOpen(true);
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
          
          <img
            src={magasin.images[currentImage]}
            alt={magasin.titre}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out"
          />

          {magasin.images.length > 1 && (
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

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {magasin.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-2 h-2 rounded-full ${
                  i === currentImage ? "bg-maliOrange" : "bg-white/70 hover:bg-maliOrange/60"
                } transition-all duration-300`}
              ></button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-md font-bold text-maliGreen mb-1">N° {magasin._id ? magasin._id.slice(-5).toUpperCase() : "N/A"}</h3>
          <div className="flex items-center text-gray-600 text-sm mb-3 font-medium">
            <MapPin className="w-4 h-4 mr-1 text-maliOrange" />
            {magasin.quartier?.ville?.nom}  
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPinHouse className="w-4 h-4 mr-1 text-maliOrange" />
            {magasin.quartier?.nom}
          </div>

          <div className="text-gray-700 text-sm mb-4">
            ⚡ EDM Separé: {magasin.compteurEDMSepare ? '✅' : '❌'} | 💧 Eau Separé: {magasin.compteurEauSepare ? '✅' : '❌'} | Toilette : {magasin.toiletteInterne ? '✅' : '❌'}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-maliOrange">
              {magasin?.prix?.toLocaleString() || "0"} XOF / mois
            </span>
            
            <div className="flex gap-2">
              {/* BOUTON WHATSAPP */}
              <a 
                href={`https://wa.me/${import.meta.env.VITE_NUMERO_WHATSAPP}?text=Bonjour, je souhaite avoir des informations sur le magasin N° ${magasin._id?.slice(-5).toUpperCase()} situé à ${magasin.quartier?.nom}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-md flex items-center justify-center"
              >
                <MessageCircle size={20} />
              </a>

              <button 
                className="px-4 py-2 bg-maliGreen text-white text-sm font-semibold rounded-full hover:bg-maliOrange transition-all duration-300"
                onClick={() => setSelectedMagasin(magasin)}
              >
                Détails
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <DetailsModalMagasin item={selectedMagasin} onClose={() => setSelectedMagasin(null)} />
      
      <ModifMagasinModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        magasin={magasin}
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