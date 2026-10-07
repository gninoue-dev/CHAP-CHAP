import { memo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contextes/AuthContexte'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { usePanier } from '../../contextes/PanierContexte'
import { useBasculerFavori, useFavoris } from '../../hooks/requetes'
import { pourcentageRemise } from '../../lib/format'
import { urlImage } from '../../lib/images'
import Icone from '../ui/Icone'
import Prix from '../ui/Prix'
import { Etoiles } from '../ui/Etoiles'
import styles from './Produits.module.css'

export function BoutonFavori({ produit, enLigne = false }) {
  const { utilisateur } = useAuth()
  const { data: favoris = [] } = useFavoris()
  const basculer = useBasculerFavori()
  const naviguer = useNavigate()
  const { notifier } = useNotifications()
  const estFavori = favoris.some(f => f.id === produit.id)

  function surClic(e) {
    e.preventDefault()
    if (!utilisateur) {
      notifier('Connecte-toi pour garder tes favoris', { type: 'info', action: { libelle: 'Connexion', rappel: () => naviguer('/connexion') } })
      return
    }
    basculer.mutate({ produit, estFavori }, { onError: erreur => notifier(erreur.message, { type: 'erreur' }) })
  }

  return (
    <button
      className={`${styles.favori} ${estFavori ? styles.actif : ''} ${enLigne ? styles.favoriEnLigne : ''}`}
      onClick={surClic}
      aria-pressed={estFavori}
      aria-label={`${estFavori ? 'Retirer' : 'Ajouter'} « ${produit.nom} » ${estFavori ? 'des' : 'aux'} favoris`}
    >
      <Icone nom="coeur" plein={estFavori} />
    </button>
  )
}

function CarteProduit({ produit }) {
  const { ajouter } = usePanier()
  const { notifier } = useNotifications()
  const [ajoute, setAjoute] = useState(false)
  const remise = pourcentageRemise(produit.prix, produit.prix_barre)
  const epuise = produit.stock === 0

  function ajouterAuPanier() {
    ajouter(produit, 1)
    setAjoute(true)
    setTimeout(() => setAjoute(false), 1200)
    notifier(`« ${produit.nom} » ajouté au panier`)
  }

  return (
    <article className={styles.carte}>
      <div className={styles.visuel}>
        <img src={urlImage(produit.images?.[0])} alt="" loading="lazy" width="400" height="400" />
        <div className={styles.etiquettes}>
          {remise > 0 && <span className={styles.etiquettePromo}>-{remise} %</span>}
          {epuise && <span className={styles.etiquetteStock}>Épuisé</span>}
          {!epuise && produit.stock <= 5 && <span className={styles.etiquetteStock}>Plus que {produit.stock}</span>}
        </div>
        <BoutonFavori produit={produit} />
      </div>
      <div className={styles.corps}>
        {produit.boutique && (
          <Link className={styles.boutique} to={`/boutique/${produit.boutique.slug}`}>
            {produit.boutique.nom}{produit.boutique.est_verifiee && <Icone nom="verifie" taille={14} titre="Boutique vérifiée" />}
          </Link>
        )}
        <h3 className={styles.nom}><Link to={`/produit/${produit.slug}`}>{produit.nom}</Link></h3>
        {produit.nombre_avis > 0 && <Etoiles note={produit.note_moyenne} taille={14} nombreAvis={produit.nombre_avis} />}
        <div className={styles.pied}>
          <Prix prix={produit.prix} prixBarre={produit.prix_barre} taille="1.02rem" />
          <button
            className={`${styles.ajouter} ${ajoute ? styles.ajoute : ''}`}
            onClick={ajouterAuPanier}
            disabled={epuise}
            aria-label={epuise ? `${produit.nom} : épuisé` : `Ajouter « ${produit.nom} » au panier`}
          >
            <Icone nom={ajoute ? 'coche' : 'panier'} />
          </button>
        </div>
      </div>
    </article>
  )
}

// memo : la grille ne re-dessine pas toutes les cartes quand un seul état change
export default memo(CarteProduit)
