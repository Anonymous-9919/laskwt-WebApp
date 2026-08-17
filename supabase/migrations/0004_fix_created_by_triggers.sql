-- ============================================================
-- Fix: Corrected customer created_by trigger
-- The previous trigger had a bug: `new.created_by = ''::uuid` fails
-- because casting empty string to UUID throws an error before comparison.
-- ============================================================

-- Drop the buggy trigger and function
drop trigger if exists trg_customers_created_by on public.customers;
drop function if exists public.set_customer_created_by();

-- Create corrected function that safely handles empty strings
create or replace function public.set_customer_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if created_by is null or empty string (using text comparison before UUID cast)
  if new.created_by is null or new.created_by::text = '' then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

-- Recreate trigger
create trigger trg_customers_created_by before insert on public.customers
  for each row execute function public.set_customer_created_by();

-- ============================================================
-- Add similar triggers for measurements and orders tables
-- to ensure created_by is always set from auth.uid()
-- ============================================================

-- Measurements trigger
create or replace function public.set_measurement_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null or new.created_by::text = '' then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_measurements_created_by on public.measurements;
create trigger trg_measurements_created_by before insert on public.measurements
  for each row execute function public.set_measurement_created_by();

-- Orders trigger
create or replace function public.set_order_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null or new.created_by::text = '' then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_created_by on public.orders;
create trigger trg_orders_created_by before insert on public.orders
  for each row execute function public.set_order_created_by();