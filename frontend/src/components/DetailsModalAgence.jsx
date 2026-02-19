import React from "react";
import { createPortal } from "react-dom";
import { 
  Building2, MapPin, Phone, Globe, Mail, X, 
  ShieldCheck, Calendar, LayoutDashboard, 
  User, ExternalLink, 
} from "lucide-react";

export default function DetailsModalAgence({ isOpen, onClose, agence }) {
  if (!isOpen || !agence) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white text-gray-900 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        
        {/* HEADER : Identité Visuelle */}
        <div className="relative h-32 bg-gray-900 flex-shrink-0">
            {/* Petit rappel de couleur Mali au dessus */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500"></div>
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white z-10">
                <X size={24} strokeWidth={3} />
            </button>

            {/* Logo de l'agence qui dépasse */}
            <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
                    {agence.logo ? (
                        <img src={agence.logo} alt={agence.nom} className="w-full h-full object-cover" />
                    ) : (
                        <Building2 size={40} className="text-gray-300" />
                    )}
                </div>
            </div>
        </div>

        <div className="overflow-y-auto p-8 pt-14 custom-scrollbar space-y-8">
          
          {/* NOM ET STATUT */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                    {agence.nomAgence || agence.nom}
                </h2>
                <ShieldCheck size={24} className="text-blue-500" fill="currentColor" fillOpacity={0.1} />
              </div>
              <p className="text-gray-500 font-bold flex items-center gap-2">
                <MapPin size={16} className="text-orange-600" /> {agence.adresse || "Siège Social, Bamako"}
              </p>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest">
                Agence Vérifiée
            </div>
          </div>

          {/* GRILLE DE CONTACT RAPIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContactCard 
                icon={Phone} 
                label="Ligne Directe" 
                value={agence.telephone || "Non renseigné"} 
                action={() => window.open(`tel:${agence.telephone}`)}
            />
            <ContactCard 
                icon={Mail} 
                label="Email Professionnel" 
                value={agence.email || "contact@agence.ml"} 
                action={() => window.open(`mailto:${agence.email}`)}
            />
          </div>

          {/* BIO / DESCRIPTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">À propos de l'agence</h3>
            <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              {agence.description || "Cette agence partenaire s'engage à fournir des services immobiliers de haute qualité au Mali. Spécialisée dans la vente et la location de biens certifiés."}
            </p>
          </div>

          {/* STATISTIQUES & INFOS COMPLÉMENTAIRES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Depuis" value={agence.anneeCreation || "2024"} icon={Calendar} />
            <StatBox label="Annonces" value={agence.totalBiens || "12"} icon={LayoutDashboard} />
            <StatBox label="Agents" value={agence.nombreAgents || "05"} icon={User} />
            <StatBox label="Réseau" value="Mali" icon={Globe} />
          </div>

          {/* FOOTER : Actions de l'agence */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="flex-1 bg-gray-900 hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl">
              <LayoutDashboard size={20} />
              VOIR TOUTES LES ANNONCES
            </button>
            <button className="px-8 py-5 border-2 border-gray-200 hover:border-gray-900 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2">
              <ExternalLink size={20} />
              SITE WEB
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

// Sous-composant pour les cartes de contact
function ContactCard({ icon: Icon, label, value, action }) {
  return (
    <button 
      onClick={action}
      className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-600 hover:shadow-md transition-all text-left group"
    >
      <div className="bg-gray-100 p-3 rounded-xl group-hover:bg-orange-100 transition-colors">
        <Icon size={20} className="text-gray-600 group-hover:text-orange-600" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
        <p className="text-sm font-black text-gray-900">{value}</p>
      </div>
    </button>
  );
}

// Sous-composant pour les petites stats
function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <Icon size={18} className="text-orange-600 mb-2" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-center">{label}</p>
      <p className="text-base font-black text-gray-900">{value}</p>
    </div>
  );
}