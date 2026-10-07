import { Suspense, useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Entete from './Entete'
import PiedDePage from './PiedDePage'
import TiroirPanier from '../panier/TiroirPanier'
import Notifications from '../ui/Notifications'
import { ChargementPage, FrontiereErreur } from '../ui/divers'

export default function MiseEnPage() {
  const [panierOuvert, setPanierOuvert] = useState(false)
  const { pathname } = useLocation()
  const ouvrirPanier = useCallback(() => setPanierOuvert(true), [])
  const fermerPanier = useCallback(() => setPanierOuvert(false), [])

  // remonte en haut à chaque changement de page
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <a href="#contenu" className="lien-evitement">Aller au contenu</a>
      <Entete ouvrirPanier={ouvrirPanier} />
      <main id="contenu" tabIndex={-1}>
        <FrontiereErreur key={pathname}>
          <Suspense fallback={<ChargementPage />}>
            <Outlet context={{ ouvrirPanier }} />
          </Suspense>
        </FrontiereErreur>
      </main>
      <PiedDePage />
      <TiroirPanier ouvert={panierOuvert} onFermer={fermerPanier} />
      <Notifications />
    </>
  )
}
