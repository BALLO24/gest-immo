import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Section 1 : À propos */}
        <section aria-labelledby="footer-about">
          <h3 id="footer-about" className="text-xl font-bold mb-4 text-maliOrange">
            À propos de ImmoMali
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Votre partenaire de confiance pour la gestion immobilière au Mali. 
            Nous simplifions la recherche et la gestion de vos biens avec 
            transparence et innovation.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-400">
             <span className="flex items-center gap-2">
               <Mail size={16} className="text-maliGreen" /> balloabdoul64@gmail.com
             </span>
             <span className="flex items-center gap-2">
               <Phone size={16} className="text-maliGreen" /> +223 64 60 00 36
             </span>
          </div>
        </section>

        {/* Section 2 : Liens utiles */}
        <nav aria-labelledby="footer-links">
          <h3 id="footer-links" className="text-xl font-bold mb-4">Liens utiles</h3>
          <ul className="space-y-3">
            <li>
              <a href="/" className="text-gray-400 hover:text-maliOrange transition-colors duration-300 block w-fit">
                Accueil
              </a>
            </li>
            <li>
              <a href="/biens" className="text-gray-400 hover:text-maliOrange transition-colors duration-300 block w-fit">
                Nos Biens
              </a>
            </li>
            <li>
              <a href="/services" className="text-gray-400 hover:text-maliOrange transition-colors duration-300 block w-fit">
                Services
              </a>
            </li>
            <li>
              <a href="/contact" className="text-gray-400 hover:text-maliOrange transition-colors duration-300 block w-fit">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* Section 3 : Suivez-nous */}
        <section aria-labelledby="footer-socials">
          <h3 id="footer-socials" className="text-xl font-bold mb-4">Suivez-nous</h3>
          <div className="flex space-x-5">
            <a href="#" aria-label="Suivre sur Facebook" className="bg-gray-800 p-2 rounded-lg hover:text-blue-500 hover:bg-gray-700 transition-all duration-300">
              <Facebook size={24} />
            </a>
            <a href="#" aria-label="Suivre sur Twitter" className="bg-gray-800 p-2 rounded-lg hover:text-cyan-400 hover:bg-gray-700 transition-all duration-300">
              <Twitter size={24} />
            </a>
            <a href="#" aria-label="Suivre sur Instagram" className="bg-gray-800 p-2 rounded-lg hover:text-pink-500 hover:bg-gray-700 transition-all duration-300">
              <Instagram size={24} />
            </a>
            <a href="#" aria-label="Suivre sur YouTube" className="bg-gray-800 p-2 rounded-lg hover:text-red-600 hover:bg-gray-700 transition-all duration-300">
              <Youtube size={24} />
            </a>
          </div>
          <p className="mt-6 text-gray-400 text-sm italic">
            "La qualité de l'immobilier au cœur de nos priorités."
          </p>
        </section>

      </div>

      {/* Barre de copyright */}
      <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>&copy; {currentYear} Abdoul W. Tous droits réservés.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:underline">Mentions légales</a>
          <span>|</span>
          <a href="#" className="hover:underline">Confidentialité</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;