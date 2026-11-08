create schema if not exists fooddf_private;
revoke all on schema fooddf_private from public, anon;
grant usage on schema fooddf_private to authenticated;
create table fooddf_private.administrators (email text primary key check(email=lower(email)));
alter table fooddf_private.administrators enable row level security;
revoke all on fooddf_private.administrators from public,anon,authenticated;
insert into fooddf_private.administrators(email) values ('contatogeralpear@gmail.com');
create function fooddf_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from auth.users u join fooddf_private.administrators a on lower(u.email)=a.email where u.id=auth.uid() and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false));
$$;
revoke all on function fooddf_private.is_admin() from public,anon;
grant execute on function fooddf_private.is_admin() to authenticated;
create function public.fooddf_is_admin() returns boolean language sql stable security invoker set search_path='' as $$ select fooddf_private.is_admin(); $$;
revoke all on function public.fooddf_is_admin() from public,anon;
grant execute on function public.fooddf_is_admin() to authenticated;

alter table public.restaurants
 add column description text not null default '' check(char_length(description)<=1000),
 add column cuisine text not null default 'Hamburgueria',
 add column contact_phone text not null default '',
 add column postal_code text not null default '',
 add column neighborhood text not null default '',
 add column complement text not null default '',
 add column logo_url text,
 add column cover_url text,
 add column is_open boolean not null default true,
 add column opening_hours jsonb not null default '[]'::jsonb check(jsonb_typeof(opening_hours)='array'),
 add column delivery_enabled boolean not null default true,
 add column pickup_enabled boolean not null default true,
 add column min_order integer not null default 0 check(min_order between 0 and 1000000),
 add column estimated_time text not null default '30–45 min' check(char_length(estimated_time)<=40),
 add column neighborhoods text[] not null default '{}',
 add column payment_methods text[] not null default '{pix,cash,card}' check(payment_methods <@ array['pix','cash','card']::text[]),
 add column pix_key_type text not null default 'email',
 add column receipt_required boolean not null default false;
alter table public.products
 add column image_url text,
 add column promo_price integer check(promo_price>0 and promo_price<price),
 add column serves integer not null default 1 check(serves between 1 and 20),
 add column featured boolean not null default false,
 add column extras jsonb not null default '[]'::jsonb check(jsonb_typeof(extras)='array' and jsonb_array_length(extras)<=20);
create table public.categories (
 id uuid primary key default gen_random_uuid(),restaurant_id text not null references public.restaurants(id) on delete cascade,
 name text not null check(char_length(name) between 1 and 80),sort_order integer not null default 0, unique(restaurant_id,name)
);
alter table public.categories enable row level security;
grant select on public.categories to anon,authenticated;
grant insert,update,delete on public.restaurants,public.products,public.categories to authenticated;
create policy admin_restaurants on public.restaurants for all to authenticated using((select fooddf_private.is_admin())) with check((select fooddf_private.is_admin()));
create policy admin_products on public.products for all to authenticated using((select fooddf_private.is_admin())) with check((select fooddf_private.is_admin()));
create policy admin_categories on public.categories for all to authenticated using((select fooddf_private.is_admin())) with check((select fooddf_private.is_admin()));
create policy public_categories on public.categories for select to anon,authenticated using(exists(select 1 from public.restaurants r where r.id=restaurant_id and r.status='published' and r.active));
insert into public.categories(restaurant_id,name,sort_order) select restaurant_id,category,min(sort_order) from public.products group by restaurant_id,category;
update public.products set featured=true where id='brasa-bacon';
update public.restaurants set description='Hambúrgueres artesanais, refeições e combos feitos na hora.', neighborhood='Asa Sul',postal_code='70300-000',neighborhoods=array['Asa Sul','Asa Norte'],opening_hours='[{"day":"Segunda","enabled":true,"open":"18:00","close":"23:00"},{"day":"Terça","enabled":true,"open":"18:00","close":"23:00"},{"day":"Quarta","enabled":true,"open":"18:00","close":"23:00"},{"day":"Quinta","enabled":true,"open":"18:00","close":"23:00"},{"day":"Sexta","enabled":true,"open":"18:00","close":"23:59"},{"day":"Sábado","enabled":true,"open":"18:00","close":"23:59"},{"day":"Domingo","enabled":false,"open":"18:00","close":"23:00"}]' where id='brasa-burger';

create table public.restaurant_plans (
 restaurant_id text primary key references public.restaurants(id) on delete cascade,
 trial_started_at timestamptz, requested_plan text check(requested_plan in ('pro')), requested_at timestamptz
);
alter table public.restaurant_plans enable row level security;
revoke all on public.restaurant_plans from anon;
grant select,insert,update on public.restaurant_plans to authenticated;
create policy admin_plans on public.restaurant_plans for all to authenticated using((select fooddf_private.is_admin())) with check((select fooddf_private.is_admin()));

create function public.fooddf_rename_category(category_id uuid,new_name text) returns void language plpgsql security invoker set search_path='' as $$
declare old_row public.categories;
begin
 if not fooddf_private.is_admin() then raise exception 'Acesso negado'; end if;
 select * into strict old_row from public.categories where id=category_id for update;
 update public.categories set name=trim(new_name) where id=category_id;
 update public.products set category=trim(new_name) where restaurant_id=old_row.restaurant_id and category=old_row.name;
end; $$;
revoke all on function public.fooddf_rename_category(uuid,text) from public,anon;
grant execute on function public.fooddf_rename_category(uuid,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('restaurant-images','restaurant-images',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy admin_image_insert on storage.objects for insert to authenticated with check(bucket_id='restaurant-images' and (select fooddf_private.is_admin()));
create policy admin_image_select on storage.objects for select to authenticated using(bucket_id='restaurant-images' and (select fooddf_private.is_admin()));
create policy admin_image_delete on storage.objects for delete to authenticated using(bucket_id='restaurant-images' and (select fooddf_private.is_admin()));

create table public.catalog_events (
 restaurant_id text not null references public.restaurants(id) on delete cascade,
 event_day date not null default (now() at time zone 'America/Sao_Paulo')::date,
 visitor_id uuid not null,event_type text not null check(event_type in ('visit','whatsapp')),
 primary key(restaurant_id,event_day,visitor_id,event_type)
);
alter table public.catalog_events enable row level security;
revoke all on public.catalog_events from public,anon,authenticated;
grant select on public.catalog_events to authenticated;
create policy admin_events on public.catalog_events for select to authenticated using((select fooddf_private.is_admin()));
create function fooddf_private.track_event(restaurant_slug text,visitor uuid,kind text) returns void language plpgsql security definer set search_path='' as $$
begin
 if kind not in ('visit','whatsapp') or visitor is null or char_length(restaurant_slug)>100 then return; end if;
 insert into public.catalog_events(restaurant_id,visitor_id,event_type) select r.id,visitor,kind from public.restaurants r where r.slug=restaurant_slug and r.status='published' and r.active on conflict do nothing;
end;$$;
revoke all on function fooddf_private.track_event(text,uuid,text) from public;
grant usage on schema fooddf_private to anon;
grant execute on function fooddf_private.track_event(text,uuid,text) to anon,authenticated;
create function public.fooddf_track_event(restaurant_slug text,visitor uuid,kind text) returns void language sql security invoker set search_path='' as $$ select fooddf_private.track_event(restaurant_slug,visitor,kind); $$;
revoke all on function public.fooddf_track_event(text,uuid,text) from public;
grant execute on function public.fooddf_track_event(text,uuid,text) to anon,authenticated;
