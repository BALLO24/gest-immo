import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  MapPin, Map, Locate, Sofa, Bed, Bath, Home, ChefHat, Store, Zap, Droplets,
  Wallet, MessageCircle, Phone, ArrowLeft, Loader2, Building2, Mail, ImageOff,
} from "lucide-react";
import API from "../api/API";

// AJOUT : cette page n'existait pas — chaque bien n'était consultable qu'en
// modal (state React local), sans URL propre. Conséquences : aucune annonce
// individuelle n'était indexable par Google, ni partageable en lien direct,
// ni compatible avec le bouton retour du navigateur. Branchée sur
// getProprieteById, qui existait côté backend depuis longtemps sans être
// appelé par rien côté frontend.
//
// Consolide en un seul composant ce qui était dupliqué dans les 4 anciens
// DetailsModal{Maison,Appart,Magasin,Terrain}.jsx (structure quasi identique,
// seuls les champs affichés changent selon le type de bien).

const SITE_URL = "https://immomali.net"; // à adapter à votre domaine final

function getPositionLabel(pos) {
  switch (String(pos)) {
    case "0": return "Rez-de-chaussée";
    case "1": return "Premier étage";
    case "2": return "Deuxième étage";
    case "3": return "Troisième étage";
    case "4": return "Quatrième étage";
    default: return null; // "Bien autonome" plutôt que d'afficher "N/A"
  }
}

// Construit la liste de champs à afficher, spécifique à chaque type de bien
// — reprend exactement ce que faisait chacun des 4 anciens modals.
function buildInfos(item) {
  const base = [
    { Icon: MapPin, label: "Ville", value: item.quartier?.ville?.nom },
    { Icon: Map, label: "Quartier", value: item.quartier?.nom },
  ];

  switch (item.__t) {
    case "maison":
      return [
        ...base,
        { Icon: Locate, label: "Position", value: getPositionLabel(item.etage) || "Bien autonome" },
        { Icon: Sofa, label: "Salon", value: item.nombreSalons },
        { Icon: Bed, label: "Chambres", value: item.nombreChambres },
        { Icon: Bath, label: "Toilette", value: item.nombreSallesBain },
        { Icon: Home, label: "Cour unique", value: item.coursUnique, status: item.coursUnique },
        { Icon: ChefHat, label: "Cuisine", value: item.cuisine, status: item.cuisine },
        { Icon: Store, label: "Magasin", value: item.magasin, status: item.magasin },
        { Icon: Zap, label: "EDM Séparé", value: item.compteurEDMSepare, status: item.compteurEDMSepare },
        { Icon: Droplets, label: "Eau Séparée", value: item.compteurEauSepare, status: item.compteurEauSepare },
      ];
    case "appartement":
      return [
        ...base,
        { Icon: Locate, label: "Position", value: getPositionLabel(item.etage) || "Bien autonome" },
        { Icon: Sofa, label: "Salon", value: item.nombreSalons },
        { Icon: Bed, label: "Chambres", value: item.nombreChambres },
        { Icon: Bath, label: "Toilette", value: item.nombreSallesBain },
        { Icon: ChefHat, label: "Cuisine", value: item.cuisine, status: item.cuisine },
        { Icon: Store, label: "Meublé", value: item.meuble, status: item.meuble },
        { Icon: Zap, label: "Climatisation", value: item.climatisation, status: item.climatisation },
        { Icon: Droplets, label: "Wi-Fi", value: item.connexionInternet, status: item.connexionInternet },
      ];
    case "magasin":
      return [
        ...base,
        { Icon: Locate, label: "Position", value: getPositionLabel(item.etage) || "Bien autonome" },
        { Icon: Bath, label: "Toilette interne", value: item.toiletteInterne, status: !!item.toiletteInterne },
        { Icon: Zap, label: "EDM Séparé", value: item.compteurEDMSepare, status: item.compteurEDMSepare },
        { Icon: Droplets, label: "Eau Séparée", value: item.compteurEauSepare, status: item.compteurEauSepare },
      ];
    case "terrain":
      return [
        ...base,
        { Icon: Zap, label: "Type de terrain", value: item.typeTerrain },
        { Icon: Locate, label: "Dimension", value: item.dimensionTerrain },
        { Icon: Bath, label: "Document", value: item.documentTerrain },
      ];
    default:
      return base;
  }
}

