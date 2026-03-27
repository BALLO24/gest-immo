import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { jwtDecode } from "jwt-decode";

// Layouts & Pages
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
 * COMPOSANT SEO : Centralise toute la logique de référencement.
 * @param {string} title - Titre de la page
 * @param {string} description - Description SEO (max 160 car.)
 * @param {string} url - Chemin de la page (ex: /vente)
 * @param {string} image - URL de l'image de partage (facultatif)
 */
const SEO = ({ title, description, url, image }) => {
  const siteName = "ImmoMali";
  const baseUrl = "https://gest-immo-three.vercel.app"; // À remplacer par ton futur domaine
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - L'immobilier au Mali en un clic`;
  const metaDescription = description || "Achat, vente et location de terrains titrés, maisons et appartements au Mali.";
  const metaImage = image || `${baseUrl}/preview-image.jpg`;
  const metaUrl = `${baseUrl}${url || ""}`;

  return (
    <Helmet>
      {/* Balises standards */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />
      <html lang="fr" />

      {/* Open Graph / Facebook / LinkedIn / WhatsApp */}
      <meta property="og:type" content="website" />
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

// --- LOGIQUE DE ROUTAGE ---

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
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/" replace />;
    }
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
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={
            <>
              <SEO title="Accueil" url="/" />
              <HomePage />
            </>
          } />
          <Route path="location" element={
            <>
              <SEO 
                title="Location de Maisons et Appartements" 
                description="Louez votre futur chez-vous au Mali : appartements, villas et magasins disponibles." 
                url="/location" 
              />
              <LocationPage />
            </>
          } />
          <Route path="vente" element={
            <>
              <SEO 
                title="Vente de Terrains et Villas" 
                description="Achetez des terrains avec titres fonciers sécurisés et des propriétés d'exception au Mali." 
                url="/vente" 
              />
              <VentePage />
            </>
          } />
        </Route>

        {/* --- AUTHENTIFICATION --- */}
        <Route element={<PublicRoute />}>
          <Route path="login" element={
            <>
              <SEO title="Connexion" url="/login" />
              <LoginPage />
            </>
          } />
          <Route path="register" element={
            <>
              <SEO title="Inscription" url="/register" />
              <RegisterPage />
            </>
          } />
        </Route>          

        {/* --- DASHBOARD ADMIN --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<HomeDashboard />} />
            <Route path="habitations" element={<HabitationsDashboard />} />
            <Route path="villes" element={<VillesPage />} />
            <Route path="quartiers" element={<QuartiersPage />} />
            <Route path="agences" element={<AgencesDashboardPage />} />
          </Route>
        </Route>

        {/* --- ESPACE AGENCE --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "agence"]} />}>
          <Route path="/agence" element={<HabitationsAgence />} />
          <Route path="change" element={<ChangePasswordPage />} />
        </Route>

        {/* --- 404 --- */}
        <Route path="*" element={
          <>
            <SEO title="Page Introuvable" />
            <NotFoundPage />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;