import { Link } from 'react-router-dom'
import { useStatistiquesAdmin } from '../../hooks/requetes'
import { formaterPrix } from '../../lib/format'
import { CourbeVentes, Camembert } from '../../composants/Graphiques'
import Icone from '../../composants/ui/Icone'
import { ChargementPage } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

export default function TableauAdmin() {
  const { data: stats, isPending } = useStatistiquesAdmin()
  if (isPending) return <ChargementPage />
  const cartes = [
    { icone: 'graphique', libelle: "Chiffre d'affaires", valeur: formaterPrix(stats.chiffre_affaires) },
    { icone: 'commande', libelle: 'Commandes', valeur: stats.commandes },
    { icone: 'utilisateurs', libelle: 'Clients', valeur: stats.clients },
    { icone: 'boutique', libelle: 'Boutiques actives', valeur: stats.vendeurs },
    { icone: 'boite', libelle: 'Produits', valeur: stats.produits }
  ]
  return (
    <>
      <h1>Vue d'ensemble</h1>
      {stats.boutiques_en_attente > 0 && (
        <p className={styles.bloc} style={{ borderColor: 'var(--orange)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icone nom="horloge" /> {stats.boutiques_en_attente} boutique(s) attendent ta validation. <Link to="/admin/boutiques">Les examiner</Link>
        </p>
      )}
      <div className={styles.stats}>
        {cartes.map(c => <div key={c.libelle} className={styles.stat}><Icone nom={c.icone} /><p>{c.libelle}</p><strong>{c.valeur}</strong></div>)}
      </div>
      <div className={styles.deuxBlocs}>
        <div className={styles.bloc}><h2>Ventes des 30 derniers jours</h2><CourbeVentes donnees={stats.ventes_par_jour} /></div>
        <div className={styles.bloc}>
          <h2>Ventes par rayon</h2>
          <Camembert donnees={stats.par_categorie} cle="categorie" valeur="total" />
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '.88rem' }}>
            {stats.par_categorie.map(c => <li key={c.categorie}>{c.categorie} : {formaterPrix(c.total)}</li>)}
          </ul>
        </div>
      </div>
    </>
  )
}
