import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function AppLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#008080',
        backgroundImage: 'none',
        fontFamily: 'Tahoma, Arial, sans-serif',
      }}
    >
      <Navbar />
      <main style={{ paddingBottom: '4px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
