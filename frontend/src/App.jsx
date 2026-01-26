import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import LocationPage from "./pages/LocationPage";
import VentePage from "./pages/VentePage";
import DetailMaison from "./modal/DetailMaison";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChangePasswordPage from "./components/ChangePassword";
import Dashboard from "./components/layout/Dashboard";
import HomeDashboard from "./pages/HomeDashboard";
import HabitationsDashboard from "./pages/HabitationsDashboard";
import VillesPage from "./pages/VillesPage";
import QuartiersPage from "./pages/QuartierPage";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="location" element={<LocationPage />} />
            <Route path="vente" element={<VentePage />} />
            <Route path="detail" element={<DetailMaison />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="change" element={<ChangePasswordPage />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<HomeDashboard />} />
            <Route path="habitations" element={<HabitationsDashboard />}/>
            <Route path="villes" element={<VillesPage />} />
            <Route path="quartiers" element={<QuartiersPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
