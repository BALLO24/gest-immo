import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe2, Home, Smile } from "lucide-react";

const qualites = [
  {
    icon: <ShieldCheck className="w-10 h-10 text-maliGreen" />,
    title: "Sécurité garantie",
    text: "Vos transactions et données sont protégées avec des standards de sécurité modernes.",
  },
  {
    icon: <Zap className="w-10 h-10 text-maliOrange" />,
    title: "Rapide et fluide",
    text: "Navigation optimisée pour trouver ou publier une annonce en quelques clics.",
  },
  {
    icon: <Globe2 className="w-10 h-10 text-maliGreen" />,
    title: "Accessible partout",
    text: "MaliLogement est disponible sur ordinateur, tablette et téléphone.",
  },
  {
    icon: <Home className="w-10 h-10 text-maliOrange" />,
    title: "Annonces vérifiées",
    text: "Chaque bien est contrôlé pour garantir authenticité et fiabilité.",
  },
  {
    icon: <Smile className="w-10 h-10 text-maliGreen" />,
    title: "Simplicité d’utilisation",
    text: "Une interface claire et intuitive, adaptée à tous les utilisateurs.",
  },
];

export default function QualitesSection() {
  return (
    <section className="bg-gradient-to-b from-maliSand via-white to-maliSand/70 py-16 px-6 sm:px-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-maliGreen mb-2">
          Pourquoi choisir <span className="text-maliOrange">MaliLogement</span> ?
        </h2>
        <p className="text-gray-600 text-base sm:text-lg">
          Découvrez les avantages qui font de MaliLogement la référence immobilière au Mali.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 place-items-center">
        {qualites.map((q, index) => (
          <motion.div
            key={index}
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-2 hover:bg-maliSand/90 text-center max-w-xs"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
          >
            <div className="flex justify-center mb-4 transition-transform duration-500 group-hover:scale-110">
              {q.icon}
            </div>
            <h3 className="text-lg font-semibold text-maliGreen mb-2 group-hover:text-maliOrange transition-colors duration-300">
              {q.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {q.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
