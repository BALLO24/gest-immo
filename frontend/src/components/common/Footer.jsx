import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{ fontFamily: 'Tahoma, Arial, sans-serif', backgroundColor: '#008080' }}
      role="contentinfo"
      aria-label="Pied de page ImmoMali"
    >
      {/* === TASKBAR-STYLE SEPARATOR === */}
      <div
        style={{
          borderTop: '2px solid #004040',
          borderBottom: '2px solid #00AAAA',
          backgroundColor: '#006666',
          padding: '2px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        aria-hidden="true"
      >
        <span style={{ color: '#FFFFFF', fontSize: '10px' }}>▬▬▬</span>
        <span style={{ color: '#FFFFFF', fontSize: '10px', fontWeight: 'bold' }}>
          © {currentYear} ImmoMali — Portail Immobilier du Mali
        </span>
        <span style={{ color: '#FFFFFF', fontSize: '10px' }}>▬▬▬</span>
      </div>

      {/* === MAIN FOOTER WINDOW === */}
      <div className="win-window mx-2 mb-2 mt-1">
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">🏠</span>
            <span>ImmoMali — À propos &amp; Contacts</span>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>_</button>
            <button className="win-btn !px-1.5 !py-0 text-xs leading-none" style={{ minWidth: '18px', minHeight: '16px' }}>□</button>
            <button className="win-btn !px-1.5 !py-0 text-xs font-black leading-none" style={{ minWidth: '18px', minHeight: '16px', color: '#CC0000' }}>✕</button>
          </div>
        </div>

        <div className="p-3" style={{ backgroundColor: '#D4D0C8' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* About section */}
            <section aria-labelledby="footer-about">
              <div className="win-window mb-2">
                <div
                  className="px-2 py-1 text-xs font-bold flex items-center gap-1"
                  style={{ background: 'linear-gradient(to right, #000080, #1084d0)', color: '#FFFFFF', fontSize: '10px' }}
                >
                  <span aria-hidden="true">ℹ️</span>
                  <h3 id="footer-about">À propos de ImmoMali</h3>
                </div>
                <div className="p-2" style={{ backgroundColor: '#D4D0C8' }}>
                  <div className="win-inset p-2 mb-2">
                    <p className="text-xs leading-relaxed">
                      Votre partenaire de confiance pour la gestion immobilière au Mali.
                      Nous simplifions la recherche et la gestion de vos biens avec
                      transparence et innovation.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Mail size={12} aria-hidden="true" />
                      <span>balloabdoul64@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Phone size={12} aria-hidden="true" />
                      <span>+223 64 60 00 36</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Links */}
            <nav aria-labelledby="footer-links">
              <div className="win-window mb-2">
                <div
                  className="px-2 py-1 text-xs font-bold flex items-center gap-1"
                  style={{ background: 'linear-gradient(to right, #000080, #1084d0)', color: '#FFFFFF', fontSize: '10px' }}
                >
                  <span aria-hidden="true">📂</span>
                  <h3 id="footer-links">Liens utiles</h3>
                </div>
                <div className="p-2" style={{ backgroundColor: '#D4D0C8' }}>
                  <ul className="space-y-1">
                    {[
                      { href: "/", label: "📄 Accueil" },
                      { href: "/location", label: "🏠 Location" },
                      { href: "/vente", label: "🌿 Vente" },
                      { href: "/login", label: "🔑 Connexion" },
                    ].map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-xs hover:underline block py-0.5"
                          style={{ color: '#000080' }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </nav>

            {/* Social / Follow */}
            <section aria-labelledby="footer-socials">
              <div className="win-window mb-2">
                <div
                  className="px-2 py-1 text-xs font-bold flex items-center gap-1"
                  style={{ background: 'linear-gradient(to right, #000080, #1084d0)', color: '#FFFFFF', fontSize: '10px' }}
                >
                  <span aria-hidden="true">🌐</span>
                  <h3 id="footer-socials">Suivez-nous</h3>
                </div>
                <div className="p-2" style={{ backgroundColor: '#D4D0C8' }}>
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {[
                      { icon: <Facebook size={14} />, label: "Facebook" },
                      { icon: <Twitter size={14} />, label: "Twitter" },
                      { icon: <Instagram size={14} />, label: "Instagram" },
                      { icon: <Youtube size={14} />, label: "YouTube" },
                    ].map((s) => (
                      <button
                        key={s.label}
                        className="win-btn !px-2 !py-1 flex items-center gap-1 text-xs"
                        aria-label={`Suivre sur ${s.label}`}
                        title={s.label}
                      >
                        {s.icon}
                      </button>
                    ))}
                  </div>
                  <div className="win-inset p-1.5">
                    <p className="text-xs italic" style={{ color: '#444' }}>
                      &quot;La qualité de l&apos;immobilier au cœur de nos priorités.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Status bar */}
        <div className="win-statusbar">
          <div className="win-status-panel">
            &copy; {currentYear} Abdoul W. Tous droits réservés.
          </div>
          <div className="win-status-panel" style={{ maxWidth: '200px' }}>
            <a href="#" className="hover:underline text-xs" style={{ color: '#000080' }}>Mentions légales</a>
            {" | "}
            <a href="#" className="hover:underline text-xs" style={{ color: '#000080' }}>Confidentialité</a>
          </div>
          <div style={{ marginLeft: 'auto', color: '#808080', fontSize: '10px' }} aria-hidden="true">◢</div>
        </div>
      </div>

      {/* === TASKBAR === */}
      <div
        style={{
          backgroundColor: '#D4D0C8',
          borderTop: '2px solid',
          borderTopColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          padding: '2px 4px',
          gap: '4px',
          fontSize: '11px',
        }}
        role="contentinfo"
        aria-label="Barre des tâches"
      >
        {/* Start button */}
        <button
          className="win-btn font-bold flex items-center gap-1"
          style={{ fontSize: '11px', padding: '2px 8px', color: '#000000' }}
          aria-label="Menu Démarrer"
        >
          🪟 <span style={{ fontWeight: 900 }}>Démarrer</span>
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#808080', borderRight: '1px solid #FFFFFF' }} aria-hidden="true"></div>

        {/* Active windows */}
        <button
          className="win-btn text-xs flex items-center gap-1"
          style={{ fontSize: '11px', padding: '2px 8px', minWidth: '120px', textAlign: 'left' }}
          aria-label="Fenêtre ImmoMali active"
        >
          🏠 ImmoMali — Accueil
        </button>

        {/* System tray */}
        <div
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', border: '2px solid', borderColor: '#808080 #FFFFFF #FFFFFF #808080' }}
          aria-hidden="true"
        >
          <span style={{ fontSize: '12px' }}>🔊</span>
          <span style={{ fontSize: '12px' }}>🌐</span>
          <span style={{ fontSize: '10px', fontFamily: 'Tahoma, Arial, sans-serif' }}>
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
