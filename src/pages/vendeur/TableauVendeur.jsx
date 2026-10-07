import { useMaBoutique, useProduitsVendeur, useStatistiquesVendeur } from '../../hooks/requetes'
import { formaterPrix } from '../../lib/format'
import { CourbeVentes, Barres } from '../../composants/Graphiques'
import Bouton from '../../composants/ui/Bouton'
import Icone from '../../composants/ui/Icone'
import { ChargementPage } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

export default function TableauVendeur() {
  const { data: boutique } = useMaBoutique()
  const { data: stats, isPending } = useStatistiquesVendeur()
  const { data: produits = [] } = useProduitsVendeur(boutique?.id)
  if (isPending) return <ChargementPage />

  const cartes = [
    { icone: 'graphique', libelle: "Chiffre d'affaires", valeur: formaterPrix(stats.chiffre_affaires) },
    { icone: 'boite', libelle: 'Articles vendus', valeur: stats.articles_vendus },
    { icone: 'camion', libelle: 'À expédier', valeur: stats.a_expedier },
    { icone: 'etoile', libelle: 'Note moyenne', valeur: stats.note_moyenne ? `${stats.note_moyenne} / 5` : '—' }
  ]
  const stockFaible = produits.filter(p => p.stock < 5)

  return (
    <>
      <div className={styles.enteteContenu}>
        <h1>Tableau de bord</h1>
        <Bouton vers="/vendeur/produits/nouveau"><Icone nom="plus" taille={18} /> Nouveau produit</Bouton>
      </div>
      <div className={styles.stats}>
        {cartes.map(c => <div key={c.libelle} className={styles.stat}><Icone nom={c.icone} /><p>{c.libelle}</p><strong>{c.valeur}</strong></div>)}
      </div>
      <div className={styles.deuxBlocs}>
        <div className={styles.bloc}><h2>Ventes des 30 derniers jours</h2><CourbeVentes donnees={stats.ventes_par_jour} /></div>
        <div className={styles.bloc}><h2>Meilleures ventes</h2><Barres donnees={stats.meilleurs_produits} cle="nom" valeur="ventes" format={v => `${v} vendus`} /></div>
      </div>
      <div className={styles.bloc}>
        <h2>Stock faible ({stockFaible.length})</h2>
        {stockFaible.length === 0 ? <p style={{ margin: 0, color: 'var(--texte-doux)' }}>Tout va bien, aucun produit en rupture imminente.</p> : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {stockFaible.map(p => <li key={p.id}>{p.nom} : <strong>{p.stock}</strong> restant(s)</li>)}
          </ul>
        )}
      </div>
    </>
  )
}
