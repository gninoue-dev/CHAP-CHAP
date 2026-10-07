import { useAuth } from '../../contextes/AuthContexte'
import Espace from '../../composants/mise-en-page/Espace'

export default function EspaceCompte() {
  const { profil, utilisateur, role } = useAuth()
  const nom = profil?.nom_complet || utilisateur.email
  const liens = [
    { vers: '/compte', libelle: 'Mes commandes', icone: 'commande', exact: true },
    { vers: '/compte/favoris', libelle: 'Mes favoris', icone: 'coeur' },
    { vers: '/compte/profil', libelle: 'Mon profil', icone: 'utilisateur' },
    role === 'vendeur' && { vers: '/vendeur', libelle: 'Espace vendeur', icone: 'boutique' },
    role === 'admin' && { vers: '/admin', libelle: 'Administration', icone: 'tableau' },
    role === 'client' && { vers: '/devenir-vendeur', libelle: 'Vendre sur CHAP CHAP', icone: 'boutique' }
  ].filter(Boolean)
  return <Espace titre={nom} sousTitre="Mon compte" initiales={nom.slice(0, 2).toUpperCase()} liens={liens} />
}