// Prix affiché : gère le cas particulier de l'appartement (loyer mensuel,
// tarif jour, tarif heure peuvent coexister).
function PrixBloc({ item }) {
  // CORRIGÉ : ajout de la vérification typeOffre === "location" — un
  // appartement en vente ne doit jamais afficher de tarif jour/heure, même
  // si d'anciennes données en base en gardaient la trace (le hook backend
  // les nettoie désormais, mais cette page ne doit pas en dépendre seule).
  if (item.__t === "appartement" && item.typeOffre === "location" && (item.prixParJour || item.prixParHeure)) {
    return (
      <div className="bg-orange-50 rounded-xl border border-orange-100 p-4 flex flex-col items-center justify-center gap-1 text-center">
        <Wallet className="w-5 h-5 text-maliOrange" />
        {item.prix ? <span className="text-lg font-black text-gray-800">{item.prix.toLocaleString()} FCFA/mois</span> : null}
        {item.prixParJour ? <span className="text-sm font-bold text-gray-500">{item.prixParJour.toLocaleString()} FCFA/jour</span> : null}
        {item.prixParHeure ? <span className="text-sm font-bold text-gray-500">{item.prixParHeure.toLocaleString()} FCFA/heure</span> : null}
      </div>
    );
  }
  const suffixe = item.typeOffre === "location" ? "/mois" : "";
  return (
    <div className="bg-orange-50 rounded-xl border border-orange-100 p-4 flex items-center justify-center gap-2">
      <Wallet className="w-5 h-5 text-maliOrange" />
      <span className="text-2xl font-black text-gray-800">{item.prix?.toLocaleString()} FCFA{suffixe}</span>
    </div>
  );
}

