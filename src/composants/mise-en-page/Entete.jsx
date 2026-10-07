import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contextes/AuthContexte'
import { usePanier } from '../../contextes/PanierContexte'
import { useTheme } from '../../contextes/ThemeContexte'
import { useCategories, useSuggestions } from '../../hooks/requetes'
import { useAntiRebond } from '../../hooks/useAntiRebond'
import { formaterPrix } from '../../lib/format'
import { urlImage } from '../../lib/images'
import Icone from '../ui/Icone'
import styles from './MiseEnPage.module.css'

function RechercheAvecSuggestions() {
  const [texte, setTexte] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const [actif, setActif] = useState(-1)
  const texteStable = useAntiRebond(texte, 250)
  const { data: suggestions = [] } = useSuggestions(texteStable)
  const naviguer = useNavigate()
  const zone = useRef(null)

  useEffect(() => {
    const surClic = e => { if (!zone.current?.contains(e.target)) setOuvert(false) }
    document.addEventListener('mousedown', surClic)
    return () => document.removeEventListener('mousedown', surClic)
  }, [])

  function rechercher(e) {
    e.preventDefault()
    if (actif >= 0 && suggestions[actif]) {
      naviguer(`/produit/${suggestions[actif].slug}`)
    } else if (texte.trim()) {
      naviguer(`/produits?q=${encodeURIComponent(texte.trim())}`)
    }
    setOuvert(false)
  }

  function surTouche(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActif(i => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActif(i => Math.max(i - 1, -1)) }
    if (e.key === 'Escape') setOuvert(false)
  }

  const afficher = ouvert && texteStable.trim().length >= 2 && suggestions.length > 0
  return (
    <div className={styles.recherche} ref={zone} role="search">
      <form onSubmit={rechercher}>
        <Icone nom="recherche" className={styles.loupe} />
        <label htmlFor="rechercheGlobale" className="visuellement-cache">Rechercher un produit</label>
        <input
          id="rechercheGlobale"
          type="search"
          placeholder="Rechercher un produit, une marque…"
          value={texte}
          autoComplete="off"
          role="combobox"
          aria-expanded={afficher}
          aria-controls="listeSuggestions"
          aria-activedescendant={actif >= 0 ? `suggestion-${actif}` : undefined}
          onChange={e => { setTexte(e.target.value); setOuvert(true); setActif(-1) }}
          onFocus={() => setOuvert(true)}
          onKeyDown={surTouche}
        />
        <button type="submit">Chercher</button>
      </form>
      {afficher && (
        <ul className={styles.suggestions} id="listeSuggestions" role="listbox">
          {suggestions.map((p, i) => (
            <li key={p.id} id={`suggestion-${i}`} role="option" aria-selected={i === actif}>
              <Link to={`/produit/${p.slug}`} onClick={() => { setOuvert(false); setTexte('') }}>
                <img src={urlImage(p.images[0])} alt="" />
                <span><strong>{p.nom}</strong><small>{p.categorie?.nom}</small></span>
                <span className={styles.suggestionPrix}>{formaterPrix(p.prix)}</span>
              </Link>
            </li>
          ))}
          <li role="option" aria-selected="false">
            <Link className={styles.toutVoir} to={`/produits?q=${encodeURIComponent(texteStable)}`} onClick={() => setOuvert(false)}>
              Voir tous les résultats pour « {texteStable} »
            </Link>
          </li>
        </ul>
      )}
    </div>
  )
}

