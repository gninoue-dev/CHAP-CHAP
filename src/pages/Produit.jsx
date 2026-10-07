import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../contextes/AuthContexte'
import { useNotifications } from '../contextes/NotificationsContexte'
import { usePanier } from '../contextes/PanierContexte'
import { useAvis, useProduit, useProduitsSimilaires, usePublierAvis, useSupprimerAvis } from '../hooks/requetes'
import { useStockageLocal } from '../hooks/useStockageLocal'
import { useMouvementReduit } from '../hooks/useMouvementReduit'
import { formaterDate } from '../lib/format'
import { urlImage } from '../lib/images'
import { schemaAvis } from '../lib/schemas'
import { webglDisponible } from '../lib/webgl'
import { BoutonFavori } from '../composants/produits/CarteProduit'
import { CarrouselProduits } from '../composants/produits/GrilleProduits'
import Bouton from '../composants/ui/Bouton'
import Champ from '../composants/ui/Champ'
import Icone from '../composants/ui/Icone'
import Prix from '../composants/ui/Prix'
import { Etoiles, EtoilesInteractives } from '../composants/ui/Etoiles'
import { Badge, ChargementPage, EtatVide, Quantite } from '../composants/ui/divers'
import styles from './Produit.module.css'

const Presentoir3D = lazy(() => import('../composants/trois-d/Presentoir3D'))

function Galerie({ produit }) {
  const images = produit.images.length ? produit.images : [null]
  const [indice, setIndice] = useState(0)
  const [en3D, setEn3D] = useState(false)
  const [zoom, setZoom] = useState(null)
  const mouvementReduit = useMouvementReduit()
  const avec3D = useMemo(() => webglDisponible(), [])

  function surMouvement(e) {
    const r = e.currentTarget.getBoundingClientRect()
    setZoom(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div className={styles.galerie}>
      {en3D ? (
        <div className={styles.vue3D}>
          <Suspense fallback={<ChargementPage />}><Presentoir3D image={urlImage(images[indice])} animation={!mouvementReduit} /></Suspense>
        </div>
      ) : (
        <div
          className={`${styles.imagePrincipale} ${zoom ? styles.zoom : ''}`}
          onMouseMove={surMouvement}
          onMouseLeave={() => setZoom(null)}
        >
          <img src={urlImage(images[indice])} alt={produit.nom} style={zoom ? { transformOrigin: zoom } : undefined} />
        </div>
      )}
      <div className={styles.vignettes}>
        {images.map((image, i) => (
          <button key={i} aria-pressed={!en3D && i === indice} onClick={() => { setIndice(i); setEn3D(false) }} aria-label={`Photo ${i + 1}`}>
            <img src={urlImage(image)} alt="" />
          </button>
        ))}
        {avec3D && (
          <button className={styles.bouton3D} aria-pressed={en3D} onClick={() => setEn3D(v => !v)} aria-label="Voir le produit en 3D">3D</button>
        )}
      </div>
    </div>
  )
}

function FormulaireAvis({ produit, avisExistant }) {
  const { utilisateur } = useAuth()
  const { notifier } = useNotifications()
  const publier = usePublierAvis(produit)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schemaAvis),
    defaultValues: { note: avisExistant?.note ?? 0, commentaire: avisExistant?.commentaire ?? '' }
  })
  useEffect(() => { reset({ note: avisExistant?.note ?? 0, commentaire: avisExistant?.commentaire ?? '' }) }, [avisExistant, reset])

  const envoyer = valeurs => publier.mutate(
    { produitId: produit.id, auteurId: utilisateur.id, ...valeurs },
    { onSuccess: () => notifier(avisExistant ? 'Avis modifié, merci !' : 'Merci pour ton avis !'), onError: e => notifier(e.message, { type: 'erreur' }) }
  )

  return (
    <form className={styles.formAvis} onSubmit={handleSubmit(envoyer)} noValidate>
      <h3 style={{ marginBottom: 10 }}>{avisExistant ? 'Modifier mon avis' : 'Donner mon avis'}</h3>
      <Controller name="note" control={control} render={({ field }) => <EtoilesInteractives valeur={field.value} onChange={field.onChange} />} />
      {errors.note && <p style={{ color: 'var(--rouge)', fontWeight: 600, fontSize: '.85rem' }}>{errors.note.message}</p>}
      <Champ libelle="Ton commentaire" multiligne placeholder="Qualité, livraison, conformité…" erreur={errors.commentaire?.message} {...register('commentaire')} />
      <Bouton type="submit" chargement={publier.isPending}>Publier</Bouton>
    </form>
  )
}

