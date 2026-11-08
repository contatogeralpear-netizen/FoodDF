-- FOODDF: Isolamento Multi-Tenant do Painel Administrativo
-- Garante que cada restaurante cadastrado veja e controle apenas o seu painel e recursos.
-- Administradores globais (fooddf_private.administrators) retêm visão e controle geral.

-- 1. Função de verificação de permissão de gerência do restaurante
create or replace function fooddf_private.can_manage_restaurant(rest_id text)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    (select fooddf_private.is_admin())
    or exists (
      select 1 from public.restaurants r
      where r.id = rest_id and r.owner_id = auth.uid()
    )
  );
$$;
revoke all on function fooddf_private.can_manage_restaurant(text) from public, anon;
grant execute on function fooddf_private.can_manage_restaurant(text) to authenticated;

-- 2. Função pública para checar se o usuário autenticado pode acessar o painel
create or replace function public.fooddf_can_access_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    (select fooddf_private.is_admin())
    or exists (select 1 from public.restaurants r where r.owner_id = auth.uid())
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and u.email_confirmed_at is not null
        and not coalesce(u.is_anonymous, false)
    )
  );
$$;
revoke all on function public.fooddf_can_access_admin() from public, anon;
grant execute on function public.fooddf_can_access_admin() to authenticated;

create or replace function public.fooddf_has_panel_access()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.fooddf_can_access_admin();
$$;
revoke all on function public.fooddf_has_panel_access() from public, anon;
grant execute on function public.fooddf_has_panel_access() to authenticated;

-- 3. Função para checar o papel do usuário (global_admin vs restaurant_owner)
create or replace function public.fooddf_get_user_role()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'is_admin', fooddf_private.is_admin(),
    'restaurant_count', (
      select count(*) from public.restaurants r
      where r.owner_id = auth.uid()
    )
  );
$$;
revoke all on function public.fooddf_get_user_role() from public, anon;
grant execute on function public.fooddf_get_user_role() to authenticated;

-- 4. Triggers para garantir a integridade do owner_id em restaurants
create or replace function public.fooddf_set_restaurant_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null then
    if fooddf_private.is_admin() then
      if new.owner_id is null then
        new.owner_id := auth.uid();
      end if;
    else
      -- Donos comuns sempre são vinculados ao próprio auth.uid()
      new.owner_id := auth.uid();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_set_restaurant_owner on public.restaurants;
create trigger tr_set_restaurant_owner
  before insert on public.restaurants
  for each row execute function public.fooddf_set_restaurant_owner();

create or replace function public.fooddf_check_restaurant_owner_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not fooddf_private.is_admin() then
    if new.owner_id is distinct from old.owner_id then
      raise exception 'Apenas administradores globais podem transferir a titularidade do restaurante';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_check_restaurant_owner_update on public.restaurants;
create trigger tr_check_restaurant_owner_update
  before update on public.restaurants
  for each row execute function public.fooddf_check_restaurant_owner_update();

-- 5. Função para criação segura de restaurante vinculada ao dono
create or replace function public.fooddf_create_restaurant(payload jsonb)
returns public.restaurants language plpgsql security definer set search_path = '' as $$
declare
  inserted_row public.restaurants;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Não autenticado';
  end if;
  insert into public.restaurants (
    id, owner_id, slug, name, state, city, address, delivery_fee, whatsapp,
    pix_key, pix_name, pix_city, is_demo, status, active, accepting_orders,
    description, cuisine, contact_phone, postal_code, neighborhood, complement,
    logo_url, cover_url, is_open, opening_hours, delivery_enabled, pickup_enabled,
    min_order, estimated_time, neighborhoods, payment_methods, pix_key_type, receipt_required
  ) values (
    coalesce(payload->>'id', gen_random_uuid()::text),
    uid,
    payload->>'slug',
    payload->>'name',
    coalesce(payload->>'state', 'DF'),
    coalesce(payload->>'city', 'Brasília'),
    coalesce(payload->>'address', ''),
    coalesce((payload->>'delivery_fee')::integer, 500),
    payload->>'whatsapp',
    payload->>'pix_key',
    payload->>'pix_name',
    payload->>'pix_city',
    coalesce((payload->>'is_demo')::boolean, false),
    coalesce(payload->>'status', 'draft'),
    coalesce((payload->>'active')::boolean, true),
    coalesce((payload->>'accepting_orders')::boolean, false),
    coalesce(payload->>'description', ''),
    coalesce(payload->>'cuisine', 'Hamburgueria'),
    coalesce(payload->>'contact_phone', ''),
    coalesce(payload->>'postal_code', ''),
    coalesce(payload->>'neighborhood', ''),
    coalesce(payload->>'complement', ''),
    payload->>'logo_url',
    payload->>'cover_url',
    coalesce((payload->>'is_open')::boolean, true),
    coalesce(payload->'opening_hours', '[]'::jsonb),
    coalesce((payload->>'delivery_enabled')::boolean, true),
    coalesce((payload->>'pickup_enabled')::boolean, true),
    coalesce((payload->>'min_order')::integer, 0),
    coalesce(payload->>'estimated_time', '30–45 min'),
    coalesce(array(select jsonb_array_elements_text(payload->'neighborhoods')), '{}'::text[]),
    coalesce(array(select jsonb_array_elements_text(payload->'payment_methods')), array['cash','card']::text[]),
    coalesce(payload->>'pix_key_type', 'email'),
    coalesce((payload->>'receipt_required')::boolean, false)
  ) returning * into inserted_row;
  return inserted_row;