function MenuCompte() {
  const { utilisateur, profil, role, deconnecter } = useAuth()
  const [ouvert, setOuvert] = useState(false)
  const zone = useRef(null)
  const naviguer = useNavigate()

  useEffect(() => {
    const surClic = e => { if (!zone.current?.contains(e.target)) setOuvert(false) }
    const surTouche = e => { if (e.key === 'Escape') setOuvert(false) }
    document.addEventListener('mousedown', surClic)
    document.addEventListener('keydown', surTouche)
    return () => { document.removeEventListener('mousedown', surClic); document.removeEventListener('keydown', surTouche) }
  }, [])

  if (!utilisateur) {
    return <Link to="/connexion" className={styles.iconeBouton} aria-label="Se connecter" title="Se connecter"><Icone nom="utilisateur" /></Link>
  }
  const nom = profil?.nom_complet || utilisateur.email
  const initiales = nom.split(/\s+/).map(m => m[0]).slice(0, 2).join('').toUpperCase()
  const fermer = () => setOuvert(false)

  return (
    <div className={styles.menuCompte} ref={zone}>
      <button className={styles.iconeBouton} onClick={() => setOuvert(o => !o)} aria-expanded={ouvert} aria-haspopup="true" aria-label={`Mon compte (${nom})`}>
        <span className={styles.avatar}>{initiales}</span>
      </button>
      {ouvert && (
        <ul className={styles.listeCompte}>
          <li className={styles.listeCompteEntete}><strong>{nom}</strong><small>{utilisateur.email}</small></li>
          <li><Link to="/compte" onClick={fermer}><Icone nom="commande" taille={18} /> Mes commandes</Link></li>
          <li><Link to="/compte/favoris" onClick={fermer}><Icone nom="coeur" taille={18} /> Mes favoris</Link></li>
          <li><Link to="/compte/profil" onClick={fermer}><Icone nom="utilisateur" taille={18} /> Mon profil</Link></li>
          {role === 'vendeur' && <li><Link to="/vendeur" onClick={fermer}><Icone nom="boutique" taille={18} /> Espace vendeur</Link></li>}
          {role === 'client' && <li><Link to="/devenir-vendeur" onClick={fermer}><Icone nom="boutique" taille={18} /> Vendre sur CHAP CHAP</Link></li>}
          {role === 'admin' && <li><Link to="/admin" onClick={fermer}><Icone nom="tableau" taille={18} /> Administration</Link></li>}
          <li><button onClick={async () => { fermer(); await deconnecter(); naviguer('/') }}><Icone nom="sortie" taille={18} /> Déconnexion</button></li>
        </ul>
      )}
    </div>
  )
}

export default function Entete({ ouvrirPanier }) {
  const { nombreArticles } = usePanier()
  const { theme, basculerTheme } = useTheme()
  const { data: categories = [] } = useCategories()
  const [rebond, setRebond] = useState(false)
  const premierRendu = useRef(true)

  // petite animation du compteur quand le panier change
  useEffect(() => {
    if (premierRendu.current) { premierRendu.current = false; return undefined }
    setRebond(true)
    const minuteur = setTimeout(() => setRebond(false), 500)
    return () => clearTimeout(minuteur)
  }, [nombreArticles])

  return (
    <header className={styles.entete}>
      <div className={`conteneur ${styles.barre}`}>
        <Link to="/" className={styles.logo} aria-label="CHAP CHAP, accueil">
          <span className={styles.logoIcone}><Icone nom="eclair" taille={22} plein /></span>
          <span className={styles.logoTexte}>CHAP<span>CHAP</span></span>
        </Link>
        <RechercheAvecSuggestions />
        <div className={styles.actions}>
          <button className={styles.iconeBouton} onClick={basculerTheme} aria-label={theme === 'sombre' ? 'Passer en thème clair' : 'Passer en thème sombre'} title="Changer de thème">
            <Icone nom={theme === 'sombre' ? 'soleil' : 'lune'} />
          </button>
          <Link to="/compte/favoris" className={styles.iconeBouton} aria-label="Mes favoris" title="Mes favoris"><Icone nom="coeur" /></Link>
          <MenuCompte />
          <button className={styles.iconeBouton} onClick={ouvrirPanier} aria-label={`Ouvrir le panier (${nombreArticles} article${nombreArticles > 1 ? 's' : ''})`}>
            <Icone nom="panier" />
            {nombreArticles > 0 && <span className={`${styles.pastille} ${rebond ? styles.rebond : ''}`}>{nombreArticles > 99 ? '99+' : nombreArticles}</span>}
          </button>
        </div>
      </div>
      <nav className={`conteneur ${styles.navCategories}`} aria-label="Catégories">
        <NavLink to="/produits" end>Tout</NavLink>
        {categories.map(c => (
          <NavLink key={c.id} to={`/categorie/${c.slug}`}><Icone nom={c.icone} taille={16} /> {c.nom}</NavLink>
        ))}
        <NavLink to="/boutiques"><Icone nom="boutique" taille={16} /> Boutiques</NavLink>
      </nav>
    </header>
  )
}
