import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { setupCapacitor } from './capacitor/setup'

import './styles/global.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No se encontró el elemento #root en index.html')
}

void setupCapacitor()

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
