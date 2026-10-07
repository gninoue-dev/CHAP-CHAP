import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../contextes/AuthContexte'
import { useNotifications } from '../contextes/NotificationsContexte'
import { schemaConnexion } from '../lib/schemas'
import Bouton from '../composants/ui/Bouton'
import Champ from '../composants/ui/Champ'
import Icone from '../composants/ui/Icone'
import styles from './Auth.module.css'

// Comptes de démonstration créés par "npm run db:remplir"
const DEMOS = [
  { libelle: 'Client', email: 'client@chapchap.ci' },
  { libelle: 'Vendeur', email: 'vendeur@chapchap.ci' },
  { libelle: 'Admin', email: 'admin@chapchap.ci' }
]
export const MOT_DE_PASSE_DEMO = 'ChapChap2026!'

export function PanneauVisuel({ titre, texte }) {
  return (
    <div className={styles.visuel} aria-hidden="true">
      <Icone nom="eclair" taille={120} plein className={styles.grosEclair} />
      <h2>{titre}</h2>
      <p>{texte}</p>
    </div>
  )
}

export default function Connexion() {
  const { utilisateur, connecter } = useAuth()
  const { notifier } = useNotifications()
  const naviguer = useNavigate()
  const { state } = useLocation()
  const [erreur, setErreur] = useState('')
  const [voir, setVoir] = useState(false)
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schemaConnexion) })

  if (utilisateur) return <Navigate to={state?.depuis || '/'} replace />

  async function envoyer({ email, motDePasse }) {
    setErreur('')
    try {
      await connecter(email, motDePasse)
      notifier('Content de te revoir !')
      naviguer(state?.depuis || '/', { replace: true })
    } catch (e) {
      setErreur(e.message)
    }
  }

  return (
    <div className="conteneur">
      <div className={styles.auth}>
        <PanneauVisuel titre="Ça fait plaisir de te revoir !" texte="Retrouve ton panier, tes favoris et le suivi de tes commandes." />
        <div className={styles.formulaire}>
          <h1>Connexion</h1>
          <p className={styles.intro}>Pas encore de compte ? <Link to="/inscription" state={state}>Inscris-toi en 1 minute</Link></p>
          {erreur && <p className={styles.erreur} role="alert">{erreur}</p>}
          <form onSubmit={handleSubmit(envoyer)} noValidate>
            <Champ libelle="Email" type="email" autoComplete="email" erreur={errors.email?.message} {...register('email')} />
            <div className={styles.motDePasse}>
              <Champ libelle="Mot de passe" type={voir ? 'text' : 'password'} autoComplete="current-password" erreur={errors.motDePasse?.message} {...register('motDePasse')} />
              <Bouton type="button" variante="fantome" taille="petit" className={styles.voir} onClick={() => setVoir(v => !v)} aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={voir}>
                <Icone nom={voir ? 'oeilBarre' : 'oeil'} taille={18} />
              </Bouton>
            </div>
            <Bouton type="submit" taille="grand" large chargement={isSubmitting}>Se connecter</Bouton>
          </form>
          <div className={styles.demo}>
            <p>Comptes de démonstration (mot de passe {MOT_DE_PASSE_DEMO}) :</p>
            <div>
              {DEMOS.map(d => (
                <Bouton key={d.email} variante="secondaire" taille="petit" onClick={() => { setValue('email', d.email); setValue('motDePasse', MOT_DE_PASSE_DEMO) }}>{d.libelle}</Bouton>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
