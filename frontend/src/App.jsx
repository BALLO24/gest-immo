import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
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
 * COMPOSANT SEO : Permet de définir les metas par défaut
 * et de changer le titre de l'onglet facilement.
 */
const SEO = ({ title, description }) => (
  <Helmet>
    <title>{title ? `${title} | MonAppImmo` : "MonAppImmo - Trouvez votre terrain ou maison"}</title>
    <meta name="description" content={description || "Plateforme de gestion et de recherche immobilière : terrains, villas et appartements."} />
    <html lang="fr" />
  </Helmet>
);

/**
 * ACCESSIBILITÉ : Remonte en haut de page à chaque changement de route
 * et pourrait plus tard gérer l'annonce vocale du changement de page.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- LOGIQUE DE ROUTAGE (Gardée identique à la tienne avec corrections mineures) ---

const PublicRoute = () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (!isExpired) {
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
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
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
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* --- ROUTES PUBLIQUES --- */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={
              <>
                <SEO title="Accueil" description="Découvrez les meilleures offres immobilières, terrains et maisons à louer ou à vendre." />
                <HomePage />
              </>
            } />
            <Route path="location" element={
              <>
                <SEO title="Locations Immobilières" description="Trouvez votre futur appartement ou maison en location." />
                <LocationPage />
              </>
            } />
            <Route path="vente" element={
              <>
                <SEO title="Ventes Immobilières" description="Achetez des terrains titrés et des maisons de luxe." />
                <VentePage />
              </>
            } />
          </Route>

          {/* --- AUTHENTIFICATION --- */}
          <Route element={<PublicRoute />}>
            <Route path="login" element={
              <>
                <SEO title="Connexion" description="Connectez-vous à votre espace agence ou administrateur." />
                <LoginPage />
              </>
            } />
            <Route path="register" element={
              <>
                <SEO title="Inscription" />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;