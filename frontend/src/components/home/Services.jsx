import { motion } from "framer-motion";

export default function Services() {
  return (
    <div className="w-full bg-maliSand text-gray-800">
      {/* SECTION À PROPOS */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold mb-6 text-maliGreen drop-shadow-md"
          >
            À propos de MaliLogement
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-700/90 max-w-2xl mx-auto mb-12"
          >
            Nous facilitons la recherche de logements, d’appartements et de terrains au Mali
            grâce à une plateforme moderne, fiable et simple d’utilisation.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: "Simplicité et rapidité",
                text: "Trouvez le bien idéal en quelques clics grâce à nos filtres puissants.",
                color: "text-maliGreen",
              },
              {
                title: "Fiabilité garantie",
                text: "Les annonces sont vérifiées pour assurer votre sécurité et votre sérénité.",
                color: "text-maliOrange",
              },
              {
                title: "Couverture nationale",
                text: "Nous connectons acheteurs et vendeurs à travers tout le Mali.",
                color: "text-maliGreen",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <h3 className={`text-xl font-semibold mb-2 ${item.color}`}>
                  {item.title}
                </h3>
                <p className="text-gray-700">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION SERVICES */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-maliGreen drop-shadow-md">
            Nos Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏠",
                title: "Location de maisons",
                text: "Des logements confortables et bien situés à Bamako et dans tout le Mali.",
                color: "text-maliOrange",
              },
              {
                icon: "🪜",
                title: "Vente de terrains",
                text: "Des terrains sécurisés et bien localisés pour vos projets immobiliers.",
                color: "text-maliGreen",
              },
              {
                icon: "💬",
                title: "Assistance & conseils",
                text: "Un accompagnement personnalisé tout au long de vos démarches.",
                color: "text-maliOrange",
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-6 bg-white/80 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className={`text-5xl mb-4 ${service.color}`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-700">{service.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section className="py-16 bg-maliGreen/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-maliGreen drop-shadow-md">
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Comment publier une annonce ?",
                a: "Créez un compte gratuitement, puis accédez à votre espace pour ajouter votre bien avec photos et détails.",
              },
              {
                q: "Les annonces sont-elles vérifiées ?",
                a: "Oui, chaque annonce est examinée avant publication pour garantir la qualité et la véracité des informations.",
              },
              {
                q: "Quels sont les frais d’utilisation ?",
                a: "L’utilisation est gratuite pour les visiteurs. Les options premium sont disponibles pour les vendeurs.",
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow hover:shadow-lg transition-all duration-400"
              >
                <summary className="cursor-pointer font-semibold text-maliGreen">
                  {faq.q}
                </summary>
                <p className="mt-2 text-gray-700">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
