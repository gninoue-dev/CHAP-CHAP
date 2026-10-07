// Gestion de la base Supabase depuis le terminal :
//   npm run db:migrer   -> crée les tables, règles RLS et fonctions (supabase/migrations)
//   npm run db:remplir  -> charge les données de démonstration (supabase/seed.sql)
// La chaîne de connexion est lue dans .env.local (DATABASE_URL), jamais commitée.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })
const commande = process.argv[2]
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant dans .env.local (Supabase > Connect > Connection string).')
  process.exit(1)
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function executer(fichier) {
  process.stdout.write(`→ ${fichier} … `)
  await client.query(readFileSync(fichier, 'utf8'))
  console.log('ok')
}

try {
  await client.connect()
  if (commande === 'migrer') {
    const dossier = 'supabase/migrations'
    for (const f of readdirSync(dossier).filter(f => f.endsWith('.sql')).sort()) await executer(join(dossier, f))
  } else if (commande === 'remplir') {
    await executer('supabase/seed.sql')
  } else {
    console.error('Commande inconnue. Utilise "migrer" ou "remplir".')
    process.exitCode = 1
  }
} catch (erreur) {
  console.error(`\nErreur : ${erreur.message}`)
  process.exitCode = 1
} finally {
  await client.end()
}
