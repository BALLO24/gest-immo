import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async' // Importation ici
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider> {/* Entoure l'app pour gérer les Meta Tags partout */}
      <App />
    </HelmetProvider>
  </StrictMode>,
)