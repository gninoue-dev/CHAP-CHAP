import { useEffect, useState } from 'react'
import { NavLink, useParams, useSearchParams } from 'react-router-dom'
import { useCategories, useProduits } from '../hooks/requetes'
import { PRODUITS_PAR_PAGE } from '../api/catalogue'
import { useAntiRebond } from '../hooks/useAntiRebond'
import GrilleProduits from '../composants/produits/GrilleProduits'
import Bouton from '../composants/ui/Bouton'
import Icone from '../composants/ui/Icone'
import { Etoiles } from '../composants/ui/Etoiles'
import { EtatVide, Pagination } from '../composants/ui/divers'
import styles from './Catalogue.module.css'

const TRIS = [
  ['pertinence', 'Les plus vendus'],
  ['nouveautes', 'Nouveautés'],
  ['prix-croissant', 'Prix croissant'],
  ['prix-decroissant', 'Prix décroissant'],
  ['note', 'Mieux notés']
]

export default function Catalogue() {
  const { slug: categorie } = useParams()
  const [parametres, setParametres] = useSearchParams()
  const { data: categories = [] } = useCategories()
  const [filtresOuverts, setFiltresOuverts] = useState(false)

  // l'URL est la seule source de vérité des filtres : on peut partager le lien
  const filtres = {
    categorie,
    recherche: parametres.get('q') || '',
    tri: parametres.get('tri') || 'pertinence',
    prixMin: parametres.get('min') || '',
    prixMax: parametres.get('max') || '',
    noteMin: parametres.get('note') || '',
    enStock: parametres.get('stock') === '1',
    promo: parametres.get('promo') === '1',
    page: Number(parametres.get('page')) || 1
  }

  // champs de prix : saisie libre, appliquée après une courte pause
  const [prix, setPrix] = useState({ min: filtres.prixMin, max: filtres.prixMax })
  const prixStable = useAntiRebond(prix, 500)
  useEffect(() => {
    if (prixStable.min !== filtres.prixMin || prixStable.max !== filtres.prixMax) {
      modifier({ min: prixStable.min, max: prixStable.max })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prixStable])

  const { data, isPending, isFetching, isError, error } = useProduits(filtres)
  const categorieCourante = categories.find(c => c.slug === categorie)

  function modifier(changements, garderPage = false) {
    setParametres(precedents => {
      const suivants = new URLSearchParams(precedents)
      Object.entries(changements).forEach(([cle, valeur]) => {
        if (valeur === '' || valeur === false || valeur === null || valeur === undefined) suivants.delete(cle)
        else suivants.set(cle, valeur === true ? '1' : valeur)
      })
      if (!garderPage) suivants.delete('page')
      return suivants
    })
  }

  function changerPage(page) {
    modifier({ page }, true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const actifs = [
    filtres.recherche && { cle: 'q', libelle: `« ${filtres.recherche} »` },
    filtres.prixMin && { cle: 'min', libelle: `Dès ${filtres.prixMin} FCFA` },
    filtres.prixMax && { cle: 'max', libelle: `Jusqu'à ${filtres.prixMax} FCFA` },
    filtres.noteMin && { cle: 'note', libelle: `${filtres.noteMin} étoiles et +` },
    filtres.enStock && { cle: 'stock', libelle: 'En stock' },
    filtres.promo && { cle: 'promo', libelle: 'En promo' }
  ].filter(Boolean)

  const titre = filtres.recherche ? `Résultats pour « ${filtres.recherche} »` : categorieCourante?.nom ?? 'Tous les produits'

  return (
    <div className={`conteneur page ${styles.mise}`}>
      {filtresOuverts && <div className={styles.fond} onClick={() => setFiltresOuverts(false)} aria-hidden="true" />}
      <aside className={`${styles.filtres} ${filtresOuverts ? styles.ouvert : ''}`} aria-label="Filtres">
        <nav aria-label="Rayons">
          <h2>Rayons</h2>
          <ul className={styles.listeCategories}>
            <li><NavLink to={{ pathname: '/produits', search: filtres.recherche ? `?q=${filtres.recherche}` : '' }} end>Tout <small /></NavLink></li>
            {categories.map(c => (
              <li key={c.id}><NavLink to={`/categorie/${c.slug}`}>{c.nom} <small>{c.produits?.[0]?.count ?? 0}</small></NavLink></li>
            ))}
          </ul>
        </nav>
        <fieldset>
          <legend>Prix (FCFA)</legend>
          <div className={styles.prix}>
            <input type="number" min="0" inputMode="numeric" placeholder="Min" aria-label="Prix minimum" value={prix.min} onChange={e => setPrix(p => ({ ...p, min: e.target.value }))} />
            <input type="number" min="0" inputMode="numeric" placeholder="Max" aria-label="Prix maximum" value={prix.max} onChange={e => setPrix(p => ({ ...p, max: e.target.value }))} />
          </div>
        </fieldset>
        <fieldset className={styles.notes}>
          <legend>Note des clients</legend>
          {[4, 3, 2].map(n => (
            <label key={n}>
              <input type="radio" name="note" checked={filtres.noteMin === String(n)} onChange={() => modifier({ note: n })} />
              <Etoiles note={n} taille={15} /> et plus
            </label>
          ))}
          {filtres.noteMin && <Bouton variante="fantome" taille="petit" onClick={() => modifier({ note: '' })}>Toutes les notes</Bouton>}
        </fieldset>
        <fieldset>
          <legend>Disponibilité</legend>
          <label className={styles.case}><input type="checkbox" checked={filtres.enStock} onChange={e => modifier({ stock: e.target.checked })} /> En stock uniquement</label>
          <label className={styles.case}><input type="checkbox" checked={filtres.promo} onChange={e => modifier({ promo: e.target.checked })} /> En promotion</label>
        </fieldset>
        <Bouton variante="secondaire" className={styles.boutonFiltres} onClick={() => setFiltresOuverts(false)} large>Voir les résultats</Bouton>
      </aside>

      <section aria-labelledby="titreCatalogue">
        <div className={styles.barre}>
          <div>
            <h1 id="titreCatalogue">{titre}</h1>
            <p aria-live="polite">{data ? `${data.total} produit${data.total > 1 ? 's' : ''}` : 'Chargement…'}{isFetching && !isPending ? ' · mise à jour…' : ''}</p>
          </div>
          <div className={styles.outils}>
            <Bouton variante="secondaire" className={styles.boutonFiltres} onClick={() => setFiltresOuverts(true)}><Icone nom="filtre" taille={18} /> Filtres</Bouton>
            <label className="visuellement-cache" htmlFor="tri">Trier par</label>
            <select id="tri" value={filtres.tri} onChange={e => modifier({ tri: e.target.value })}>
              {TRIS.map(([valeur, libelle]) => <option key={valeur} value={valeur}>{libelle}</option>)}
            </select>
          </div>
        </div>

        {actifs.length > 0 && (
          <div className={styles.puces}>
            {actifs.map(f => (
              <button key={f.cle} onClick={() => { modifier({ [f.cle]: '' }); if (f.cle === 'min' || f.cle === 'max') setPrix(p => ({ ...p, [f.cle]: '' })) }} aria-label={`Retirer le filtre ${f.libelle}`}>
                {f.libelle} <Icone nom="fermer" taille={14} />
              </button>
            ))}
          </div>
        )}

        {isError ? (
          <EtatVide icone="alerte" titre="Impossible de charger les produits">{error.message}</EtatVide>
        ) : !isPending && data.total === 0 ? (
          <EtatVide icone="recherche" titre="Aucun produit trouvé" action={<Bouton vers="/produits" variante="secondaire">Effacer les filtres</Bouton>}>
            Essaie avec d'autres mots ou retire quelques filtres.
          </EtatVide>
        ) : (
          <>
            <GrilleProduits produits={data?.donnees ?? []} chargement={isPending} />
            {data && <Pagination page={filtres.page} total={data.total} parPage={PRODUITS_PAR_PAGE} onChange={changerPage} />}
          </>
        )}
      </section>
    </div>
  )
}
