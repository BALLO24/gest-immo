import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";

// Layouts (légers, gardés en chargement immédiat pour la structure de page)
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./layouts/Dashboard";

// AJOUT : découpage par route via React.lazy — avant, un visiteur de la page
// d'accueil publique téléchargeait AUSSI tout le code du dashboard admin,
// des formulaires de biens et de l'espace agence, qu'il ne verra jamais.
// Le build répétait cet avertissement depuis le début ("chunk larger than
// 500 kB, consider dynamic import()") sans qu'il soit jamais traité.
const HomePage = lazy(() => import("./pages/HomePage"));
const LocationPage = lazy(() => import("./pages/LocationPage"));
const VentePage = lazy(() => import("./pages/VentePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ChangePasswordPage = lazy(() => import("./components/ChangePassword"));
const MonProfilPage = lazy(() => import("./pages/MonProfilPage"));
const DemandesVisitePage = lazy(() => import("./pages/DemandesVisitePage"));
const SignalementsPage = lazy(() => import("./pages/SignalementsPage"));
const ProprieteDetailPage = lazy(() => import("./pages/ProprieteDetailPage"));
const FavorisPage = lazy(() => import("./pages/FavorisPage"));
const CGUPage = lazy(() => import("./pages/CGUPage"));
const PolitiqueConfidentialitePage = lazy(() => import("./pages/PolitiqueConfidentialitePage"));
const HomeDashboard = lazy(() => import("./pages/HomeDashboard"));
const HabitationsDashboard = lazy(() => import("./pages/HabitationsDashboard"));
const HabitationsAgence = lazy(() => import("./pages/HabitationsAgence"));
const AgencesDashboardPage = lazy(() => import("./pages/AgencesDashboardPage"));
const UtilisateursPage = lazy(() => import("./pages/UtilisateursPage"));
const VillesPage = lazy(() => import("./pages/VillesPage"));
const QuartiersPage = lazy(() => import("./pages/QuartiersPage"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));

// AJOUT : écran de chargement minimal affiché pendant le téléchargement du
// code d'une route (quasi instantané en pratique une fois en cache).
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="animate-spin text-maliOrange" size={32} />
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

/**
 * COMPOSANT SEO ENRICHI
 */
const SEO = ({ title, description, url, image, type = "website" }) => {
  const siteName = "ImmoMali";
  // CORRIGÉ : URL codée en dur — si le domaine final diffère (déploiement de
  // test, changement de domaine...), toutes les URLs canoniques/OG seraient
  // fausses sans qu'aucune erreur ne le signale. Configurable désormais,
  // avec ce domaine comme repli si la variable n'est pas définie.
  const baseUrl = import.meta.env.VITE_SITE_URL || "https://immomali.net";
  const fullTitle = title 
    ? `${title} | ${siteName} - Immobilier Mali` 
    : `ImmoMali | N°1 de l'Immobilier au Mali : Achat, Vente, Location`;
  
  const metaDescription = description || "Trouvez des terrains titrés, villas de luxe, appartements meublés et magasins à Bamako. Sécurisez votre investissement immobilier au Mali avec ImmoMali.";
  const metaImage = image || `${baseUrl}/preview-image.jpg`;
  const metaUrl = `${baseUrl}${url || ""}`;

  return (
    <Helmet>
      {/* Balises standards renforcées */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />
      <html lang="fr" />

      {/* Balises Open Graph pour WhatsApp/Facebook (Très utilisé au Mali) */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- LOGIQUE DE ROUTAGE (Gardée telle quelle pour la sécurité) ---
const PublicRoute = () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        return <Navigate to={decoded.role === "admin" ? "/dashboard" : "/agence"} replace />;
      }
    } catch (e) {
      localStorage.removeItem("authToken");
    }
  }
  return <Outlet />;
};

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/login" replace />;
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("authToken");
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(decoded.role)) return <Navigate to="/" replace />;
    return <Outlet />;
  } catch (error) {
    localStorage.removeItem("authToken");
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      {/* AJOUT : un seul <Toaster/> global pour toute l'app, au lieu d'un
          par carte (MaisonCard/AppartementCard en montaient chacun un,
          ce qui n'est pas recommandé par react-hot-toast — un seul suffit
          et doit être partagé). Position top-right : en haut à droite. */}
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* --- ROUTES PUBLIQUES OPTIMISÉES --- */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={
            <>
              <SEO 
                title="Vente et Location Immobilière à Bamako" 
                description="La plateforme immobilière de référence au Mali. Terrains avec Titre Foncier, villas à l'ACI 2000, appartements meublés et champs."
                url="/" 
              />
              <HomePage />
            </>
          } />
          
          <Route path="location" element={
            <>
              <SEO 
                title="Location Appartement et Maison Mali" 
                description="Trouvez une location à Bamako : appartements meublés, villas à Sébénikoro ou Sotuba, et magasins commerciaux au meilleur prix." 
                url="/location" 
              />
              <LocationPage />
            </>
          } />
          
          <Route path="vente" element={
            <>
              <SEO 
                title="Vente Terrain Titré et Villa Mali" 
                description="Achetez votre terrain avec Titre Foncier (TF) au Mali. Large choix de parcelles à bâtir, villas duplex et terres agricoles sécurisées." 
                url="/vente" 
              />
              <VentePage />
            </>
          } />

          {/* AJOUT : page dédiée par bien — le SEO propre à chaque annonce
              est géré directement dans ProprieteDetailPage (titre/description/
              image dynamiques selon le bien affiché), pas ici. */}
          <Route path="bien/:slug" element={<ProprieteDetailPage />} />
          <Route path="cgu" element={<CGUPage />} />
          <Route path="confidentialite" element={<PolitiqueConfidentialitePage />} />
          <Route path="favoris" element={<FavorisPage />} />
        </Route>

        {/* --- AUTH & DASHBOARD (SEO moins critique ici, mais présent) --- */}
        <Route element={<PublicRoute />}>
          <Route path="login" element={
            <>
              <SEO title="Connexion Espace Client" url="/login" />
              <LoginPage />
            </>
          } />
          <Route path="register" element={
            <>
              <SEO title="Créer un compte Agence" url="/register" />
              <RegisterPage />
            </>
          } />
          <Route path="forgot-password" element={
            <>
              <SEO title="Mot de passe oublié" url="/forgot-password" />
              <ForgotPasswordPage />
            </>
          } />
          <Route path="reset-password/:token" element={
            <>
              <SEO title="Réinitialiser le mot de passe" url="/reset-password" />
              <ResetPasswordPage />
            </>
          } />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<HomeDashboard />} />
            <Route path="habitations" element={<HabitationsDashboard />} />
            <Route path="villes" element={<VillesPage />} />
            <Route path="quartiers" element={<QuartiersPage />} />
            <Route path="agences" element={<AgencesDashboardPage />} />
            <Route path="utilisateurs" element={<UtilisateursPage />} />
            <Route path="demandes-visite" element={<DemandesVisitePage />} />
            <Route path="signalements" element={<SignalementsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "agence"]} />}>
          <Route path="/agence" element={<HabitationsAgence />} />
          <Route path="/agence/profil" element={<MonProfilPage />} />
          <Route path="/agence/demandes-visite" element={<DemandesVisitePage />} />
          <Route path="change" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={
          <>
            <SEO title="Page non trouvée" />
            <NotFoundPage />
          </>
        } />
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;