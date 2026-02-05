import React, { useState,useEffect } from "react";
import AddHouseModal from "../components/AddHouseModal"
import AddAppartementModal from "../components/AddAppartementModal";
import ToastSuccess from "../components/ToastSuccess";
import { useNavigate } from "react-router-dom";
import MaisonCard from "../components/cards/MaisonCard";
import AppartementCard from "../components/cards/AppartementCard";
import AddMagasinModal from "../components/AddMagasinModal";
import AddTerrainModal from "../components/AddTerrainModal";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import API from "../api/API";



export default function HabitationsAgence() {
  const [selectedType, setSelectedType] = useState("Tous");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [messageToast, setMessageToast] = useState("");
  const [isOpenModalMaison, setIsOpenModalMaison] = useState(false);
  const [isOpenModalAppartement, setIsOpenModalAppartement] = useState(false);
  const [isOpenModalMagasin,setIsOpenModalMagasin]=useState(false);
  const [isOpenModalTerrain,setIsOpenModalTerrain]=useState(false);
  const [habitations, setHabitations] = useState([]);

    const fetchHabitations = async (idAgence) => {
      try {
        const data = await API.getHabitationsByAgence(idAgence);
        console.log("data data",data);
        setHabitations(data);
        console.log("habitations : ", habitations);
  
      } catch (error) {
        console.error('Erreur lors de la récupération des habitations:', error);
      }
    };
      
    useEffect(() => {
      //const initialFiltre = {villeSelected,quartier: quartierSelected, type, prixMin, prixMax, position, magasin,nbreSalon,nbreChambres,nombreDouche, parking,coursUnique ,meuble,climatisation,connexionInternet,energieSecours };
      fetchHabitations();
      
    }, []);
  
  
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
        case "Magasin":
        setIsOpenModalMagasin(true);
        break;
        case "Terrain":
        setIsOpenModalTerrain(true);
        break;
      default:
        break;
    }
  };

  const handleSuccess = async (successMessage) => {
    try {
      handleClose();
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

      <AddMagasinModal 
        isOpen={isOpenModalMagasin} 
        onClose={() => setIsOpenModalMagasin(false)}
        onSuccess={(message) => handleSuccess(message)}
      />
      <AddTerrainModal 
        isOpen={isOpenModalTerrain} 
        onClose={() => setIsOpenModalTerrain(false)}
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

    <section className="w-full bg-gradient-to-b from-white via-maliSand/10 to-maliGreen/10 py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
          Biens disponibles à la location
        </h2>

        {habitations.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-10">
            Aucun résultat trouvé 😕  
            <p className="text-sm text-gray-500">
              Essayez de modifier vos filtres de recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitations.map((habitation) => {
              switch (habitation.__t) {
                case 'maison':
                  return <MaisonCard key={habitation._id} maison={habitation} />;
                case 'appartement':
                  return <AppartementCard key={habitation._id} appartement={habitation} />;
                // case 'magasin':
                //   return <AddMagasinModal key={habitation._id} appartement={habitation} />
                default:
                  return null;
              }
            })}
          </div>
        )}
      </div>
    </section>
      </main>
    </div>
  );
}

