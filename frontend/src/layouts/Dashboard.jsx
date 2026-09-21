import { Outlet } from "react-router-dom";
import SidebarDashboard from "./SidebarDashboard";
export default function Dashboard() {
  // CORRIGÉ : min-h-screen (hauteur minimale, qui grandit avec le contenu)
  // remplacé par h-screen (hauteur fixe = 100vh). Avant, <main> n'était
  // jamais réellement contraint, donc overflow-y-auto ne faisait rien —
  // c'était toute la page qui défilait, sidebar comprise (en flux normal sur
  // desktop). Avec h-screen + overflow-hidden ici, seul <main> défile en
  // interne, la sidebar reste visuellement fixe.
  return <div className="flex h-screen overflow-hidden bg-gray-100">
    <SidebarDashboard /> 
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
}