/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
theme: {
    extend: {
      colors: {
        maliOrange: '#FF8C00',   // orange chaleureux
        maliGreen:  '#1E5E48',   // vert profond
        maliSand:   '#F6EBD9',   // sable clair
        maliOcre:   '#D68B3A' ,  // ocre accent
        bgSoleil:" #FFF1E0"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },  plugins: [
  ],
}