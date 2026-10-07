import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../contextes/AuthContexte'
import { usePanier } from '../contextes/PanierContexte'
import { usePasserCommande } from '../hooks/requetes'
import { formaterPrix, PAIEMENTS } from '../lib/format'
import { urlImage } from '../lib/images'
import { schemaAdresse } from '../lib/schemas'
import Totaux from '../composants/panier/Totaux'
import Bouton from '../composants/ui/Bouton'
import Champ from '../composants/ui/Champ'
import Icone from '../composants/ui/Icone'
import { EtatVide } from '../composants/ui/divers'
import styles from './Achat.module.css'

export default function Commande() {
  const { profil } = useAuth()
  const { lignes, sousTotal, livraison, total, vider } = usePanier()
  const passer = usePasserCommande()
  const naviguer = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schemaAdresse),
    defaultValues: { nomComplet: profil?.nom_complet ?? '', telephone: profil?.telephone ?? '', ville: 'Abidjan', quartier: '', details: '', paiement: 'orange' }
  })
  const paiement = watch('paiement')

  if (!lignes.length && !passer.isSuccess) {
    return <div className="conteneur page"><EtatVide icone="panier" titre="Rien à commander" action={<Bouton vers="/produits">Voir les produits</Bouton>}>Ton panier est vide.</EtatVide></div>
  }

  function envoyer({ paiement: moyen, ...adresse }) {
    passer.mutate({ lignes, adresse, paiement: moyen }, {
      onSuccess: numero => { vider(); naviguer(`/commande/${numero}`, { replace: true, state: { nouvelle: true } }) }
    })
  }

  return (
    <div className="conteneur page">
      <h1 className="titre-page">Finaliser ma commande</h1>
      <form className={styles.grille} onSubmit={handleSubmit(envoyer)} noValidate>
        <div style={{ display: 'grid', gap: 20 }}>
          <section className={styles.carte} aria-labelledby="titreLivraison">
            <h2 id="titreLivraison"><Icone nom="localisation" taille={20} /> Adresse de livraison</h2>
            <div className={styles.deuxColonnes}>
              <Champ libelle="Nom complet" autoComplete="name" erreur={errors.nomComplet?.message} {...register('nomComplet')} />
              <Champ libelle="Téléphone" type="tel" inputMode="tel" autoComplete="tel" placeholder="07 00 00 00 00" erreur={errors.telephone?.message} {...register('telephone')} />
              <Champ libelle="Ville" autoComplete="address-level2" erreur={errors.ville?.message} {...register('ville')} />
              <Champ libelle="Quartier / commune" placeholder="Cocody Riviera 2" erreur={errors.quartier?.message} {...register('quartier')} />
            </div>
            <Champ libelle="Point de repère" placeholder="Ex. : en face de la pharmacie, portail bleu" erreur={errors.details?.message} {...register('details')} />
          </section>

          <section className={styles.carte} aria-labelledby="titrePaiement">
            <h2 id="titrePaiement"><Icone nom="carte" taille={20} /> Paiement</h2>
            <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
              <legend className="visuellement-cache">Moyen de paiement</legend>
              <div className={styles.paiements}>
                {PAIEMENTS.map(p => (
                  <label key={p.id} className={styles.paiement}>
                    <input type="radio" value={p.id} {...register('paiement')} />
                    <span className={styles.pastillePaiement} style={{ background: p.couleur }} />
                    {p.nom}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className={styles.encart}>
              <Icone nom="bouclier" taille={18} />
              {paiement === 'especes'
                ? 'Tu paies en espèces au livreur, à la réception.'
                : 'Projet de démonstration : aucun paiement réel n\'est effectué, la commande est simplement enregistrée.'}
            </p>
          </section>
        </div>

        <aside className={`${styles.carte} ${styles.resume}`} aria-label="Récapitulatif">
          <h2>Ma commande</h2>
          <div>
            {lignes.map(l => (
              <div key={l.id} className={styles.miniLigne}>
                <img src={urlImage(l.image)} alt="" />
                <span>{l.quantite} × {l.nom}</span>
                <strong>{formaterPrix(l.prix * l.quantite)}</strong>
              </div>
            ))}
          </div>
          <Totaux sousTotal={sousTotal} livraison={livraison} total={total} />
          {passer.isError && <p className={styles.erreurServeur} role="alert">{passer.error.message}</p>}
          <Bouton type="submit" taille="grand" large chargement={passer.isPending}>
            <Icone nom="bouclier" taille={18} /> Confirmer et payer {formaterPrix(total)}
          </Bouton>
          <p className={styles.encart}><Icone nom="verifie" taille={18} /> Les prix et le stock sont vérifiés par le serveur au moment de la commande.</p>
        </aside>
      </form>
    </div>
  )
}
