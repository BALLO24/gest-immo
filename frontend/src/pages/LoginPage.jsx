import { useState, useEffect } from "react";
import { useNavigate ,Link} from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Importation de la bibliothèque
import API from "../api/API";

export default function LoginPage() {
  const navigate = useNavigate();
  const [nomUtilisateur, setNomUtilisateur] = useState(""); 
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // const [isVerifying, setIsVerifying] = useState(true);
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // --- 1. EFFET : PRÉ-REMPLIR LE NOM D'UTILISATEUR (REMEMBER ME) ---
  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      setNomUtilisateur(savedUser);
      setRemember(true);
    }
  }, []);

  // --- 2. EFFET : VÉRIFICATION DU TOKEN EXISTANT ---
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      
      if (token) {
        try {
          const decoded = jwtDecode(token);          
          // Vérification si le token est encore valide
          const isValid = decoded.exp * 1000 > Date.now();

          if (isValid) {
            navigate(decoded.role==="admin" ? "/dashboard" : "/agence");
            return;
          } else {
            localStorage.removeItem("authToken"); // Nettoyage si expiré
          }
        } catch (e) {
          console.error("Token corrompu");
          localStorage.removeItem("authToken");
        }
      }
      // On arrête le splash screen après la vérification
      // setTimeout(() => setIsVerifying(false), 300);
    };

    checkAuth();
  }, [navigate]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    if (type === "error") {
      setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
    }
  };

  const inputBase = "w-full px-4 py-2 rounded-xl border border-gray-200 bg-white/95 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maliOrange transition-all duration-200 text-sm";

  function validate() {
    const e = {};
    if (!nomUtilisateur.trim()) e.nomUtilisateur = "Nom d'utilisateur requis.";
    if (!password) e.password = "Mot de passe requis.";
    else if (password.length < 6) e.password = "6 caractères min.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await API.login({ nomUtilisateur, password });
      setLoading(false);

      if (response.success) {
        const { token } = response.data;

        // Gestion du "Remember Me"
        if (remember) {
          localStorage.setItem("rememberedUser", nomUtilisateur);
        } else {
          localStorage.removeItem("rememberedUser");
        }

        // Stockage du token
        localStorage.setItem("authToken", token);
        showToast("Connexion réussie !", "success");
        
        // Décodage pour redirection immédiate
        const decoded = jwtDecode(token);
        const role = decoded.role; 

        setTimeout(() => {
            navigate(role==="admin" ? "/dashboard" : "/agence");
        }, 1000);

      } else {
        showToast(response.error || "Identifiants incorrects.", "error");
      }
    } catch (err) {
      setLoading(false);
      showToast("Erreur de connexion au serveur.", "error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col sm:items-center sm:justify-center bg-gradient-to-br from-maliGreen via-maliSand to-maliOrange sm:px-4 sm:py-6 relative animate-in fade-in duration-500">
      
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-2xl shadow-2xl text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          <span className="mr-3 font-bold">{toast.type === "success" ? "✓" : "✕"}</span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full sm:h-auto">
        <div className="hidden lg:flex flex-col justify-center gap-4 px-8 py-8 bg-white/10 rounded-2xl backdrop-blur-sm shadow-lg border border-white/20">
          <div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Bienvenue sur <span className="text-maliOrange">MaliImmo</span>
            </h1>
            <p className="mt-1 text-sm text-white/90 max-w-md">Gère tes annonces et contacte les propriétaires en toute simplicité.</p>
          </div>
          <div className="mt-4"><img src="/images/image1.jpg" alt="illustration" className="w-full rounded-lg object-cover h-32 shadow-inner" /></div>
        </div>

        <div className="bg-white sm:rounded-2xl shadow-2xl p-6 flex flex-col min-h-screen sm:min-h-0">
          <h2 className="text-xl font-bold text-gray-900 mb-0.5">Se connecter</h2>
          <p className="text-xs text-gray-500 mb-5">Ravi de vous revoir !</p>

          <form onSubmit={handleSubmit} className="space-y-3.5 flex-1">
            <label className="block text-sm">
              <span className="text-gray-700 font-medium">Nom d'utilisateur <span className="text-red-500">*</span></span>
              <input type="text" value={nomUtilisateur} onChange={(e) => setNomUtilisateur(e.target.value)} className={`${inputBase} mt-1`} placeholder="Ex: abdoul24" />
              {errors.nomUtilisateur && <p className="text-[10px] text-red-600 mt-0.5">{errors.nomUtilisateur}</p>}
            </label>

            <label className="block text-sm relative">
              <span className="text-gray-700 font-medium">Mot de passe <span className="text-red-500">*</span></span>
              <div className="mt-1 relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputBase} pr-12`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-maliGreen uppercase">{showPassword ? "Cacher" : "Voir"}</button>
              </div>
              {errors.password && <p className="text-[10px] text-red-600 mt-0.5">{errors.password}</p>}
            </label>


            <button type="submit" disabled={loading} className="w-full py-4 bg-maliOrange text-white font-bold rounded-xl shadow-lg hover:bg-maliOcre transition active:scale-95 text-sm disabled:opacity-70">
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          <p className="mt-auto pt-6 text-center text-sm text-gray-600">
            Nouveau ici ? <Link to="/register" className="text-maliGreen font-bold hover:underline">S'inscrire</Link>
          </p>
          </form>

        </div>
      </div>
    </div>
  );
}