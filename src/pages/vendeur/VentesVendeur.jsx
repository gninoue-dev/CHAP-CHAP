import { useMemo, useState } from 'react'
import { cles, useMaBoutique, useMutationVendeur, useVentesVendeur } from '../../hooks/requetes'
import { changerStatutLigne } from '../../api/vendeur'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { formaterDate, formaterPrix } from '../../lib/format'
import { urlImage } from '../../lib/images'
import { Badge, ChargementPage, EtatVide } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

const STATUTS = { en_preparation: ['En préparation', 'orange'], expediee: ['Expédiée', 'violet'], livree: ['Livrée', 'vert'], annulee: ['Annulée', 'rouge'] }

export default function VentesVendeur() {
  const { data: boutique } = useMaBoutique()
  const { data: lignes = [], isPending } = useVentesVendeur(boutique?.id)
  const { notifier } = useNotifications()
  const [filtre, setFiltre] = useState('en_preparation')
  const changer = useMutationVendeur(({ id, statut }) => changerStatutLigne(id, statut), [cles.ventesVendeur(boutique?.id)])

  const affichees = useMemo(() => (filtre ? lignes.filter(l => l.statut === filtre) : lignes), [lignes, filtre])
  if (isPending) return <ChargementPage />

  return (
    <>
      <h1>Ventes à traiter</h1>
      <div className={styles.filtresTableau}>
        <label className="visuellement-cache" htmlFor="filtreStatut">Filtrer par statut</label>
        <select id="filtreStatut" value={filtre} onChange={e => setFiltre(e.target.value)}>
          <option value="">Toutes ({lignes.length})</option>
          {Object.entries(STATUTS).map(([cle, [libelle]]) => <option key={cle} value={cle}>{libelle} ({lignes.filter(l => l.statut === cle).length})</option>)}
        </select>
      </div>
      {affichees.length === 0 ? <EtatVide icone="commande" titre="Rien à traiter">Aucune vente avec ce statut.</EtatVide> : (
        <div className={styles.tableauDefilant}>
          <table className={styles.tableau}>
            <thead><tr><th>Commande</th><th>Article</th><th>Client</th><th>Montant</th><th>Statut</th></tr></thead>
            <tbody>
              {affichees.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.commande.numero}</strong><br /><small>{formaterDate(l.commande.cree_le, true)}</small></td>
                  <td><div className={styles.cellProduit}><img src={urlImage(l.image)} alt="" /><span>{l.quantite} × {l.nom_produit}</span></div></td>
                  <td>{l.commande.adresse.nomComplet}<br /><small>{l.commande.adresse.telephone} · {l.commande.adresse.quartier}</small></td>
                  <td>{formaterPrix(l.prix_unitaire * l.quantite)}</td>
                  <td>
                    <label className="visuellement-cache" htmlFor={`statut-${l.id}`}>Statut de {l.nom_produit}</label>
                    <select id={`statut-${l.id}`} value={l.statut} disabled={changer.isPending}
                      onChange={e => changer.mutate({ id: l.id, statut: e.target.value }, { onSuccess: () => notifier('Statut mis à jour'), onError: er => notifier(er.message, { type: 'erreur' }) })}>
                      {Object.entries(STATUTS).map(([cle, [libelle]]) => <option key={cle} value={cle}>{libelle}</option>)}
                    </select>
                    {' '}<Badge couleur={STATUTS[l.statut][1]}>{STATUTS[l.statut][0]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
