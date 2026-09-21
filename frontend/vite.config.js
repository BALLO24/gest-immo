import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // AJOUT : sans ça, Rollup rattachait tout framer-motion (utilisé
        // identiquement par les 4 cartes de biens) au chunk de la première
        // carte rencontrée dans son graphe interne (MagasinCard, 168 Ko —
        // 10x plus lourd que TerrainCard alors qu'elles utilisent la même
        // bibliothèque). Isolé ici dans son propre chunk partagé, chargé une
        // seule fois et réutilisé par toutes.
        manualChunks: {
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
})
