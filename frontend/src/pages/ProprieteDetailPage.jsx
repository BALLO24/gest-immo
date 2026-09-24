import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Map, Locate, Sofa, Bed, Bath, Home, ChefHat, Store, Zap, Droplets,
  Wallet, MessageCircle, Phone, ArrowLeft, Loader2, Building2, Mail, ImageOff,
  Share2, Facebook, Link2, CalendarClock, X as XIcon, User, Flag,
} from "lucide-react";
import API from "../api/API";

// AJOUT : correctif standard — Leaflet référence en interne ses icônes de
// marqueur par des chemins relatifs qui ne survivent pas au bundling
// (Vite/Webpack), résultat : marqueur invisible ou cassé sans ce correctif.
// Solution connue de l'écosystème react-leaflet : pointer explicitement
// vers des URLs de CDN plutôt que de laisser Leaflet deviner ses propres
// chemins de fichiers.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// AJOUT : les miniatures de la galerie (96×56px affichés) chargeaient la
// même image pleine résolution (1200px, format ?tr=w-1200,q-80,f-auto sur
// ImageKit) que la photo principale en grand — un vrai gaspillage,
// multiplié par jusqu'à 6 photos désormais. ImageKit expose ses
// transformations directement dans l'URL (query string), donc on peut
// générer une vraie petite variante juste en changeant la largeur demandée,
// sans second appel au backend.
function urlMiniature(url) {
  return url.replace(/w-\d+/, "w-160");
}

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
  const [shareOpen, setShareOpen] = useState(false);
  // AJOUT : demande de visite — jusqu'ici, une demande de visite se faisait
  // uniquement via WhatsApp, sans aucune trace côté plateforme.
  const [visiteOpen, setVisiteOpen] = useState(false);
  const [visiteEnvoi, setVisiteEnvoi] = useState(false);
  const [visiteEnvoyee, setVisiteEnvoyee] = useState(false);
  const [visiteForm, setVisiteForm] = useState({ nomClient: "", telephoneClient: "", emailClient: "", dateSouhaitee: "", message: "" });
  // AJOUT : signalement d'annonce.
  const [signalementOpen, setSignalementOpen] = useState(false);
  const [signalementEnvoi, setSignalementEnvoi] = useState(false);
  const [signalementEnvoye, setSignalementEnvoye] = useState(false);
  const [signalementForm, setSignalementForm] = useState({ motif: "", message: "", contactSignaleur: "" });
  // WhatsApp/Appel utilisent TOUJOURS le numéro central du site (variable
  // d'environnement), jamais celui d'une agence en particulier — ce
  // comportement existait déjà, on le garde tel quel.
  const telephoneSite = import.meta.env.VITE_NUMERO_WHATSAPP || "64600036";

  // AJOUT : le numéro/email PUBLIC de l'agence (différent du numéro central
  // ci-dessus) n'est visible que pour un administrateur connecté — un
  // visiteur normal ne doit voir que le contact WhatsApp/téléphone du site.
  const isAdmin = (() => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return false;
      return jwtDecode(token).role === "admin";
    } catch {
      return false;
    }
  })();

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

  // AJOUT : bouton Partager — utilise le partage natif du téléphone quand
  // disponible (accède à TOUTES les apps installées : WhatsApp, Messenger,
  // SMS, etc., pas seulement les 2-3 qu'on pourrait lister nous-mêmes), avec
  // un petit menu de secours pour les navigateurs qui ne le supportent pas
  // (essentiellement desktop).
  const partagerNatif = async () => {
    try {
      await navigator.share({ title: seoTitle, text: seoDescription, url: seoUrl });
    } catch (err) {
      // L'utilisateur a annulé le partage, ou une erreur est survenue — pas
      // besoin d'afficher quoi que ce soit dans les deux cas.
    }
  };

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(seoUrl);
      toast.success("Lien copié !");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
    setShareOpen(false);
  };

  const partagerWhatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${seoTitle} ${seoUrl}`)}`, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  const partagerFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(seoUrl)}`, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  const handlePartager = () => {
    if (navigator.share) {
      partagerNatif();
    } else {
      setShareOpen((o) => !o);
    }
  };

  const handleDemandeVisite = async (e) => {
    e.preventDefault();
    if (!visiteForm.nomClient.trim() || !visiteForm.telephoneClient.trim()) {
      toast.error("Nom et téléphone sont obligatoires.");
      return;
    }
    setVisiteEnvoi(true);
    const result = await API.creerDemandeVisite({
      proprieteId: item._id,
      ...visiteForm,
    });
    setVisiteEnvoi(false);
    if (result.success) {
      setVisiteEnvoyee(true);
    } else {
      toast.error(result.error);
    }
  };

  const handleSignalement = async (e) => {
    e.preventDefault();
    if (!signalementForm.motif) {
      toast.error("Veuillez choisir un motif.");
      return;
    }
    if (!signalementForm.message.trim()) {
      toast.error("Merci de préciser les détails de votre signalement.");
      return;
    }
    setSignalementEnvoi(true);
    const result = await API.creerSignalement({
      proprieteId: item._id,
      ...signalementForm,
    });
    setSignalementEnvoi(false);
    if (result.success) {
      setSignalementEnvoye(true);
    } else {
      toast.error(result.error);
    }
  };

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
            <div className="flex items-center gap-2">
              {item.misEnAvant && (
                <span className="text-xs font-black bg-orange-100 text-orange-700 px-3 py-1 rounded-full">🔥 En vedette</span>
              )}
              {/* AJOUT : bouton Partager */}
              <div className="relative">
                <button
                  onClick={handlePartager}
                  aria-label="Partager ce bien"
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-maliGreen bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
                >
                  <Share2 size={14} /> Partager
                </button>

                {shareOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShareOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                      <button onClick={partagerWhatsapp} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <MessageCircle size={16} className="text-green-600" /> WhatsApp
                      </button>
                      <button onClick={partagerFacebook} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Facebook size={16} className="text-blue-600" /> Facebook
                      </button>
                      <button onClick={copierLien} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Link2 size={16} className="text-gray-400" /> Copier le lien
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SLIDER */}
          {images.length > 0 ? (
            <div className="relative">
              {/* AJOUT : fetchpriority="high" — c'est le plus gros élément
                  visible au chargement (LCP) de cette page, il doit être
                  priorisé, pas mis en concurrence avec le reste. */}
              <img
                src={images[currentImage]}
                fetchpriority={currentImage === 0 ? "high" : "auto"}
                className="w-full h-80 sm:h-[28rem] object-cover"
                alt={`${typeLabel} ${offreLabel} à ${lieu} - photo ${currentImage + 1}`}
              />
              {images.length > 1 && (
                <div className="flex gap-2 justify-center p-3 bg-white/80">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={urlMiniature(img)}
                      loading="lazy"
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

            {/* AJOUT : carte de localisation — les coordonnées GPS existent
                en base (localisation.coordinates) depuis longtemps mais
                n'étaient affichées nulle part. GeoJSON stocke
                [longitude, latitude] alors que Leaflet attend
                [latitude, longitude] — ordre inversé ci-dessous, piège
                classique sinon. */}
            {item.localisation?.coordinates?.length === 2 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <MapPin size={15} className="text-maliOrange" /> Localisation
                </h3>
                <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
                  <MapContainer
                    center={[item.localisation.coordinates[1], item.localisation.coordinates[0]]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[item.localisation.coordinates[1], item.localisation.coordinates[0]]}>
                      <Popup>{typeLabel} — {lieu}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
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

            {/* AJOUT : bouton Demander une visite — enregistre la demande
                côté plateforme (contrairement à WhatsApp ci-dessus, qui ne
                laisse aucune trace). Base nécessaire pour qu'un jour le
                frais de visite prévu dans les CGU puisse être appliqué. */}
            <button
              onClick={() => { setVisiteOpen(true); setVisiteEnvoyee(false); }}
              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-maliOrange/10 text-maliOrange rounded-xl hover:bg-maliOrange/20 transition text-sm font-semibold"
            >
              <CalendarClock className="w-4 h-4" /> Demander une visite
            </button>
          </div>

          {/* CORRIGÉ : le contact public de l'agence n'est plus visible que
              par un administrateur connecté — avant, n'importe quel
              visiteur pouvait le voir, alors que le point de contact
              affiché au public doit toujours être le numéro central du site
              (WhatsApp/Appel ci-dessus). */}
          {isAdmin && (item.agence?.nom_agence || item.agence?.telephonePublic || item.agence?.emailPublic) && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Visible uniquement par l'administrateur
              </p>
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

          {/* AJOUT : signaler une annonce — discret, volontairement pas mis
              en avant visuellement (peu utilisé en usage normal, mais doit
              rester accessible). */}
          <button
            onClick={() => { setSignalementOpen(true); setSignalementEnvoye(false); }}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors py-2"
          >
            <Flag size={13} /> Signaler cette annonce
          </button>
        </div>
      </div>

      {/* AJOUT : modal de demande de visite */}
      {visiteOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center z-[100] p-4 overflow-y-auto"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setVisiteOpen(false); }}
        >
          {/* CORRIGÉ (clavier mobile) : le modal était centré verticalement
              dans la hauteur TOTALE de l'écran — sur mobile, le clavier ne
              réduit pas cette référence, donc il cachait le bas du
              formulaire (jusqu'au bouton d'envoi). Ancré en haut sur mobile
              (my-8 = marge au lieu de centrage), avec défilement interne si
              le contenu dépasse la hauteur visible restante. */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 my-8 sm:my-0 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Demander une visite</h3>
              <button onClick={() => setVisiteOpen(false)} aria-label="Fermer" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            {visiteEnvoyee ? (
              <div className="p-8 text-center overflow-y-auto">
                <div className="w-14 h-14 rounded-full bg-maliGreen/10 flex items-center justify-center mx-auto mb-4">
                  <CalendarClock className="text-maliGreen" size={26} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Demande envoyée !</h4>
                <p className="text-sm text-gray-500">L'agence a reçu votre demande et vous contactera pour organiser la visite.</p>
                <button onClick={() => setVisiteOpen(false)} className="mt-6 text-sm font-semibold text-maliGreen hover:underline">Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleDemandeVisite} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="text-sm font-semibold text-gray-700 ml-0.5">Nom complet</label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                      type="text" required autoFocus
                      value={visiteForm.nomClient}
                      onChange={(e) => setVisiteForm((f) => ({ ...f, nomClient: e.target.value }))}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-maliOrange outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 ml-0.5">Téléphone</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                      type="tel" required
                      value={visiteForm.telephoneClient}
                      onChange={(e) => setVisiteForm((f) => ({ ...f, telephoneClient: e.target.value }))}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-maliOrange outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 ml-0.5">Date souhaitée <span className="text-gray-400 font-normal">(optionnel)</span></label>
                  <input
                    type="date"
                    value={visiteForm.dateSouhaitee}
                    onChange={(e) => setVisiteForm((f) => ({ ...f, dateSouhaitee: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-maliOrange outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={visiteEnvoi}
                  className="w-full py-3 bg-maliOrange hover:bg-maliOcre text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {visiteEnvoi ? <><Loader2 className="animate-spin" size={18} /> Envoi...</> : "Envoyer la demande"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AJOUT : modal de signalement d'annonce */}
      {signalementOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center z-[100] p-4 overflow-y-auto"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setSignalementOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 my-8 sm:my-0 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Flag size={18} className="text-red-500" /> Signaler cette annonce
              </h3>
              <button onClick={() => setSignalementOpen(false)} aria-label="Fermer" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            {signalementEnvoye ? (
              <div className="p-8 text-center overflow-y-auto">
                <div className="w-14 h-14 rounded-full bg-maliGreen/10 flex items-center justify-center mx-auto mb-4">
                  <Flag className="text-maliGreen" size={24} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Signalement transmis</h4>
                <p className="text-sm text-gray-500">Merci, notre équipe va l'examiner rapidement.</p>
                <button onClick={() => setSignalementOpen(false)} className="mt-6 text-sm font-semibold text-maliGreen hover:underline">Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleSignalement} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="text-sm font-semibold text-gray-700 ml-0.5">Motif</label>
                  <select
                    value={signalementForm.motif}
                    required
                    onChange={(e) => setSignalementForm((f) => ({ ...f, motif: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-maliOrange outline-none transition-colors"
                  >
                    <option value="" disabled>Sélectionnez un motif</option>
                    <option value="fraude">Annonce frauduleuse</option>
                    <option value="deja_indisponible">Bien déjà loué/vendu</option>
                    <option value="informations_incorrectes">Informations incorrectes</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 ml-0.5">Détails</label>
                  <textarea
                    value={signalementForm.message}
                    required
                    onChange={(e) => setSignalementForm((f) => ({ ...f, message: e.target.value }))}
                    rows={3}
                    placeholder="Expliquez ce qui vous a amené à signaler cette annonce..."
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-maliOrange outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 ml-0.5">Votre contact <span className="text-gray-400 font-normal">(optionnel, pour vous recontacter)</span></label>
                  <input
                    type="text"
                    value={signalementForm.contactSignaleur}
                    onChange={(e) => setSignalementForm((f) => ({ ...f, contactSignaleur: e.target.value }))}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:border-maliOrange outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={signalementEnvoi}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {signalementEnvoi ? <><Loader2 className="animate-spin" size={18} /> Envoi...</> : "Envoyer le signalement"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
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
