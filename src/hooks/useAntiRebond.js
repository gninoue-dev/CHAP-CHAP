import { useEffect, useState } from 'react'

// Renvoie la valeur seulement quand elle n'a plus changé depuis "delai" ms
export function useAntiRebond(valeur, delai = 300) {
  const [valeurStable, setValeurStable] = useState(valeur)
  useEffect(() => {
    const minuteur = setTimeout(() => setValeurStable(valeur), delai)
    return () => clearTimeout(minuteur)
  }, [valeur, delai])
  return valeurStable
}
