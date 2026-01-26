import React, { useState,useEffect } from "react";
import AddHouseModal from "../components/AddHouseModal"
import AddAppartementModal from "../components/AddAppartementModal";
import ToastSuccess from "../components/ToastSuccess";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import API from "../api/API";


const properties = [
  {
    id: 1,
    title: "Villa moderne à Bamako",
    price: "150 000 000 XOF",
    type: "Maison",
    location: "Bamako - ACI 2000",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
    ],
  },
  {
    id: 2,
    title: "Appartement à louer à Hamdallaye",
    price: "250 000 XOF / mois",
    type: "Appartement",
    location: "Bamako - Hamdallaye ACI",
    images: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
  },
  {
    id: 3,
    title: "Bureau professionnel à louer",
    price: "350 000 XOF / mois",
    type: "Bureau",
    location: "Bamako - Badalabougou",
    images: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800",
    ],
  },
];

export default function HabitationsDashboard() {
  const [selectedType, setSelectedType] = useState("Tous");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [messageToast, setMessageToast] = useState("");
  const [isOpenModalMaison, setIsOpenModalMaison] = useState(false);
  const [isOpenModalAppartement, setIsOpenModalAppartement] = useState(false);

  const filteredProperties = properties.filter((p) =>
    selectedType === "Tous"
      ? p.title.toLowerCase().includes(search.toLowerCase())
      : p.type === selectedType &&
        p.title.toLowerCase().includes(search.toLowerCase())
  );
  
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpenModalMaison(false);
    setIsOpenModalAppartement(false);
  };

  const handleOpen = (type) => {
    switch(type) {
      case "Maison":
        setIsOpenModalMaison(true);
        break;
      case "Appartement":
        setIsOpenModalAppartement(true);
        break;
      default:
        break;
    }
  };

  const handleSuccess = async (successMessage) => {
    try {
      handleClose();
      //navigate(0);
      navigate("/dashboard");
      setMessageToast(successMessage);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch(error) {
      console.error("Erreur lors du rafraîchissement du tableau de bord:", error);
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
    {showSuccessToast && <ToastSuccess message={messageToast || "Operation effectuée avec succes"} />}
      
      <AddHouseModal 
        isOpen={isOpenModalMaison} 
        onClose={() => setIsOpenModalMaison(false)} 
        onSuccess={(message) => handleSuccess(message)}
      />
      <AddAppartementModal 
        isOpen={isOpenModalAppartement} 
        onClose={() => setIsOpenModalAppartement(false)}
        onSuccess={(message) => handleSuccess(message)}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 relative">
          <h2 className="text-3xl font-bold">Tableau de bord</h2>

          {/* Bouton Ajouter avec Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition text-sm font-medium"
            >
              <Plus size={16} />
              Ajouter
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-10">
                {["Maison", "Appartement", "Bureau", "Magasin", "Terrain"].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => {
                        handleOpen(type);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-orange-500/80 transition text-sm"
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un bien..."
              className="w-full bg-gray-800 text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-white/60"
            />
            <Search className="absolute left-3 top-2.5 text-white/60" size={18} />
          </div>
        </div>

        {/* Mini filtre */}
        <div className="flex flex-wrap justify-start gap-3 mb-10">
          {["Tous", "Maison", "Appartement", "Bureau", "Magasin", "Terrain"].map(
            (type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedType === type
                    ? "bg-orange-500 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white/80"
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">Aucun bien trouvé</p>
          </div>
        )}
      </main>
    </div>
  );
}

// function SidebarItem({ icon, text, active }) {
//   return (
//     <div
//       className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition ${
//         active
//           ? "bg-orange-500 text-white"
//           : "text-white/80 hover:bg-gray-700 hover:text-white"
//       }`}
//     >
//       {icon}
//       <span className="text-sm font-medium">{text}</span>
//     </div>
//   );
// }

function PropertyCard({ property }) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () =>
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  const prevImage = () =>
    setCurrentImage((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-orange-500/30 transition relative">
      {/* Image Slider */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.images[currentImage]}
          alt={property.title}
          className="w-full h-full object-cover transition-all duration-500"
        />

        {/* Indicateurs d'images */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {property.images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentImage ? 'bg-orange-500' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Flèches */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900/60 hover:bg-gray-900/80 p-2 rounded-full transition"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900/60 hover:bg-gray-900/80 p-2 rounded-full transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Détails */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{property.title}</h3>
        <p className="text-orange-500 font-bold mt-1">{property.price}</p>
        <p className="text-white/70 text-sm mt-1">{property.location}</p>
        <span className="inline-block px-2 py-1 bg-gray-700 rounded-full text-xs mt-2">
          {property.type}
        </span>

        <div className="flex justify-between mt-4">
          <button className="px-3 py-1 bg-green-600/80 hover:bg-green-700 transition rounded-md text-sm">
            Éditer
          </button>
          <button className="px-3 py-1 bg-red-600/80 hover:bg-red-700 transition rounded-md text-sm">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}