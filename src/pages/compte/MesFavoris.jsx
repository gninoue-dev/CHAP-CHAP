import { useFavoris } from '../../hooks/requetes'
import GrilleProduits from '../../composants/produits/GrilleProduits'
import Bouton from '../../composants/ui/Bouton'
import { EtatVide } from '../../composants/ui/divers'

export default function MesFavoris() {
  const { data: favoris = [], isPending } = useFavoris()
  return (
    <>
      <h1>Mes favoris</h1>
      {!isPending && favoris.length === 0
        ? <EtatVide icone="coeur" titre="Aucun favori" action={<Bouton vers="/produits">Explorer</Bouton>}>Touche le cœur d'un produit pour le retrouver ici.</EtatVide>
        : <GrilleProduits produits={favoris} chargement={isPending} nombreSquelettes={4} />}
    </>
  )
}
