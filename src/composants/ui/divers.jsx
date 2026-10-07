import { Component, useEffect, useRef } from 'react'
import Icone from './Icone'
import Bouton from './Bouton'
import styles from './ui.module.css'

export function Badge({ couleur = 'gris', children }) {
  return <span className={`${styles.badge} ${styles[`badge-${couleur}`]}`}>{children}</span>
}

export function Squelette({ largeur = '100%', hauteur = 16, rond, style }) {
  return <span className={styles.squelette} style={{ display: 'block', width: largeur, height: hauteur, borderRadius: rond ? '50%' : undefined, ...style }} aria-hidden="true" />
}

export function EtatVide({ icone = 'boite', titre, children, action }) {
  return (
    <div className={styles.etatVide}>
      <span className={styles.etatVideIcone}><Icone nom={icone} /></span>
      <h2>{titre}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function ChargementPage() {
  return <div className={styles.chargementPage} role="status"><span className={styles.anneau} /><span className="visuellement-cache">Chargement…</span></div>
}

export function Quantite({ valeur, onChange, max = 99, min = 1, libelle = 'Quantité' }) {
  return (
    <div className={styles.quantite} role="group" aria-label={libelle}>
      <button type="button" onClick={() => onChange(valeur - 1)} disabled={valeur <= min} aria-label="Diminuer"><Icone nom={valeur <= 1 && min === 0 ? 'poubelle' : 'moins'} taille={16} /></button>
      <output aria-live="polite">{valeur}</output>
      <button type="button" onClick={() => onChange(valeur + 1)} disabled={valeur >= max} aria-label="Augmenter"><Icone nom="plus" taille={16} /></button>
    </div>
  )
}

export function Pagination({ page, total, parPage, onChange }) {
  const pages = Math.ceil(total / parPage)
  if (pages <= 1) return null
  const visibles = Array.from({ length: pages }, (_, i) => i + 1).filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Page précédente"><Icone nom="flecheGauche" taille={16} /></button>
      {visibles.map((p, i) => (
        <span key={p} style={{ display: 'contents' }}>
          {i > 0 && p - visibles[i - 1] > 1 && <span aria-hidden="true">…</span>}
          <button onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>{p}</button>
        </span>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pages} aria-label="Page suivante"><Icone nom="fleche" taille={16} /></button>
    </nav>
  )
}

// Fenêtre modale accessible : focus piégé, Échap pour fermer, retour du focus
export function Modale({ titre, ouverte, onFermer, children }) {
  const boite = useRef(null)
  useEffect(() => {
    if (!ouverte) return undefined
    const precedent = document.activeElement
    const focusables = () => [...boite.current.querySelectorAll('button, a[href], input, select, textarea')].filter(e => !e.disabled)
    focusables()[1]?.focus()
    const surTouche = e => {
      if (e.key === 'Escape') onFermer()
      if (e.key === 'Tab') {
        const liste = focusables()
        if (e.shiftKey && document.activeElement === liste[0]) { e.preventDefault(); liste.at(-1).focus() }
        else if (!e.shiftKey && document.activeElement === liste.at(-1)) { e.preventDefault(); liste[0].focus() }
      }
    }
    document.addEventListener('keydown', surTouche)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', surTouche)
      document.body.style.overflow = ''
      precedent?.focus()
    }
  }, [ouverte, onFermer])

  if (!ouverte) return null
  return (
    <div className={styles.fondModale} onMouseDown={e => e.target === e.currentTarget && onFermer()}>
      <div className={styles.modale} role="dialog" aria-modal="true" aria-label={titre} ref={boite}>
        <Bouton variante="fantome" taille="petit" className={styles.fermerModale} onClick={onFermer} aria-label="Fermer"><Icone nom="fermer" /></Bouton>
        <h2>{titre}</h2>
        {children}
      </div>
    </div>
  )
}

// Attrape les erreurs de rendu pour ne pas afficher une page blanche
export class FrontiereErreur extends Component {
  state = { erreur: null }
  static getDerivedStateFromError(erreur) { return { erreur } }
  componentDidCatch(erreur, infos) { console.error(erreur, infos) }
  render() {
    if (!this.state.erreur) return this.props.children
    return (
      <EtatVide icone="alerte" titre="Oups, quelque chose s'est mal passé" action={<Bouton onClick={() => window.location.reload()}>Recharger la page</Bouton>}>
        {this.state.erreur.message}
      </EtatVide>
    )
  }
}
