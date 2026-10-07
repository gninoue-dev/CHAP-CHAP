import { useState } from 'react'
import Icone from './Icone'
import styles from './ui.module.css'

export function Etoiles({ note = 0, taille = 16, nombreAvis }) {
  return (
    <span className={styles.etoiles} style={{ '--taille': `${taille}px` }} role="img" aria-label={`Note : ${Number(note).toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Icone key={i} nom="etoile" taille={taille} plein={note >= i - 0.25} className={note >= i - 0.25 ? '' : styles.etoileVide} />
      ))}
      {nombreAvis !== undefined && <small style={{ color: 'var(--texte-doux)', marginLeft: 4 }}>({nombreAvis})</small>}
    </span>
  )
}

export function EtoilesInteractives({ valeur, onChange, taille = 30 }) {
  const [survol, setSurvol] = useState(0)
  const affichee = survol || valeur
  const libelles = ['Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent']
  return (
    <div className={`${styles.etoiles} ${styles.etoilesInteractives}`} role="radiogroup" aria-label="Ta note" onMouseLeave={() => setSurvol(0)}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={valeur === i}
          aria-label={`${i} étoile${i > 1 ? 's' : ''} : ${libelles[i - 1]}`}
          className={affichee >= i ? 'allumee' : ''}
          onMouseEnter={() => setSurvol(i)}
          onClick={() => onChange(i)}
        >
          <Icone nom="etoile" taille={taille} plein={affichee >= i} />
        </button>
      ))}
      <span style={{ marginLeft: 8, color: 'var(--texte-doux)', fontWeight: 600 }}>{affichee ? libelles[affichee - 1] : ''}</span>
    </div>
  )
}
