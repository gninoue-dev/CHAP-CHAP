import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import MiseEnPage from './composants/mise-en-page/MiseEnPage'
import RouteProtegee from './composants/mise-en-page/RouteProtegee'

// Chaque page est un fichier JavaScript séparé, téléchargé seulement quand on y va
const Accueil = lazy(() => import('./pages/Accueil'))
const Catalogue = lazy(() => import('./pages/Catalogue'))
const Produit = lazy(() => import('./pages/Produit'))
const Boutiques = lazy(() => import('./pages/Boutiques'))
const Boutique = lazy(() => import('./pages/Boutique'))
const Panier = lazy(() => import('./pages/Panier'))
const Commande = lazy(() => import('./pages/Commande'))
const Confirmation = lazy(() => import('./pages/Confirmation'))
const Connexion = lazy(() => import('./pages/Connexion'))
const Inscription = lazy(() => import('./pages/Inscription'))
const DevenirVendeur = lazy(() => import('./pages/DevenirVendeur'))
const Credits = lazy(() => import('./pages/Credits'))
const NonTrouve = lazy(() => import('./pages/NonTrouve'))

const EspaceCompte = lazy(() => import('./pages/compte/EspaceCompte'))
const MesCommandes = lazy(() => import('./pages/compte/MesCommandes'))
const MesFavoris = lazy(() => import('./pages/compte/MesFavoris'))
const MonProfil = lazy(() => import('./pages/compte/MonProfil'))

const EspaceVendeur = lazy(() => import('./pages/vendeur/EspaceVendeur'))
const TableauVendeur = lazy(() => import('./pages/vendeur/TableauVendeur'))
const ProduitsVendeur = lazy(() => import('./pages/vendeur/ProduitsVendeur'))
const FormulaireProduit = lazy(() => import('./pages/vendeur/FormulaireProduit'))
const VentesVendeur = lazy(() => import('./pages/vendeur/VentesVendeur'))
const ReglagesBoutique = lazy(() => import('./pages/vendeur/ReglagesBoutique'))

const EspaceAdmin = lazy(() => import('./pages/admin/EspaceAdmin'))
const TableauAdmin = lazy(() => import('./pages/admin/TableauAdmin'))
const BoutiquesAdmin = lazy(() => import('./pages/admin/BoutiquesAdmin'))
const ProduitsAdmin = lazy(() => import('./pages/admin/ProduitsAdmin'))
const CommandesAdmin = lazy(() => import('./pages/admin/CommandesAdmin'))
const UtilisateursAdmin = lazy(() => import('./pages/admin/UtilisateursAdmin'))

export default function App() {
  return (
    <Routes>
      <Route element={<MiseEnPage />}>
        <Route index element={<Accueil />} />
        <Route path="produits" element={<Catalogue />} />
        <Route path="categorie/:slug" element={<Catalogue />} />
        <Route path="produit/:slug" element={<Produit />} />
        <Route path="boutiques" element={<Boutiques />} />
        <Route path="boutique/:slug" element={<Boutique />} />
        <Route path="panier" element={<Panier />} />
        <Route path="connexion" element={<Connexion />} />
        <Route path="inscription" element={<Inscription />} />
        <Route path="credits" element={<Credits />} />

        <Route element={<RouteProtegee />}>
          <Route path="commande" element={<Commande />} />
          <Route path="commande/:numero" element={<Confirmation />} />
          <Route path="devenir-vendeur" element={<DevenirVendeur />} />
          <Route path="compte" element={<EspaceCompte />}>
            <Route index element={<MesCommandes />} />
            <Route path="favoris" element={<MesFavoris />} />
            <Route path="profil" element={<MonProfil />} />
          </Route>
        </Route>

        <Route element={<RouteProtegee roles={['vendeur']} />}>
          <Route path="vendeur" element={<EspaceVendeur />}>
            <Route index element={<TableauVendeur />} />
            <Route path="produits" element={<ProduitsVendeur />} />
            <Route path="produits/nouveau" element={<FormulaireProduit />} />
            <Route path="produits/:id" element={<FormulaireProduit />} />
            <Route path="ventes" element={<VentesVendeur />} />
            <Route path="boutique" element={<ReglagesBoutique />} />
          </Route>
        </Route>

        <Route element={<RouteProtegee roles={['admin']} />}>
          <Route path="admin" element={<EspaceAdmin />}>
            <Route index element={<TableauAdmin />} />
            <Route path="boutiques" element={<BoutiquesAdmin />} />
            <Route path="produits" element={<ProduitsAdmin />} />
            <Route path="commandes" element={<CommandesAdmin />} />
            <Route path="utilisateurs" element={<UtilisateursAdmin />} />
          </Route>
        </Route>

        <Route path="*" element={<NonTrouve />} />
      </Route>
    </Routes>
  )
}
