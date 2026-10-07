import { Fragment, useState } from 'react'
import { useAdminCommandes, useMutationAdmin } from '../../hooks/requetes'
import { annulerCommande } from '../../api/admin'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { formaterDate, formaterPrix, PAIEMENTS, STATUTS_COMMANDE } from '../../lib/format'
import Bouton from '../../composants/ui/Bouton'
import { Badge, ChargementPage, EtatVide } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

export default function CommandesAdmin() {
  const { data: commandes = [], isPending } = useAdminCommandes()
  const { notifier } = useNotifications()
  const [ouverte, setOuverte] = useState(null)
  const annuler = useMutationAdmin(annulerCommande)

  if (isPending) return <ChargementPage />
  if (!commandes.length) return <><h1>Commandes</h1><EtatVide icone="commande" titre="Aucune commande pour l'instant" /></>
  return (
    <>
      <h1>Commandes ({commandes.length})</h1>
      <div className={styles.tableauDefilant}>
        <table className={styles.tableau}>
          <thead><tr><th>Numéro</th><th>Date</th><th>Client</th><th>Paiement</th><th>Total</th><th>Statut</th><th /></tr></thead>
          <tbody>
            {commandes.map(c => (
              <Fragment key={c.id}>
                <tr>
                  <td><strong>{c.numero}</strong></td>
                  <td>{formaterDate(c.cree_le, true)}</td>
                  <td>{c.adresse.nomComplet}<br /><small>{c.adresse.quartier}, {c.adresse.ville}</small></td>
                  <td>{PAIEMENTS.find(p => p.id === c.paiement)?.nom}</td>
                  <td>{formaterPrix(c.total)}</td>
                  <td><Badge couleur={STATUTS_COMMANDE[c.statut].couleur}>{STATUTS_COMMANDE[c.statut].libelle}</Badge></td>
                  <td>
                    <div className={styles.actions}>
                      <Bouton variante="secondaire" taille="petit" aria-expanded={ouverte === c.id} onClick={() => setOuverte(o => (o === c.id ? null : c.id))}>Détails</Bouton>
                      {!['annulee', 'livree'].includes(c.statut) && (
                        <Bouton variante="danger" taille="petit" onClick={() => annuler.mutate(c.id, { onSuccess: () => notifier(`Commande ${c.numero} annulée`) })}>Annuler</Bouton>
                      )}
                    </div>
                  </td>
                </tr>
                {ouverte === c.id && (
                  <tr>
                    <td colSpan={7} style={{ background: 'var(--surface-2)' }}>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {c.lignes.map(l => <li key={l.id}>{l.quantite} × {l.nom_produit} ({l.boutique?.nom}) : {formaterPrix(l.prix_unitaire * l.quantite)} · {l.statut}</li>)}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
