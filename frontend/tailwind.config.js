/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Windows 2000 palette
        maliOrange: '#FF8C00',
        maliGreen:  '#1E5E48',
        maliSand:   '#F6EBD9',
        maliOcre:   '#D68B3A',
        bgSoleil:   '#FFF1E0',
        // Win2k system colors
        win2kSilver:   '#C0C0C0',
        win2kDarkGray: '#808080',
        win2kLightGray:'#D4D0C8',
        win2kTeal:     '#008080',
        win2kNavy:     '#000080',
        win2kWhite:    '#FFFFFF',
        win2kShadow:   '#404040',
        win2kHighlight:'#FFFFFF',
        win2kButton:   '#D4D0C8',
      },
      fontFamily: {
        sans: ['Tahoma', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        none: '0px',
      },
      boxShadow: {
        // Classic Win32 raised/sunken border styles
        'win-raised': 'inset -1px -1px #404040, inset 1px 1px #FFFFFF, inset -2px -2px #808080, inset 2px 2px #D4D0C8',
        'win-sunken': 'inset 1px 1px #404040, inset -1px -1px #FFFFFF, inset 2px 2px #808080, inset -2px -2px #D4D0C8',
        'win-button': 'inset -1px -1px #000000, inset 1px 1px #FFFFFF, inset -2px -2px #404040, inset 2px 2px #D4D0C8',
        'win-pressed': 'inset 1px 1px #000000, inset -1px -1px #FFFFFF, inset 2px 2px #404040, inset -2px -2px #D4D0C8',
        'win-field': 'inset 1px 1px #808080, inset -1px -1px #D4D0C8, inset 2px 2px #404040, inset -2px -2px #FFFFFF',
      }
    }
  },
  plugins: [],
}
