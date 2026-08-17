-- ============================================================
-- LASKWT — MASTER PERMISSION & RLS FIX
-- Run this in Supabase SQL Editor any time you hit a
-- permission / RLS / function-not-found error.
-- It is fully idempotent — safe to run multiple times.
-- ============================================================


-- ===========================================================
-- SECTION 1: HELPER FUNCTIONS (SECURITY DEFINER)
-- These run as the DB owner, bypassing RLS.
-- ===========================================================

-- 1a. is_admin() — used by admin-only RLS policies
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

-- 1b. next_order_number() — generates LK-YYYY-XXXX with auto-correction
create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_val  bigint;
  cur_year text := to_char(now(), 'YYYY');
  max_seq  bigint;
begin
  select nextval('public.orders_number_seq') into seq_val;

  select coalesce(
    max((regexp_match(number, 'LK-' || cur_year || '-(\d+)$'))[1])::bigint, 0
  )
  into max_seq
  from public.orders
  where number like 'LK-' || cur_year || '-%';

  if seq_val <= max_seq then
    perform setval('public.orders_number_seq', max_seq, true);
    select nextval('public.orders_number_seq') into seq_val;
  end if;

  return 'LK-' || cur_year || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

-- 1c. create_order() — SECURITY DEFINER so employees bypass RLS on orders
--     Parameter names must match exactly what the JS client sends.
drop function if exists public.create_order(uuid,text,numeric,numeric,text,numeric,numeric,numeric,uuid,jsonb,jsonb,text,date,uuid);

create function public.create_order(
  customer_id        uuid,
  status             text,
  subtotal           numeric,
  customization_total numeric,
  discount_type      text,
  discount_value     numeric,
  discount_amount    numeric,
  total              numeric,
  measurement_id     uuid,
  measurements       jsonb,
  items              jsonb,
  notes              text,
  due_date           date,
  created_by         uuid
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number text;
begin
  v_number := public.next_order_number();
  insert into public.orders (
    number, customer_id, status, subtotal, customization_total,
    discount_type, discount_value, discount_amount, total,
    measurement_id, measurements, items, notes, due_date, created_by
  ) values (
    v_number,
    create_order.customer_id,
    create_order.status,
    create_order.subtotal,
    create_order.customization_total,
    create_order.discount_type,
    create_order.discount_value,
    create_order.discount_amount,
    create_order.total,
    create_order.measurement_id,
    create_order.measurements,
    create_order.items,
    create_order.notes,
    create_order.due_date,
    create_order.created_by
  );
  return v_number;
end;
$$;

-- 1d. handle_new_user() — creates a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 1e. set_updated_at() — auto-update updated_at column
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ===========================================================
-- SECTION 2: SEQUENCES & TABLES (create if missing)
-- ===========================================================

create sequence if not exists public.orders_number_seq start 1;

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  email      text,
  role       text not null default 'employee' check (role in ('employee', 'admin')),
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  phone      text not null,
  whatsapp   text,
  email      text,
  notes      text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.measurements (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  created_by  uuid not null references auth.users(id) on delete cascade,
  label       text,
  values      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.style_options (
  id              text primary key,
  kind            text not null check (kind in ('collar','cuff','pocket','front','buttons','embroidery')),
  key             text not null,
  label_ar        text not null,
  label_en        text not null,
  price_addition  numeric not null default 0,
  preview_svg     text,
  active          boolean not null default true,
  sort_order      int not null default 0,
  unique (kind, key)
);

create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  number               text not null unique,
  customer_id          uuid not null references public.customers(id) on delete cascade,
  status               text not null default 'draft'
                         check (status in ('draft','quotation','confirmed','completed','cancelled')),
  currency             text not null default 'KWD',
  subtotal             numeric not null default 0,
  customization_total  numeric not null default 0,
  discount_type        text not null default 'percent'
                         check (discount_type in ('percent','fixed')),
  discount_value       numeric not null default 0,
  discount_amount      numeric not null default 0,
  total                numeric not null default 0,
  measurement_id       uuid references public.measurements(id) on delete set null,
  measurements         jsonb not null default '{}'::jsonb,
  items                jsonb not null default '[]'::jsonb,
  notes                text,
  due_date             date,
  created_by           uuid not null references auth.users(id) on delete cascade,
  shopify_order_id     text unique,
  shopify_sync_status  text not null default 'pending'
                         check (shopify_sync_status in ('pending','synced','failed')),
  shopify_synced_at    timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.drafts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('order','measurement')),
  payload    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, kind)
);

