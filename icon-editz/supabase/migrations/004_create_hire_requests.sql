create table if not exists public.hire_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_name text not null,
  email text not null,
  phone text not null,
  company text,
  project_type text not null,
  budget text not null,
  deadline date not null,
  location text not null,
  service text not null,
  message text not null,
  reference_link text,
  preferred_contact text not null,
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'Pending' check (status in ('Pending', 'Contacted', 'In Progress', 'Completed', 'Cancelled'))
);

create index if not exists hire_requests_created_at_idx on public.hire_requests (created_at desc);
create index if not exists hire_requests_status_idx on public.hire_requests (status);
create index if not exists hire_requests_project_type_idx on public.hire_requests (project_type);

alter table public.hire_requests enable row level security;
create policy "Hire requests - admins manage" on public.hire_requests
  for all using (public.is_admin()) with check (public.is_admin());
