import { supabase, donneesOuErreur } from '../lib/supabase'

// ---------- Favoris ----------
export async function listerFavoris(utilisateurId) {
  const lignes = donneesOuErreur(await supabase.from('favoris')
    .select('produit:produits(id, nom, slug, prix, prix_barre, stock, images, note_moyenne, nombre_avis, boutique:boutiques(nom, slug, est_verifiee))')
    .eq('utilisateur_id', utilisateurId).order('cree_le', { ascending: false }))
  return lignes.map(l => l.produit).filter(Boolean)
}

export async function ajouterFavori(utilisateurId, produitId) {
  return donneesOuErreur(await supabase.from('favoris').insert({ utilisateur_id: utilisateurId, produit_id: produitId }))
}

export async function retirerFavori(utilisateurId, produitId) {
  return donneesOuErreur(await supabase.from('favoris').delete().eq('utilisateur_id', utilisateurId).eq('produit_id', produitId))
}

// ---------- Commandes ----------
export async function passerCommande({ lignes, adresse, paiement }) {
  return donneesOuErreur(await supabase.rpc('passer_commande', {
    lignes: lignes.map(l => ({ produit_id: l.id, quantite: l.quantite })),
    adresse,
    paiement
  }))
}

export async function mesCommandes(utilisateurId) {
  return donneesOuErreur(await supabase.from('commandes').select('*, lignes:lignes_commande(*, produit:produits(slug, stock, images, prix))')
    .eq('client_id', utilisateurId).order('cree_le', { ascending: false }))
}

export async function obtenirCommande(numero) {
  return donneesOuErreur(await supabase.from('commandes').select('*, lignes:lignes_commande(*, boutique:boutiques(nom, slug))')
    .eq('numero', numero).single())
}

// ---------- Profil ----------
export async function modifierProfil(id, champs) {
  return donneesOuErreur(await supabase.from('profils').update(champs).eq('id', id).select().single())
}

// ---------- Devenir vendeur ----------
export async function maBoutique(utilisateurId) {
  return donneesOuErreur(await supabase.from('boutiques').select('*').eq('proprietaire_id', utilisateurId).maybeSingle())
}

export async function creerBoutique(utilisateurId, champs) {
  return donneesOuErreur(await supabase.from('boutiques').insert({ ...champs, proprietaire_id: utilisateurId, slug: 'temporaire' }).select().single())
}
