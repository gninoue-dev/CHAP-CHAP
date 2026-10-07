import { lazy, Suspense, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBoutiques, useCategories, useProduitsPromo, useProduitsVedettes } from '../hooks/requetes'
import { useCompteARebours } from '../hooks/useCompteARebours'
import { useMouvementReduit } from '../hooks/useMouvementReduit'
import { webglDisponible } from '../lib/webgl'
import { urlImage } from '../lib/images'
import { CarrouselProduits } from '../composants/produits/GrilleProduits'
import Bouton from '../composants/ui/Bouton'
import Icone from '../composants/ui/Icone'
import styles from './Accueil.module.css'

// la 3D (three.js) n'est téléchargée que si le navigateur sait l'afficher
const SceneBoutique3D = lazy(() => import('../composants/trois-d/SceneBoutique3D'))

// photo représentative de chaque rayon (dossier public/produits)
const IMAGES_CATEGORIES = {
  telephones: 'produits/smartphone-1.jpg',
  informatique: 'produits/laptop-1.jpg',
  'mode-femme': 'produits/robe-wax.jpg',
  'mode-homme': 'produits/chemise-wax.jpg',
  maison: 'produits/blender.jpg',
  beaute: 'produits/karite.jpg',
  sport: 'produits/ballon.jpg',
  epicerie: 'produits/cacao.jpg'
}

function Vitrine({ categories }) {
  const naviguer = useNavigate()
  const mouvementReduit = useMouvementReduit()
  const avec3D = useMemo(() => webglDisponible(), [])
  const cartes = categories.map(c => ({ ...c, image: IMAGES_CATEGORIES[c.slug] }))

  const secours = (
    <div className={styles.sceneSecours}>
      {cartes.slice(0, 6).map(c => (
        <Link key={c.slug} to={`/categorie/${c.slug}`} aria-label={c.nom}><img src={urlImage(c.image)} alt="" /></Link>
      ))}
    </div>
  )
  if (!avec3D || !cartes.length) return <div className={styles.scene}>{secours}</div>
  return (
    <div className={styles.scene}>
      <Suspense fallback={secours}>
        <SceneBoutique3D categories={cartes} animation={!mouvementReduit} onChoisir={c => naviguer(`/categorie/${c.slug}`)} />
      </Suspense>
      <p className={styles.indiceScene}>Bouge la souris, clique sur un rayon</p>
    </div>
  )
}

function Compteur() {
  const { heures, minutes, secondes } = useCompteARebours()
  const deux = n => String(n).padStart(2, '0')
  return (
    <span className={styles.compteur} role="timer" aria-label={`Se termine dans ${heures} heures et ${minutes} minutes`}>
      <span>{deux(heures)}</span>:<span>{deux(minutes)}</span>:<span>{deux(secondes)}</span>
    </span>
  )
}

export default function Accueil() {
  const { data: categories = [] } = useCategories()
  const vedettes = useProduitsVedettes()
  const promos = useProduitsPromo()
  const { data: boutiques = [] } = useBoutiques()
  const totalProduits = categories.reduce((t, c) => t + (c.produits?.[0]?.count ?? 0), 0)

  return (
    <>
      <section className={styles.hero}>
        <div className={`conteneur ${styles.heroGrille}`}>
          <div className={styles.heroTexte}>
            <p className={styles.surTitre}><Icone nom="eclair" taille={16} plein /> Livré en 24 h partout à Abidjan</p>
            <h1>Tout ce que tu veux, <em>chap chap</em>.</h1>
            <p>High-tech, mode wax, maison, beauté, sport et épicerie du pays : des vendeurs ivoiriens vérifiés, un seul panier, paiement Mobile Money.</p>
            <div className={styles.heroActions}>
              <Bouton vers="/produits" taille="grand">Découvrir les produits <Icone nom="fleche" taille={18} /></Bouton>
              <Bouton vers="/devenir-vendeur" variante="secondaire" taille="grand">Vendre sur CHAP CHAP</Bouton>
            </div>
            <ul className={styles.chiffres}>
              <li><strong>{totalProduits || '…'}</strong><span>produits</span></li>
              <li><strong>{boutiques.length || '…'}</strong><span>boutiques vérifiées</span></li>
              <li><strong>{categories.length || '…'}</strong><span>rayons</span></li>
            </ul>
          </div>
          <Vitrine categories={categories} />
        </div>
      </section>

      <section className={`conteneur ${styles.section}`} aria-labelledby="titreRayons">
        <h2 className={styles.titreSection} id="titreRayons">Nos rayons</h2>
        <div className={styles.categories}>
          {categories.map(c => (
            <Link key={c.id} to={`/categorie/${c.slug}`} className={styles.categorie} style={{ '--couleur': c.couleur }}>
              <span className={styles.categorieIcone}><Icone nom={c.icone} taille={26} /></span>
              {c.nom}
              <small>{c.produits?.[0]?.count ?? 0} articles</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={`conteneur ${styles.section}`}>
        <div className={styles.flash}>
          <CarrouselProduits
            titre="Ventes flash du jour"
            sousTitre="Les meilleures remises, jusqu'à minuit"
            produits={promos.data}
            chargement={promos.isPending}
            action={<Compteur />}
          />
        </div>
      </section>

      <section className={`conteneur ${styles.section}`}>
        <CarrouselProduits
          titre="Les plus vendus"
          sousTitre="Ce que tout Abidjan achète en ce moment"
          produits={vedettes.data}
          chargement={vedettes.isPending}
          action={<Bouton vers="/produits" variante="secondaire" taille="petit">Tout voir</Bouton>}
        />
      </section>

      <section className={`conteneur ${styles.section}`} aria-labelledby="titreBoutiques">
        <h2 className={styles.titreSection} id="titreBoutiques">Boutiques à la une</h2>
        <div className={styles.boutiques}>
          {boutiques.map(b => (
            <Link key={b.id} to={`/boutique/${b.slug}`} className={styles.carteBoutique}>
              <span className={styles.monogramme} style={{ '--couleur': b.couleur }}>{b.nom.slice(0, 2).toUpperCase()}</span>
              <span>
                <strong>{b.nom}{b.est_verifiee && <Icone nom="verifie" taille={16} titre="Boutique vérifiée" />}</strong>
                <small>{b.ville} · {b.produits?.[0]?.count ?? 0} produits</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`conteneur ${styles.section}`}>
        <div className={styles.banniereVendeur}>
          <div>
            <h2>Tu as quelque chose à vendre ?</h2>
            <p>Ouvre ta boutique en 2 minutes et touche des milliers de clients en Côte d'Ivoire.</p>
            <Bouton vers="/devenir-vendeur" variante="sombre" taille="grand">Ouvrir ma boutique</Bouton>
          </div>
          <ul>
            <li><Icone nom="coche" /> Aucun frais d'inscription</li>
            <li><Icone nom="coche" /> Tableau de bord des ventes en temps réel</li>
            <li><Icone nom="coche" /> Paiements Mobile Money</li>
            <li><Icone nom="coche" /> Livraison prise en charge</li>
          </ul>
        </div>
      </section>
    </>
  )
}
