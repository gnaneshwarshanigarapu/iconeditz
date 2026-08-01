-- Older product writes set `published` but omitted `status`. Keep the two public-state fields aligned.
update public.products
set status = 'published'
where published is true and status is distinct from 'published';

update public.products
set published = true
where status = 'published' and published is distinct from true;

create or replace function public.sync_product_publication() returns trigger language plpgsql as $$
begin
  new.status := coalesce(new.status, case when new.published then 'published' else 'draft' end);
  new.published := new.status = 'published';
  return new;
end $$;

drop trigger if exists sync_product_publication on public.products;
create trigger sync_product_publication before insert or update on public.products
for each row execute function public.sync_product_publication();
