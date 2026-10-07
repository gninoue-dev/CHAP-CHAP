import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cles, useMaBoutique, useMutationVendeur } from '../../hooks/requetes'
import { useAuth } from '../../contextes/AuthContexte'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { modifierBoutique } from '../../api/vendeur'
import { schemaBoutique } from '../../lib/schemas'
import Bouton from '../../composants/ui/Bouton'
import Champ from '../../composants/ui/Champ'
import { Badge } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

export default function ReglagesBoutique() {
  const { utilisateur } = useAuth()
  const { data: boutique } = useMaBoutique()
  const { notifier } = useNotifications()
  const modifier = useMutationVendeur(champs => modifierBoutique(boutique.id, champs), [cles.maBoutique(utilisateur.id)])
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schemaBoutique),
    values: { nom: boutique.nom, description: boutique.description, ville: boutique.ville, couleur: boutique.couleur }
  })

  return (
    <>
      <h1>Ma boutique</h1>
      <form className={styles.bloc} style={{ maxWidth: 640 }} noValidate
        onSubmit={handleSubmit(v => modifier.mutate(v, { onSuccess: () => notifier('Boutique mise à jour'), onError: e => notifier(e.message, { type: 'erreur' }) }))}>
        <p style={{ marginTop: 0 }}>
          Statut : <Badge couleur="vert">Active</Badge> {boutique.est_verifiee && <Badge couleur="bleu">Vérifiée</Badge>}
        </p>
        <Champ libelle="Nom" erreur={errors.nom?.message} {...register('nom')} />
        <Champ libelle="Présentation" multiligne erreur={errors.description?.message} {...register('description')} />
        <Champ libelle="Ville" erreur={errors.ville?.message} {...register('ville')} />
        <Champ libelle="Couleur" type="color" style={{ padding: 4, height: 48, maxWidth: 120 }} {...register('couleur')} />
        <Bouton type="submit" chargement={modifier.isPending} disabled={!isDirty}>Enregistrer</Bouton>
      </form>
    </>
  )
}