end;
$$;
revoke all on function public.fooddf_create_restaurant(jsonb) from public, anon;
grant execute on function public.fooddf_create_restaurant(jsonb) to authenticated;

-- 6. Atualização das políticas RLS na tabela restaurants
drop policy if exists admin_restaurants on public.restaurants;

create policy restaurant_owner_select on public.restaurants
  for select to authenticated
  using (
    (select fooddf_private.is_admin())
    or owner_id = auth.uid()
  );

create policy restaurant_owner_insert on public.restaurants
  for insert to authenticated
  with check (
    (select fooddf_private.is_admin())
    or owner_id = auth.uid()
    or owner_id is null
  );

create policy restaurant_owner_update on public.restaurants
  for update to authenticated
  using (
    (select fooddf_private.is_admin())
    or owner_id = auth.uid()
  )
  with check (
    (select fooddf_private.is_admin())
    or owner_id = auth.uid()
  );

create policy restaurant_owner_delete on public.restaurants
  for delete to authenticated
  using (
    (select fooddf_private.is_admin())
    or owner_id = auth.uid()
  );

-- 7. Atualização das políticas RLS na tabela products
drop policy if exists admin_products on public.products;

create policy restaurant_owner_products on public.products
  for all to authenticated
  using (fooddf_private.can_manage_restaurant(restaurant_id))
  with check (fooddf_private.can_manage_restaurant(restaurant_id));

-- 8. Atualização das políticas RLS na tabela categories
drop policy if exists admin_categories on public.categories;

create policy restaurant_owner_categories on public.categories
  for all to authenticated
  using (fooddf_private.can_manage_restaurant(restaurant_id))
  with check (fooddf_private.can_manage_restaurant(restaurant_id));

-- 9. Atualização das políticas RLS na tabela restaurant_plans
drop policy if exists admin_plans on public.restaurant_plans;

create policy restaurant_owner_plans on public.restaurant_plans
  for all to authenticated
  using (fooddf_private.can_manage_restaurant(restaurant_id))
  with check (fooddf_private.can_manage_restaurant(restaurant_id));

-- 10. Atualização das políticas RLS na tabela catalog_events
drop policy if exists admin_events on public.catalog_events;

create policy restaurant_owner_events on public.catalog_events
  for select to authenticated
  using (fooddf_private.can_manage_restaurant(restaurant_id));

-- 11. Atualização de storage (restaurant-images)
drop policy if exists admin_image_insert on storage.objects;
drop policy if exists admin_image_select on storage.objects;
drop policy if exists admin_image_delete on storage.objects;

create policy owner_image_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'restaurant-images'
    and fooddf_private.can_manage_restaurant(split_part(name, '/', 1))
  );

create policy owner_image_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'restaurant-images'
    and fooddf_private.can_manage_restaurant(split_part(name, '/', 1))
  );

create policy owner_image_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'restaurant-images'
    and fooddf_private.can_manage_restaurant(split_part(name, '/', 1))
  );

-- 12. Reforço de isolamento nas funções de métricas e renomeação de categoria
create or replace function public.fooddf_admin_metrics(restaurant text)
returns table(day date, visits bigint, clicks bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not fooddf_private.can_manage_restaurant(restaurant) then
    raise exception 'Acesso negado às métricas deste restaurante';
  end if;
  return query
  select event_day,
    count(*) filter (where event_type = 'visit'),
    count(*) filter (where event_type = 'whatsapp')
  from public.catalog_events
  where restaurant_id = restaurant
    and event_day >= (now() at time zone 'America/Sao_Paulo')::date - 6
  group by event_day order by event_day;
end;
$$;
revoke all on function public.fooddf_admin_metrics(text) from public, anon;
grant execute on function public.fooddf_admin_metrics(text) to authenticated;

create or replace function public.fooddf_rename_category(category_id uuid, new_name text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  old_row public.categories;
begin
  select * into strict old_row from public.categories where id = category_id for update;
  if not fooddf_private.can_manage_restaurant(old_row.restaurant_id) then
    raise exception 'Acesso negado para gerenciar categorias deste restaurante';
  end if;
  update public.categories set name = trim(new_name) where id = category_id;
  update public.products set category = trim(new_name) where restaurant_id = old_row.restaurant_id and category = old_row.name;
end;
$$;
revoke all on function public.fooddf_rename_category(uuid, text) from public, anon;
grant execute on function public.fooddf_rename_category(uuid, text) to authenticated;
