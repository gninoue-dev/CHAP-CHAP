import { useSyncExternalStore } from 'react'

const requete = '(prefers-reduced-motion: reduce)'

function abonner(rappel) {
  const media = window.matchMedia(requete)
  media.addEventListener('change', rappel)
  return () => media.removeEventListener('change', rappel)
}

export function useMouvementReduit() {
  return useSyncExternalStore(abonner, () => window.matchMedia(requete).matches, () => false)
}
