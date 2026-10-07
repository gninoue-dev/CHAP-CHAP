import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { usePanier } from '../../contextes/PanierContexte'
import { formaterPrix, LIVRAISON_OFFERTE_DES } from '../../lib/format'
import { urlImage } from '../../lib/images'
import Bouton from '../ui/Bouton'
import Icone from '../ui/Icone'
import { EtatVide, Quantite } from '../ui/divers'
import styles from '../mise-en-page/MiseEnPage.module.css'

export default function TiroirPanier({ ouvert, onFermer }) {
  const { lignes, sousTotal, changerQuantite } = usePanier()
  const boutonFermer = useRef(null)

  useEffect(() => {
    if (!ouvert) return undefined
    const precedent = document.activeElement
    boutonFermer.current?.focus()
    const surTouche = e => { if (e.key === 'Escape') onFermer() }
    document.addEventListener('keydown', surTouche)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', surTouche); document.body.style.overflow = ''; precedent?.focus() }
  }, [ouvert, onFermer])

  if (!ouvert) return null
  const reste = LIVRAISON_OFFERTE_DES - sousTotal
  return (
    <>
      <div className={styles.fondTiroir} onClick={onFermer} aria-hidden="true" />
      <aside className={styles.tiroir} role="dialog" aria-modal="true" aria-labelledby="titreTiroir">
        <div className={styles.tiroirEntete}>
          <h2 id="titreTiroir">Mon panier</h2>
          <Bouton variante="fantome" taille="petit" onClick={onFermer} ref={boutonFermer} aria-label="Fermer le panier"><Icone nom="fermer" /></Bouton>
        </div>
        {lignes.length === 0 ? (
          <EtatVide icone="panier" titre="Ton panier est vide" action={<Bouton vers="/produits" onClick={onFermer}>Découvrir les produits</Bouton>}>
            Des milliers d'articles t'attendent, livrés chap chap.
          </EtatVide>
        ) : (
          <>
            <ul className={styles.tiroirLignes}>
              {lignes.map(l => (
                <li key={l.id} className={styles.tiroirLigne}>
                  <img src={urlImage(l.image)} alt="" />
                  <div>
                    <Link to={`/produit/${l.slug}`} onClick={onFermer}>{l.nom}</Link>
                    <small>{l.boutique}</small>
                    <span className={styles.montant}>{formaterPrix(l.prix * l.quantite)}</span>
                  </div>
                  <Quantite valeur={l.quantite} min={0} max={l.stock} onChange={q => changerQuantite(l.id, q)} libelle={`Quantité de ${l.nom}`} />
                </li>
              ))}
            </ul>
            <div className={styles.tiroirPied}>
              <p style={{ margin: 0, fontSize: '.9rem' }}>
                {reste > 0 ? <>Plus que <strong>{formaterPrix(reste)}</strong> pour la livraison offerte</> : <><Icone nom="cadeau" taille={16} /> Livraison offerte !</>}
              </p>
              <div className={styles.jauge}><span style={{ width: `${Math.min(100, (sousTotal / LIVRAISON_OFFERTE_DES) * 100)}%` }} /></div>
              <p className={styles.ligneTotal}><span>Sous-total</span><strong>{formaterPrix(sousTotal)}</strong></p>
              <Bouton vers="/commande" onClick={onFermer} large taille="grand">Commander <Icone nom="fleche" taille={18} /></Bouton>
              <Bouton vers="/panier" onClick={onFermer} variante="secondaire" large>Voir le panier</Bouton>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
