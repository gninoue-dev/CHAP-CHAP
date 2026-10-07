import { supabase, donneesOuErreur } from '../lib/supabase'

export async function statistiquesAdmin() {
  return donneesOuErreur(await supabase.rpc('statistiques_admin'))
}

export async function toutesLesBoutiques() {
  return donneesOuErreur(await supabase.from('boutiques')
    .select('*, produits(count)').order('cree_le', { ascending: false }))
}

export async function changerStatutBoutique(id, champs) {
  return donneesOuErreur(await supabase.from('boutiques').update(champs).eq('id', id))
}

export async function toutesLesCommandes() {
  return donneesOuErreur(await supabase.from('commandes')
    .select('*, lignes:lignes_commande(id, nom_produit, quantite, prix_unitaire, statut, boutique:boutiques(nom))')
    .order('cree_le', { ascending: false }).limit(200))
}

export async function annulerCommande(id) {
  await supabase.from('lignes_commande').update({ statut: 'annulee' }).eq('commande_id', id)
  return donneesOuErreur(await supabase.from('commandes').update({ statut: 'annulee' }).eq('id', id))
}

export async function tousLesUtilisateurs() {
  return donneesOuErreur(await supabase.from('profils').select('*').order('cree_le', { ascending: false }))
}

export async function changerRole(id, role) {
  return donneesOuErreur(await supabase.from('profils').update({ role }).eq('id', id))
}

export async function tousLesProduits() {
  return donneesOuErreur(await supabase.from('produits')
    .select('id, nom, slug, prix, stock, est_actif, images, ventes, boutique:boutiques(nom), categorie:categories(nom)')
    .order('cree_le', { ascending: false }))
}

export async function basculerProduit(id, estActif) {
  return donneesOuErreur(await supabase.from('produits').update({ est_actif: estActif }).eq('id', id))
}
