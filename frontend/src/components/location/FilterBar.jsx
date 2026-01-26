export default function FilterBar() {
  return (
    <section className="w-full bg-gradient-to-r from-maliGreen/90 to-maliOrange/80 py-6 sm:py-8 shadow-md">
      <div className="container mx-auto px-4">
        {/* Titre */}
        <h2 className="text-center text-white text-2xl sm:text-3xl font-bold mb-6 drop-shadow-lg">
          Trouvez la location parfaite 🏠
        </h2>

        {/* Formulaire de filtres */}
        <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm sm:text-base">
          
          {/* Type de bien */}
          <div>
            <label className="block text-white font-semibold mb-1">Type</label>
            <select className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-maliOrange">
              <option className=" bg-maliGreen/60 font-semibold">Maison</option>
              <option className=" bg-maliGreen/60 font-semibold">Appartement</option>
              <option className=" bg-maliGreen/60 font-semibold">Magasin</option>
              <option className=" bg-maliGreen/60 font-semibold">Bureau</option>
              <option className=" bg-maliGreen/60 font-semibold">Villa</option>
              <option className=" bg-maliGreen/60 font-semibold">Studio</option>
            </select>
          </div>

          {/* Prix minimum */}
          <div>
            <label className="block text-white font-semibold mb-1">Prix min (FCFA)</label>
            <input
              type="number"
              placeholder="Ex: 100000"
              className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-maliOrange"
            />
          </div>

          {/* Prix maximum */}
          <div>
            <label className="block text-white font-semibold mb-1">Prix max (FCFA)</label>
            <input
              type="number"
              placeholder="Ex: 500000"
              className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-maliOrange"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-white font-semibold mb-1">Position</label>
            <select className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange">
              <option className="bg-maliOrange/60">Rez-de-chaussée</option>
              <option className="bg-maliOrange/60">Étage 1</option>
              <option className="bg-maliOrange/60">Étage 2</option>
              <option className="bg-maliOrange/60">Étage 3+</option>
            </select>
          </div>

          {/* Nombre de douches */}
          <div>
            <label className="block text-white font-semibold mb-1">Douches</label>
            <select className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
          </div>

          {/* Parking */}
          <div>
            <label className="block text-white font-semibold mb-1">Parking</label>
            <select className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange">
              <option>Oui</option>
              <option>Non</option>
            </select>
          </div>

          {/* Meublé */}
          <div>
            <label className="block text-white font-semibold mb-1">Meublé</label>
            <select className="w-full p-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-maliOrange">
              <option className="bg-maliOrange/70 font-semibold">Oui</option>
              <option className="bg-maliOrange/70 font-semibold">Non</option>
            </select>
          </div>

          {/* Bouton Rechercher */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-maliOrange hover:bg-maliOcre text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
