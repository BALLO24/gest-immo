import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import LocationPage from "./pages/LocationPage";
import VentePage from "./pages/VentePage";
// import DetailMaison from "./modal/DetailMaison";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChangePasswordPage from "./components/ChangePassword";
import Dashboard from "./components/layout/Dashboard";
// import Agence from "./components/layout/Agence";
import HomeDashboard from "./pages/HomeDashboard";
import HabitationsDashboard from "./pages/HabitationsDashboard";
import HabitationsAgence from "./pages/HabitationsAgence";
import AgencesDashboardPage from "./pages/AgencesDashboardPage";
import VillesPage from "./pages/VillesPage";
import QuartiersPage from "./pages/QuartierPage";
import NotFoundPage from "./pages/NotFound";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";



const PublicRoute = () => {
  const token = localStorage.getItem("authToken");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (!isExpired) {
        // L'utilisateur est déjà connecté, on le redirige selon son rôle
        return <Navigate to={decoded.role === "admin" ? "/dashboard" : "/agence"} replace />;
      }
    } catch (e) {
      // Token invalide, on laisse l'utilisateur accéder à la page publique
      localStorage.removeItem("authToken");
    }
  }

  // Pas de token ou token expiré : on affiche la page (Login/Register)
  return <Outlet />;
};

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // Pas de token ? Retour au login
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.removeItem("authToken");
      return <Navigate to="/login" replace />;
    }

    // Si on a précisé des rôles et que l'utilisateur n'a pas le bon
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/" replace />; // Rediriger vers l'accueil si pas autorisé
    }

    return <Outlet />; // Si tout est OK, on affiche les sous-routes
  } catch (error) {
    localStorage.removeItem("authToken");
    return <Navigate to="/" replace />;
  }
};
function App() {
  return (
    <>
<Router>
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="location" element={<LocationPage />} />
          <Route path="vente" element={<VentePage />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>          
        {/* --- ROUTES RÉSERVÉES AUX ADMINS --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<HomeDashboard />} />
            <Route path="habitations" element={<HabitationsDashboard />} />
            <Route path="villes" element={<VillesPage />} />
            <Route path="quartiers" element={<QuartiersPage />} />
            <Route path="agences" element={<AgencesDashboardPage />} />
          </Route>
        </Route>

        {/* --- ROUTES RÉSERVÉES AUX AGENCES (ET ADMINS) --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "agence"]} />}>
          <Route path="/agence" element={<HabitationsAgence />}>
        </Route>
          <Route path="change" element={<ChangePasswordPage />} />
        </Route>

        {/* --- 404 --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>    </>
  );
}

export default App;
