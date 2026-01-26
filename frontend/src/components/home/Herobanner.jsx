import { useEffect, useState } from "react";

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
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[28vh] sm:h-[65vh] sm:flex items-center justify-center overflow-hidden bg-gradient-to-b from-maliSand via-white to-maliSand/70">
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${slide.image})`,
          filter: "brightness(0.6)",
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-maliGreen/60 via-transparent to-maliSand/30"></div>

      {/* Contenu texte */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl pt-12 sm:pt-0">
        <h1 className="text-2xl sm:text-5xl font-bold text-white drop-shadow-md mb-3 sm:mb-4 transition-all duration-700">
          {slide.title}
        </h1>
        <p className="text-white/90 text-base sm:text-xl mb-6 sm:mb-10">
          {slide.text}
        </p>
        <a
          href="#"
          className="inline-block px-5 py-2 sm:px-6 sm:py-3 bg-maliOrange hover:bg-maliOcre text-white font-semibold rounded-full shadow-md transition-all duration-300"
        >
          Dernières annonces
        </a>
      </div>

      {/* Indicateurs */}
      <div className="absolute bottom-2 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              i === current ? "bg-maliOrange w-4 sm:w-5" : "bg-white/60 hover:bg-white/80"
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
}
