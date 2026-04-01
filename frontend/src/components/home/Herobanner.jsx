import { useEffect, useState } from "react";
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

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Galerie de présentation immobilière"
      style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}
    >
      {/* === OUTER WINDOW === */}
      <div className="win-window mx-2 mt-2">

        {/* Window title bar */}
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">🏠</span>
            <span>Bienvenue sur ImmoMali - Annonces Immobilières</span>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>_</button>
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>□</button>
            <button className="win-btn !px-1.5 !py-0 text-xs font-black leading-none" style={{ minWidth: '18px', minHeight: '16px', color: '#CC0000' }}>✕</button>
          </div>
        </div>

        {/* Tab row */}
        <div className="flex items-end px-2 pt-1" style={{ backgroundColor: '#D4D0C8', borderBottom: '2px solid #808080' }} role="tablist" aria-label="Catégories">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Diapositive ${i + 1}`}
              className={i === current ? 'win-tab-active' : 'win-tab'}
              style={{ position: 'relative', bottom: '-2px', fontSize: '11px', marginRight: '2px' }}
            >
              {i === 0 ? '🏠 Maisons' : i === 1 ? '🌿 Terrains' : '🏢 Appartements'}
            </button>
          ))}
        </div>

        {/* Main image area */}
        <div
          className="relative overflow-hidden win-inset"
          style={{ height: '320px' }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              role="img"
              aria-label={slide.alt}
              className={`absolute inset-0 transition-opacity duration-700 ${index === current ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}></div>
            </div>
          ))}

          {/* Text overlay in a "dialog box" style */}
          <div
            className="absolute bottom-4 left-4 right-4 win-window p-0"
            style={{ zIndex: 10 }}
            aria-live="polite"
          >
            <div className="win-titlebar text-xs">
              <span>📢 Annonce #{current + 1} sur {slides.length}</span>
            </div>
            <div className="px-3 py-2" style={{ backgroundColor: '#D4D0C8' }}>
              <h1 className="font-bold text-sm mb-1" style={{ color: '#000080' }}>
                {slides[current].title}
              </h1>
              <p className="text-xs mb-3" style={{ color: '#000000' }}>
                {slides[current].text}
              </p>
              <div className="flex gap-2 items-center">
                <Link to="./location">
                  <button className="win-btn font-bold text-xs" style={{ color: '#000080' }}>
                    🔍 Voir les annonces
                  </button>
                </Link>
                <Link to="./vente">
                  <button className="win-btn text-xs">
                    📋 Vente
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => setCurrent((p) => (p === 0 ? slides.length - 1 : p - 1))}
            aria-label="Image précédente"
            className="absolute left-2 top-1/2 -translate-y-1/2 win-btn text-sm font-bold"
            style={{ zIndex: 20 }}
          >
            ◀
          </button>
          <button
            onClick={() => setCurrent((p) => (p + 1) % slides.length)}
            aria-label="Image suivante"
            className="absolute right-2 top-1/2 -translate-y-1/2 win-btn text-sm font-bold"
            style={{ zIndex: 20 }}
          >
            ▶
          </button>
        </div>

        {/* Status bar */}
        <div className="win-statusbar" aria-label="Barre de statut">
          <div className="win-status-panel">
            ✅ {slides.length} annonces en vedette
          </div>
          <div className="win-status-panel" style={{ maxWidth: '180px' }}>
            📍 Bamako, Mali
          </div>
          <div className="win-status-panel flex gap-1 items-center" style={{ maxWidth: '160px' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Diapo ${i + 1}`}
                aria-pressed={i === current}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: i === current ? '#000080' : '#D4D0C8',
                  border: '1px solid #808080',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          {/* Resize grip */}
          <div style={{ marginLeft: 'auto', color: '#808080', fontSize: '10px' }} aria-hidden="true">◢</div>
        </div>

      </div>

      {/* === QUICK LINKS ROW === */}
      <div
        className="mx-2 mt-1 mb-2 px-3 py-2 flex flex-wrap gap-2 items-center"
        style={{ backgroundColor: '#D4D0C8', border: '2px solid', borderColor: '#FFFFFF #404040 #404040 #FFFFFF' }}
      >
        <span className="text-xs font-bold" style={{ color: '#000080' }}>Accès rapide :</span>
        <Link to="./location">
          <button className="win-btn text-xs">🏠 Location</button>
        </Link>
        <Link to="./vente">
          <button className="win-btn text-xs">🌿 Vente terrain</button>
        </Link>
        <Link to="/login">
          <button className="win-btn text-xs">👤 Mon compte</button>
        </Link>
        <div style={{ marginLeft: 'auto', fontSize: '10px', color: '#808080' }}>
          Internet Explorer 6.0 — Immobilier du Mali
        </div>
      </div>
    </section>
  );
}
