import { useMaBoutique } from '../../hooks/requetes'
import Espace from '../../composants/mise-en-page/Espace'
import { ChargementPage } from '../../composants/ui/divers'

const LIENS = [
  { vers: '/vendeur', libelle: 'Tableau de bord', icone: 'graphique', exact: true },
  { vers: '/vendeur/produits', libelle: 'Mes produits', icone: 'boite' },
  { vers: '/vendeur/ventes', libelle: 'Ventes à traiter', icone: 'commande' },
  { vers: '/vendeur/boutique', libelle: 'Ma boutique', icone: 'boutique' }
]

export default function EspaceVendeur() {
  const { data: boutique, isPending } = useMaBoutique()
  if (isPending) return <ChargementPage />
  return <Espace titre={boutique.nom} sousTitre="Espace vendeur" initiales={boutique.nom.slice(0, 2).toUpperCase()} couleur={boutique.couleur} liens={LIENS} />
}
