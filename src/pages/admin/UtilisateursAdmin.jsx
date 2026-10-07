import { useAdminUtilisateurs, useMutationAdmin } from '../../hooks/requetes'
import { changerRole } from '../../api/admin'
import { useAuth } from '../../contextes/AuthContexte'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { formaterDate } from '../../lib/format'
import { ChargementPage } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

export default function UtilisateursAdmin() {
  const { utilisateur } = useAuth()
  const { data: utilisateurs = [], isPending } = useAdminUtilisateurs()
  const { notifier } = useNotifications()
  const changer = useMutationAdmin(({ id, role }) => changerRole(id, role))

  if (isPending) return <ChargementPage />
  return (
    <>
      <h1>Utilisateurs ({utilisateurs.length})</h1>
      <div className={styles.tableauDefilant}>
        <table className={styles.tableau}>
          <thead><tr><th>Nom</th><th>Téléphone</th><th>Inscrit le</th><th>Rôle</th></tr></thead>
          <tbody>
            {utilisateurs.map(u => (
              <tr key={u.id}>
                <td>{u.nom_complet || <em>Sans nom</em>}</td>
                <td>{u.telephone || '—'}</td>
                <td>{formaterDate(u.cree_le)}</td>
                <td>
                  <label className="visuellement-cache" htmlFor={`role-${u.id}`}>Rôle de {u.nom_complet}</label>
                  <select id={`role-${u.id}`} value={u.role} disabled={u.id === utilisateur.id}
                    onChange={e => changer.mutate({ id: u.id, role: e.target.value }, { onSuccess: () => notifier('Rôle modifié'), onError: er => notifier(er.message, { type: 'erreur' }) })}>
                    <option value="client">Client</option>
                    <option value="vendeur">Vendeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
