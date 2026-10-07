const formateurPrix = new Intl.NumberFormat('fr-FR')

export function formaterPrix(montant) {
  return `${formateurPrix.format(Math.round(montant || 0))} FCFA`
}

export function pourcentageRemise(prix, prixBarre) {
  if (!prixBarre || prixBarre <= prix) return 0
  return Math.round((1 - prix / prixBarre) * 100)
}

export function formaterDate(date, avecHeure = false) {
  return new Date(date).toLocaleString('fr-FR', avecHeure
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' })
}

export function formaterDateCourte(date) {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export const STATUTS_COMMANDE = {
  payee: { libelle: 'Payée', couleur: 'bleu' },
  en_preparation: { libelle: 'En préparation', couleur: 'orange' },
  expediee: { libelle: 'Expédiée', couleur: 'violet' },
  livree: { libelle: 'Livrée', couleur: 'vert' },
  annulee: { libelle: 'Annulée', couleur: 'rouge' }
}

export const PAIEMENTS = [
  { id: 'orange', nom: 'Orange Money', couleur: '#FF7900' },
  { id: 'mtn', nom: 'MTN MoMo', couleur: '#FFCC00' },
  { id: 'wave', nom: 'Wave', couleur: '#1DC4FF' },
  { id: 'moov', nom: 'Moov Money', couleur: '#0056A6' },
  { id: 'carte', nom: 'Carte bancaire', couleur: '#0F172A' },
  { id: 'especes', nom: 'Espèces à la livraison', couleur: '#16A34A' }
]

export const LIVRAISON_OFFERTE_DES = 50000
export const FRAIS_LIVRAISON = 1500

export function fraisLivraison(sousTotal) {
  return sousTotal === 0 || sousTotal >= LIVRAISON_OFFERTE_DES ? 0 : FRAIS_LIVRAISON
}
