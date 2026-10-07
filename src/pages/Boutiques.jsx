import { Link } from 'react-router-dom'
import { useBoutiques } from '../hooks/requetes'
import Icone from '../composants/ui/Icone'
import { ChargementPage } from '../composants/ui/divers'
import styles from './Accueil.module.css'

export default function Boutiques() {
  const { data: boutiques = [], isPending } = useBoutiques()
  if (isPending) return <ChargementPage />
  return (
    <div className="conteneur page">
      <h1 className="titre-page">Nos boutiques</h1>
      <div className={styles.boutiques}>
        {boutiques.map(b => (
          <Link key={b.id} to={`/boutique/${b.slug}`} className={styles.carteBoutique}>
            <span className={styles.monogramme} style={{ '--couleur': b.couleur }}>{b.nom.slice(0, 2).toUpperCase()}</span>
            <span>
              <strong>{b.nom}{b.est_verifiee && <Icone nom="verifie" taille={16} titre="Boutique vérifiée" />}</strong>
              <small>{b.ville} · {b.produits?.[0]?.count ?? 0} produits</small>
              <small style={{ display: 'block', marginTop: 4 }}>{b.description}</small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
