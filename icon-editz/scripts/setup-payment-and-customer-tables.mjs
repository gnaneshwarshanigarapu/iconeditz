import dotenv from 'dotenv'
import { getSupabaseAdmin } from '../server/lib/supabaseAdmin.js'

dotenv.config({ path: '.env' })

;(async () => {
  console.log('Ensuring payment_attempts, customers, and orders tables in Supabase...')
  const supabase = getSupabaseAdmin()

  // 1. Check/Insert initial payment_attempts
  try {
    const { data, error } = await supabase.from('payment_attempts').select('id').limit(1)
    if (error && (error.code === 'PGRST205' || /does not exist/i.test(error.message))) {
      console.log('Creating payment_attempts table is required via database migration or RPC...')
    } else {
      console.log('✓ payment_attempts table exists!')
    }
  } catch (err) {
    console.error('Error checking payment_attempts:', err.message)
  }

  // 2. Check customers table
  try {
    const { data, error } = await supabase.from('customers').select('id,email,total_orders,total_spent').limit(1)
    if (error) console.log('Customers table columns note:', error.message)
    else console.log('✓ customers table exists!')
  } catch (err) {
    console.error('Error checking customers:', err.message)
  }
})()
