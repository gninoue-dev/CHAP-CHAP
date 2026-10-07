import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminBoutiques, useMutationAdmin } from '../../hooks/requetes'
import { changerStatutBoutique } from '../../api/admin'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { formaterDate } from '../../lib/format'
import Bouton from '../../composants/ui/Bouton'
import { Badge, ChargementPage } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

const STATUTS = { en_attente: ['En attente', 'orange'], active: ['Active', 'vert'], suspendue: ['Suspendue', 'rouge'] }

export default function BoutiquesAdmin() {
  const { data: boutiques = [], isPending } = useAdminBoutiques()
  const { notifier } = useNotifications()
  const [filtre, setFiltre] = useState('')
  const changer = useMutationAdmin(({ id, champs }) => changerStatutBoutique(id, champs))
  const action = (id, champs, message) => changer.mutate({ id, champs }, { onSuccess: () => notifier(message), onError: e => notifier(e.message, { type: 'erreur' }) })

  if (isPending) return <ChargementPage />
  const affichees = filtre ? boutiques.filter(b => b.statut === filtre) : boutiques
  return (
    <>
      <h1>Boutiques ({boutiques.length})</h1>
      <div className={styles.filtresTableau}>
        <label className="visuellement-cache" htmlFor="filtreBoutiques">Filtrer</label>
        <select id="filtreBoutiques" value={filtre} onChange={e => setFiltre(e.target.value)}>
          <option value="">Toutes</option>
          {Object.entries(STATUTS).map(([cle, [libelle]]) => <option key={cle} value={cle}>{libelle} ({boutiques.filter(b => b.statut === cle).length})</option>)}
        </select>
      </div>
      <div className={styles.tableauDefilant}>
        <table className={styles.tableau}>
          <thead><tr><th>Boutique</th><th>Ville</th><th>Produits</th><th>Créée le</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {affichees.map(b => (
              <tr key={b.id}>
                <td><strong>{b.statut === 'active' ? <Link to={`/boutique/${b.slug}`}>{b.nom}</Link> : b.nom}</strong><br /><small>{b.description.slice(0, 70)}{b.description.length > 70 ? '…' : ''}</small></td>
                <td>{b.ville}</td>
                <td>{b.produits?.[0]?.count ?? 0}</td>
                <td>{formaterDate(b.cree_le)}</td>
                <td><Badge couleur={STATUTS[b.statut][1]}>{STATUTS[b.statut][0]}</Badge> {b.est_verifiee && <Badge couleur="bleu">Vérifiée</Badge>}</td>
                <td>
                  <div className={styles.actions}>
                    {b.statut !== 'active' && <Bouton taille="petit" onClick={() => action(b.id, { statut: 'active' }, `${b.nom} est active`)}>Valider</Bouton>}
                    {b.statut === 'active' && <Bouton variante="danger" taille="petit" onClick={() => action(b.id, { statut: 'suspendue' }, `${b.nom} est suspendue`)}>Suspendre</Bouton>}
                    {b.statut === 'active' && (
                      <Bouton variante="secondaire" taille="petit" onClick={() => action(b.id, { est_verifiee: !b.est_verifiee }, b.est_verifiee ? 'Badge retiré' : 'Badge vérifié accordé')}>
                        {b.est_verifiee ? 'Retirer le badge' : 'Vérifier'}
                      </Bouton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
