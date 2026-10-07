import { supabase, donneesOuErreur } from '../lib/supabase'

export const PRODUITS_PAR_PAGE = 12
const CHAMPS_BASE = 'id, nom, slug, prix, prix_barre, stock, images, note_moyenne, nombre_avis, ventes, cree_le, est_actif, categorie_id, categorie:categories(id, nom, slug)'
const CHAMPS_PRODUIT = `${CHAMPS_BASE}, boutique:boutiques(id, nom, slug, est_verifiee, couleur)`

export async function listerCategories() {
  return donneesOuErreur(await supabase.from('categories').select('*, produits(count)').order('ordre'))
}

// filtres : { categorie, recherche, tri, prixMin, prixMax, noteMin, boutique, enStock, page }
export async function listerProduits(filtres = {}) {
  const page = Math.max(1, Number(filtres.page) || 1)
  let requete = supabase.from('produits').select(CHAMPS_PRODUIT, { count: 'exact' }).eq('est_actif', true)

  if (filtres.categorie) {
    const { data } = await supabase.from('categories').select('id').eq('slug', filtres.categorie).single()
    if (data) requete = requete.eq('categorie_id', data.id)
  }
  if (filtres.boutique) requete = requete.eq('boutique_id', filtres.boutique)
  if (filtres.recherche) requete = requete.textSearch('recherche', filtres.recherche, { type: 'websearch', config: 'french' })
  if (filtres.prixMin) requete = requete.gte('prix', Number(filtres.prixMin))
  if (filtres.prixMax) requete = requete.lte('prix', Number(filtres.prixMax))
  if (filtres.noteMin) requete = requete.gte('note_moyenne', Number(filtres.noteMin))
  if (filtres.enStock) requete = requete.gt('stock', 0)
  if (filtres.promo) requete = requete.not('prix_barre', 'is', null)

  const tris = {
    pertinence: ['ventes', false],
    nouveautes: ['cree_le', false],
    'prix-croissant': ['prix', true],
    'prix-decroissant': ['prix', false],
    note: ['note_moyenne', false]
  }
  const [colonne, croissant] = tris[filtres.tri] || tris.pertinence
  requete = requete.order(colonne, { ascending: croissant }).order('id')

  const debut = (page - 1) * PRODUITS_PAR_PAGE
  return donneesOuErreur(await requete.range(debut, debut + PRODUITS_PAR_PAGE - 1))
}

export async function obtenirProduit(slug) {
  return donneesOuErreur(await supabase.from('produits')
    .select(`${CHAMPS_BASE}, description, caracteristiques, boutique:boutiques(id, nom, slug, est_verifiee, couleur, ville, description)`)
    .eq('slug', slug).single())
}

export async function produitsSimilaires(produit) {
  return donneesOuErreur(await supabase.from('produits').select(CHAMPS_PRODUIT)
    .eq('est_actif', true).eq('categorie_id', produit.categorie_id).neq('id', produit.id)
    .order('ventes', { ascending: false }).limit(8))
}

export async function produitsVedettes() {
  return donneesOuErreur(await supabase.from('produits').select(CHAMPS_PRODUIT)
    .eq('est_actif', true).order('ventes', { ascending: false }).limit(10))
}

export async function produitsPromo() {
  return donneesOuErreur(await supabase.from('produits').select(CHAMPS_PRODUIT)
    .eq('est_actif', true).not('prix_barre', 'is', null).order('ventes', { ascending: false }).limit(10))
}

export async function suggestionsRecherche(texte) {
  if (texte.trim().length < 2) return []
  return donneesOuErreur(await supabase.from('produits')
    .select('id, nom, slug, prix, images, categorie:categories(nom)')
    .eq('est_actif', true).ilike('nom', `%${texte.trim()}%`).limit(6))
}

export async function listerBoutiques() {
  return donneesOuErreur(await supabase.from('boutiques')
    .select('id, nom, slug, description, ville, couleur, est_verifiee, produits(count)')
    .eq('statut', 'active').order('nom'))
}

export async function obtenirBoutique(slug) {
  return donneesOuErreur(await supabase.from('boutiques')
    .select('id, nom, slug, description, ville, couleur, est_verifiee, cree_le, produits(count)')
    .eq('slug', slug).single())
}

// ---------- Avis ----------
export async function listerAvis(produitId) {
  const avis = donneesOuErreur(await supabase.from('avis').select('*').eq('produit_id', produitId).order('cree_le', { ascending: false }))
  if (!avis.length) return []
  const auteurs = donneesOuErreur(await supabase.from('auteurs').select('id, nom_complet').in('id', avis.map(a => a.auteur_id)))
  const noms = Object.fromEntries(auteurs.map(a => [a.id, a.nom_complet]))
  return avis.map(a => ({ ...a, auteur: noms[a.auteur_id] || 'Client CHAP CHAP' }))
}

export async function publierAvis({ produitId, auteurId, note, commentaire }) {
  return donneesOuErreur(await supabase.from('avis')
    .upsert({ produit_id: produitId, auteur_id: auteurId, note, commentaire }, { onConflict: 'produit_id,auteur_id' })
    .select().single())
}

export async function supprimerAvis(id) {
  return donneesOuErreur(await supabase.from('avis').delete().eq('id', id))
}
