import { useEffect, useState } from "react";
import {Link} from "react-router-dom";

const slides = [
  {
    image: "/images/image1.jpg",
    title: "Trouvez la maison de vos rêves",
    text: "Découvrez les plus belles villas et appartements à Bamako et partout au Mali.",
  },
  {
    image: "/images/image2.jpg",
    title: "Investissez dans un avenir sûr",
    text: "Des terrains bien situés, prêts pour vos projets immobiliers.",
  },
  {
    image: "/images/image3.jpg",
    title: "Louez en toute sérénité",
    text: "Appartements modernes et confortables pour un quotidien paisible.",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000); // Temps légèrement plus long pour laisser apprécier l'image
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[45vh] sm:h-[70vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Images de fond avec fondu croisé */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            transitionProperty: "opacity, transform",
            transitionDuration: "1500ms, 6000ms", // Zoom très lent pour effet cinématique
          }}
        >
          {/* Overlay sombre progressif */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>
        </div>
      ))}

      {/* Contenu texte avec animation de montée */}
      <div className="relative z-20 text-center px-4 sm:px-8 max-w-5xl">
        <div className="overflow-hidden">
          <h1 className="text-3xl sm:text-6xl font-black text-white drop-shadow-2xl mb-4 animate-in slide-in-from-bottom-8 duration-700">
            {slides[current].title}
          </h1>
        </div>
        <p className="text-white/90 text-base sm:text-2xl mb-8 sm:mb-12 font-medium max-w-4xl mx-auto drop-shadow-lg animate-in fade-in slide-in-from-bottom-12 duration-1000">
          {slides[current].text}
        </p>
        
        <div className="flex flex-col  sm:flex-row gap-4 justify-center items-center animate-in fade-in zoom-in duration-1000 delay-300">
          <Link
            to="./location"
            className="w-auto sm:w-auto px-4 py-4 mb-2 bg-maliOrange hover:bg-maliOrange/90 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(232,119,34,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Voir les annonces
          </Link>
          {/* <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 font-bold rounded-xl transition-all duration-300"
          >
            Nous contacter
          </a> */}
        </div>
      </div>

      {/* Indicateurs style "barre de progression" */}
      <div className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative py-2"
          >
            <div className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? "w-12 sm:w-16 bg-maliOrange" : "w-4 sm:w-6 bg-white/40 group-hover:bg-white/60"
            }`}></div>
          </button>
        ))}
      </div>

      {/* Vague décorative en bas (Optionnel) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
        <svg className="relative block w-full h-[40px] sm:h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.21,113,113.15,108.82,164,95.14,213.62,81.76,263.39,67.23,321.39,56.44Z" fill="#ffffff"></path>
        </svg>
      </div>
    </section>
  );
}