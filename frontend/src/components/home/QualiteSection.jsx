import { ShieldCheck, Zap, Globe2, Home, Smile } from "lucide-react";

const qualites = [
  {
    icon: "🛡️",
    title: "Equipe d'experts",
    text: "Pour faire vos documents immobiliers (titre foncier...) et vous assister dans vos litiges fonciers et constructions.",
  },
  {
    icon: "⚡",
    title: "Rapide et fluide",
    text: "Navigation optimisée pour trouver ou publier une annonce en quelques clics.",
  },
  {
    icon: "🌐",
    title: "Accessible partout",
    text: "ImmoMali est disponible sur ordinateur, tablette et téléphone.",
  },
  {
    icon: "🏠",
    title: "Annonces vérifiées",
    text: "Chaque bien est contrôlé pour garantir authenticité et fiabilité.",
  },
  {
    icon: "😊",
    title: "Simplicité d'utilisation",
    text: "Une interface claire et intuitive, adaptée à tous les utilisateurs.",
  },
];

export default function QualitesSection() {
  return (
    <section
      className="mx-2 mb-2"
      aria-labelledby="section-qualites-titre"
      style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}
    >
      {/* === OUTER WINDOW === */}
      <div className="win-window">

        {/* Title bar */}
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">⭐</span>
            <h2 id="section-qualites-titre">
              Pourquoi choisir ImmoMali ?
            </h2>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>_</button>
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>□</button>
            <button className="win-btn !px-1.5 !py-0 text-xs font-black leading-none" style={{ minWidth: '18px', minHeight: '16px', color: '#CC0000' }}>✕</button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-3" style={{ backgroundColor: '#D4D0C8' }}>
          {/* Inner description */}
          <div className="win-inset p-2 mb-3">
            <p className="text-xs" style={{ color: '#000080', fontWeight: 'bold' }}>
              Découvrez les avantages qui font de ImmoMali la référence immobilière au Mali.
            </p>
          </div>

          {/* Cards grid */}
          <div
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            role="list"
          >
            {qualites.map((q, index) => (
              <div
                key={index}
                role="listitem"
                className="win-window"
                style={{ cursor: 'default' }}
              >
                {/* Mini title bar for each card */}
                <div
                  className="px-2 py-1 text-xs font-bold flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(to right, #000080, #1084d0)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                  }}
                >
                  <span aria-hidden="true">{q.icon}</span>
                  <span className="truncate">{q.title}</span>
                </div>
                <div className="p-2" style={{ backgroundColor: '#D4D0C8' }}>
                  <p className="text-xs leading-relaxed" style={{ color: '#000000' }}>
                    {q.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* OK Button row */}
          <div className="mt-3 flex justify-end gap-2">
            <button className="win-btn font-bold text-xs" style={{ color: '#000080' }}>
              ✔ OK
            </button>
            <button className="win-btn text-xs">
              ✖ Fermer
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="win-statusbar">
          <div className="win-status-panel">
            {qualites.length} avantages répertoriés
          </div>
          <div style={{ marginLeft: 'auto', color: '#808080', fontSize: '10px' }} aria-hidden="true">◢</div>
        </div>

      </div>
    </section>
  );
}
