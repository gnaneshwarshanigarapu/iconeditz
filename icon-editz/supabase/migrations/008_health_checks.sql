-- Admin-only diagnostic RPC. Secrets stay server-side, so external provider configuration is reported as deploy-time verification.
create or replace function public.admin_health_check() returns jsonb language plpgsql security definer set search_path = public, storage as $$
declare
  required_tables text[] := array['profiles','admins','settings','page_content','website_sections','categories','products','product_images','product_gallery','customers','orders','order_items','downloads','media_library','services','projects','testimonials','coupons','analytics','enquiries','newsletter_subscribers','activity_logs','footer_content','cta_content','legal_pages','hire_requests','r2_buckets','r2_objects'];
  audit_tables text[] := array['profiles','admins','settings','page_content','website_sections','categories','products','product_images','product_gallery','customers','orders','order_items','downloads','media_library','services','projects','testimonials','coupons','analytics','enquiries','newsletter_subscribers','activity_logs','footer_content','cta_content','legal_pages','hire_requests','r2_buckets','r2_objects'];
  expected_indexes text[] := array['products_status_idx','products_category_idx','product_images_product_idx','product_gallery_product_idx','order_items_order_idx','orders_customer_idx','page_content_page_order_idx','website_sections_page_order_idx','r2_objects_bucket_key_idx','activity_logs_actor_created_idx'];
  expected_fks text[] := array['products_category_id_fkey','product_images_product_id_fkey','product_gallery_product_id_fkey','orders_customer_id_fkey','orders_product_id_fkey','order_items_order_id_fkey','order_items_product_id_fkey','downloads_product_id_fkey','downloads_r2_object_id_fkey','r2_objects_bucket_id_fkey','media_library_r2_object_id_fkey'];
  expected_policies text[] := array['admin_manage','public_read_products','public_read_footer','public_read_cta','public_read_legal','public_subscribe','profiles_read_own','profiles_insert_own','profiles_update_own','admins_read_own'];
  t text; c text;
  missing_tables jsonb := '[]'; missing_columns jsonb := '[]'; missing_indexes jsonb := '[]'; missing_foreign_keys jsonb := '[]'; missing_policies jsonb := '[]'; rls_disabled jsonb := '[]'; missing_rpcs jsonb := '[]'; missing_buckets jsonb := '[]'; missing_seed_data jsonb := '[]';
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  foreach t in array required_tables loop
    if to_regclass('public.' || t) is null then missing_tables := missing_tables || jsonb_build_array(t); end if;
  end loop;
  foreach t in array audit_tables loop
    if to_regclass('public.' || t) is not null then
      foreach c in array array['status','created_at','updated_at','created_by','deleted_at'] loop
        if not exists (select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name=c) then missing_columns := missing_columns || jsonb_build_array(t || '.' || c); end if;
      end loop;
      if not exists (select 1 from pg_class cl join pg_namespace ns on ns.oid=cl.relnamespace where ns.nspname='public' and cl.relname=t and cl.relrowsecurity) then rls_disabled := rls_disabled || jsonb_build_array(t); end if;
    end if;
  end loop;
  foreach t in array expected_indexes loop if not exists (select 1 from pg_indexes where schemaname='public' and indexname=t) then missing_indexes := missing_indexes || jsonb_build_array(t); end if; end loop;
  foreach t in array expected_fks loop if not exists (select 1 from pg_constraint where conname=t) then missing_foreign_keys := missing_foreign_keys || jsonb_build_array(t); end if; end loop;
  foreach t in array expected_policies loop if not exists (select 1 from pg_policies where schemaname='public' and policyname=t) then missing_policies := missing_policies || jsonb_build_array(t); end if; end loop;
  foreach t in array array['admin_health_check','seed_default_content','initialize_default_cms','repair_database'] loop if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=t) then missing_rpcs := missing_rpcs || jsonb_build_array(t); end if; end loop;
  select coalesce(jsonb_agg(x.bucket), '[]'::jsonb) into missing_buckets from (select unnest(array['icon-editz-assets','hire-request-files']) bucket) x where not exists (select 1 from storage.buckets b where b.id=x.bucket);
  if not exists (select 1 from public.settings where key='site') then missing_seed_data := missing_seed_data || jsonb_build_array('settings.site'); end if;
  foreach t in array array['Homepage','About','Services','Projects','Store','Hire From Us'] loop if not exists (select 1 from public.page_content where page=t) then missing_seed_data := missing_seed_data || jsonb_build_array('page_content.' || t); end if; end loop;
  return jsonb_build_object('missing_tables',missing_tables,'missing_columns',missing_columns,'missing_indexes',missing_indexes,'missing_foreign_keys',missing_foreign_keys,'rls_disabled',rls_disabled,'missing_policies',missing_policies,'missing_storage_buckets',missing_buckets,'missing_rpc_functions',missing_rpcs,'missing_seed_data',missing_seed_data,'environment',jsonb_build_object('supabase_auth_schema',to_regclass('auth.users') is not null),'cloudflare_r2',jsonb_build_object('metadata_table',to_regclass('public.r2_objects') is not null,'credentials','verify in Vercel environment'),'razorpay',jsonb_build_object('credentials','verify in Vercel environment'),'resend',jsonb_build_object('credentials','verify in Vercel environment'));
end $$;
grant execute on function public.admin_health_check() to authenticated;
