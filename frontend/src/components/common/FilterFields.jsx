// AJOUT : composants de champ de filtre partagés entre location/FilterList.jsx
// et vente/FilterList.jsx. Avant, chaque page définissait ses propres
// <select>/<input> stylés en dupliquant le balisage — risque qu'un correctif
// (comme celui du bug booléen sur le backend) mène à des styles divergents
// entre les deux pages avec le temps.

export function ChevronDownIcon({ dimmed }) {
  return (
    <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity ${dimmed ? "opacity-30" : "opacity-100"}`} aria-hidden="true">
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function SelectField({ label, value, onChange, options, disabled, hint }) {
  const id = `filtre-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className={`text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1 transition-opacity ${disabled ? "opacity-50" : "opacity-100"}`}>
        {label}
        {hint && <span className="sr-only"> ({hint})</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          aria-disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-11 px-3 pr-8 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all appearance-none ${
            disabled ? "opacity-50 cursor-not-allowed bg-white/5" : "opacity-100 cursor-pointer"
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
          ))}
        </select>
        <ChevronDownIcon dimmed={disabled} />
      </div>
    </div>
  );
}

export function NumberField({ label, value, onChange, placeholder }) {
  const id = `filtre-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-white/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        placeholder={placeholder}
        className="w-full h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:bg-white/20 focus:ring-2 focus:ring-maliOrange outline-none transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export const PEU_IMPORTE_OUI_NON = [
  { value: "tous", label: "Peu importe" },
  { value: "true", label: "Oui" },
  { value: "false", label: "Non" },
];
