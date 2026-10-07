import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../contextes/AuthContexte'
import { useCreerBoutique, useMaBoutique } from '../hooks/requetes'
import { schemaBoutique } from '../lib/schemas'
import Bouton from '../composants/ui/Bouton'
import Champ from '../composants/ui/Champ'
import Icone from '../composants/ui/Icone'
import { ChargementPage, EtatVide } from '../composants/ui/divers'
import styles from './Achat.module.css'

export default function DevenirVendeur() {
  const { role } = useAuth()
  const { data: boutique, isPending } = useMaBoutique()
  const creer = useCreerBoutique()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schemaBoutique),
    defaultValues: { nom: '', description: '', ville: 'Abidjan', couleur: '#FF6B00' }
  })

  if (isPending) return <ChargementPage />
  if (role === 'vendeur') return <div className="conteneur page"><EtatVide icone="boutique" titre="Tu as déjà ta boutique" action={<Bouton vers="/vendeur">Mon espace vendeur</Bouton>} /></div>
  if (boutique?.statut === 'en_attente') {
    return (
      <div className="conteneur page">
        <EtatVide icone="horloge" titre="Demande en cours de validation">
          Ta boutique « {boutique.nom} » sera vérifiée par l'équipe CHAP CHAP. Tu pourras ensuite ajouter tes produits.
        </EtatVide>
      </div>
    )
  }
  if (boutique?.statut === 'suspendue') return <div className="conteneur page"><EtatVide icone="alerte" titre="Boutique suspendue">Contacte le support CHAP CHAP.</EtatVide></div>

  const couleur = watch('couleur')
  return (
    <div className="conteneur page" style={{ maxWidth: 760 }}>
      <h1 className="titre-page">Ouvrir ma boutique</h1>
      <form className={styles.carte} onSubmit={handleSubmit(valeurs => creer.mutate(valeurs))} noValidate>
        <Champ libelle="Nom de la boutique" erreur={errors.nom?.message} {...register('nom')} />
        <Champ libelle="Présentation" multiligne erreur={errors.description?.message} placeholder="Ce que tu vends, ce qui te rend unique…" {...register('description')} />
        <div className={styles.deuxColonnes}>
          <Champ libelle="Ville" erreur={errors.ville?.message} {...register('ville')} />
          <Champ libelle="Couleur de la boutique" type="color" style={{ padding: 4, height: 48 }} {...register('couleur')} />
        </div>
        <p className={styles.encart} style={{ borderLeft: `6px solid ${couleur}` }}><Icone nom="verifie" taille={18} /> Chaque boutique est validée par un administrateur avant de pouvoir vendre.</p>
        {creer.isError && <p className={styles.erreurServeur}>{creer.error.message}</p>}
        <Bouton type="submit" taille="grand" chargement={creer.isPending} style={{ marginTop: 16 }}>Envoyer ma demande</Bouton>
      </form>
    </div>
  )
}
