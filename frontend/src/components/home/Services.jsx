export default function Services() {
  return (
    <div className="w-full" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>

      {/* === A PROPOS WINDOW === */}
      <div className="win-window mx-2 mb-2">
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">ℹ️</span>
            <h2 id="about-title">À propos de ImmoMali</h2>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>_</button>
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>□</button>
            <button className="win-btn !px-1.5 !py-0 text-xs font-black leading-none" style={{ minWidth: '18px', minHeight: '16px', color: '#CC0000' }}>✕</button>
          </div>
        </div>
        <div className="p-3" style={{ backgroundColor: '#D4D0C8' }}>
          {/* Description text in inset box */}
          <div className="win-inset p-2 mb-3">
            <p className="text-xs leading-relaxed">
              Nous facilitons la recherche de logements, d&apos;appartements et de terrains au Mali
              grâce à une plateforme moderne, fiable et simple d&apos;utilisation.
            </p>
          </div>

          {/* Three feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="list">
            {[
              { icon: "⚡", title: "Simplicité et rapidité", text: "Trouvez le bien idéal en quelques clics grâce à nos filtres puissants.", color: '#000080' },
              { icon: "✅", title: "Fiabilité garantie", text: "Les annonces sont vérifiées pour assurer votre sécurité et votre sérénité.", color: '#006400' },
              { icon: "🗺️", title: "Couverture nationale", text: "Nous connectons acheteurs et vendeurs à travers tout le Mali.", color: '#000080' },
            ].map((item, i) => (
              <div key={i} role="listitem" className="win-window">
                <div
                  className="px-2 py-1 text-xs font-bold flex items-center gap-1"
                  style={{ background: 'linear-gradient(to right, #000080, #1084d0)', color: '#FFFFFF', fontSize: '10px' }}
                >
                  <span aria-hidden="true">{item.icon}</span> {item.title}
                </div>
                <div className="p-2" style={{ backgroundColor: '#D4D0C8' }}>
                  <p className="text-xs">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="win-statusbar">
          <div className="win-status-panel">Prêt</div>
          <div style={{ marginLeft: 'auto', color: '#808080', fontSize: '10px' }} aria-hidden="true">◢</div>
        </div>
      </div>

      {/* === NOS SERVICES WINDOW === */}
      <div className="win-window mx-2 mb-2">
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">🗂️</span>
            <h2 id="services-title">Nos Services</h2>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>_</button>
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>□</button>
            <button className="win-btn !px-1.5 !py-0 text-xs font-black leading-none" style={{ minWidth: '18px', minHeight: '16px', color: '#CC0000' }}>✕</button>
          </div>
        </div>

        {/* Tab strip */}
        <div
          className="flex items-end px-2 pt-1"
          style={{ backgroundColor: '#D4D0C8', borderBottom: '2px solid #808080' }}
          role="tablist"
        >
          {['🏠 Location', '🌿 Terrain', '💬 Assistance'].map((tab, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === 0}
              className={i === 0 ? 'win-tab-active' : 'win-tab'}
              style={{ position: 'relative', bottom: '-2px', marginRight: '2px', fontSize: '11px' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-3" style={{ backgroundColor: '#D4D0C8' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2" role="list">
            {[
              { icon: "🏠", title: "Location de maisons", text: "Des logements confortables et bien situés à Bamako et dans tout le Mali." },
              { icon: "🌿", title: "Vente de terrains", text: "Des terrains sécurisés et bien localisés pour vos projets immobiliers." },
              { icon: "💬", title: "Assistance & conseils", text: "Un accompagnement personnalisé tout au long de vos démarches administratives immobilières." },
            ].map((service, i) => (
              <div key={i} role="listitem" className="win-window">
                <div
                  className="px-2 py-1 text-xs font-bold flex items-center gap-1"
                  style={{ background: 'linear-gradient(to right, #000080, #1084d0)', color: '#FFFFFF', fontSize: '10px' }}
                >
                  <span aria-hidden="true">{service.icon}</span> {service.title}
                </div>
                <div className="p-3" style={{ backgroundColor: '#D4D0C8' }}>
                  <p className="text-xs leading-relaxed">{service.text}</p>
                  <div className="mt-2">
                    <button className="win-btn text-xs w-full">En savoir plus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="win-statusbar">
          <div className="win-status-panel">3 services disponibles</div>
          <div style={{ marginLeft: 'auto', color: '#808080', fontSize: '10px' }} aria-hidden="true">◢</div>
        </div>
      </div>

      {/* === FAQ WINDOW === */}
      <div className="win-window mx-2 mb-2">
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">❓</span>
            <h2 id="faq-title">Questions fréquentes (FAQ)</h2>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>_</button>
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>□</button>
            <button className="win-btn !px-1.5 !py-0 text-xs font-black leading-none" style={{ minWidth: '18px', minHeight: '16px', color: '#CC0000' }}>✕</button>
          </div>
        </div>

        <div className="p-3" style={{ backgroundColor: '#D4D0C8' }}>
          <div className="flex gap-3 items-start mb-3">
            {/* Warning icon like Windows dialogs */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{ width: '32px', height: '32px', backgroundColor: '#FFFFFF', border: '1px solid #808080', fontSize: '18px' }}
              aria-hidden="true"
            >
              ❓
            </div>
            <div className="win-inset p-2 flex-1">
              <p className="text-xs font-bold" style={{ color: '#000080' }}>
                Aide en ligne — ImmoMali Support Center
              </p>
              <p className="text-xs mt-1">
                Consultez les réponses aux questions les plus posées.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { q: "Comment publier une annonce ?", a: "Créez un compte gratuitement, puis accédez à votre espace pour ajouter votre bien avec photos et détails." },
              { q: "Les annonces sont-elles vérifiées ?", a: "Oui, chaque annonce est examinée avant publication pour garantir la qualité et la véracité des informations." },
              { q: "Quels sont les frais d'utilisation ?", a: "Les annonces sont publiées gratuitement sans frais d'utilisation." },
            ].map((faq, i) => (
              <details
                key={i}
                className="win-window"
              >
                <summary
                  className="cursor-pointer px-2 py-1.5 text-xs font-bold flex items-center gap-2 select-none list-none"
                  style={{ backgroundColor: '#D4D0C8' }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#D4D0C8',
                      border: '2px solid',
                      borderColor: '#FFFFFF #404040 #404040 #FFFFFF',
                      fontSize: '8px',
                      lineHeight: '8px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                  <span style={{ color: '#000080' }}>{faq.q}</span>
                </summary>
                <div className="win-inset p-2 m-1">
                  <p className="text-xs leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button className="win-btn font-bold text-xs" style={{ color: '#000080' }}>
              ✔ OK
            </button>
            <button className="win-btn text-xs">Aide</button>
          </div>
        </div>
        <div className="win-statusbar">
          <div className="win-status-panel">Prêt</div>
          <div style={{ marginLeft: 'auto', color: '#808080', fontSize: '10px' }} aria-hidden="true">◢</div>
        </div>
      </div>

    </div>
  );
}
