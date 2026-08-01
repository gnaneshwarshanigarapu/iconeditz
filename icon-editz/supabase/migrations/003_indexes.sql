-- Every index is guarded so a legacy database can never fail here because a column is absent.
do $$
declare idx record;
begin
  for idx in select * from (values
    ('products_status_idx','products','status, created_at desc','deleted_at is null'),
    ('products_category_idx','products','category_id','deleted_at is null'),
    ('product_images_product_idx','product_images','product_id, sort_order','deleted_at is null'),
    ('product_gallery_product_idx','product_gallery','product_id, sort_order','deleted_at is null'),
    ('order_items_order_idx','order_items','order_id','deleted_at is null'),
    ('orders_customer_idx','orders','customer_id, created_at desc','deleted_at is null'),
    ('page_content_page_order_idx','page_content','page, sort_order','deleted_at is null'),
    ('website_sections_page_order_idx','website_sections','page, sort_order','deleted_at is null'),
    ('r2_objects_bucket_key_idx','r2_objects','bucket_id, object_key','deleted_at is null'),
    ('activity_logs_actor_created_idx','activity_logs','actor_id, created_at desc',null)
  ) as x(index_name, table_name, index_columns, predicate) loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=idx.table_name)
       and not exists (
         select 1 from regexp_split_to_table(idx.index_columns, ',') raw
         where not exists (select 1 from information_schema.columns where table_schema='public' and table_name=idx.table_name and column_name=trim(split_part(trim(raw), ' ', 1)))
       )
       and (idx.predicate is null or not exists (select 1 from information_schema.columns where table_schema='public' and table_name=idx.table_name and column_name='deleted_at')) then
      execute format('create index if not exists %I on public.%I (%s)%s', idx.index_name, idx.table_name, idx.index_columns, case when idx.predicate is null then '' else ' where ' || idx.predicate end);
    end if;
  end loop;
end $$;
