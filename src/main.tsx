import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './styles/global.css'
import App from './App.tsx'

posthog.init('phc_R7ZAuPFBNbxkup1BuUERgB7zRw1NC4htBd4Eu9N49MQ', {
  api_host: 'https://us.i.posthog.com',
  persistence: 'localStorage+cookie',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
