-- Store the default retail rate for each existing fabric. Order-specific rates
-- are saved in the order item JSON so historical pricing remains unchanged.
alter table public.style_options
  add column if not exists price_per_meter numeric not null default 0;

update public.style_options
set price_per_meter = case key
  when 'fabric_cotton' then 5
  when 'fabric_linen' then 7
  when 'fabric_wool' then 10
  when 'fabric_bureisem' then 8
  when 'fabric_polyester_blend' then 4
  else 0
end
where kind = 'fabric';

notify pgrst, 'reload schema';
