import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

const NotificationsContexte = createContext(null)

function reducteur(etat, action) {
  switch (action.type) {
    case 'AJOUTER':
      return [...etat.slice(-3), action.notification]
    case 'RETIRER':
      return etat.filter(n => n.id !== action.id)
    default:
      return etat
  }
}

export function FournisseurNotifications({ children }) {
  const [notifications, dispatch] = useReducer(reducteur, [])

  const retirer = useCallback(id => dispatch({ type: 'RETIRER', id }), [])
  const notifier = useCallback((message, options = {}) => {
    const id = crypto.randomUUID()
    dispatch({ type: 'AJOUTER', notification: { id, message, type: options.type || 'succes', action: options.action } })
    setTimeout(() => dispatch({ type: 'RETIRER', id }), options.duree || 3500)
  }, [])

  const valeur = useMemo(() => ({ notifications, notifier, retirer }), [notifications, notifier, retirer])
  return <NotificationsContexte.Provider value={valeur}>{children}</NotificationsContexte.Provider>
}

export function useNotifications() {
  return useContext(NotificationsContexte)
}
