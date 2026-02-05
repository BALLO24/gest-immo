import {
  Home,
  Users,
  Settings,
  LogOut,
  } from "lucide-react";
import { Link } from "react-router-dom";
  import { useNavigate } from "react-router-dom";
const SidebarDashboard = () => {
    function SidebarItem({ icon, text, active,to }) {
  return (
   <Link to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition ${
        active
          ? "bg-orange-500 text-white"
          : "text-white/80 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </Link>

  );
  }
    const navigate = useNavigate();
  const logout = () => {        
            localStorage.removeItem("authToken");
            ///localStorage.removeItem("user");
            navigate("/");
          }
  return (
      <aside className="w-64 bg-gray-800/90 backdrop-blur-sm p-6 hidden md:flex flex-col justify-between min-h-screen">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-orange-500">
            MaliLogement
          </h1>
          <nav className="space-y-3">
            <SidebarItem icon={<Home size={18} />} text="Dashboard" to="./" active />
            <SidebarItem icon={<Home size={18} />} text="Habitations" to="./habitations" />
            <SidebarItem icon={<Settings size={18} />} text="Paramètres" />
          </nav>
        </div>
      <button className="flex items-center gap-2 mt-10 text-white/80 hover:text-orange-500 transition"
              onClick={()=>logout()}>
          <LogOut size={18}  />
          Déconnexion
        </button>
      </aside>
  )
}
export default SidebarDashboard;