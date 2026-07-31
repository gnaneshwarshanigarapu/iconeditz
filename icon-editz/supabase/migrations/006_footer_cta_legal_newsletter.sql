create table if not exists public.footer_content (
  id boolean primary key default true check (id),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.cta_content (
  id boolean primary key default true check (id),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  seo_title text,
  seo_description text,
  slug text not null unique,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'active'
);
alter table public.footer_content enable row level security;
alter table public.cta_content enable row level security;
alter table public.legal_pages enable row level security;
alter table public.newsletter_subscribers enable row level security;
create policy "Footer public read" on public.footer_content for select using (true);
create policy "CTA public read" on public.cta_content for select using (true);
create policy "Legal public read published" on public.legal_pages for select using (published = true);
create policy "Newsletter public subscribe" on public.newsletter_subscribers for insert with check (status = 'active');
create policy "Footer admin manage" on public.footer_content for all using (public.is_admin()) with check (public.is_admin());
create policy "CTA admin manage" on public.cta_content for all using (public.is_admin()) with check (public.is_admin());
create policy "Legal admin manage" on public.legal_pages for all using (public.is_admin()) with check (public.is_admin());
create policy "Newsletter admin manage" on public.newsletter_subscribers for all using (public.is_admin()) with check (public.is_admin());
insert into public.legal_pages (title, slug, published) values
  ('Terms & Conditions', 'terms-and-conditions', true),
  ('Privacy Policy', 'privacy-policy', true),
  ('Refund Policy', 'refund-policy', true),
  ('Shipping Policy', 'shipping-policy', true),
  ('Cancellation Policy', 'cancellation-policy', true),
  ('License Agreement', 'license-agreement', true),
  ('Cookies Policy', 'cookies-policy', true)
on conflict (slug) do nothing;
update public.footer_content
set content = content || '{"quickLinksTitle":"Quick Links","contactTitle":"Contact","mapLabel":"Google Maps","emailPlaceholder":"Email address"}'::jsonb
where id = true;
insert into public.footer_content (id, content) values (true, '{"brandName":"ICON EDITZ","description":"Premium video editing, motion graphics, and brand storytelling.","logo":"/assets/logos/icon-editz.jpg","quickLinks":[{"label":"Home","url":"/"},{"label":"About","url":"/about"},{"label":"Services","url":"/services"},{"label":"Projects","url":"/projects"},{"label":"Store","url":"/store"},{"label":"Hire From Us","url":"/hire"},{"label":"FAQ","url":"/#faq"}],"socialLinks":{"youtube":"","instagram":"","facebook":"","linkedin":"","twitter":""},"address":"","email":"","phone":"","businessHours":"","mapUrl":"","newsletterTitle":"Stay in the loop","newsletterDescription":"Creative updates and new assets, delivered occasionally.","newsletterButtonText":"Subscribe","copyrightText":"© 2026 ICON EDITZ. All rights reserved.","legalLinks":[{"label":"Terms & Conditions","url":"/legal/terms-and-conditions"},{"label":"Privacy Policy","url":"/legal/privacy-policy"},{"label":"Refund Policy","url":"/legal/refund-policy"},{"label":"Shipping Policy","url":"/legal/shipping-policy"},{"label":"Cancellation Policy","url":"/legal/cancellation-policy"},{"label":"License Agreement","url":"/legal/license-agreement"},{"label":"Cookies Policy","url":"/legal/cookies-policy"}],"backgroundColor":"#0f0a1f","accentColor":"#9d5cff"}') on conflict (id) do nothing;
insert into public.cta_content (id, content) values (true, '{"heading":"Let’s create your next standout project.","subheading":"Tell us what you are building and we will take it from there.","primaryButton":"Hire From Us","primaryButtonUrl":"/hire","secondaryButton":"View Projects","secondaryButtonUrl":"/projects","backgroundImage":"","backgroundGradient":"linear-gradient(135deg, rgba(157,92,255,.24), rgba(255,255,255,.05), transparent)","visible":true}') on conflict (id) do nothing;
