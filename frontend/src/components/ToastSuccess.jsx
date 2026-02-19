import { useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function ToastSuccess({ message = "Opération réussie !", onClose }) {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100); 
  
  const autoTimer = useRef(null);
  const progressTimer = useRef(null);
  
  // Vitesse accélérée : 3000ms au lieu de 4000ms
  const DURATION = 3000; 

  useEffect(() => {
    // Animation d'entrée
    const raf = requestAnimationFrame(() => setVisible(true));
    
    // On définit le moment exact de la fin
    const startTime = Date.now();
    const endTime = startTime + DURATION;

    progressTimer.current = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      
      // Calcul du pourcentage restant précis
      const percentage = (remaining / DURATION) * 100;

      if (percentage <= 0) {
        setProgress(0);
        clearInterval(progressTimer.current);
      } else {
        setProgress(percentage);
      }
    }, 10); // Mise à jour toutes les 10ms pour une fluidité totale

    // Fermeture automatique synchronisée
    autoTimer.current = setTimeout(() => startClose(), DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(progressTimer.current);
      clearTimeout(autoTimer.current);
    };
  }, []);

  function startClose() {
    setVisible(false);
    // Attendre la fin de l'animation CSS (400ms) avant de démonter le composant
    setTimeout(() => {
      setMounted(false);
      if (onClose) onClose();
    }, 400); 
  }

  if (!mounted) return null;

  return (
    <div
      role="status"
      className={`fixed top-8 right-8 z-[999] w-full max-w-sm transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${visible ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-90"}`}
    >
      <div className="relative overflow-hidden rounded-[1.8rem] bg-white/95 backdrop-blur-md border border-green-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-5 flex items-center gap-4">
        
        <div className="flex-shrink-0 bg-green-500 text-white p-2.5 rounded-2xl shadow-lg shadow-green-200">
          <CheckCircle2 size={24} strokeWidth={3} />
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-0.5">Notification</p>
          <p className="text-gray-900 font-bold text-[15px] leading-tight">{message}</p>
        </div>

        <button onClick={startClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
          <X size={18} strokeWidth={3} />
        </button>

        {/* BARRE DE PROGRESSION SYNCHRONISÉE */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-gray-100 w-full">
          <div 
            className="h-full bg-green-500"
            style={{ 
              width: `${progress}%`,
              transition: 'none' // 'none' car le setInterval gère la fluidité (10ms)
            }} 
          />
        </div>
      </div>
    </div>
  );
}