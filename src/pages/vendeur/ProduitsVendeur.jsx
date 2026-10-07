import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMaBoutique, useMutationVendeur, useProduitsVendeur, cles } from '../../hooks/requetes'
import { basculerProduitActif, supprimerProduit } from '../../api/vendeur'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { formaterPrix } from '../../lib/format'
import { urlImage } from '../../lib/images'
import Bouton from '../../composants/ui/Bouton'
import Icone from '../../composants/ui/Icone'
import { Badge, ChargementPage, EtatVide, Modale } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

export default function ProduitsVendeur() {
  const { data: boutique } = useMaBoutique()
  const { data: produits = [], isPending } = useProduitsVendeur(boutique?.id)
  const { notifier } = useNotifications()
  const [recherche, setRecherche] = useState('')
  const [aSupprimer, setASupprimer] = useState(null)
  const invalider = [cles.produitsVendeur(boutique?.id)]
  const basculer = useMutationVendeur(({ id, actif }) => basculerProduitActif(id, actif), invalider)
  const supprimer = useMutationVendeur(supprimerProduit, invalider)

  const filtres = useMemo(
    () => produits.filter(p => p.nom.toLowerCase().includes(recherche.toLowerCase())),
    [produits, recherche]
  )

  if (isPending) return <ChargementPage />
  return (
    <>
      <div className={styles.enteteContenu}>
        <h1>Mes produits ({produits.length})</h1>
        <Bouton vers="/vendeur/produits/nouveau"><Icone nom="plus" taille={18} /> Ajouter</Bouton>
      </div>
      {produits.length === 0 ? (
        <EtatVide icone="boite" titre="Aucun produit" action={<Bouton vers="/vendeur/produits/nouveau">Ajouter mon premier produit</Bouton>} />
      ) : (
        <>
          <div className={styles.filtresTableau}>
            <input type="search" placeholder="Rechercher dans mes produits…" aria-label="Rechercher dans mes produits" value={recherche} onChange={e => setRecherche(e.target.value)} />
          </div>
          <div className={styles.tableauDefilant}>
            <table className={styles.tableau}>
              <thead><tr><th>Produit</th><th>Prix</th><th>Stock</th><th>Ventes</th><th>Statut</th><th><span className="visuellement-cache">Actions</span></th></tr></thead>
              <tbody>
                {filtres.map(p => (
                  <tr key={p.id}>
                    <td><div className={styles.cellProduit}><img src={urlImage(p.images[0])} alt="" /><span><Link to={`/produit/${p.slug}`}>{p.nom}</Link><br /><small>{p.categorie?.nom}</small></span></div></td>
                    <td>{formaterPrix(p.prix)}</td>
                    <td>{p.stock < 5 ? <Badge couleur="rouge">{p.stock}</Badge> : p.stock}</td>
                    <td>{p.ventes}</td>
                    <td>
                      <Bouton variante={p.est_actif ? 'secondaire' : 'fantome'} taille="petit" onClick={() => basculer.mutate({ id: p.id, actif: !p.est_actif })} aria-pressed={p.est_actif}>
                        {p.est_actif ? 'En ligne' : 'Masqué'}
                      </Bouton>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Bouton vers={`/vendeur/produits/${p.id}`} variante="secondaire" taille="petit" aria-label={`Modifier ${p.nom}`}><Icone nom="crayon" taille={16} /></Bouton>
                        <Bouton variante="danger" taille="petit" onClick={() => setASupprimer(p)} aria-label={`Supprimer ${p.nom}`}><Icone nom="poubelle" taille={16} /></Bouton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Modale titre="Supprimer ce produit ?" ouverte={Boolean(aSupprimer)} onFermer={() => setASupprimer(null)}>
        <p>« {aSupprimer?.nom} » sera définitivement retiré de ta boutique.</p>
        <div className={styles.actions}>
          <Bouton variante="danger" chargement={supprimer.isPending} onClick={() => supprimer.mutate(aSupprimer.id, {
            onSuccess: () => { notifier('Produit supprimé'); setASupprimer(null) },
            onError: e => notifier(e.message, { type: 'erreur' })
          })}>Supprimer</Bouton>
          <Bouton variante="secondaire" onClick={() => setASupprimer(null)}>Annuler</Bouton>
        </div>
      </Modale>
    </>
  )
}
