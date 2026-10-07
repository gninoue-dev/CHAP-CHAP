// GitHub Pages ne connaît pas les routes de React Router : en servant index.html
// comme page 404, un lien direct vers /produit/xxx ouvre quand même l'application.
import { copyFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/404.html créé')
