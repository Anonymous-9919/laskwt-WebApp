-- ============================================================
-- Fix: Reset orders_number_seq to avoid duplicate order numbers
-- The sequence may have been reset or gotten out of sync with existing orders.
-- This sets it to max existing sequence value + 1 for the current year.
-- ============================================================

-- Find the maximum sequence number used in the current year and reset sequence
do $$
declare
  max_seq bigint := 0;
  current_year text := to_char(now(), 'YYYY');
  prefix text := 'LK-' || current_year || '-';
begin
  -- Extract sequence numbers from existing orders for current year
  select coalesce(max((regexp_match(number, prefix || '(\d+)$'))[1])::bigint, 0)
  into max_seq
  from public.orders
  where number like prefix || '%';

  -- Reset sequence to max_seq + 1 (so nextval returns max_seq + 1)
  if max_seq > 0 then
    perform setval('public.orders_number_seq', max_seq, true);
    raise notice 'Reset orders_number_seq to % (max existing: %)', max_seq + 1, max_seq;
  else
    raise notice 'No existing orders for year %, sequence unchanged', current_year;
  end if;
end;
$$;

-- ============================================================
-- Also fix the next_order_number function to be year-aware
-- This prevents future issues when the year changes
-- ============================================================

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

  -- Check if we've wrapped to a new year and need to reset sequence
  -- (This handles the case where sequence was not reset at year boundary)
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