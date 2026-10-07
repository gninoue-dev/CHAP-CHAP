import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../contextes/AuthContexte'
import { useNotifications } from '../contextes/NotificationsContexte'
import { schemaInscription } from '../lib/schemas'
import { PanneauVisuel } from './Connexion'
import Bouton from '../composants/ui/Bouton'
import Champ from '../composants/ui/Champ'
import styles from './Auth.module.css'

function forceMotDePasse(v = '') {
  if (!v) return 0
  let score = 0
  if (v.length >= 8) score++
  if (/\d/.test(v)) score++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score++
  return Math.max(1, score)
}

export default function Inscription() {
  const { utilisateur, inscrire } = useAuth()
  const { notifier } = useNotifications()
  const naviguer = useNavigate()
  const { state } = useLocation()
  const [erreur, setErreur] = useState('')
  const [emailEnvoye, setEmailEnvoye] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schemaInscription),
    defaultValues: { telephone: '' }
  })
  const force = forceMotDePasse(watch('motDePasse'))

  if (utilisateur && !emailEnvoye) return <Navigate to={state?.depuis || '/'} replace />

  async function envoyer(valeurs) {
    setErreur('')
    try {
      const { confirmationRequise } = await inscrire(valeurs)
      if (confirmationRequise) { setEmailEnvoye(true); return }
      notifier('Bienvenue sur CHAP CHAP !')
      naviguer(state?.depuis || '/', { replace: true })
    } catch (e) {
      setErreur(e.message)
    }
  }

  return (
    <div className="conteneur">
      <div className={styles.auth}>
        <PanneauVisuel titre="Bienvenue dans la famille CHAP CHAP" texte="Commande en quelques clics, suis tes livraisons et garde tes coups de cœur." />
        <div className={styles.formulaire}>
          <h1>Créer mon compte</h1>
          <p className={styles.intro}>Déjà inscrit ? <Link to="/connexion" state={state}>Connecte-toi</Link></p>
          {emailEnvoye ? (
            <p className={styles.succes} role="status">Presque fini ! Clique sur le lien envoyé par email pour activer ton compte.</p>
          ) : (
            <>
              {erreur && <p className={styles.erreur} role="alert">{erreur}</p>}
              <form onSubmit={handleSubmit(envoyer)} noValidate>
                <Champ libelle="Nom complet" autoComplete="name" erreur={errors.nomComplet?.message} {...register('nomComplet')} />
                <Champ libelle="Email" type="email" autoComplete="email" erreur={errors.email?.message} {...register('email')} />
                <Champ libelle={<>Téléphone <small>(facultatif)</small></>} type="tel" autoComplete="tel" placeholder="07 00 00 00 00" erreur={errors.telephone?.message} {...register('telephone')} />
                <Champ libelle="Mot de passe" type="password" autoComplete="new-password" erreur={errors.motDePasse?.message} aide="8 caractères minimum, avec un chiffre" {...register('motDePasse')} />
                <div className={styles.force} data-niveau={force} aria-hidden="true"><span /><span /><span /><span /></div>
                <Champ libelle="Confirme le mot de passe" type="password" autoComplete="new-password" erreur={errors.confirmation?.message} {...register('confirmation')} />
                <Bouton type="submit" taille="grand" large chargement={isSubmitting}>Créer mon compte</Bouton>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
