import { Link } from 'react-router-dom'
import { usePanier } from '../../contextes/PanierContexte'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { useMesCommandes } from '../../hooks/requetes'
import { formaterDate, formaterPrix, STATUTS_COMMANDE } from '../../lib/format'
import { urlImage } from '../../lib/images'
import Bouton from '../../composants/ui/Bouton'
import { Badge, ChargementPage, EtatVide } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

export default function MesCommandes() {
  const { data: commandes = [], isPending } = useMesCommandes()
  const { ajouter } = usePanier()
  const { notifier } = useNotifications()

  function recommander(commande) {
    const disponibles = commande.lignes.filter(l => l.produit && l.produit.stock > 0)
    disponibles.forEach(l =>
      ajouter({ id: l.produit_id, nom: l.nom_produit, prix: l.produit.prix, images: l.produit.images, slug: l.produit.slug, stock: l.produit.stock }, l.quantite))
    notifier(disponibles.length ? 'Articles ajoutés au panier' : 'Ces articles ne sont plus disponibles', { type: disponibles.length ? 'succes' : 'erreur' })
  }

  if (isPending) return <ChargementPage />
  return (
    <>
      <h1>Mes commandes</h1>
      {commandes.length === 0 ? (
        <EtatVide icone="commande" titre="Aucune commande" action={<Bouton vers="/produits">Faire mes premiers achats</Bouton>}>Tes commandes apparaîtront ici.</EtatVide>
      ) : (
        <ul className={styles.commandes}>
          {commandes.map(c => (
            <li key={c.id} className={styles.commande}>
              <div className={styles.commandeEntete}>
                <div><strong>{c.numero}</strong><small>{formaterDate(c.cree_le, true)}</small></div>
                <Badge couleur={STATUTS_COMMANDE[c.statut].couleur}>{STATUTS_COMMANDE[c.statut].libelle}</Badge>
              </div>
              <div className={styles.vignettes}>
                {c.lignes.slice(0, 6).map(l => <img key={l.id} src={urlImage(l.image)} alt={l.nom_produit} title={`${l.quantite} × ${l.nom_produit}`} />)}
              </div>
              <div className={styles.commandePied}>
                <strong>{formaterPrix(c.total)} · {c.lignes.reduce((t, l) => t + l.quantite, 0)} article(s)</strong>
                <div className={styles.actions}>
                  <Bouton vers={`/commande/${c.numero}`} variante="secondaire" taille="petit">Suivre</Bouton>
                  <Bouton taille="petit" onClick={() => recommander(c)}>Recommander</Bouton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: 20, color: 'var(--texte-doux)' }}>Besoin d'aide ? <Link to="/produits">Continue tes achats</Link> ou contacte le vendeur depuis sa boutique.</p>
    </>
  )
}
