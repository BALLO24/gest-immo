import { useState, useEffect, useMemo } from "react";

/**
 * PropertyDetailPage
 *
 * Props:
 *  - property (optional): objet propriété. Si absent, un exemple mock est utilisé.
 *
 * Utilisation:
 *  <PropertyDetailPage property={myProperty} />
 *
 * Remarques :
 *  - Les classes `maliOrange`, `maliGreen`, `maliSand` sont utilisées pour rester
 *    cohérent avec ton thème. Si ces classes n'existent pas dans ta config Tailwind,
 *    remplace-les par des classes utilitaires (ex: text-yellow-500, text-green-600).
 */

export default function DetailMaison({ property: propFromParent }) {
  // Exemple de propriété si aucune fournie
  const sample = {
    id: 42,
    title: "Magnifique appartement moderne à ACI 2000",
    price: 350000,
    currency: "FCFA",
    type: "Appartement",
    surface: 120, // m²
    bedrooms: 3,
    bathrooms: 2,
    parking: true,
    meuble: true,
    position: "Étage 1",
    floor: 1,
    yearBuilt: 2018,
    availableFrom: "2025-10-15",
    description:
      "Appartement lumineux, finitions modernes, cuisine équipée, grand séjour et balcon. Situation idéale proche des commodités et des transports.",
    amenities: ["Cuisine équipée", "Climatisation", "Balcon", "Sécurité 24/7", "Wi-Fi"],
    location: "ACI 2000, Bamako",
    owner: {
      name: "M. Ibrahim Traoré",
      phone: "+223 75 00 00 00",
      email: "ibrahim@example.com",
    },
    images: [
      "/images/image1.jpg",
      "/images/image2.jpg",
      "/images/image3.jpg",
      "/images/image1.jpg",
    ],
  };

  const property = propFromParent || sample;

  const total = property.images?.length || 0;
  const [selectedIndex, setSelectedIndex] = useState(0);

  // format helpers
  const formatPrice = (val, currency = "FCFA") =>
    `${val.toLocaleString()} ${currency}`;

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso || "Non spécifié";
    }
  };

  // keyboard navigation for images + Escape to go back
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((i) => (i - 1 + total) % total);
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((i) => (i + 1) % total);
      } else if (e.key === "Escape") {
        // goBack : si route history présent, go back, sinon no-op
        if (window.history.length > 1) window.history.back();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  const prevImage = () =>
    setSelectedIndex((i) => (i - 1 + total) % total);
  const nextImage = () => setSelectedIndex((i) => (i + 1) % total);

  // Selected image url (safe)
  const selectedImage = useMemo(
    () => (property.images && property.images[selectedIndex]) || "",
    [property.images, selectedIndex]
  );

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8 sm:py-12">
      <div className="container mx-auto">
        {/* Breadcrumb / back */}
        <div className="mb-6">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-maliOrange rounded"
            aria-label="Revenir en arrière"
          >
            ← Retour
          </button>
        </div>

        {/* Card */}
        <article className="bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-6">
          {/* Left: Gallery */}
          <div className="bg-gray-100">
            <div className="relative bg-gray-200 h-64 sm:h-[40rem] md:h-[28rem] lg:h-[36rem]">
              {/* Main image */}
              <img
                key={selectedImage} // force remount for smoother transition
                src={selectedImage}
                alt={`${property.title} - image ${selectedIndex + 1}`}
                className="w-full h-full object-cover"
                style={{ transition: "opacity 220ms ease" }}
              />

              {/* Left/Right chevrons (desktop + tablet) */}
              {total > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Image précédente"
                    className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  >
                    ◀
                  </button>

                  <button
                    onClick={nextImage}
                    aria-label="Image suivante"
                    className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow focus:outline-none focus:ring-2 focus:ring-maliOrange"
                  >
                    ▶
                  </button>
                </>
              )}

              {/* index indicator */}
              <div className="absolute left-4 bottom-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {selectedIndex + 1}/{total}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="py-3 px-3 sm:px-6 bg-white/50">
              <div className="flex gap-3 overflow-x-auto px-1 pb-2">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedIndex(i);
                      }
                    }}
                    className={`flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border-2 focus:outline-none focus:ring-2 ${
                      i === selectedIndex
                        ? "border-maliOrange"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    aria-label={`Voir l'image ${i + 1}`}
                    title={`Image ${i + 1}`}
                    tabIndex={0}
                  >
                    <img
                      src={img}
                      alt={`Miniature ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="p-6 sm:p-8 lg:p-10 overflow-y-auto">
            <header className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {property.title}
              </h1>
              <p className="mt-2 text-lg font-semibold text-maliGreen">
                {formatPrice(property.price, property.currency)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {property.location} • <span className="capitalize">{property.type}</span>
              </p>
            </header>

            {/* quick facts */}
            <section className="mb-6">
              <h2 className="sr-only">Informations principales</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="text-xs text-gray-500">Surface</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {property.surface ? `${property.surface} m²` : "Non spécifié"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="text-xs text-gray-500">Chambres</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {property.bedrooms ?? "—"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="text-xs text-gray-500">Salles d'eau</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {property.bathrooms ?? "—"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="text-xs text-gray-500">Parking</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {property.parking ? "Oui" : "Non"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="text-xs text-gray-500">Meublé</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {property.meuble ? "Oui" : "Non"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="text-xs text-gray-500">Disponible</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatDate(property.availableFrom)}
                  </div>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </section>

            {/* Amenities */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Équipements</h3>
              <ul className="flex flex-wrap gap-2">
                {property.amenities?.length ? (
                  property.amenities.map((a, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-gray-50 px-3 py-1 rounded-full text-gray-700 border border-gray-100"
                    >
                      {a}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">Aucun équipement listé</li>
                )}
              </ul>
            </section>

            {/* Owner & action */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>

              <div className="bg-gray-50 rounded-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-600">Propriétaire</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {property.owner?.name || "Non spécifié"}
                  </div>
                  <div className="text-sm text-gray-600">{property.owner?.phone || "—"}</div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`tel:${property.owner?.phone || ""}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-maliOrange text-white font-semibold hover:bg-maliOcre transition"
                  >
                    Appeler
                  </a>

                  <a
                    href={`mailto:${property.owner?.email || ""}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-100 transition"
                  >
                    Envoyer un message
                  </a>
                </div>
              </div>
            </section>

            {/* Extra details / metadata */}
            <section className="text-sm text-gray-500">
              <div>Réf: <span className="text-gray-700">{property.id}</span></div>
              <div>Année de construction: <span className="text-gray-700">{property.yearBuilt || "—"}</span></div>
              <div>Position: <span className="text-gray-700">{property.position || "—"}</span></div>
            </section>

            {/* Call to action sticky bottom on small screens */}
            <div className="mt-6 sm:mt-8">
              <div className="hidden sm:block">
                <button
                  onClick={() => alert("Fonctionnalité de contact à implémenter")}
                  className="w-full py-3 rounded-full bg-maliGreen text-white font-semibold hover:brightness-95 transition"
                >
                  Demander une visite
                </button>
              </div>

              <div className="block sm:hidden">
                <button
                  onClick={() => alert("Fonctionnalité de contact à implémenter")}
                  className="w-full py-3 rounded-full bg-maliGreen text-white font-semibold hover:brightness-95 transition"
                >
                  Demander visite
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
