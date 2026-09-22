/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CORRIGÉ (accessibilité) : #FF8C00 n'offrait qu'un contraste de
        // 2.33:1 contre du blanc (calcul WCAG vérifié), très en dessous du
        // minimum requis de 4.5:1 pour du texte normal — ça touchait les
        // prix affichés, les titres accentués, et le texte blanc sur fond
        // orange des boutons (même ratio dans les deux sens). Assombri à
        // 5.10:1, même teinte, juste moins lumineux.
        maliOrange: '#A65B00',   // orange chaleureux (accessible)
        maliGreen:  '#1E5E48',   // vert profond
        maliSand:   '#F6EBD9',   // sable clair
        maliOcre:   '#D68B3A',   // ocre accent
        bgSoleil:   '#FFF1E0',   // fond ensoleillé (espace supprimé)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: [],
}