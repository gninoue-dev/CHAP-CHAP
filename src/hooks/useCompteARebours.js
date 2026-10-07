import { useEffect, useState } from 'react'

// Temps restant jusqu'à minuit (pour les ventes flash du jour)
function tempsRestant() {
  const maintenant = new Date()
  const minuit = new Date(maintenant)
  minuit.setHours(24, 0, 0, 0)
  const total = Math.max(0, minuit - maintenant)
  return {
    heures: Math.floor(total / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    secondes: Math.floor((total % 60_000) / 1000)
  }
}

export function useCompteARebours() {
  const [temps, setTemps] = useState(tempsRestant)
  useEffect(() => {
    const minuteur = setInterval(() => setTemps(tempsRestant()), 1000)
    return () => clearInterval(minuteur)
  }, [])
  return temps
}
