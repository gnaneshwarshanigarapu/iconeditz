create or replace function public.seed_default_content() returns jsonb language plpgsql security definer set search_path = public as $$
begin
  insert into public.settings(key,value,status) select v.key,v.value::jsonb,v.status from (values ('site','{"siteName":"ICON EDITZ","currency":"INR"}','published'),('analytics','{}','published'),('admin_setup','{"instructions":"Create an Auth user, then insert its id into public.admins."}','published')) v(key,value,status) where not exists (select 1 from public.settings s where s.key=v.key);
  insert into public.footer_content(id,content,status) select true,'{"brandName":"ICON EDITZ","description":"Creative editing, motion, and digital assets.","quickLinks":[],"socialLinks":{}}','published' where not exists (select 1 from public.footer_content where id=true);
  insert into public.cta_content(id,content,status) select true,'{"heading":"Let us build your next creative project.","visible":true}','published' where not exists (select 1 from public.cta_content where id=true);
  insert into public.legal_pages(title,content,slug,published,status) select v.title,v.content,v.slug,true,'published' from (values ('Privacy Policy','Privacy policy content will be published here.','privacy-policy'),('Terms of Service','Terms of service content will be published here.','terms-of-service')) v(title,content,slug) where not exists (select 1 from public.legal_pages p where p.slug=v.slug);
  insert into public.page_content(page,section,content,status,sort_order) select v.page,v.section,'{}','published',v.sort_order from (values ('Homepage','Hero',0),('About','Hero',0),('Services','Hero',0),('Projects','Hero',0),('Store','Hero',0),('Hire From Us','Hero',0)) v(page,section,sort_order) where not exists (select 1 from public.page_content p where p.page=v.page and p.section=v.section);
  insert into public.website_sections(page,section_key,content,status,sort_order) select v.page,v.section_key,'{}','published',v.sort_order from (values ('Hire From Us','hero',0),('Hire From Us','enquiry_form',1),('Hire From Us','contact',2),('Hire From Us','social',3),('Hire From Us','seo',4)) v(page,section_key,sort_order) where not exists (select 1 from public.website_sections s where s.page=v.page and s.section_key=v.section_key);
  return jsonb_build_object('seeded', true);
end $$;
create or replace function public.initialize_default_cms() returns jsonb language plpgsql security definer set search_path = public as $$ begin return public.seed_default_content(); end $$;
create or replace function public.repair_database() returns jsonb language plpgsql security definer set search_path = public, storage as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  perform public.seed_default_content();
  insert into storage.buckets (id, name, public) values ('icon-editz-assets','icon-editz-assets',false),('hire-request-files','hire-request-files',false) on conflict (id) do nothing;
  return jsonb_build_object('repaired', true);
end $$;
grant execute on function public.seed_default_content() to authenticated;
grant execute on function public.initialize_default_cms() to authenticated;
grant execute on function public.repair_database() to authenticated;
create or replace view public.newsletter as select id, email, status, created_at, updated_at, deleted_at from public.newsletter_subscribers;
