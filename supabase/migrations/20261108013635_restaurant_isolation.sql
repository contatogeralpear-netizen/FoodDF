-- Each verified owner has one restaurant. No global administration in this release.
create table fooddf_private.restaurant_members(restaurant_id text not null references public.restaurants(id) on delete cascade,email text primary key check(email=lower(email)));
alter table fooddf_private.restaurant_members enable row level security;
revoke all on fooddf_private.restaurant_members from public,anon,authenticated;
insert into fooddf_private.restaurant_members values('brasa-burger','contatogeralpear@gmail.com');
create or replace function fooddf_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select false; $$;
create function fooddf_private.can_manage(rid text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users u join fooddf_private.restaurant_members m on m.email=lower(u.email) where u.id=auth.uid() and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false) and m.restaurant_id=rid);
$$;
revoke all on function fooddf_private.can_manage(text) from public,anon;
grant execute on function fooddf_private.can_manage(text) to authenticated;
create function public.fooddf_has_panel_access() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and not coalesce(is_anonymous,false)); $$;
revoke all on function public.fooddf_has_panel_access() from public,anon;
grant execute on function public.fooddf_has_panel_access() to authenticated;
alter policy restaurants_public_catalog on public.restaurants to anon;
alter policy products_public_catalog on public.products to anon;
alter policy public_categories on public.categories to anon;
drop policy admin_restaurants on public.restaurants;
create policy owner_read on public.restaurants for select to authenticated using((select fooddf_private.can_manage(id)));
create policy owner_update on public.restaurants for update to authenticated using((select fooddf_private.can_manage(id))) with check((select fooddf_private.can_manage(id)));
alter policy admin_products on public.products using((select fooddf_private.can_manage(restaurant_id))) with check((select fooddf_private.can_manage(restaurant_id)));
alter policy admin_categories on public.categories using((select fooddf_private.can_manage(restaurant_id))) with check((select fooddf_private.can_manage(restaurant_id)));
alter policy admin_plans on public.restaurant_plans using((select fooddf_private.can_manage(restaurant_id))) with check((select fooddf_private.can_manage(restaurant_id)));
alter policy admin_events on public.catalog_events using((select fooddf_private.can_manage(restaurant_id)));
alter policy admin_image_select on storage.objects using(bucket_id='restaurant-images' and (select fooddf_private.can_manage((storage.foldername(name))[1])));
alter policy admin_image_insert on storage.objects with check(bucket_id='restaurant-images' and (select fooddf_private.can_manage((storage.foldername(name))[1])));
alter policy admin_image_delete on storage.objects using(bucket_id='restaurant-images' and (select fooddf_private.can_manage((storage.foldername(name))[1])));
-- Public customers only see the fields needed by the published menu.
revoke select on public.restaurants from anon;
grant select(id,slug,name,state,city,address,delivery_fee,whatsapp,pix_key,pix_name,pix_city,accepting_orders,is_demo,description,cuisine,logo_url,cover_url,is_open,opening_hours,delivery_enabled,pickup_enabled,min_order,estimated_time,neighborhoods,payment_methods,receipt_required,neighborhood,complement,active,status) on public.restaurants to anon;
create or replace function public.fooddf_rename_category(category_id uuid,new_name text) returns void language plpgsql security invoker set search_path='' as $$
declare old_row public.categories;
begin
 select * into strict old_row from public.categories where id=category_id for update;
 if not fooddf_private.can_manage(old_row.restaurant_id) then raise exception 'Acesso negado'; end if;
 update public.categories set name=trim(new_name) where id=category_id;
 update public.products set category=trim(new_name) where restaurant_id=old_row.restaurant_id and category=old_row.name;
end; $$;
create function public.fooddf_create_restaurant(payload jsonb) returns public.restaurants language plpgsql security definer set search_path='' as $$
declare account_email text; created public.restaurants;
begin
 select lower(email) into account_email from auth.users where id=auth.uid() and email_confirmed_at is not null and not coalesce(is_anonymous,false);
 if account_email is null then raise exception 'Confirme seu e-mail para cadastrar o restaurante'; end if;
 -- Serialize signup, including simultaneous requests from the same owner.
 perform pg_advisory_xact_lock(hashtextextended(account_email,0));
 if exists(select 1 from fooddf_private.restaurant_members where email=account_email) then raise exception 'Sua conta já possui um restaurante'; end if;
 insert into public.restaurants(name,slug,state,city,owner_id) values(payload->>'name',payload->>'slug',payload->>'state',payload->>'city',auth.uid()) returning * into created;
 insert into fooddf_private.restaurant_members values(created.id,account_email);
 return created;
end; $$;
revoke all on function public.fooddf_create_restaurant(jsonb) from public,anon;
grant execute on function public.fooddf_create_restaurant(jsonb) to authenticated;
-- owner_id is informational; changing it must never transfer ownership.
revoke insert,delete on public.restaurants from authenticated;
