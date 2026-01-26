import { ImSpinner } from "react-icons/im";

const ConfirmSuppression = ({ isOpen, onClose,isDeleting, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        {/* Icône d’alerte */}
        <div className="flex justify-center mb-4">
          <svg
            className="w-14 h-14 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 
              1.918-.816 1.995-1.85L21 19V7c0-1.054-.816-1.918-1.85-1.995L19 
              5H5c-1.054 0-1.918.816-1.995 1.85L3 
              7v12c0 1.054.816 1.918 1.85 1.995L5 
              21h14z"
            />
          </svg>
        </div>

        {/* Titre */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Confirmation de suppression
        </h2>

        {/* Texte */}
        <p className="text-gray-600 text-center mb-6">
          Êtes-vous sûr de vouloir supprimer cet élément ? <br />
          Cette action est{" "}
          <span className="text-red-500 font-bold animate-bounce duration-100">irréversible</span>.
        </p>

        {/* Boutons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={` ${isDeleting ? "cursor-not-allowed":""} px-5 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 shadow-md transition`}
          >
           {isDeleting ?  <ImSpinner className="animate-spin w-10"/> : " Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSuppression;
