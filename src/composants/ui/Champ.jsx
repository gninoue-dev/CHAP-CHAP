import { forwardRef, useId } from 'react'
import styles from './ui.module.css'

// Champ compatible avec react-hook-form ({...register('nom')})
const Champ = forwardRef(function Champ({ libelle, erreur, aide, type = 'text', options, multiligne, className = '', ...props }, ref) {
  const id = useId()
  const idAide = `${id}-aide`
  const commun = {
    id,
    ref,
    className: styles.saisie,
    'aria-invalid': erreur ? true : undefined,
    'aria-describedby': erreur || aide ? idAide : undefined,
    ...props
  }
  return (
    <div className={`${styles.champ} ${erreur ? styles.invalide : ''} ${className}`}>
      <label htmlFor={id} className={styles.libelle}>{libelle}</label>
      {options ? (
        <select {...commun}>{options.map(o => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}</select>
      ) : multiligne ? (
        <textarea rows={4} {...commun} />
      ) : (
        <input type={type} {...commun} />
      )}
      <p id={idAide} className={erreur ? styles.erreur : styles.aide} role={erreur ? 'alert' : undefined}>{erreur || aide || ''}</p>
    </div>
  )
})

export default Champ
