import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contextes/AuthContexte'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { cles, useCategories, useMaBoutique, useMutationVendeur } from '../../hooks/requetes'
import { enregistrerProduit, envoyerImage, obtenirMonProduit } from '../../api/vendeur'
import { schemaProduit } from '../../lib/schemas'
import { formaterPrix, pourcentageRemise } from '../../lib/format'
import { urlImage } from '../../lib/images'
import Bouton from '../../composants/ui/Bouton'
import Champ from '../../composants/ui/Champ'
import Icone from '../../composants/ui/Icone'
import { ChargementPage } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'
import stylesAchat from '../Achat.module.css'

const TAILLE_MAX = 3 * 1024 * 1024
const VIDE = { nom: '', categorie_id: '', description: '', prix: '', prix_barre: '', stock: 1, est_actif: true, caracteristiques: [] }

// Photos : glisser-déposer ou choisir, aperçu, réordonner, supprimer
function ZoneImages({ images, setImages }) {
  const { utilisateur } = useAuth()
  const { notifier } = useNotifications()
  const [envoi, setEnvoi] = useState(0)
  const [survol, setSurvol] = useState(false)
  const champ = useRef(null)

  async function ajouterFichiers(fichiers) {
    const valides = [...fichiers].filter(f => f.type.startsWith('image/') && f.size <= TAILLE_MAX)
    if (valides.length < fichiers.length) notifier('Images uniquement, 3 Mo maximum par fichier', { type: 'erreur' })
    setEnvoi(n => n + valides.length)
    for (const fichier of valides) {
      try {
        const url = await envoyerImage(utilisateur.id, fichier)
        setImages(liste => [...liste, url].slice(0, 6))
      } catch (e) {
        notifier(`Envoi impossible : ${e.message}`, { type: 'erreur' })
      } finally {
        setEnvoi(n => n - 1)
      }
    }
  }

  const deplacer = (i, sens) => setImages(liste => {
    const copie = [...liste]
    const [image] = copie.splice(i, 1)
    copie.splice(i + sens, 0, image)
    return copie
  })

  return (
    <div>
      <p style={{ fontWeight: 600, marginBottom: 8 }}>Photos <small style={{ color: 'var(--texte-doux)', fontWeight: 400 }}>(6 maximum, la première est la photo principale)</small></p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
        {images.map((image, i) => (
          <figure key={image} style={{ margin: 0, position: 'relative', borderRadius: 14, overflow: 'hidden', border: i === 0 ? '3px solid var(--orange)' : '1px solid var(--bordure)', aspectRatio: '1' }}>
            <img src={urlImage(image)} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <figcaption style={{ position: 'absolute', inset: 'auto 4px 4px 4px', display: 'flex', gap: 4, justifyContent: 'center' }}>
              {i > 0 && <Bouton type="button" variante="secondaire" taille="petit" onClick={() => deplacer(i, -1)} aria-label="Avancer"><Icone nom="flecheGauche" taille={14} /></Bouton>}
              <Bouton type="button" variante="danger" taille="petit" onClick={() => setImages(l => l.filter(x => x !== image))} aria-label="Retirer la photo"><Icone nom="poubelle" taille={14} /></Bouton>
            </figcaption>
          </figure>
        ))}
        {images.length < 6 && (
          <button
            type="button"
            onClick={() => champ.current.click()}
            onDragOver={e => { e.preventDefault(); setSurvol(true) }}
            onDragLeave={() => setSurvol(false)}
            onDrop={e => { e.preventDefault(); setSurvol(false); ajouterFichiers(e.dataTransfer.files) }}
            style={{ aspectRatio: '1', display: 'grid', placeItems: 'center', gap: 4, border: `2px dashed ${survol ? 'var(--orange)' : 'var(--bordure)'}`, borderRadius: 14, background: survol ? 'var(--orange-pale)' : 'var(--surface-2)', color: 'var(--texte-doux)', cursor: 'pointer', padding: 8 }}
          >
            <span style={{ display: 'grid', placeItems: 'center', gap: 4 }}>
              <Icone nom="image" taille={28} />
              <small>{envoi > 0 ? `Envoi… (${envoi})` : 'Ajouter ou déposer'}</small>
            </span>
          </button>
        )}
      </div>
      <input ref={champ} type="file" accept="image/*" multiple hidden onChange={e => { ajouterFichiers(e.target.files); e.target.value = '' }} />
    </div>
  )
}

