import { formaterPrix, LIVRAISON_OFFERTE_DES } from '../../lib/format'
import styles from '../../pages/Achat.module.css'

export default function Totaux({ sousTotal, livraison, total }) {
  const reste = LIVRAISON_OFFERTE_DES - sousTotal
  return (
    <>
      <dl className={styles.totaux}>
        <div><dt>Sous-total</dt><dd>{formaterPrix(sousTotal)}</dd></div>
        <div><dt>Livraison</dt><dd>{livraison === 0 ? <span className={styles.offerte}>Offerte</span> : formaterPrix(livraison)}</dd></div>
        <div className={styles.total}><dt>Total</dt><dd>{formaterPrix(total)}</dd></div>
      </dl>
      {reste > 0 && (
        <div>
          <p style={{ margin: '0 0 6px', fontSize: '.88rem' }}>Plus que <strong>{formaterPrix(reste)}</strong> pour la livraison offerte</p>
          <div className={styles.jauge}><span style={{ width: `${Math.min(100, (sousTotal / LIVRAISON_OFFERTE_DES) * 100)}%` }} /></div>
        </div>
      )}
    </>
  )
}