export default function ProprieteDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const telephoneSite = import.meta.env.VITE_NUMERO_WHATSAPP || "64600036";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    API.getProprieteById(slug).then((data) => {
      if (!cancelled) {
        setItem(data);
        setCurrentImage(0);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-maliOrange" size={32} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Helmet><title>Bien introuvable | ImmoMali</title></Helmet>
        <ImageOff className="text-gray-300" size={48} />
        <p className="text-gray-600 font-medium">Ce bien n'existe plus ou a été retiré de la vente.</p>
        <Link to="/" className="text-maliOrange font-semibold hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const idCourt = item._id ? item._id.slice(-5).toUpperCase() : "N/A";
  const typeLabel = { maison: "Maison", appartement: "Appartement", magasin: "Magasin", terrain: "Terrain" }[item.__t] || "Bien";
  const offreLabel = item.typeOffre === "location" ? "à louer" : "à vendre";
  const lieu = [item.quartier?.nom, item.quartier?.ville?.nom].filter(Boolean).join(", ");

  // AJOUT : SEO dynamique propre à CE bien précis — c'est le cœur du
  // correctif. Chaque annonce a maintenant son propre titre/description/image
  // pour Google et les réseaux sociaux, au lieu d'hériter des balises
  // génériques du site entier.
  const seoTitle = `${typeLabel} ${offreLabel}${lieu ? " à " + lieu : ""} - ${item.prix?.toLocaleString() || ""} FCFA`;
  const seoDescription = item.description?.slice(0, 155) || `${typeLabel} ${offreLabel} à ${lieu || "Bamako"}. Contactez l'agence directement sur ImmoMali.`;
  const seoImage = item.images?.[0];
  const seoUrl = `${SITE_URL}/bien/${item.slug || item._id}`;

  const infos = buildInfos(item);
  const images = item.images?.length ? item.images : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Helmet>
        <title>{seoTitle} | ImmoMali</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={seoUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={seoUrl} />
        {seoImage && <meta property="og:image" content={seoImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {seoImage && <meta name="twitter:image" content={seoImage} />}
      </Helmet>

      <Link to={-1} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-maliGreen mb-4">
        <ArrowLeft size={16} /> Retour
      </Link>

      {/* AJOUT : deux colonnes larges plutôt qu'une colonne unique étroite —
          la galerie profite du surplus d'espace, le prix/contact reste
          visible pendant le défilement (sticky) au lieu d'être tout en bas. */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* COLONNE GAUCHE (galerie, description, caractéristiques) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <span className="text-xs font-bold text-maliOrange uppercase tracking-wide">{typeLabel}</span>
              <h1 className="text-lg font-bold text-maliGreen">N° {idCourt}</h1>
            </div>
            {item.misEnAvant && (
              <span className="text-xs font-black bg-orange-100 text-orange-700 px-3 py-1 rounded-full">🔥 En vedette</span>
            )}
          </div>

          {/* SLIDER */}
          {images.length > 0 ? (
            <div className="relative">
              <img src={images[currentImage]} className="w-full h-80 sm:h-[28rem] object-cover" alt={`${typeLabel} ${offreLabel} à ${lieu} - photo ${currentImage + 1}`} />
              {images.length > 1 && (
                <div className="flex gap-2 justify-center p-3 bg-white/80">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt=""
                      onClick={() => setCurrentImage(index)}
                      className={`h-14 w-24 rounded object-cover cursor-pointer border-2 transition ${currentImage === index ? "border-maliOrange scale-105" : "border-gray-300"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-gray-400">
              <ImageOff size={32} />
            </div>
          )}

          <div className="p-4 sm:p-6">
            {/* La description garde une largeur de lecture confortable même
                dans une colonne large, via max-w-prose (~65 caractères/ligne) */}
            {item.description && <p className="text-gray-600 text-sm mb-4 max-w-prose">{item.description}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {infos.filter((i) => i.value !== undefined && i.value !== null && i.value !== "").map((info, idx) => (
                <InfoCompact key={idx} {...info} />
              ))}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (prix + contact, reste visible au défilement) */}
        <div className="lg:sticky lg:top-6 self-start w-full space-y-3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <PrixBloc item={item} />

            <a
              href={`https://wa.me/${telephoneSite}?text=${encodeURIComponent(`Bonjour, je suis intéressé par le bien N° ${idCourt} (${seoUrl})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition"
            >
              <MessageCircle className="w-4 h-4" /> Contacter sur WhatsApp
            </a>

            <a href={`tel:${telephoneSite}`} className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition text-sm font-semibold">
              <Phone className="w-4 h-4" /> {telephoneSite}
            </a>
          </div>

          {/* AJOUT : contact public de l'agence propriétaire du bien —
              champs telephonePublic/emailPublic ajoutés au modèle Agence
              il y a plusieurs tours, jamais affichés nulle part jusqu'ici. */}
          {(item.agence?.nom_agence || item.agence?.telephonePublic || item.agence?.emailPublic) && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-2">
              {item.agence?.nom_agence && (
                <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm pb-2 border-b border-gray-50">
                  <Building2 className="w-4 h-4 text-gray-400" /> {item.agence.nom_agence}
                </div>
              )}
              {item.agence?.telephonePublic && (
                <a href={`tel:${item.agence.telephonePublic}`} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-semibold">
                  <Phone className="w-4 h-4" /> {item.agence.telephonePublic}
                </a>
              )}
              {item.agence?.emailPublic && (
                <a href={`mailto:${item.agence.emailPublic}`} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-semibold">
                  <Mail className="w-4 h-4" /> {item.agence.emailPublic}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCompact({ Icon, label, value, status }) {
  const isBoolean = typeof status === "boolean";
  const valueText = isBoolean ? (value ? "Oui" : "Non") : value;

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-200 text-center min-h-[48px]">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-4 h-4 text-gray-600" />
        <p className="text-xs font-semibold text-gray-600">{label}</p>
      </div>
      <p className={`text-sm font-medium ${isBoolean ? (value ? "text-green-600" : "text-red-600") : "text-gray-800"}`}>{valueText}</p>
    </div>
  );
}
