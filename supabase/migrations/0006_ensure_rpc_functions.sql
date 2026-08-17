-- ============================================================
-- Fix: Ensure all required RPC functions exist
-- Error: "could not find function public.create_order"
-- This may happen if migrations were partially applied or if
-- the database was restored without all functions.
-- ============================================================

-- Ensure sequence exists
create sequence if not exists public.orders_number_seq start 1;

-- Ensure next_order_number function exists
create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_val bigint;
  current_year text := to_char(now(), 'YYYY');
  max_seq bigint;
begin
  -- Get next sequence value
  select nextval('public.orders_number_seq') into seq_val;

  -- Check if sequence is behind existing orders for current year
  select coalesce(max((regexp_match(number, 'LK-' || current_year || '-(\d+)$'))[1])::bigint, 0)
  into max_seq
  from public.orders
  where number like 'LK-' || current_year || '-%';

  -- If sequence is behind existing orders, catch up
  if seq_val <= max_seq then
    perform setval('public.orders_number_seq', max_seq, true);
    select nextval('public.orders_number_seq') into seq_val;
  end if;

  return 'LK-' || current_year || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

-- Drop function with p_ parameter names if it exists to avoid PostgREST RPC lookup mismatch
drop function if exists public.create_order(uuid, text, numeric, numeric, text, numeric, numeric, numeric, uuid, jsonb, jsonb, text, date, uuid);

-- Ensure create_order function exists with exact parameter names matching PostgREST RPC call
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

-- Grant execute permission to authenticated users
grant execute on function public.create_order(uuid, text, numeric, numeric, text, numeric, numeric, numeric, uuid, jsonb, jsonb, text, date, uuid) to authenticated;
grant execute on function public.next_order_number() to authenticated;
