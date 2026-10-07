// Les photos de démonstration sont dans /public/produits ; celles envoyées
// par les vendeurs sont des URL complètes du stockage Supabase.
export function urlImage(chemin) {
  if (!chemin) return `${import.meta.env.BASE_URL}produit-sans-image.svg`
  if (/^https?:\/\//.test(chemin)) return chemin
  return `${import.meta.env.BASE_URL}${chemin.replace(/^\//, '')}`
}
