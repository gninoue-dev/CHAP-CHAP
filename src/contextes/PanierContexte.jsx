import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { fraisLivraison } from '../lib/format'

const PanierContexte = createContext(null)
const CLE = 'chapchap.panier'

// Chaque ligne garde une copie des infos utiles à l'affichage ;
// le prix réel est recalculé par la base au moment de la commande.
export function reducteurPanier(etat, action) {
  switch (action.type) {
    case 'AJOUTER': {
      const { produit, quantite = 1 } = action
      const existante = etat.find(l => l.id === produit.id)
      const maximum = produit.stock ?? 99
      if (existante) {
        return etat.map(l => (l.id === produit.id ? { ...l, quantite: Math.min(maximum, l.quantite + quantite) } : l))
      }
      return [...etat, {
        id: produit.id,
        slug: produit.slug,
        nom: produit.nom,
        prix: produit.prix,
        image: produit.images?.[0] ?? null,
        boutique: produit.boutique?.nom ?? '',
        stock: maximum,
        quantite: Math.min(maximum, quantite)
      }]
    }
    case 'CHANGER_QUANTITE':
      return action.quantite <= 0
        ? etat.filter(l => l.id !== action.id)
        : etat.map(l => (l.id === action.id ? { ...l, quantite: Math.min(l.stock, action.quantite) } : l))
    case 'RETIRER':
      return etat.filter(l => l.id !== action.id)
    case 'RESTAURER':
      return action.lignes
    case 'VIDER':
      return []
    default:
      return etat
  }
}

function lireStockage() {
  try {
    return JSON.parse(localStorage.getItem(CLE)) ?? []
  } catch {
    return []
  }
}

export function FournisseurPanier({ children }) {
  const [lignes, dispatch] = useReducer(reducteurPanier, undefined, lireStockage)

  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify(lignes))
    } catch {
      // stockage indisponible
    }
  }, [lignes])

  // synchronisation entre onglets
  useEffect(() => {
    const surStockage = e => { if (e.key === CLE) dispatch({ type: 'RESTAURER', lignes: lireStockage() }) }
    window.addEventListener('storage', surStockage)
    return () => window.removeEventListener('storage', surStockage)
  }, [])

  const valeur = useMemo(() => {
    const nombreArticles = lignes.reduce((t, l) => t + l.quantite, 0)
    const sousTotal = lignes.reduce((t, l) => t + l.prix * l.quantite, 0)
    const livraison = fraisLivraison(sousTotal)
    return {
      lignes,
      nombreArticles,
      sousTotal,
      livraison,
      total: sousTotal + livraison,
      ajouter: (produit, quantite) => dispatch({ type: 'AJOUTER', produit, quantite }),
      changerQuantite: (id, quantite) => dispatch({ type: 'CHANGER_QUANTITE', id, quantite }),
      retirer: id => dispatch({ type: 'RETIRER', id }),
      restaurer: lignesSauvegardees => dispatch({ type: 'RESTAURER', lignes: lignesSauvegardees }),
      vider: () => dispatch({ type: 'VIDER' })
    }
  }, [lignes])

  return <PanierContexte.Provider value={valeur}>{children}</PanierContexte.Provider>
}

export function usePanier() {
  return useContext(PanierContexte)
}
