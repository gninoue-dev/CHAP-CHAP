import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FournisseurAuth } from './contextes/AuthContexte'
import { FournisseurPanier } from './contextes/PanierContexte'
import { FournisseurTheme } from './contextes/ThemeContexte'
import { FournisseurNotifications } from './contextes/NotificationsContexte'
import { supabaseConfigure } from './lib/supabase'
import App from './App'
import ConfigurationRequise from './pages/ConfigurationRequise'
import './styles/globaux.css'

const clientRequetes = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {supabaseConfigure ? (
      <QueryClientProvider client={clientRequetes}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <FournisseurTheme>
            <FournisseurNotifications>
              <FournisseurAuth>
                <FournisseurPanier>
                  <App />
                </FournisseurPanier>
              </FournisseurAuth>
            </FournisseurNotifications>
          </FournisseurTheme>
        </BrowserRouter>
      </QueryClientProvider>
    ) : (
      <ConfigurationRequise />
    )}
  </StrictMode>
)
