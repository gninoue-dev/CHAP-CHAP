import { act, renderHook } from '@testing-library/react'
import { FournisseurPanier, reducteurPanier, usePanier } from '../contextes/PanierContexte'

const telephone = { id: 'p1', slug: 'telephone', nom: 'Téléphone', prix: 50000, stock: 3, images: ['a.jpg'], boutique: { nom: 'TechnoPlus' } }
const cafe = { id: 'p2', slug: 'cafe', nom: 'Café', prix: 6500, stock: 10, images: [], boutique: { nom: 'Saveurs' } }

describe('reducteurPanier', () => {
  it('ajoute un produit puis cumule les quantités', () => {
    let etat = reducteurPanier([], { type: 'AJOUTER', produit: cafe, quantite: 2 })
    etat = reducteurPanier(etat, { type: 'AJOUTER', produit: cafe, quantite: 3 })
    expect(etat).toHaveLength(1)
    expect(etat[0]).toMatchObject({ id: 'p2', quantite: 5, boutique: 'Saveurs', image: null })
  })

  it('ne dépasse jamais le stock disponible', () => {
    const etat = reducteurPanier([], { type: 'AJOUTER', produit: telephone, quantite: 10 })
    expect(etat[0].quantite).toBe(3)
    expect(reducteurPanier(etat, { type: 'CHANGER_QUANTITE', id: 'p1', quantite: 8 })[0].quantite).toBe(3)
  })

  it('retire la ligne quand la quantité tombe à zéro', () => {
    const etat = reducteurPanier([], { type: 'AJOUTER', produit: cafe })
    expect(reducteurPanier(etat, { type: 'CHANGER_QUANTITE', id: 'p2', quantite: 0 })).toEqual([])
  })

  it('vide et restaure le panier', () => {
    const etat = reducteurPanier([], { type: 'AJOUTER', produit: cafe })
    expect(reducteurPanier(etat, { type: 'VIDER' })).toEqual([])
    expect(reducteurPanier([], { type: 'RESTAURER', lignes: etat })).toBe(etat)
  })
})

describe('usePanier', () => {
  beforeEach(() => localStorage.clear())

  it('calcule les totaux et la livraison offerte dès 50 000 FCFA', () => {
    const { result } = renderHook(() => usePanier(), { wrapper: FournisseurPanier })
    act(() => result.current.ajouter(cafe, 2))
    expect(result.current.sousTotal).toBe(13000)
    expect(result.current.livraison).toBe(1500)
    expect(result.current.total).toBe(14500)
    act(() => result.current.ajouter(telephone, 1))
    expect(result.current.nombreArticles).toBe(3)
    expect(result.current.livraison).toBe(0)
  })

  it('mémorise le panier dans le localStorage', () => {
    const { result } = renderHook(() => usePanier(), { wrapper: FournisseurPanier })
    act(() => result.current.ajouter(cafe, 1))
    expect(JSON.parse(localStorage.getItem('chapchap.panier'))).toHaveLength(1)
    const { result: autre } = renderHook(() => usePanier(), { wrapper: FournisseurPanier })
    expect(autre.current.lignes[0].nom).toBe('Café')
  })
})
