import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminProduits, useMutationAdmin } from '../../hooks/requetes'
import { basculerProduit } from '../../api/admin'
import { useAntiRebond } from '../../hooks/useAntiRebond'
import { formaterPrix } from '../../lib/format'
import { urlImage } from '../../lib/images'
import Bouton from '../../composants/ui/Bouton'
import { ChargementPage } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

export default function ProduitsAdmin() {
  const { data: produits = [], isPending } = useAdminProduits()
  const [recherche, setRecherche] = useState('')
  const rechercheStable = useAntiRebond(recherche)
  const basculer = useMutationAdmin(({ id, actif }) => basculerProduit(id, actif))
  const filtres = useMemo(() => {
    const t = rechercheStable.toLowerCase()
    return produits.filter(p => p.nom.toLowerCase().includes(t) || p.boutique?.nom.toLowerCase().includes(t))
  }, [produits, rechercheStable])

  if (isPending) return <ChargementPage />
  return (
    <>
      <h1>Produits ({produits.length})</h1>
      <div className={styles.filtresTableau}>
        <input type="search" placeholder="Produit ou boutique…" aria-label="Rechercher" value={recherche} onChange={e => setRecherche(e.target.value)} />
      </div>
      <div className={styles.tableauDefilant}>
        <table className={styles.tableau}>
          <thead><tr><th>Produit</th><th>Boutique</th><th>Rayon</th><th>Prix</th><th>Stock</th><th>Visibilité</th></tr></thead>
          <tbody>
            {filtres.map(p => (
              <tr key={p.id}>
                <td><div className={styles.cellProduit}><img src={urlImage(p.images[0])} alt="" /><Link to={`/produit/${p.slug}`}>{p.nom}</Link></div></td>
                <td>{p.boutique?.nom}</td>
                <td>{p.categorie?.nom}</td>
                <td>{formaterPrix(p.prix)}</td>
                <td>{p.stock}</td>
                <td>
                  <Bouton variante={p.est_actif ? 'secondaire' : 'danger'} taille="petit" aria-pressed={p.est_actif} onClick={() => basculer.mutate({ id: p.id, actif: !p.est_actif })}>
                    {p.est_actif ? 'En ligne' : 'Masqué'}
                  </Bouton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
