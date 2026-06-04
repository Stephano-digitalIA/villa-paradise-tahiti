import { createClient } from '@supabase/supabase-js'

async function main() {
  const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error, count } = await c
    .from('excursion_providers')
    .select('id, name, active, contact_email', { count: 'exact' })
  console.log('Count:', count, '— Error:', error?.message ?? 'none')
  console.log(JSON.stringify(data, null, 2))
}
main()
