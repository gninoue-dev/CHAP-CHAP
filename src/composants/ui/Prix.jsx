import { formaterPrix, pourcentageRemise } from '../../lib/format'
import styles from './ui.module.css'

export default function Prix({ prix, prixBarre, taille = '1.1rem' }) {
  const remise = pourcentageRemise(prix, prixBarre)
  return (
    <span className={styles.prix} style={{ fontSize: taille }}>
      <span className={styles.prixActuel}>{formaterPrix(prix)}</span>
      {remise > 0 && (
        <>
          <span className={styles.prixBarre}><span className="visuellement-cache">au lieu de </span>{formaterPrix(prixBarre)}</span>
          <span className={styles.remise}>-{remise} %</span>
        </>
      )}
    </span>
  )
}
