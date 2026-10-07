import { supabase, donneesOuErreur } from '../lib/supabase'

export async function statistiquesVendeur() {
  return donneesOuErreur(await supabase.rpc('statistiques_vendeur'))
}

export async function produitsDeMaBoutique(boutiqueId) {
  return donneesOuErreur(await supabase.from('produits')
    .select('*, categorie:categories(nom)').eq('boutique_id', boutiqueId).order('cree_le', { ascending: false }))
}

export async function obtenirMonProduit(id) {
  return donneesOuErreur(await supabase.from('produits').select('*').eq('id', id).single())
}

export async function enregistrerProduit(boutiqueId, produit) {
  const champs = {
    nom: produit.nom,
    categorie_id: produit.categorie_id,
    description: produit.description,
    prix: produit.prix,
    prix_barre: produit.prix_barre || null,
    stock: produit.stock,
    est_actif: produit.est_actif,
    images: produit.images,
    caracteristiques: produit.caracteristiques || {}
  }
  const requete = produit.id
    ? supabase.from('produits').update(champs).eq('id', produit.id)
    : supabase.from('produits').insert({ ...champs, boutique_id: boutiqueId, slug: 'temporaire' })
  return donneesOuErreur(await requete.select().single())
}

export async function supprimerProduit(id) {
  return donneesOuErreur(await supabase.from('produits').delete().eq('id', id))
}

export async function basculerProduitActif(id, estActif) {
  return donneesOuErreur(await supabase.from('produits').update({ est_actif: estActif }).eq('id', id))
}

// Envoie une image dans le dossier du vendeur : produits/<id utilisateur>/<fichier>
export async function envoyerImage(utilisateurId, fichier) {
  const extension = fichier.name.split('.').pop().toLowerCase()
  const chemin = `${utilisateurId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('produits').upload(chemin, fichier, { cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)
  return supabase.storage.from('produits').getPublicUrl(chemin).data.publicUrl
}

export async function lignesDeMaBoutique(boutiqueId) {
  return donneesOuErreur(await supabase.from('lignes_commande')
    .select('*, commande:commandes(numero, cree_le, adresse, paiement)')
    .eq('boutique_id', boutiqueId).order('id', { ascending: false }))
}

export async function changerStatutLigne(id, statut) {
  return donneesOuErreur(await supabase.from('lignes_commande').update({ statut }).eq('id', id))
}

export async function modifierBoutique(id, champs) {
  return donneesOuErreur(await supabase.from('boutiques').update(champs).eq('id', id).select().single())
}
