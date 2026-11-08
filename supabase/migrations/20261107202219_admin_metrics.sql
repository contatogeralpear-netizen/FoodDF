create or replace function public.fooddf_admin_metrics(restaurant text)
returns table(day date, visits bigint, clicks bigint)
language sql stable security invoker set search_path = '' as $$
  select event_day,
    count(*) filter (where event_type = 'visit'),
    count(*) filter (where event_type = 'whatsapp')
  from public.catalog_events
  where restaurant_id = restaurant
    and event_day >= (now() at time zone 'America/Sao_Paulo')::date - 6
  group by event_day order by event_day
$$;
revoke all on function public.fooddf_admin_metrics(text) from public, anon;
grant execute on function public.fooddf_admin_metrics(text) to authenticated;
