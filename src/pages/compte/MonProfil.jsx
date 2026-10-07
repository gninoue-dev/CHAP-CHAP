import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contextes/AuthContexte'
import { useNotifications } from '../../contextes/NotificationsContexte'
import { modifierProfil } from '../../api/client'
import { telephoneCI } from '../../lib/schemas'
import { formaterDate } from '../../lib/format'
import Bouton from '../../composants/ui/Bouton'
import Champ from '../../composants/ui/Champ'
import { Badge } from '../../composants/ui/divers'
import styles from '../../composants/mise-en-page/Espace.module.css'

const schema = z.object({
  nom_complet: z.string().trim().min(2, 'Indique ton nom'),
  telephone: z.union([z.literal(''), telephoneCI])
})

export default function MonProfil() {
  const { profil, utilisateur, rafraichirProfil } = useAuth()
  const { notifier } = useNotifications()
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
    values: { nom_complet: profil?.nom_complet ?? '', telephone: profil?.telephone ?? '' }
  })

  async function enregistrer(valeurs) {
    try {
      await modifierProfil(utilisateur.id, valeurs)
      await rafraichirProfil()
      notifier('Profil enregistré')
    } catch (e) {
      notifier(e.message, { type: 'erreur' })
    }
  }

  return (
    <>
      <h1>Mon profil</h1>
      <form className={styles.bloc} onSubmit={handleSubmit(enregistrer)} noValidate style={{ maxWidth: 560 }}>
        <p style={{ marginTop: 0 }}>
          {utilisateur.email} · <Badge couleur="orange">{profil?.role}</Badge>
          <br /><small style={{ color: 'var(--texte-doux)' }}>Membre depuis le {profil && formaterDate(profil.cree_le)}</small>
        </p>
        <Champ libelle="Nom complet" erreur={errors.nom_complet?.message} {...register('nom_complet')} />
        <Champ libelle="Téléphone" type="tel" erreur={errors.telephone?.message} {...register('telephone')} />
        <Bouton type="submit" chargement={isSubmitting} disabled={!isDirty}>Enregistrer</Bouton>
      </form>
    </>
  )
}
