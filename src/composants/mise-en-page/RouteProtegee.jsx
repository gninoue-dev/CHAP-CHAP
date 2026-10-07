import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contextes/AuthContexte'
import { ChargementPage, EtatVide } from '../ui/divers'
import Bouton from '../ui/Bouton'

// roles : liste des rôles autorisés (vide = tout utilisateur connecté)
export default function RouteProtegee({ roles = [] }) {
  const { utilisateur, role, chargement } = useAuth()
  const position = useLocation()
  if (chargement || (utilisateur && !role)) return <ChargementPage />
  if (!utilisateur) return <Navigate to="/connexion" replace state={{ depuis: position.pathname + position.search }} />
  if (roles.length && !roles.includes(role)) {
    return (
      <div className="conteneur page">
        <EtatVide icone="bouclier" titre="Accès réservé" action={<Bouton vers="/">Retour à l'accueil</Bouton>}>
          Cette page est réservée aux {roles.join(' et ')}s.
        </EtatVide>
      </div>
    )
  }
  return <Outlet />
}
