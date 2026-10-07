import { useRef } from 'react'
import CarteProduit from './CarteProduit'
import Icone from '../ui/Icone'
import { Squelette } from '../ui/divers'
import styles from './Produits.module.css'

export function CarteSquelette() {
  return (
    <div className={`${styles.carte} ${styles.carteSquelette}`} aria-hidden="true">
      <Squelette hauteur={0} style={{ aspectRatio: '1', height: 'auto', borderRadius: 0 }} />
      <div className={styles.corps}>
        <Squelette largeur="40%" hauteur={12} />
        <Squelette hauteur={16} />
        <Squelette largeur="70%" hauteur={16} />
        <Squelette largeur="50%" hauteur={22} style={{ marginTop: 10 }} />
      </div>
    </div>
  )
}

export default function GrilleProduits({ produits, chargement, nombreSquelettes = 8 }) {
  return (
    <div className={styles.grille} aria-busy={chargement || undefined}>
      {chargement
        ? Array.from({ length: nombreSquelettes }, (_, i) => <CarteSquelette key={i} />)
        : produits.map(p => <CarteProduit key={p.id} produit={p} />)}
    </div>
  )
}

export function CarrouselProduits({ titre, sousTitre, produits = [], chargement, action }) {
  const piste = useRef(null)
  const defiler = sens => piste.current?.scrollBy({ left: sens * piste.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section aria-label={titre}>
      <div className={styles.carrouselEntete}>
        <div><h2>{titre}</h2>{sousTitre && <p>{sousTitre}</p>}</div>
        <div className={styles.fleches}>
          {action}
          <button onClick={() => defiler(-1)} aria-label="Précédent"><Icone nom="flecheGauche" taille={18} /></button>
          <button onClick={() => defiler(1)} aria-label="Suivant"><Icone nom="fleche" taille={18} /></button>
        </div>
      </div>
      <div className={styles.piste} ref={piste} tabIndex={0}>
        {chargement ? Array.from({ length: 5 }, (_, i) => <CarteSquelette key={i} />) : produits.map(p => <CarteProduit key={p.id} produit={p} />)}
      </div>
    </section>
  )
}
