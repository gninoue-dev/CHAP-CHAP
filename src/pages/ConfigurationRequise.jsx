// Affiché tant que .env.local ne contient pas les clés Supabase
export default function ConfigurationRequise() {
  return (
    <main style={{ maxWidth: 640, margin: '10vh auto', padding: 24, fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}>
      <h1 style={{ fontFamily: 'Sora, system-ui', color: '#FF6B00' }}>CHAP CHAP : configuration requise</h1>
      <p>Le site a besoin d'un projet Supabase. Copie <code>.env.example</code> en <code>.env.local</code>, puis remplis :</p>
      <pre style={{ background: '#0F172A', color: '#E2E8F0', padding: 16, borderRadius: 12, overflowX: 'auto' }}>
        {'VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJ...'}
      </pre>
      <p>Ensuite : <code>npm run db:migrer</code>, <code>npm run db:remplir</code> et <code>npm run dev</code>.</p>
    </main>
  )
}
