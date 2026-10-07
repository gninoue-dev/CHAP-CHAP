# CHAP CHAP

Marketplace ivoirienne multi-vendeurs : des boutiques vérifiées, un seul panier, livré « chap chap ».
**Démo en ligne : https://gninoue-dev.github.io/CHAP-CHAP/**

Projet réalisé pour démontrer la maîtrise de **React** sur une application complète, avec une vraie base de données.

## Fonctionnalités

- **Clients**
  - Catalogue avec recherche plein texte, filtres dans l'URL, tri et pagination.
  - Fiche produit avec zoom et vue 3D, avis et notes, favoris.
  - Panier, commande, suivi de livraison.
- **Vendeurs**
  - Demande d'ouverture de boutique, puis tableau de bord avec graphiques.
  - Gestion des produits : photos par glisser-déposer, caractéristiques dynamiques.
  - Traitement des ventes.
- **Administrateurs**
  - Statistiques globales et validation des boutiques.
  - Modération des produits, gestion des commandes et des rôles.
- **Interface**
  - Accueil en 3D interactive : sac CHAP CHAP et vitrine des rayons qui suivent la souris.
  - Thème sombre, version mobile, accessibilité au clavier.

## Ce que le code montre en React

| Sujet | Où regarder |
|---|---|
| Hooks personnalisés | `src/hooks/` (`useStockageLocal`, `useAntiRebond`, `useCompteARebours`, `useMouvementReduit` avec `useSyncExternalStore`) |
| Context + `useReducer` | `src/contextes/PanierContexte.jsx` (panier persistant et synchronisé entre onglets) |
| Données serveur | `src/hooks/requetes.js` : TanStack Query (cache, invalidation, mise à jour optimiste des favoris) |
| Routage | `src/App.jsx` : routes imbriquées, routes protégées par rôle, pages chargées à la demande (`React.lazy` + `Suspense`) |
| Formulaires | React Hook Form + Zod (`src/lib/schemas.js`), `useFieldArray` dans `FormulaireProduit.jsx` |
| 3D | React Three Fiber + Drei (`src/composants/trois-d/`) |
| Performance | `memo`, `useMemo`, découpage du code (3D et graphiques séparés), images paresseuses |
| Robustesse | frontière d'erreur, états de chargement en squelettes, états vides |
| Tests | Vitest + Testing Library (`src/tests/`) |

## Base de données (Supabase / PostgreSQL)

- `supabase/migrations/001_schema.sql` : tables, règles RLS par rôle, déclencheurs et fonctions SQL (`passer_commande` vérifie le stock et les prix côté serveur, `statistiques_admin`, `statistiques_vendeur`).
- `supabase/seed.sql` : données de démonstration (6 boutiques, 64 produits, commandes et avis).

## Lancer le projet

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Copier `.env.example` en `.env.local` et le remplir.
3. Puis :

```bash
npm install
npm run db:migrer   # crée le schéma
npm run db:remplir  # charge les données de démo
npm run dev
```

Comptes de démo (mot de passe `ChapChap2026!`) : `client@chapchap.ci`, `vendeur@chapchap.ci`, `admin@chapchap.ci`.

## Crédits

Les photos des produits viennent de Wikimedia Commons, sous licences libres ; la liste est sur la page `/credits` du site.

© DEV-GNINOUE
