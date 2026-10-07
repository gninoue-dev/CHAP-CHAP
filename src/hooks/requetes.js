// ============================================
// Hooks de données (TanStack Query)
// Chaque écran lit ses données ici : cache, rechargement en arrière-plan,
// invalidation après une mutation et mises à jour optimistes.
// ============================================
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as catalogue from '../api/catalogue'
import * as client from '../api/client'
import * as vendeur from '../api/vendeur'
import * as admin from '../api/admin'
import { useAuth } from '../contextes/AuthContexte'

export const cles = {
  categories: ['categories'],
  produits: filtres => ['produits', filtres],
  produit: slug => ['produit', slug],
  similaires: id => ['similaires', id],
  vedettes: ['vedettes'],
  promos: ['promos'],
  suggestions: texte => ['suggestions', texte],
  boutiques: ['boutiques'],
  boutique: slug => ['boutique', slug],
  avis: produitId => ['avis', produitId],
  favoris: id => ['favoris', id],
  commandes: id => ['commandes', id],
  commande: numero => ['commande', numero],
  maBoutique: id => ['ma-boutique', id],
  statsVendeur: ['stats-vendeur'],
  produitsVendeur: id => ['produits-vendeur', id],
  ventesVendeur: id => ['ventes-vendeur', id],
  statsAdmin: ['stats-admin'],
  adminBoutiques: ['admin', 'boutiques'],
  adminCommandes: ['admin', 'commandes'],
  adminUtilisateurs: ['admin', 'utilisateurs'],
  adminProduits: ['admin', 'produits']
}

// ---------- Catalogue ----------
export const useCategories = () =>
  useQuery({ queryKey: cles.categories, queryFn: catalogue.listerCategories, staleTime: 10 * 60_000 })

export const useProduits = filtres =>
  useQuery({ queryKey: cles.produits(filtres), queryFn: () => catalogue.listerProduits(filtres), placeholderData: keepPreviousData })

export const useProduit = slug =>
  useQuery({ queryKey: cles.produit(slug), queryFn: () => catalogue.obtenirProduit(slug), enabled: Boolean(slug) })

export const useProduitsSimilaires = produit =>
  useQuery({ queryKey: cles.similaires(produit?.id), queryFn: () => catalogue.produitsSimilaires(produit), enabled: Boolean(produit) })

export const useProduitsVedettes = () => useQuery({ queryKey: cles.vedettes, queryFn: catalogue.produitsVedettes })
export const useProduitsPromo = () => useQuery({ queryKey: cles.promos, queryFn: catalogue.produitsPromo })

export const useSuggestions = texte =>
  useQuery({ queryKey: cles.suggestions(texte), queryFn: () => catalogue.suggestionsRecherche(texte), enabled: texte.trim().length >= 2, staleTime: 60_000 })

export const useBoutiques = () => useQuery({ queryKey: cles.boutiques, queryFn: catalogue.listerBoutiques })
export const useBoutique = slug =>
  useQuery({ queryKey: cles.boutique(slug), queryFn: () => catalogue.obtenirBoutique(slug), enabled: Boolean(slug) })

// ---------- Avis ----------
export const useAvis = produitId =>
  useQuery({ queryKey: cles.avis(produitId), queryFn: () => catalogue.listerAvis(produitId), enabled: Boolean(produitId) })

export function usePublierAvis(produit) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: catalogue.publierAvis,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cles.avis(produit.id) })
      qc.invalidateQueries({ queryKey: cles.produit(produit.slug) })
    }
  })
}

export function useSupprimerAvis(produit) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: catalogue.supprimerAvis,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cles.avis(produit.id) })
      qc.invalidateQueries({ queryKey: cles.produit(produit.slug) })
    }
  })
}

// ---------- Favoris (mise à jour optimiste) ----------
export function useFavoris() {
  const { utilisateur } = useAuth()
  return useQuery({
    queryKey: cles.favoris(utilisateur?.id),
    queryFn: () => client.listerFavoris(utilisateur.id),
    enabled: Boolean(utilisateur)
  })
}

