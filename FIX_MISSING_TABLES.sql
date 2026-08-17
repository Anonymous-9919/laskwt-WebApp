-- Create missing tables that the app expects

-- Measurements table
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  label text,
  values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.measurements enable row level security;
create policy "measurements_all_authenticated" on public.measurements
  for all to authenticated using (true) with check (true);
create index if not exists idx_measurements_customer on public.measurements (customer_id);

-- Drafts table
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('order', 'measurement')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, kind)
);
alter table public.drafts enable row level security;
create policy "drafts_own" on public.drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Style options table
create table if not exists public.style_options (
  id text primary key,
  kind text not null check (kind in ('collar', 'cuff', 'pocket', 'front', 'buttons', 'embroidery')),
  key text not null,
  label_ar text not null,
  label_en text not null,
  price_addition numeric not null default 0,
  preview_svg text,
  active boolean not null default true,
  sort_order int not null default 0,
  unique (kind, key)
);
alter table public.style_options enable row level security;
create policy "style_options_read" on public.style_options
  for select to authenticated using (true);
create policy "style_options_admin" on public.style_options
  for all using (public.is_admin(auth.uid()));

-- Touch updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_measurements_updated on public.measurements;
create trigger trg_measurements_updated before update on public.measurements
  for each row execute function public.set_updated_at();
