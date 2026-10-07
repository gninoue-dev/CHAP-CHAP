import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, traduireErreur } from '../lib/supabase'

const AuthContexte = createContext(null)

export function FournisseurAuth({ children }) {
  const [session, setSession] = useState(null)
  const [profil, setProfil] = useState(null)
  const [chargement, setChargement] = useState(Boolean(supabase))
  const clientRequetes = useQueryClient()

  async function chargerProfil(utilisateur) {
    if (!utilisateur) { setProfil(null); return }
    const { data } = await supabase.from('profils').select('*').eq('id', utilisateur.id).single()
    setProfil(data)
  }

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await chargerProfil(data.session?.user)
      setChargement(false)
    })
    const { data: abonnement } = supabase.auth.onAuthStateChange((evenement, nouvelleSession) => {
      setSession(nouvelleSession)
      // évite un appel Supabase dans le rappel (recommandation officielle)
      setTimeout(() => chargerProfil(nouvelleSession?.user), 0)
      if (evenement === 'SIGNED_OUT') clientRequetes.clear()
    })
    return () => abonnement.subscription.unsubscribe()
  }, [clientRequetes])

  const valeur = useMemo(() => ({
    session,
    utilisateur: session?.user ?? null,
    profil,
    role: profil?.role ?? null,
    chargement,
    async connecter(email, motDePasse) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse })
      if (error) throw new Error(traduireErreur(error.message))
    },
    async inscrire({ email, motDePasse, nomComplet, telephone }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: motDePasse,
        options: { data: { nom_complet: nomComplet, telephone } }
      })
      if (error) throw new Error(traduireErreur(error.message))
      return { confirmationRequise: !data.session }
    },
    async deconnecter() {
      await supabase.auth.signOut()
    },
    rafraichirProfil: () => chargerProfil(session?.user)
  }), [session, profil, chargement])

  return <AuthContexte.Provider value={valeur}>{children}</AuthContexte.Provider>
}

export function useAuth() {
  return useContext(AuthContexte)
}
