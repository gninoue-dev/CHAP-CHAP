import Bouton from '../composants/ui/Bouton'
import { EtatVide } from '../composants/ui/divers'

export default function NonTrouve() {
  return (
    <div className="conteneur page">
      <EtatVide icone="recherche" titre="Page introuvable (404)" action={<Bouton vers="/">Retour à l'accueil</Bouton>}>
        Cette page n'existe pas, ou elle a déménagé chap chap.
      </EtatVide>
    </div>
  )
}
