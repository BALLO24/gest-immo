import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { jwtDecode } from "jwt-decode";

// Layouts & Pages (Gardés tels quels)
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import LocationPage from "./pages/LocationPage";
import VentePage from "./pages/VentePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChangePasswordPage from "./components/ChangePassword";
import Dashboard from "./components/layout/Dashboard";
import HomeDashboard from "./pages/HomeDashboard";
import HabitationsDashboard from "./pages/HabitationsDashboard";
import HabitationsAgence from "./pages/HabitationsAgence";
import AgencesDashboardPage from "./pages/AgencesDashboardPage";
import VillesPage from "./pages/VillesPage";
import QuartiersPage from "./pages/QuartierPage";
import NotFoundPage from "./pages/NotFound";

/**
 * COMPOSANT SEO ENRICHI
 */
const SEO = ({ title, description, url, image, type = "website" }) => {
  const siteName = "ImmoMali";
  const baseUrl = "https://immomali.net"; // Utilise ton domaine final
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
      <ScrollToTop />
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
        </Route>          

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<HomeDashboard />} />
            <Route path="habitations" element={<HabitationsDashboard />} />
            <Route path="villes" element={<VillesPage />} />
            <Route path="quartiers" element={<QuartiersPage />} />
            <Route path="agences" element={<AgencesDashboardPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin", "agence"]} />}>
          <Route path="/agence" element={<HabitationsAgence />} />
          <Route path="change" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={
          <>
            <SEO title="Page non trouvée" />
            <NotFoundPage />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;