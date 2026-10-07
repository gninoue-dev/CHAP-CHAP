import { Link } from 'react-router-dom'
import { usePanier } from '../contextes/PanierContexte'
import { useNotifications } from '../contextes/NotificationsContexte'
import { formaterPrix } from '../lib/format'
import { urlImage } from '../lib/images'
import Totaux from '../composants/panier/Totaux'
import Bouton from '../composants/ui/Bouton'
import Icone from '../composants/ui/Icone'
import { EtatVide, Quantite } from '../composants/ui/divers'
import styles from './Achat.module.css'

export default function Panier() {
  const { lignes, nombreArticles, sousTotal, livraison, total, changerQuantite, retirer, restaurer, vider } = usePanier()
  const { notifier } = useNotifications()

  // suppression avec possibilité d'annuler
  function supprimer(ligne) {
    const sauvegarde = lignes
    retirer(ligne.id)
    notifier(`« ${ligne.nom} » retiré`, { action: { libelle: 'Annuler', rappel: () => restaurer(sauvegarde) } })
  }

  function toutVider() {
    const sauvegarde = lignes
    vider()
    notifier('Panier vidé', { action: { libelle: 'Annuler', rappel: () => restaurer(sauvegarde) } })
  }

  if (!lignes.length) {
    return (
      <div className="conteneur page">
        <EtatVide icone="panier" titre="Ton panier est vide" action={<Bouton vers="/produits">Commencer mes achats</Bouton>}>
          Parcours les rayons et ajoute ce qui te fait plaisir.
        </EtatVide>
      </div>
    )
  }

  return (
    <div className="conteneur page">
      <h1 className="titre-page">Mon panier <small style={{ color: 'var(--texte-doux)', fontSize: '1rem' }}>({nombreArticles} article{nombreArticles > 1 ? 's' : ''})</small></h1>
      <div className={styles.grille}>
        <section className={styles.carte} aria-label="Articles">
          <ul className={styles.lignes}>
            {lignes.map(l => (
              <li key={l.id} className={styles.ligne}>
                <img src={urlImage(l.image)} alt="" />
                <div>
                  <h3><Link to={`/produit/${l.slug}`}>{l.nom}</Link></h3>
                  <small>Vendu par {l.boutique}</small>
                  <small>{formaterPrix(l.prix)} l'unité</small>
                </div>
                <div><Quantite valeur={l.quantite} max={l.stock} onChange={q => changerQuantite(l.id, q)} libelle={`Quantité de ${l.nom}`} /></div>
                <p className={styles.montant}>{formaterPrix(l.prix * l.quantite)}</p>
                <Bouton variante="fantome" taille="petit" onClick={() => supprimer(l)} aria-label={`Retirer ${l.nom}`}><Icone nom="poubelle" taille={18} /></Bouton>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 10 }}>
            <Bouton vers="/produits" variante="secondaire"><Icone nom="flecheGauche" taille={18} /> Continuer mes achats</Bouton>
            <Bouton variante="danger" onClick={toutVider}><Icone nom="poubelle" taille={18} /> Vider le panier</Bouton>
          </div>
        </section>
        <aside className={`${styles.carte} ${styles.resume}`} aria-label="Résumé">
          <h2>Résumé</h2>
          <Totaux sousTotal={sousTotal} livraison={livraison} total={total} />
          <Bouton vers="/commande" taille="grand" large><Icone nom="bouclier" taille={18} /> Passer la commande</Bouton>
          <p className={styles.encart}><Icone nom="carte" taille={18} /> Orange Money, MTN, Wave, Moov, carte ou espèces.</p>
        </aside>
      </div>
    </div>
  )
}
