import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// BASE_URL : '/' en local, '/CHAP-CHAP/' (nom du dépôt) sur GitHub Pages
export default defineConfig({
  base: process.env.CHEMIN_DE_BASE || '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // la 3D (three.js) est lourde mais chargée seulement à la demande
    rollupOptions: {
      output: {
        // la 3D et les graphiques dans des fichiers séparés, chargés à la demande
        manualChunks(id) {
          if (/node_modules\/(three|@react-three)/.test(id)) return 'trois-d'
          if (/node_modules\/(recharts|d3-)/.test(id)) return 'graphiques'
          if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) return 'react'
          if (/node_modules\/@supabase/.test(id)) return 'supabase'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/preparation.js',
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
