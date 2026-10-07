import Espace from '../../composants/mise-en-page/Espace'

const LIENS = [
  { vers: '/admin', libelle: "Vue d'ensemble", icone: 'graphique', exact: true },
  { vers: '/admin/boutiques', libelle: 'Boutiques', icone: 'boutique' },
  { vers: '/admin/produits', libelle: 'Produits', icone: 'boite' },
  { vers: '/admin/commandes', libelle: 'Commandes', icone: 'commande' },
  { vers: '/admin/utilisateurs', libelle: 'Utilisateurs', icone: 'utilisateurs' }
]

export default function EspaceAdmin() {
  return <Espace titre="Administration" sousTitre="CHAP CHAP" initiales="CC" couleur="#0F172A" liens={LIENS} />
}
