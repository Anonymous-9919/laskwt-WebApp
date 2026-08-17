-- ============================================================
-- Fix: Add email column to profiles for admin users
-- ============================================================

alter table public.profiles
  add column if not exists email text;

-- Update handle_new_user to store email when creating profile
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
  );
  return new;
end;
$$;

-- ============================================================
-- Ensure customers table has open RLS for all authenticated users
-- ============================================================

drop policy if exists "customers_all_authenticated" on public.customers;
create policy "customers_all_authenticated" on public.customers
  for all to authenticated using (true) with check (true);

-- Auto-set created_by on insert if auth.uid() is available
create or replace function public.set_customer_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null or new.created_by = ''::uuid then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_customers_created_by on public.customers;
create trigger trg_customers_created_by before insert on public.customers
  for each row execute function public.set_customer_created_by();
