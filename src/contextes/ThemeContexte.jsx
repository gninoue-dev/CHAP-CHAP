import { createContext, useContext, useEffect } from 'react'
import { useStockageLocal } from '../hooks/useStockageLocal'

const ThemeContexte = createContext(null)

export function FournisseurTheme({ children }) {
  const prefereSombre = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  const [theme, setTheme] = useStockageLocal('theme', prefereSombre ? 'sombre' : 'clair')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const basculerTheme = () => setTheme(t => (t === 'sombre' ? 'clair' : 'sombre'))
  return <ThemeContexte.Provider value={{ theme, basculerTheme }}>{children}</ThemeContexte.Provider>
}

export function useTheme() {
  return useContext(ThemeContexte)
}
