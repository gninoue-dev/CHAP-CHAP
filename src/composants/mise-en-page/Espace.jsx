import { NavLink, Outlet } from 'react-router-dom'
import Icone from '../ui/Icone'
import styles from './Espace.module.css'

// Mise en page commune : espace client, espace vendeur, administration
export default function Espace({ titre, sousTitre, initiales, couleur, liens }) {
  return (
    <div className={`conteneur page ${styles.espace}`}>
      <nav className={styles.menu} aria-label={titre} style={{ '--accent': couleur }}>
        <div className={styles.menuEntete}>
          <span>{initiales}</span>
          <span><strong>{titre}</strong><small>{sousTitre}</small></span>
        </div>
        <ul>
          {liens.map(l => (
            <li key={l.vers}><NavLink to={l.vers} end={l.exact}><Icone nom={l.icone} taille={18} /> {l.libelle}</NavLink></li>
          ))}
        </ul>
      </nav>
      <section className={styles.contenu}><Outlet /></section>
    </div>
  )
}
