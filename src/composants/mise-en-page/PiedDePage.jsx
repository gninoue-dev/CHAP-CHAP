import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/requetes'
import { PAIEMENTS } from '../../lib/format'
import Icone from '../ui/Icone'
import styles from './MiseEnPage.module.css'

const ANNEE = new Date().getFullYear()

const ATOUTS = [
  { icone: 'camion', titre: 'Livraison chap chap', texte: 'En 24 h à Abidjan' },
  { icone: 'bouclier', titre: 'Paiement sécurisé', texte: 'Mobile Money et carte' },
  { icone: 'retour', titre: 'Retours faciles', texte: '7 jours pour changer d\'avis' },
  { icone: 'verifie', titre: 'Vendeurs vérifiés', texte: 'Boutiques contrôlées' }
]

export default function PiedDePage() {
  const { data: categories = [] } = useCategories()
  return (
    <footer className={styles.pied}>
      <div className="conteneur">
        <div className={styles.atouts}>
          {ATOUTS.map(a => (
            <div key={a.titre} className={styles.atout}><Icone nom={a.icone} taille={28} /><span><strong>{a.titre}</strong><small>{a.texte}</small></span></div>
          ))}
        </div>
        <div className={styles.piedGrille}>
          <div className={styles.piedMarque}>
            <h2>CHAP CHAP</h2>
            <p>La marketplace ivoirienne : des centaines de vendeurs, un seul panier, livré chap chap.</p>
            <div className={styles.piedPaiements}>{PAIEMENTS.map(p => <span key={p.id}>{p.nom}</span>)}</div>
          </div>
          <div>
            <h2>Rayons</h2>
            <ul>{categories.slice(0, 6).map(c => <li key={c.id}><Link to={`/categorie/${c.slug}`}>{c.nom}</Link></li>)}</ul>
          </div>
          <div>
            <h2>Mon compte</h2>
            <ul>
              <li><Link to="/compte">Mes commandes</Link></li>
              <li><Link to="/compte/favoris">Mes favoris</Link></li>
              <li><Link to="/panier">Mon panier</Link></li>
            </ul>
          </div>
          <div>
            <h2>Vendre</h2>
            <ul>
              <li><Link to="/devenir-vendeur">Ouvrir ma boutique</Link></li>
              <li><Link to="/boutiques">Toutes les boutiques</Link></li>
              <li><Link to="/vendeur">Espace vendeur</Link></li>
              <li><Link to="/credits">Crédits photos</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <p className={styles.piedBas}>© {ANNEE} CHAP CHAP · DEV-GNINOUE · Projet de démonstration React + Supabase</p>
    </footer>
  )
}
