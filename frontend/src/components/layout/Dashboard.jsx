import { Outlet } from "react-router-dom";
import SidebarDashboard from "../SidebarDashboard";
export default function Dashboard() {
  return <div className="flex bg-gray-100 min-h-screen">
    <SidebarDashboard /> 
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
}