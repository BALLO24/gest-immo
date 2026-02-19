import { Outlet } from "react-router-dom";
// import SidebarAgence from "../SidebarAgence";
export default function Agence() {
  return <div className="flex bg-gray-100 min-h-screen">
    {/* <SidebarAgence />  */}
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
}