import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ItemsParPageOptions from "../components/ItemsParPage";
import SearchBar from "../components/SearchBar";
import { AiFillDelete } from "react-icons/ai";
import { TbListDetails } from "react-icons/tb";
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import NouvelleVille from "../components/NouvelleVille";
import ToastSuccess from "../components/ToastSuccess";
import ToastError from "../components/ToastError";  
import { useNavigate } from "react-router-dom";
import ConfirmSuppression from "../components/ConfirmSuppression";
import API from "../api/API";


export default function VillesPage() {
  // données
  const [villes, setVilles] = useState([])  
  useEffect(() => {
    // Fetch villes from API
    const fetchVilles = async () => {
      try {
        const response=await API.getVilles();
        setVilles(response);  
      } 
      catch (error) {
        console.error("Erreur lors de la récupération des villes:", error);
      } };
    fetchVilles();
  }, []);

  const [filteredData, setFilteredData] = useState(villes);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [messageToast, setMessageToast] = useState("");
  const [isOpenForm, setOpenForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idTodDelete,setIdToDelete]=useState(null);

  // --- dropdown actions
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // --- filtrage
  useEffect(() => {
    const term = (searchTerm || "").trim().toLowerCase();

    if (!term) {
      setFilteredData(villes);
      setCurrentPage(1);
      return;
    }

    const filtered = villes.filter((item) =>
      Object.values(item).some((val) =>
        (val ?? "").toString().toLowerCase().includes(term)
      )
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, villes]);

  // --- pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages =
    filteredData.length > 0 ? Math.ceil(filteredData.length / itemsPerPage) : 1;

  const displayStart = filteredData.length === 0 ? 0 : indexOfFirstItem + 1;
  const displayEnd = Math.min(indexOfLastItem, filteredData.length);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSuccess = async (successMessage) => {
    try {
      setOpenForm(false);
      navigate("./");
      try {
        const response=await API.getVilles();
        setVilles(response);  
      }
      catch (error) {
        console.error("Erreur lors de la récupération des villes:", error);
      }
      setMessageToast(successMessage);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Erreur lors du rafraîchissement du tableau de bord:",
        error
      );
    }
  };

    const handleError = async (errorMessage) => {
    try {
      setOpenForm(false);
      navigate("./");
      setMessageToast(errorMessage);
      setShowErrorToast(true);
      setTimeout(() => {
        setShowErrorToast(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Erreur lors du rafraîchissement du tableau de bord:",
        error
      );
    }
  };
  const handleDelete = (villeId) => {
    toggleDropdown(villeId)
    setShowModalConfirm(true);
    setIdToDelete(villeId);
    console.log(villeId);
    
  }

    const handleConfirmDelete=async()=>{
     if(!idTodDelete) return ;
     try {
      setIsDeleting(true)
      await new Promise(resolve=>setTimeout(resolve,2000));
      await API.deleteVille(idTodDelete);
      const res=await API.getVilles();
      setShowModalConfirm(false);
      setVilles(res || []);
      setMessageToast("Ville supprimée avec succès !");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
      setIsDeleting(false)
  
     }
     
     catch(err){
      console.log(err);
        setIsDeleting(false)
     }
    }

  const navigate = useNavigate();

  return (
    <>
      <div className="relative p-4 max-w-full overflow-hidden ">
    {showSuccessToast && <ToastSuccess message={messageToast || "Operation effectuée avec succes"} />}
    {showErrorToast && <ToastError message={messageToast || "Une erreur est survenue"} />}
    <ConfirmSuppression isOpen={showModalConfirm} onClose={()=>setShowModalConfirm(false)} isDeleting={isDeleting} onConfirm={()=>handleConfirmDelete()}/>
        <NouvelleVille isOpen={isOpenForm} close={() => setOpenForm(false)} onSuccess={(message)=>handleSuccess(message)} onError={(message)=>handleError(message)}/>
        <ItemsParPageOptions
          value={itemsPerPage}
          onChange={(value) => {
            setItemPerPage(value);
            setCurrentPage(1);
          }}
          options={[5, 10, 20, 50, 100]}
        />

        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
        />

        <button
          className="px-2 py-2 absolute right-10 top-4 font-bold rounded-sm bg-gradient-to-r from-green-400 via-green-500 to-green-700 text-white shadow hover:opacity-90"
          onClick={() => setOpenForm(true)}
        >
          + Ajouter
        </button>

        {/* Desktop-Version */}
        <div className="hidden md:block overflow-y-auto h-screen">
          <table className="min-w-full divide-y divide-gray-200 border-collapse">
            <thead className="bg-gray-200 sticky top-0 z-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  No
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.map((item, idx) => (
                <tr key={item._id ?? idx}>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {indexOfFirstItem + idx + 1}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {item.nom}
                  </td>
                  <td className="px-6 py-2 text-gray-600">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => toggleDropdown(item._id)}
                        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Actions
                        <svg
                          className="-mr-1 ml-2 h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {openDropdownId === item._id && (
                        <div className="absolute mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                              <TbListDetails className="mr-1 text-xl" />
                              Détails
                            </button>

                            <Link
                              to=""
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <MdOutlinePublishedWithChanges className="mr-1 text-xl" />
                              Modifier
                            </Link>

                            <Link
                              onClick={()=>handleDelete(item._id)}
                              to=""
                              className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100 w-full text-left"
                            >
                              <AiFillDelete className="mr-1 text-xl" />
                              Supprimer
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-between mt-4 mx-4">
            <div className="text-sm text-gray-700 font-semibold">
              Affichage de <span>{displayStart}</span> à{" "}
              <span className="font-medium">{displayEnd}</span> sur{" "}
              <span className="font-medium">{filteredData.length}</span>{" "}
              résultats
            </div>
          </div>

          <div className="flex space-x-2 m-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Précedent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
