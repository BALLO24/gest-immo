import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     // forward any request starting with /api to backend
  //     '/api': {
  //       target: 'http://127.0.0.1:5000',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
})
