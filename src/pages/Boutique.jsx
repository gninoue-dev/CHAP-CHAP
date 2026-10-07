import { useParams, useSearchParams } from 'react-router-dom'
import { useBoutique, useProduits } from '../hooks/requetes'
import { PRODUITS_PAR_PAGE } from '../api/catalogue'
import { formaterDate } from '../lib/format'
import GrilleProduits from '../composants/produits/GrilleProduits'
import Bouton from '../composants/ui/Bouton'
import Icone from '../composants/ui/Icone'
import { Badge, ChargementPage, EtatVide, Pagination } from '../composants/ui/divers'

export default function Boutique() {
  const { slug } = useParams()
  const [parametres, setParametres] = useSearchParams()
  const page = Number(parametres.get('page')) || 1
  const { data: boutique, isPending, isError } = useBoutique(slug)
  const produits = useProduits({ boutique: boutique?.id, page, tri: 'pertinence' })

  if (isPending) return <ChargementPage />
  if (isError) return <div className="conteneur page"><EtatVide icone="boutique" titre="Boutique introuvable" action={<Bouton vers="/boutiques">Toutes les boutiques</Bouton>} /></div>

  return (
    <>
      <section style={{ background: boutique.couleur, color: '#fff' }}>
        <div className="conteneur" style={{ display: 'flex', gap: 20, alignItems: 'center', paddingBlock: 40, flexWrap: 'wrap' }}>
          <span style={{ width: 88, height: 88, display: 'grid', placeItems: 'center', borderRadius: 24, background: 'rgba(255,255,255,.18)', fontFamily: 'var(--police-titre)', fontWeight: 800, fontSize: '2rem' }}>{boutique.nom.slice(0, 2).toUpperCase()}</span>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {boutique.nom} {boutique.est_verifiee && <Badge couleur="bleu"><Icone nom="verifie" taille={14} /> Vérifiée</Badge>}
            </h1>
            <p style={{ margin: '6px 0 0', maxWidth: 640, opacity: 0.95 }}>{boutique.description}</p>
            <p style={{ margin: '8px 0 0', opacity: 0.85, fontSize: '.9rem' }}>
              <Icone nom="localisation" taille={14} /> {boutique.ville} · Sur CHAP CHAP depuis le {formaterDate(boutique.cree_le)} · {boutique.produits?.[0]?.count ?? 0} produits
            </p>
          </div>
        </div>
      </section>
      <div className="conteneur page">
        <GrilleProduits produits={produits.data?.donnees ?? []} chargement={produits.isPending} />
        {produits.data && (
          <Pagination page={page} total={produits.data.total} parPage={PRODUITS_PAR_PAGE} onChange={p => setParametres({ page: p })} />
        )}
      </div>
    </>
  )
}
