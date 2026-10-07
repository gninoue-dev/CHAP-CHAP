import { useEffect, useState } from 'react'

// Comme useState, mais la valeur survit au rechargement (localStorage)
export function useStockageLocal(cle, valeurInitiale) {
  const [valeur, setValeur] = useState(() => {
    try {
      const stockee = window.localStorage.getItem(`chapchap.${cle}`)
      return stockee === null ? valeurInitiale : JSON.parse(stockee)
    } catch {
      return valeurInitiale
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(`chapchap.${cle}`, JSON.stringify(valeur))
    } catch {
      // stockage indisponible (navigation privée) : on continue sans mémoriser
    }
  }, [cle, valeur])

  return [valeur, setValeur]
}
