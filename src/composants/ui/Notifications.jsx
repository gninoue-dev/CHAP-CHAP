import { useNotifications } from '../../contextes/NotificationsContexte'
import Icone from './Icone'
import styles from './ui.module.css'

export default function Notifications() {
  const { notifications, retirer } = useNotifications()
  return (
    <div className={styles.zoneNotifications} aria-live="polite">
      {notifications.map(n => (
        <div key={n.id} className={`${styles.notification} ${n.type === 'erreur' ? styles.erreurNotif : ''}`}>
          <Icone nom={n.type === 'erreur' ? 'alerte' : 'verifie'} />
          <span>{n.message}</span>
          {n.action && <button onClick={() => { n.action.rappel(); retirer(n.id) }}>{n.action.libelle}</button>}
        </div>
      ))}
    </div>
  )
}