export default function FormulaireProduit() {
  const { id } = useParams()
  const edition = Boolean(id)
  const naviguer = useNavigate()
  const { notifier } = useNotifications()
  const { data: boutique } = useMaBoutique()
  const { data: categories = [] } = useCategories()
  const [images, setImages] = useState([])
  const existant = useQuery({ queryKey: ['mon-produit', id], queryFn: () => obtenirMonProduit(id), enabled: edition })
  const enregistrer = useMutationVendeur(produit => enregistrerProduit(boutique.id, produit), [cles.produitsVendeur(boutique?.id)])

  const { register, control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schemaProduit),
    defaultValues: VIDE
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'caracteristiques' })

  // en édition : remplir le formulaire avec le produit existant
  useEffect(() => {
    if (!existant.data) return
    const p = existant.data
    reset({
      nom: p.nom, categorie_id: p.categorie_id, description: p.description, prix: p.prix,
      prix_barre: p.prix_barre ?? '', stock: p.stock, est_actif: p.est_actif,
      caracteristiques: Object.entries(p.caracteristiques || {}).map(([cle, valeur]) => ({ cle, valeur }))
    })
    setImages(p.images)
  }, [existant.data, reset])

  // prévient avant de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    if (!isDirty) return undefined
    const avertir = e => { e.preventDefault() }
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [isDirty])

  const [prix, prixBarre] = watch(['prix', 'prix_barre'])
  const remise = pourcentageRemise(Number(prix), Number(prixBarre))

  function envoyer(valeurs) {
    const caracteristiques = Object.fromEntries((valeurs.caracteristiques || []).filter(c => c.cle?.trim()).map(c => [c.cle.trim(), c.valeur.trim()]))
    enregistrer.mutate({ ...valeurs, id, images, caracteristiques }, {
      onSuccess: () => { notifier(edition ? 'Produit mis à jour' : 'Produit publié !'); naviguer('/vendeur/produits') },
      onError: e => notifier(e.message, { type: 'erreur' })
    })
  }

  if (edition && existant.isPending) return <ChargementPage />

  return (
    <>
      <h1>{edition ? 'Modifier le produit' : 'Nouveau produit'}</h1>
      <form onSubmit={handleSubmit(envoyer)} noValidate>
        <div className={styles.bloc}>
          <Champ libelle="Nom du produit" erreur={errors.nom?.message} {...register('nom')} />
          <div className={stylesAchat.deuxColonnes}>
            <Champ libelle="Catégorie" erreur={errors.categorie_id?.message} options={[{ valeur: '', libelle: 'Choisir…' }, ...categories.map(c => ({ valeur: c.id, libelle: c.nom }))]} {...register('categorie_id')} />
            <Champ libelle="Stock" type="number" min="0" erreur={errors.stock?.message} {...register('stock')} />
            <Champ libelle="Prix (FCFA)" type="number" min="1" erreur={errors.prix?.message} {...register('prix')} />
            <Champ libelle={<>Prix barré <small>(facultatif)</small></>} type="number" min="1" erreur={errors.prix_barre?.message} aide={remise ? `Remise affichée : -${remise} % (${formaterPrix(prix)} au lieu de ${formaterPrix(prixBarre)})` : ''} {...register('prix_barre')} />
          </div>
          <Champ libelle="Description" multiligne erreur={errors.description?.message} {...register('description')} />
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 600 }}>
            <input type="checkbox" style={{ width: 20, height: 20, accentColor: 'var(--orange)' }} {...register('est_actif')} /> Visible dans la boutique
          </label>
        </div>

        <div className={styles.bloc}><ZoneImages images={images} setImages={setImages} /></div>

        <div className={styles.bloc}>
          <h2>Caractéristiques</h2>
          {fields.map((champ, i) => (
            <div key={champ.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 10, alignItems: 'start' }}>
              <Champ libelle={`Caractéristique ${i + 1}`} placeholder="Ex. : Couleur" {...register(`caracteristiques.${i}.cle`)} />
              <Champ libelle="Valeur" placeholder="Ex. : Noir" {...register(`caracteristiques.${i}.valeur`)} />
              <Bouton type="button" variante="danger" taille="petit" onClick={() => remove(i)} style={{ marginTop: 30 }} aria-label={`Retirer la caractéristique ${i + 1}`}><Icone nom="poubelle" taille={16} /></Bouton>
            </div>
          ))}
          <Bouton type="button" variante="secondaire" taille="petit" onClick={() => append({ cle: '', valeur: '' })}><Icone nom="plus" taille={16} /> Ajouter une caractéristique</Bouton>
        </div>

        <div className={styles.actions}>
          <Bouton type="submit" taille="grand" chargement={enregistrer.isPending}>{edition ? 'Enregistrer' : 'Publier le produit'}</Bouton>
          <Bouton type="button" variante="secondaire" taille="grand" onClick={() => naviguer('/vendeur/produits')}>Annuler</Bouton>
        </div>
      </form>
    </>
  )
}
