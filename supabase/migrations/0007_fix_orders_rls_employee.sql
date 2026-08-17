-- ============================================================
-- Fix: Orders RLS policy blocking employee inserts
-- Employees get "new row violates row-level security policy"
-- because the fallback direct insert runs as the employee user
-- and some RLS policy may be blocking them.
-- This migration ensures all tables are accessible to all
-- authenticated users and the create_order function is correct.
-- ============================================================

-- 1. Ensure orders table has open RLS for all authenticated users
--    (both read and write for any authenticated user)
drop policy if exists "orders_all_authenticated" on public.orders;
create policy "orders_all_authenticated" on public.orders
  for all to authenticated using (true) with check (true);

-- 2. Ensure measurements table has open RLS for all authenticated users
drop policy if exists "measurements_all_authenticated" on public.measurements;
create policy "measurements_all_authenticated" on public.measurements
  for all to authenticated using (true) with check (true);

-- 3. Ensure customers table has open RLS for all authenticated users
drop policy if exists "customers_all_authenticated" on public.customers;
create policy "customers_all_authenticated" on public.customers
  for all to authenticated using (true) with check (true);

-- 4. Drop ALL existing versions of create_order to avoid signature conflicts
drop function if exists public.create_order(uuid, text, numeric, numeric, text, numeric, numeric, numeric, uuid, jsonb, jsonb, text, date, uuid);

-- Also drop any version with p_ prefix that might still exist from 0001_init.sql
-- These are the same signature so the above covers both

-- 5. Recreate create_order with matching parameter names (no p_ prefix)
--    SECURITY DEFINER means it runs as the function owner (superuser),
--    completely bypassing RLS — so employees can always create orders.
create or replace function public.create_order(
  customer_id uuid,
  status text,
  subtotal numeric,
  customization_total numeric,
  discount_type text,
  discount_value numeric,
  discount_amount numeric,
  total numeric,
  measurement_id uuid,
  measurements jsonb,
  items jsonb,
  notes text,
  due_date date,
  created_by uuid
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

-- 6. Grant execute to authenticated users
grant execute on function public.create_order(uuid, text, numeric, numeric, text, numeric, numeric, numeric, uuid, jsonb, jsonb, text, date, uuid) to authenticated;
grant execute on function public.next_order_number() to authenticated;

-- 7. Notify: reload PostgREST schema cache
notify pgrst, 'reload schema';
