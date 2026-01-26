import { useState } from "react";
import DetailMaison from "../../modal/DetailMaison";

export default function PropertyCard({ property }) {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const total = property.images.length;

  const prev = () => setIndex((index - 1 + total) % total);
  const next = () => setIndex((index + 1) % total);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
        {/* Slider */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img
            src={property.images[index]}
            alt={property.title}
            className="w-full h-full object-cover transition-all duration-500"
          />
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/80 rounded-full p-1.5 text-gray-800 shadow-md"
              >
                ◀
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/80 rounded-full p-1.5 text-gray-800 shadow-md"
              >
                ▶
              </button>
            </>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-5">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
            {property.title}
          </h3>
          <p className="text-maliGreen font-bold mb-3">{property.price}</p>

          <div className="grid grid-cols-2 text-sm text-gray-600 gap-y-2">
            <p>🏠 {property.type}</p>
            <p>🚿 {property.douches} douches</p>
            <p>🅿️ Parking : {property.parking ? "Oui" : "Non"}</p>
            <p>🪑 Meublé : {property.meuble ? "Oui" : "Non"}</p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2 rounded-full bg-maliOrange text-white font-semibold hover:bg-maliOcre transition-all duration-300"
            >
              Voir les détails
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <DetailMaison property={property} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
