import { Link, useLocation, useParams } from 'react-router-dom'
import { useCommande } from '../hooks/requetes'
import { formaterDate, formaterPrix, PAIEMENTS } from '../lib/format'
import { urlImage } from '../lib/images'
import Bouton from '../composants/ui/Bouton'
import Icone from '../composants/ui/Icone'
import { Badge, ChargementPage, EtatVide } from '../composants/ui/divers'
import styles from './Achat.module.css'

const ETAPES = [
  { statut: 'payee', nom: 'Payée', icone: 'verifie' },
  { statut: 'en_preparation', nom: 'En préparation', icone: 'boite' },
  { statut: 'expediee', nom: 'Expédiée', icone: 'camion' },
  { statut: 'livree', nom: 'Livrée', icone: 'home' }
]

export default function Confirmation() {
  const { numero } = useParams()
  const { state } = useLocation()
  const { data: commande, isPending, isError } = useCommande(numero)

  if (isPending) return <ChargementPage />
  if (isError) return <div className="conteneur page"><EtatVide icone="recherche" titre="Commande introuvable" action={<Bouton vers="/compte">Mes commandes</Bouton>} /></div>

  const indexEtape = Math.max(0, ETAPES.findIndex(e => e.statut === commande.statut))
  const paiement = PAIEMENTS.find(p => p.id === commande.paiement)

  return (
    <div className={`conteneur page ${styles.confirmation}`}>
      {state?.nouvelle ? (
        <div className={styles.merci}>
          <div className={styles.coche}><Icone nom="coche" taille={42} /></div>
          <h1>Merci, c'est commandé !</h1>
          <p>Ta commande <strong>{commande.numero}</strong> est enregistrée. Les vendeurs la préparent chap chap.</p>
        </div>
      ) : (
        <h1 className="titre-page">Commande {commande.numero}</h1>
      )}

      <section className={styles.carte} aria-label="Suivi">
        {commande.statut === 'annulee' ? (
          <p className={styles.erreurServeur}>Cette commande a été annulée.</p>
        ) : (
          <ol className={styles.frise}>
            {ETAPES.map((e, i) => (
              <li key={e.statut} className={i < indexEtape ? styles.faite : i === indexEtape ? styles.encours : ''} aria-current={i === indexEtape ? 'step' : undefined}>
                <span><Icone nom={e.icone} taille={22} /></span>{e.nom}
              </li>
            ))}
          </ol>
        )}
        <p style={{ color: 'var(--texte-doux)', textAlign: 'center' }}>Passée le {formaterDate(commande.cree_le, true)} · {paiement?.nom}</p>
      </section>

      <div className={styles.grille} style={{ marginTop: 20 }}>
        <section className={styles.carte} aria-label="Articles">
          <h2>Articles</h2>
          {commande.lignes.map(l => (
            <div key={l.id} className={styles.miniLigne}>
              <img src={urlImage(l.image)} alt="" />
              <span>{l.quantite} × {l.nom_produit}<br /><small style={{ color: 'var(--texte-doux)' }}>{l.boutique?.nom}</small></span>
              <Badge couleur={l.statut === 'livree' ? 'vert' : l.statut === 'expediee' ? 'violet' : l.statut === 'annulee' ? 'rouge' : 'orange'}>
                {{ en_preparation: 'En préparation', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' }[l.statut]}
              </Badge>
              <strong>{formaterPrix(l.prix_unitaire * l.quantite)}</strong>
            </div>
          ))}
        </section>
        <aside className={styles.carte}>
          <h2>Livraison</h2>
          <p style={{ margin: 0 }}><strong>{commande.adresse.nomComplet}</strong><br />{commande.adresse.telephone}<br />{commande.adresse.quartier}, {commande.adresse.ville}<br /><small>{commande.adresse.details}</small></p>
          <dl className={styles.totaux} style={{ marginTop: 16 }}>
            <div><dt>Sous-total</dt><dd>{formaterPrix(commande.sous_total)}</dd></div>
            <div><dt>Livraison</dt><dd>{commande.frais_livraison ? formaterPrix(commande.frais_livraison) : 'Offerte'}</dd></div>
            <div className={styles.total}><dt>Total</dt><dd>{formaterPrix(commande.total)}</dd></div>
          </dl>
        </aside>
      </div>
      <p style={{ textAlign: 'center', marginTop: 24 }}><Link to="/compte">Voir toutes mes commandes</Link> · <Link to="/produits">Continuer mes achats</Link></p>
    </div>
  )
}