export function useBasculerFavori() {
  const { utilisateur } = useAuth()
  const qc = useQueryClient()
  const cle = cles.favoris(utilisateur?.id)
  return useMutation({
    mutationFn: ({ produit, estFavori }) =>
      estFavori ? client.retirerFavori(utilisateur.id, produit.id) : client.ajouterFavori(utilisateur.id, produit.id),
    onMutate: async ({ produit, estFavori }) => {
      await qc.cancelQueries({ queryKey: cle })
      const precedent = qc.getQueryData(cle)
      qc.setQueryData(cle, (liste = []) => (estFavori ? liste.filter(p => p.id !== produit.id) : [produit, ...liste]))
      return { precedent }
    },
    onError: (_erreur, _variables, contexte) => qc.setQueryData(cle, contexte.precedent),
    onSettled: () => qc.invalidateQueries({ queryKey: cle })
  })
}

// ---------- Commandes ----------
export function usePasserCommande() {
  const qc = useQueryClient()
  const { utilisateur } = useAuth()
  return useMutation({
    mutationFn: client.passerCommande,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cles.commandes(utilisateur?.id) })
      qc.invalidateQueries({ queryKey: ['produits'] })
    }
  })
}

export function useMesCommandes() {
  const { utilisateur } = useAuth()
  return useQuery({ queryKey: cles.commandes(utilisateur?.id), queryFn: () => client.mesCommandes(utilisateur.id), enabled: Boolean(utilisateur) })
}

export const useCommande = numero =>
  useQuery({ queryKey: cles.commande(numero), queryFn: () => client.obtenirCommande(numero), enabled: Boolean(numero), refetchInterval: 30_000 })

// ---------- Boutique du vendeur ----------
export function useMaBoutique() {
  const { utilisateur } = useAuth()
  return useQuery({ queryKey: cles.maBoutique(utilisateur?.id), queryFn: () => client.maBoutique(utilisateur.id), enabled: Boolean(utilisateur) })
}

export function useCreerBoutique() {
  const { utilisateur } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: champs => client.creerBoutique(utilisateur.id, champs),
    onSuccess: () => qc.invalidateQueries({ queryKey: cles.maBoutique(utilisateur.id) })
  })
}

export const useStatistiquesVendeur = () => useQuery({ queryKey: cles.statsVendeur, queryFn: vendeur.statistiquesVendeur })

export const useProduitsVendeur = boutiqueId =>
  useQuery({ queryKey: cles.produitsVendeur(boutiqueId), queryFn: () => vendeur.produitsDeMaBoutique(boutiqueId), enabled: Boolean(boutiqueId) })

export const useVentesVendeur = boutiqueId =>
  useQuery({ queryKey: cles.ventesVendeur(boutiqueId), queryFn: () => vendeur.lignesDeMaBoutique(boutiqueId), enabled: Boolean(boutiqueId) })

export function useMutationVendeur(fonction, invalider = []) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fonction,
    onSuccess: () => {
      invalider.forEach(queryKey => qc.invalidateQueries({ queryKey }))
      qc.invalidateQueries({ queryKey: cles.statsVendeur })
      qc.invalidateQueries({ queryKey: ['produits'] })
    }
  })
}

// ---------- Administration ----------
export const useStatistiquesAdmin = () => useQuery({ queryKey: cles.statsAdmin, queryFn: admin.statistiquesAdmin })
export const useAdminBoutiques = () => useQuery({ queryKey: cles.adminBoutiques, queryFn: admin.toutesLesBoutiques })
export const useAdminCommandes = () => useQuery({ queryKey: cles.adminCommandes, queryFn: admin.toutesLesCommandes })
export const useAdminUtilisateurs = () => useQuery({ queryKey: cles.adminUtilisateurs, queryFn: admin.tousLesUtilisateurs })
export const useAdminProduits = () => useQuery({ queryKey: cles.adminProduits, queryFn: admin.tousLesProduits })

export function useMutationAdmin(fonction) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fonction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: cles.statsAdmin })
      qc.invalidateQueries({ queryKey: ['produits'] })
    }
  })
}
