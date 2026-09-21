import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 mt-10 text-center">
      {/* Illustration 404 avec style immobilier */}
      <div className="relative mb-8">
        <h1 className="text-9xl font-black text-maliGreen/10 select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-32 h-32 text-maliOrange animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-maliGreen mb-4">
        Oups ! Ce lien n'est pas fonctionnel.
      </h2>
      
      <p className="text-gray-600 max-w-md mb-8">
        Il semble ce que  que vous recherchez ait été déplacé ou que l'adresse soit incorrecte. Ne vous inquiétez pas, il y a plein d'autres opportunités sur le site !
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-maliGreen text-white font-bold rounded-xl shadow-lg hover:bg-maliGreen/90 transition-all active:scale-95"
        >
          Retour à l'accueil
        </button>
        
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 border-2 border-maliOcre text-maliOcre font-bold rounded-xl hover:bg-maliOcre/5 transition-all"
        >
          Page précédente
        </button>
      </div>

      {/* Décoration subtile en bas */}
      <div className="mt-16 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-maliGreen"></div>
        <div className="w-2 h-2 rounded-full bg-maliSand"></div>
        <div className="w-2 h-2 rounded-full bg-maliOrange"></div>
      </div>
    </div>
  );
}