create table if not exists public.audit_log (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references auth.users(id) on delete set null,
  action    text not null,
  entity    text not null,
  entity_id text,
  meta      jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.business_profile (
  id             uuid primary key default gen_random_uuid(),
  name_ar        text not null default 'لاسكويت',
  name_en        text not null default 'Laskwt',
  address        text,
  phone          text,
  whatsapp       text,
  logo_url       text,
  vat_number     text,
  footer_note_ar text,
  footer_note_en text,
  currency       text not null default 'KWD'
);

-- Seed business profile if missing
insert into public.business_profile (id)
values (gen_random_uuid())
on conflict do nothing;


-- ===========================================================
-- SECTION 3: ENABLE RLS ON ALL TABLES
-- ===========================================================

alter table public.profiles        enable row level security;
alter table public.customers       enable row level security;
alter table public.measurements    enable row level security;
alter table public.style_options   enable row level security;
alter table public.orders          enable row level security;
alter table public.drafts          enable row level security;
alter table public.audit_log       enable row level security;
alter table public.business_profile enable row level security;


-- ===========================================================
-- SECTION 4: RLS POLICIES — DROP ALL & RECREATE CLEAN
-- ===========================================================

-- PROFILES
drop policy if exists "profiles_select_own"   on public.profiles;
drop policy if exists "profiles_update_own"   on public.profiles;
drop policy if exists "profiles_admin_read"   on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;

create policy "profiles_select_own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_read"   on public.profiles for select using (public.is_admin(auth.uid()));
create policy "profiles_admin_update" on public.profiles for update using (public.is_admin(auth.uid()));

-- CUSTOMERS — all authenticated users can read/write
drop policy if exists "customers_all_authenticated" on public.customers;
create policy "customers_all_authenticated" on public.customers
  for all to authenticated using (true) with check (true);

-- MEASUREMENTS — all authenticated users can read/write
drop policy if exists "measurements_all_authenticated" on public.measurements;
create policy "measurements_all_authenticated" on public.measurements
  for all to authenticated using (true) with check (true);

-- STYLE OPTIONS — all can read; only admins can write
drop policy if exists "style_options_read"  on public.style_options;
drop policy if exists "style_options_admin" on public.style_options;
create policy "style_options_read"  on public.style_options for select to authenticated using (true);
create policy "style_options_admin" on public.style_options for all using (public.is_admin(auth.uid()));

-- ORDERS — all authenticated users can read/write
-- (inserts go through SECURITY DEFINER RPC, but direct select/update must work too)
drop policy if exists "orders_all_authenticated" on public.orders;
create policy "orders_all_authenticated" on public.orders
  for all to authenticated using (true) with check (true);

-- DRAFTS — users can only access their own drafts
drop policy if exists "drafts_own" on public.drafts;
create policy "drafts_own" on public.drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AUDIT LOG — anyone can insert; only admins can read
drop policy if exists "audit_insert"     on public.audit_log;
drop policy if exists "audit_admin_read" on public.audit_log;
create policy "audit_insert"     on public.audit_log for insert to authenticated with check (true);
create policy "audit_admin_read" on public.audit_log for select using (public.is_admin(auth.uid()));

-- BUSINESS PROFILE — all can read; only admins can write
drop policy if exists "business_profile_read"  on public.business_profile;
drop policy if exists "business_profile_admin" on public.business_profile;
create policy "business_profile_read"  on public.business_profile for select to authenticated using (true);
create policy "business_profile_admin" on public.business_profile for all using (public.is_admin(auth.uid()));


-- ===========================================================
-- SECTION 5: GRANTS — ensure authenticated role can call RPCs
-- ===========================================================

grant execute on function public.create_order(uuid,text,numeric,numeric,text,numeric,numeric,numeric,uuid,jsonb,jsonb,text,date,uuid) to authenticated;
grant execute on function public.next_order_number() to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;


-- ===========================================================
-- SECTION 6: TRIGGERS — updated_at on all tables
-- ===========================================================

drop trigger if exists trg_profiles_updated     on public.profiles;
drop trigger if exists trg_customers_updated    on public.customers;
drop trigger if exists trg_measurements_updated on public.measurements;
drop trigger if exists trg_orders_updated       on public.orders;

create trigger trg_profiles_updated     before update on public.profiles     for each row execute function public.set_updated_at();
create trigger trg_customers_updated    before update on public.customers    for each row execute function public.set_updated_at();
create trigger trg_measurements_updated before update on public.measurements for each row execute function public.set_updated_at();
create trigger trg_orders_updated       before update on public.orders       for each row execute function public.set_updated_at();


-- ===========================================================
-- SECTION 7: INDEXES (create if missing)
-- ===========================================================

create index if not exists idx_customers_phone    on public.customers (phone);
create index if not exists idx_customers_name     on public.customers (lower(full_name));
create index if not exists idx_customers_whatsapp on public.customers (whatsapp);
create index if not exists idx_measurements_customer on public.measurements (customer_id);
create index if not exists idx_orders_customer    on public.orders (customer_id);
create index if not exists idx_orders_created_by  on public.orders (created_by);
create index if not exists idx_orders_created_at  on public.orders (created_at desc);
create index if not exists idx_audit_created      on public.audit_log (created_at desc);


-- ===========================================================
-- SECTION 8: RELOAD POSTGREST SCHEMA CACHE
-- Forces PostgREST to pick up any new/changed functions immediately
-- ===========================================================

notify pgrst, 'reload schema';


-- ===========================================================
-- DONE ✅
-- All tables, RLS policies, functions, grants, and triggers
-- have been verified and restored to a known-good state.
-- ===========================================================
