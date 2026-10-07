import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const cleAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

// false tant que .env.local n'est pas rempli : l'application affiche alors un écran d'aide
export const supabaseConfigure = Boolean(url && cleAnon)

export const supabase = supabaseConfigure
  ? createClient(url, cleAnon, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

// Transforme une réponse Supabase en données, ou lève une erreur lisible
export function donneesOuErreur({ data, error, count }) {
  if (error) throw new Error(traduireErreur(error.message))
  return count === undefined || count === null ? data : { donnees: data, total: count }
}

const TRADUCTIONS = [
  [/Invalid login credentials/i, 'Email ou mot de passe incorrect.'],
  [/User already registered/i, 'Un compte existe déjà avec cet email.'],
  [/Email not confirmed/i, 'Confirme ton email avant de te connecter (vérifie ta boîte de réception).'],
  [/Password should be at least/i, 'Le mot de passe doit contenir au moins 6 caractères.'],
  [/rate limit/i, 'Trop de tentatives, réessaie dans un instant.'],
  [/Failed to fetch|NetworkError/i, 'Connexion impossible. Vérifie ta connexion internet.'],
  [/row-level security/i, 'Action non autorisée.']
]

export function traduireErreur(message = '') {
  const trouvee = TRADUCTIONS.find(([motif]) => motif.test(message))
  return trouvee ? trouvee[1] : message
}
