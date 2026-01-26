export default function StyledInputs() {
  return (
    <div className="max-w-md mx-auto p-6 space-y-5 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-maliOcre/20">
      <h2 className="text-xl font-semibold text-maliGreen mb-4">
        Recherche de bien
      </h2>

      {/* Champ texte stylisé */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-maliGreen/90 mb-2"
        >
          Ville ou Quartier
        </label>
        <input
          type="text"
          id="location"
          placeholder="Ex: Bamako, ACI 2000..."
          className="w-full px-4 py-2.5 bg-maliSand/30 border border-maliOcre/25 rounded-xl text-maliGreen placeholder-maliGreen/50 focus:ring-2 focus:ring-maliOrange/60 focus:border-maliOrange/60 transition duration-200 outline-none"
        />
      </div>

      {/* Champ select stylisé */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-maliGreen/90 mb-2"
        >
          Type de bien
        </label>
        <select
          id="type"
          className="w-full px-4 py-2.5 bg-maliSand/30 border border-maliOcre/25 rounded-xl text-maliGreen focus:ring-2 focus:ring-maliOrange/60 focus:border-maliOrange/60 transition duration-200 outline-none appearance-none"
        >
          <option value="">Sélectionnez...</option>
          <option value="maison">Maison</option>
          <option value="appartement">Appartement</option>
          <option value="terrain">Terrain</option>
          <option value="villa">Villa</option>
        </select>
      </div>

      {/* Bouton */}
      <button
        type="button"
        className="w-full mt-2 bg-maliOrange hover:bg-maliOcre text-white font-semibold py-2.5 rounded-xl shadow-sm transition-all duration-200"
      >
        Rechercher
      </button>
    </div>
  );
}
