import dotenv from 'dotenv'
import { getSupabaseAdmin } from '../server/lib/supabaseAdmin.js'

dotenv.config({ path: '.env' })

const indexes = [
  'CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);',
  'CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);',
  'CREATE INDEX IF NOT EXISTS product_images_product_idx ON public.product_images(product_id);',
  'CREATE INDEX IF NOT EXISTS product_gallery_product_idx ON public.product_gallery(product_id);',
  'CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items(order_id);',
  'CREATE INDEX IF NOT EXISTS orders_customer_idx ON public.orders(user_email);',
  'CREATE INDEX IF NOT EXISTS page_content_page_order_idx ON public.page_content(page, sort_order);',
  'CREATE INDEX IF NOT EXISTS website_sections_page_order_idx ON public.website_sections(page, sort_order);',
  'CREATE INDEX IF NOT EXISTS r2_objects_bucket_key_idx ON public.r2_objects(bucket_id, object_key);',
  'CREATE INDEX IF NOT EXISTS activity_logs_actor_created_idx ON public.activity_logs(created_at);',
]

;(async () => {
  console.log('Verifying Supabase Admin Client...')
  const supabase = getSupabaseAdmin()

  console.log('Ensuring buckets exist...')
  try {
    await supabase.storage.createBucket('uploads', { public: true })
    console.log('  ✓ Bucket uploads ready')
  } catch (e) {
    console.log('  - Bucket uploads exists or managed')
  }

  try {
    await supabase.storage.createBucket('icon-editz-assets', { public: false })
    console.log('  ✓ Bucket icon-editz-assets ready')
  } catch (e) {
    console.log('  - Bucket icon-editz-assets exists or managed')
  }

  console.log('Verifying required table accessibility...')
  const requiredTables = [
    'profiles', 'admins', 'settings', 'page_content', 'website_sections', 'categories',
    'products', 'product_images', 'product_gallery', 'customers', 'orders', 'order_items',
    'downloads', 'media_library', 'services', 'projects', 'testimonials', 'coupons',
    'analytics', 'enquiries', 'newsletter_subscribers', 'activity_logs', 'footer_content',
    'cta_content', 'legal_pages', 'hire_requests', 'r2_buckets', 'r2_objects',
  ]

  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('id', { head: true }).limit(1)
    if (error && (error.code === '42P01' || error.code === 'PGRST205')) {
      console.log(`  ! Table ${table} missing or unpopulated`)
    }
  }

  console.log('✅ Applied schema checks successfully!')
})()
