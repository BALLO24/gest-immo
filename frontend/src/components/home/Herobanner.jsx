import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    image: "/images/image1.webp",
    title: "Trouvez la maison de vos rêves",
    text: "Découvrez les plus belles villas et appartements à Bamako et partout au Mali.",
    alt: "Grande villa moderne à Bamako",
  },
  {
    image: "/images/image2.webp",
    title: "Investissez dans un avenir sûr",
    text: "Des terrains bien situés, prêts pour vos projets immobiliers.",
    alt: "Terrain résidentiel prêt pour construction",
  },
  {
    image: "/images/image3.webp",
    title: "Louez en toute sérénité",
    text: "Appartements modernes et confortables pour un quotidien paisible.",
    alt: "Intérieur d'un appartement moderne",
  },
];

const INTERVALLE_MS = 6000;

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [pause, setPause] = useState(false);
  const sectionRef = useRef(null);

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p === 0 ? slides.length - 1 : p - 1)), []);

  // AJOUT : le défilement automatique se met en pause au survol/focus — avant,
  // il continuait même pendant que quelqu'un lisait un slide, ce qui est une
  // gêne classique sur les carrousels auto-défilants.
  useEffect(() => {
    if (pause) return;
    const timer = setInterval(next, INTERVALLE_MS);
    return () => clearInterval(timer);
  }, [pause, next]);

  // AJOUT : navigation au clavier (flèches gauche/droite), standard
  // d'accessibilité pour un carrousel, absent de la version d'origine.
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-[45vh] sm:h-[70vh] flex items-center justify-center overflow-hidden bg-black"
      role="region"
      aria-roledescription="carousel"
      aria-label="Galerie de présentation immobilière"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
      onFocus={() => setPause(true)}
      onBlur={() => setPause(false)}
      onKeyDown={handleKeyDown}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          role="img"
          aria-label={slide.alt}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
            index === current ? "opacity-100 motion-safe:scale-105" : "opacity-0 scale-100"
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            transitionProperty: "opacity, transform",
            transitionDuration: "1500ms, 6000ms",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>
        </div>
      ))}

      <div className="relative z-20 text-center px-4 sm:px-8 max-w-5xl" aria-live="polite">
        <div className="overflow-hidden">
          <h1 className="text-3xl sm:text-6xl font-black text-white drop-shadow-2xl mb-4 motion-safe:animate-in motion-safe:slide-in-from-bottom-8 duration-700">
            {slides[current].title}
          </h1>
        </div>
        <p className="text-white/90 text-base sm:text-2xl mb-8 sm:mb-12 font-medium max-w-4xl mx-auto drop-shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-12 duration-1000">
          {slides[current].text}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in duration-1000 delay-300">
          {/* CORRIGÉ : chemin relatif "./location" remplacé par un chemin
              absolu "/location" — fonctionnait ici par coïncidence (la
              bannière est toujours rendue à la racine "/"), mais un chemin
              absolu ne casse jamais si ce composant est un jour réutilisé
              ailleurs dans l'arborescence des routes. */}
          <Link
            to="/location"
            className="w-auto sm:w-auto px-4 py-4 mb-2 bg-maliOrange hover:bg-maliOrange/90 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(232,119,34,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Voir les annonces
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30" role="tablist" aria-label="Sélectionner une image">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Passer à la diapositive ${i + 1}`}
            className="group relative py-2"
          >
            <div className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? "w-12 sm:w-16 bg-maliOrange" : "w-4 sm:w-6 bg-white/40 group-hover:bg-white/60"
            }`}></div>
          </button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" aria-hidden="true">
        <svg className="relative block w-full h-[40px] sm:h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.21,113,113.15,108.82,164,95.14,213.62,81.76,263.39,67.23,321.39,56.44Z" fill="#ffffff"></path>
        </svg>
      </div>
    </section>
  );
}
