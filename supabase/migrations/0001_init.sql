-- ============================================================
-- Laskwt Tailoring Management — Full Schema
-- Run in Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

-- ---------- 1. PROFILES (extends auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'employee' check (role in ('employee', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Admins may read/update any profile
create policy "profiles_admin_read" on public.profiles
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "profiles_admin_update" on public.profiles
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2. CUSTOMERS ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  notes text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;

create policy "customers_all_authenticated" on public.customers
  for all to authenticated using (true) with check (true);

create index if not exists idx_customers_phone on public.customers (phone);
create index if not exists idx_customers_name on public.customers (lower(full_name));
create index if not exists idx_customers_whatsapp on public.customers (whatsapp);

-- ---------- 3. MEASUREMENTS ----------
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

-- ---------- 4. STYLE OPTIONS (seed catalog) ----------
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
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------- 5. ORDERS ----------
create sequence if not exists public.orders_number_seq start 1;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  customer_id uuid not null references public.customers(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'quotation', 'confirmed', 'completed', 'cancelled')),
  currency text not null default 'KWD',
  subtotal numeric not null default 0,
  customization_total numeric not null default 0,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null default 0,
  discount_amount numeric not null default 0,
  total numeric not null default 0,
  measurement_id uuid references public.measurements(id) on delete set null,
  measurements jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  notes text,
  due_date date,
  created_by uuid not null references auth.users(id) on delete cascade,
  shopify_order_id text unique,
  shopify_sync_status text not null default 'pending' check (shopify_sync_status in ('pending', 'synced', 'failed')),
  shopify_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders_all_authenticated" on public.orders
  for all to authenticated using (true) with check (true);

create index if not exists idx_orders_customer on public.orders (customer_id);
create index if not exists idx_orders_created_by on public.orders (created_by);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- ---------- 6. DRAFTS (autosave) ----------
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

-- ---------- 7. AUDIT LOG ----------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "audit_insert" on public.audit_log
  for insert to authenticated with check (true);

create policy "audit_admin_read" on public.audit_log
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create index if not exists idx_audit_created on public.audit_log (created_at desc);

-- ---------- 8. BUSINESS PROFILE (single row) ----------
create table if not exists public.business_profile (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null default 'لاسكويت',
  name_en text not null default 'Laskwt',
  address text,
  phone text,
  whatsapp text,
  logo_url text,
  vat_number text,
  footer_note_ar text,
  footer_note_en text,
  currency text not null default 'KWD'
);

alter table public.business_profile enable row level security;

create policy "business_profile_read" on public.business_profile
  for select to authenticated using (true);

create policy "business_profile_admin" on public.business_profile
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Seed the single business profile row
insert into public.business_profile (id) values (gen_random_uuid())
on conflict do nothing;

-- ---------- 9. ORDER NUMBER GENERATOR ----------
create or replace function public.next_order_number()
returns text language plpgsql security definer set search_path = public as $$
declare
  seq_val bigint;
begin
  select nextval('public.orders_number_seq') into seq_val;
  return 'LK-' || to_char(now(), 'YYYY') || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

-- Atomic order creation: generates number, inserts order, returns number.
create or replace function public.create_order(
  p_customer_id uuid,
  p_status text,
  p_subtotal numeric,
  p_customization_total numeric,
  p_discount_type text,
  p_discount_value numeric,
  p_discount_amount numeric,
  p_total numeric,
  p_measurement_id uuid,
  p_measurements jsonb,
  p_items jsonb,
  p_notes text,
  p_due_date date,
  p_created_by uuid
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_number text;
begin
  v_number := public.next_order_number();
  insert into public.orders (
    number, customer_id, status, subtotal, customization_total,
    discount_type, discount_value, discount_amount, total,
    measurement_id, measurements, items, notes, due_date, created_by
  ) values (
    v_number, p_customer_id, p_status, p_subtotal, p_customization_total,
    p_discount_type, p_discount_value, p_discount_amount, p_total,
    p_measurement_id, p_measurements, p_items, p_notes, p_due_date, p_created_by
  );
  return v_number;
end;
$$;

-- ---------- 10. TOUCH-UPDATED AT ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated on public.customers;
create trigger trg_customers_updated before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
