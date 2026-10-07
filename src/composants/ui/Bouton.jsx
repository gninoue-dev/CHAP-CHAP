import { Link } from 'react-router-dom'
import styles from './ui.module.css'

// Un seul composant pour <button> et les liens qui ressemblent à des boutons
export default function Bouton({ variante = 'principal', taille, large, chargement, vers, children, className = '', ...props }) {
  const classes = [styles.bouton, styles[variante], taille && styles[taille], large && styles.large, className].filter(Boolean).join(' ')
  const contenu = <>{chargement && <span className={styles.tournant} aria-hidden="true" />}{children}</>
  if (vers) return <Link to={vers} className={classes} {...props}>{contenu}</Link>
  return (
    <button className={classes} disabled={chargement || props.disabled} aria-busy={chargement || undefined} {...props}>
      {contenu}
    </button>
  )
}
