/**
 * apply-migrations.mjs — Villa Paradise Tahiti
 *
 * Applique les migrations + seed Supabase via une connexion PostgreSQL directe.
 * Nécessite DATABASE_URL dans .env.local.
 *
 *   npm run db:migrate
 *
 * DATABASE_URL : Supabase Dashboard → Settings → Database
 *               → Connection string → URI (mode "Session" ou "Transaction")
 *   Format : postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import pkg from '@next/env'
const { loadEnvConfig } = pkg

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const { combinedEnv } = loadEnvConfig(ROOT)

const DATABASE_URL = combinedEnv.DATABASE_URL

if (!DATABASE_URL) {
  console.error(
    '❌  DATABASE_URL manquant dans .env.local\n' +
    '   Supabase Dashboard → Settings → Database → Connection string (URI)\n' +
    '   Format : postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres'
  )
  process.exit(1)
}

const MIGRATIONS = [
  'supabase/migrations/001_initial.sql',
  'supabase/migrations/002_rls.sql',
  'supabase/migrations/004_access_token.sql',
  'supabase/seed.sql',
]

const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

console.log('\n📦  Connexion à Supabase PostgreSQL...\n')

try {
  await client.connect()
  console.log('✅  Connecté\n')

  for (const file of MIGRATIONS) {
    const label = file.replace('supabase/', '')
    const sql = readFileSync(resolve(ROOT, file), 'utf8')

    process.stdout.write(`⏳  ${label} ...`)
    try {
      await client.query(sql)
      console.log(`  ✅`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Ignorer les erreurs "already exists" — le SQL utilise IF NOT EXISTS
      if (
        msg.includes('already exists') ||
        msg.includes('duplicate') ||
        msg.includes('does not exist') && file.includes('seed')
      ) {
        console.log(`  ⚠️  (ignoré : ${msg.slice(0, 80)})`)
      } else {
        console.log(`  ❌`)
        throw err
      }
    }
  }

  console.log('\n🎉  Toutes les migrations appliquées avec succès.\n')
} catch (err) {
  console.error('\n❌  Échec :', err instanceof Error ? err.message : err)
  process.exit(1)
} finally {
  await client.end()
}