function SectionAvis({ produit }) {
  const { utilisateur } = useAuth()
  const { data: avis = [], isPending } = useAvis(produit.id)
  const supprimer = useSupprimerAvis(produit)
  const monAvis = avis.find(a => a.auteur_id === utilisateur?.id)
  const repartition = [5, 4, 3, 2, 1].map(n => ({ n, nombre: avis.filter(a => a.note === n).length }))

  return (
    <div className={styles.avisGrille}>
      <div className={styles.resumeAvis}>
        <p className={styles.noteGrande}>{Number(produit.note_moyenne).toFixed(1)}</p>
        <Etoiles note={produit.note_moyenne} taille={20} />
        <p style={{ color: 'var(--texte-doux)', margin: '6px 0 0' }}>{produit.nombre_avis} avis</p>
        <ul className={styles.barres}>
          {repartition.map(r => (
            <li key={r.n}>
              <span>{r.n} étoile{r.n > 1 ? 's' : ''}</span>
              <span className={styles.barre}><span style={{ width: `${avis.length ? (r.nombre / avis.length) * 100 : 0}%` }} /></span>
              <span>{r.nombre}</span>
            </li>
          ))}
        </ul>
        {utilisateur
          ? <FormulaireAvis produit={produit} avisExistant={monAvis} />
          : <Bouton vers="/connexion" variante="secondaire" large>Connecte-toi pour donner ton avis</Bouton>}
      </div>
      <div>
        {isPending ? <ChargementPage /> : avis.length === 0 ? (
          <EtatVide icone="etoile" titre="Pas encore d'avis">Sois le premier à donner ton avis sur ce produit.</EtatVide>
        ) : (
          <ul className={styles.listeAvis}>
            {avis.map(a => (
              <li key={a.id} className={styles.avis}>
                <div className={styles.avisEntete}>
                  <div><strong>{a.auteur}</strong><small>{formaterDate(a.cree_le)}</small></div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {a.achat_verifie && <Badge couleur="vert"><Icone nom="verifie" taille={14} /> Achat vérifié</Badge>}
                    <Etoiles note={a.note} taille={15} />
                  </div>
                </div>
                {a.commentaire && <p>{a.commentaire}</p>}
                {a.auteur_id === utilisateur?.id && (
                  <Bouton variante="fantome" taille="petit" onClick={() => supprimer.mutate(a.id)}><Icone nom="poubelle" taille={16} /> Supprimer</Bouton>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// La clé force un composant neuf (quantité, onglet…) à chaque changement de produit
export default function PageProduit() {
  const { slug } = useParams()
  return <Produit key={slug} slug={slug} />
}

function Produit({ slug }) {
  const { data: produit, isPending, isError } = useProduit(slug)
  const similaires = useProduitsSimilaires(produit)
  const { ajouter } = usePanier()
  const { notifier } = useNotifications()
  const naviguer = useNavigate()
  const [quantite, setQuantite] = useState(1)
  const [onglet, setOnglet] = useState('description')
  const [recents, setRecents] = useStockageLocal('recents', [])

  // mémorise les produits consultés (10 derniers)
  useEffect(() => {
    if (!produit) return
    document.title = `${produit.nom} — CHAP CHAP`
    setRecents(liste => [
      { id: produit.id, nom: produit.nom, slug: produit.slug, prix: produit.prix, prix_barre: produit.prix_barre, images: produit.images, stock: produit.stock, note_moyenne: produit.note_moyenne, nombre_avis: produit.nombre_avis, boutique: produit.boutique },
      ...liste.filter(p => p.id !== produit.id)
    ].slice(0, 10))
    return () => { document.title = 'CHAP CHAP — Tout Abidjan livré chap chap' }
  }, [produit, setRecents])

  if (isPending) return <ChargementPage />
  if (isError || !produit) {
    return <div className="conteneur page"><EtatVide icone="recherche" titre="Produit introuvable" action={<Bouton vers="/produits">Voir les produits</Bouton>}>Ce produit n'existe pas ou n'est plus en vente.</EtatVide></div>
  }

  const epuise = produit.stock === 0
  const caracteristiques = Object.entries(produit.caracteristiques || {})
  const ajouterAuPanier = () => { ajouter(produit, quantite); notifier(`${quantite} × « ${produit.nom} » ajouté au panier`) }
  const acheter = () => { ajouter(produit, quantite); naviguer('/commande') }
  const onglets = [
    ['description', 'Description'],
    ...(caracteristiques.length ? [['caracteristiques', 'Caractéristiques']] : []),
    ['avis', `Avis (${produit.nombre_avis})`]
  ]
  const autresRecents = recents.filter(p => p.id !== produit.id)

  return (
    <div className="conteneur page">
      <nav aria-label="Fil d'Ariane">
        <ol className={styles.fil}>
          <li><Link to="/">Accueil</Link></li>
          <li><Link to={`/categorie/${produit.categorie.slug}`}>{produit.categorie.nom}</Link></li>
          <li aria-current="page">{produit.nom}</li>
        </ol>
      </nav>

      <div className={styles.haut}>
        <Galerie produit={produit} />
        <div className={styles.infos}>
          <Link className={styles.vendeur} to={`/boutique/${produit.boutique.slug}`}>
            <Icone nom="boutique" taille={16} /> {produit.boutique.nom}
            {produit.boutique.est_verifiee && <Icone nom="verifie" taille={16} titre="Boutique vérifiée" />}
          </Link>
          <h1>{produit.nom}</h1>
          <div className={styles.ligneNote}>
            {produit.nombre_avis > 0 && <><Etoiles note={produit.note_moyenne} /><button className="lien" onClick={() => setOnglet('avis')} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>{produit.nombre_avis} avis</button></>}
            {produit.ventes > 0 && <span>{produit.ventes} vendus</span>}
          </div>

          <div className={styles.blocPrix}>
            <Prix prix={produit.prix} prixBarre={produit.prix_barre} taille="1.8rem" />
            <p className={`${styles.stock} ${epuise ? styles.epuise : produit.stock <= 5 ? styles.faible : styles.ok}`}>
              <Icone nom={epuise ? 'alerte' : 'boite'} taille={18} />
              {epuise ? 'Épuisé' : produit.stock <= 5 ? `Plus que ${produit.stock} en stock, dépêche-toi !` : 'En stock'}
            </p>
          </div>

          <div className={styles.achat}>
            {!epuise && <Quantite valeur={quantite} max={produit.stock} onChange={setQuantite} />}
            <Bouton taille="grand" onClick={ajouterAuPanier} disabled={epuise}><Icone nom="panier" taille={20} /> Ajouter au panier</Bouton>
            <BoutonFavori produit={produit} enLigne />
          </div>
          {!epuise && <Bouton variante="sombre" taille="grand" large onClick={acheter} style={{ marginTop: 12 }}>Acheter maintenant <Icone nom="eclair" taille={18} plein /></Bouton>}

          <ul className={styles.garanties}>
            <li><Icone nom="camion" /> Livraison en 24 h à Abidjan, offerte dès 50 000 FCFA</li>
            <li><Icone nom="bouclier" /> Paiement sécurisé : Mobile Money, carte ou espèces</li>
            <li><Icone nom="retour" /> Retour gratuit sous 7 jours</li>
          </ul>
        </div>
      </div>

      <section className={styles.onglets}>
        <div className={styles.ongletsListe} role="tablist" aria-label="Informations produit">
          {onglets.map(([id, libelle]) => (
            <button key={id} role="tab" id={`onglet-${id}`} aria-selected={onglet === id} aria-controls={`panneau-${id}`} onClick={() => setOnglet(id)}>{libelle}</button>
          ))}
        </div>
        <div role="tabpanel" id={`panneau-${onglet}`} aria-labelledby={`onglet-${onglet}`}>
          {onglet === 'description' && <p className={styles.description}>{produit.description}</p>}
          {onglet === 'caracteristiques' && (
            <table className={styles.caracteristiques}>
              <tbody>{caracteristiques.map(([cle, valeur]) => <tr key={cle}><th scope="row">{cle}</th><td>{valeur}</td></tr>)}</tbody>
            </table>
          )}
          {onglet === 'avis' && <SectionAvis produit={produit} />}
        </div>
      </section>

      {(similaires.isPending || similaires.data?.length > 0) && (
        <section className={styles.section}>
          <CarrouselProduits titre="Dans le même rayon" produits={similaires.data} chargement={similaires.isPending} />
        </section>
      )}
      {autresRecents.length > 0 && (
        <section className={styles.section}>
          <CarrouselProduits titre="Consultés récemment" produits={autresRecents} />
        </section>
      )}
    </div>
  )
}
