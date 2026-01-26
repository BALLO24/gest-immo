import { useEffect, useRef, useState } from "react";

/**
 * Toast de succès simple
 * - slide-in depuis la droite
 * - slide-out vers la droite
 * - fond blanchâtre, texte vert
 * - auto-dismiss 4s
 * - fermeture manuelle via ✕
 */
export default function ToastSuccess({ message = "Opération réussie !"}) {
  const [mounted, setMounted] = useState(true); // garde le composant monté pendant l'animation de sortie
  const [visible, setVisible] = useState(false); // contrôle les classes d'animation
  const autoTimer = useRef(null);
  const unmountTimer = useRef(null);

  // déclenche l'animation d'entrée au prochain frame
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // démarre le timer d'auto-dismiss quand le toast devient visible
  useEffect(() => {
    if (!visible) return;
    autoTimer.current = setTimeout(() => startClose(), 4000);
    return () => clearTimeout(autoTimer.current);
  }, [visible]);

  function startClose() {
    // lance l'animation de sortie
    setVisible(false);
    // attendre la durée de transition (300ms) avant de démonter
    unmountTimer.current = setTimeout(() => setMounted(false), 300);
    // nettoie le timer d'auto-dismiss
    clearTimeout(autoTimer.current);
  }

  // nettoyage final
  useEffect(() => {
    return () => {
      clearTimeout(autoTimer.current);
      clearTimeout(unmountTimer.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-10 right-5 z-50 transform transition-all duration-300 ease-out
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
    >
      <div className="flex items-center gap-3 rounded-lg h-20 bg-white/95 px-4 py-4 shadow-lg border border-red-200 text-red-700">
        <span className="flex-1 text-md font-semibold ">{message}</span>

        <button
          onClick={startClose}
          aria-label="Fermer la notification"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
