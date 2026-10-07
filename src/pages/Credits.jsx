import credits from '../donnees/credits.json'
import { urlImage } from '../lib/images'
import styles from '../composants/mise-en-page/Espace.module.css'

export default function Credits() {
  return (
    <div className="conteneur page">
      <h1 className="titre-page">Crédits photos</h1>
      <p style={{ maxWidth: 760, color: 'var(--texte-doux)' }}>
        Les photos des produits de démonstration viennent de <a href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">Wikimedia Commons</a> sous licences libres.
        Elles ont été recadrées et compressées. Merci à leurs auteurs. Icônes inspirées de Lucide (ISC), polices Sora et Inter (SIL OFL).
      </p>
      <div className={styles.tableauDefilant}>
        <table className={styles.tableau}>
          <thead><tr><th>Photo</th><th>Produit</th><th>Auteur</th><th>Licence</th></tr></thead>
          <tbody>
            {credits.map(c => (
              <tr key={c.fichier}>
                <td><img src={urlImage(c.fichier)} alt="" loading="lazy" /></td>
                <td>{c.produit}</td>
                <td>{c.auteur}</td>
                <td><a href={c.source} target="_blank" rel="noreferrer">{c.licence}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
