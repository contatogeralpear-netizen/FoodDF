create table fooddf_private.restaurant_restrictions (restaurant_id text primary key references public.restaurants(id) on delete cascade, blocked boolean not null default false, deleted_at timestamptz);
create table fooddf_private.plan_assignments (restaurant_id text primary key references public.restaurants(id) on delete cascade, plan text not null check(plan in ('none','trial','pro')), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id));
revoke all on fooddf_private.restaurant_restrictions, fooddf_private.plan_assignments from public,anon,authenticated;
create or replace function fooddf_private.can_manage(rid text) returns boolean language sql stable security definer set search_path='' as $$
 select fooddf_private.master_allowed() or (not exists(select 1 from fooddf_private.restaurant_restrictions x where x.restaurant_id=rid and x.deleted_at is not null) and exists(select 1 from auth.users u join fooddf_private.restaurant_members m on m.email=lower(u.email) where u.id=auth.uid() and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false) and m.restaurant_id=rid));
$$;
create or replace function fooddf_private.prevent_reactivation() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.active and exists(select 1 from fooddf_private.restaurant_restrictions x where x.restaurant_id=new.id and (x.blocked or x.deleted_at is not null)) then raise exception 'Este restaurante está bloqueado ou excluído'; end if;
 return new;
end $$;
create trigger fooddf_prevent_reactivation before update of active on public.restaurants for each row execute function fooddf_private.prevent_reactivation();
create or replace function public.fooddf_master_restrict(rid text, action text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 if not exists(select 1 from public.restaurants where id=rid) then raise exception 'Restaurante não encontrado'; end if;
 if action='block' then
  insert into fooddf_private.restaurant_restrictions(restaurant_id,blocked) values(rid,true) on conflict(restaurant_id) do update set blocked=true;
  update public.restaurants set active=false where id=rid;
 elsif action='unblock' then
  update fooddf_private.restaurant_restrictions set blocked=false where restaurant_id=rid and deleted_at is null;
 elsif action='delete' then
  insert into fooddf_private.restaurant_restrictions(restaurant_id,blocked,deleted_at) values(rid,true,now()) on conflict(restaurant_id) do update set blocked=true,deleted_at=now();
  update public.restaurants set active=false where id=rid;
 elsif action='restore' then
  update fooddf_private.restaurant_restrictions set blocked=false,deleted_at=null where restaurant_id=rid;
 else raise exception 'Ação inválida'; end if;
end $$;
revoke all on function public.fooddf_master_restrict(text,text) from public,anon;
grant execute on function public.fooddf_master_restrict(text,text) to authenticated;
create or replace function public.fooddf_master_set_plan(rid text, selected_plan text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 if selected_plan not in ('none','trial','pro') then raise exception 'Plano inválido'; end if;
 insert into fooddf_private.plan_assignments(restaurant_id,plan,updated_by) values(rid,selected_plan,auth.uid()) on conflict(restaurant_id) do update set plan=excluded.plan,updated_at=now(),updated_by=auth.uid();
end $$;
revoke all on function public.fooddf_master_set_plan(text,text) from public,anon;
grant execute on function public.fooddf_master_set_plan(text,text) to authenticated;
create or replace function public.fooddf_current_plan(rid text) returns text language plpgsql stable security definer set search_path='' as $$
begin
 if not fooddf_private.can_manage(rid) then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 return coalesce((select plan from fooddf_private.plan_assignments where restaurant_id=rid),'none');
end $$;
revoke all on function public.fooddf_current_plan(text) from public,anon;
grant execute on function public.fooddf_current_plan(text) to authenticated;
create or replace function public.fooddf_master_extras() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 return jsonb_build_object('restrictions',coalesce((select jsonb_agg(to_jsonb(x)) from fooddf_private.restaurant_restrictions x),'[]'::jsonb),'plans',coalesce((select jsonb_agg(jsonb_build_object('restaurant_id',restaurant_id,'plan',plan)) from fooddf_private.plan_assignments),'[]'::jsonb));
end $$;
revoke all on function public.fooddf_master_extras() from public,anon;
grant execute on function public.fooddf_master_extras() to authenticated;
create or replace function public.fooddf_master_top20(date_from date, date_to date, uf text, municipality text, category text) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(to_jsonb(t) order by t.sales desc,t.total desc,t.name) from (select r.id,r.name,r.city,r.state,r.cuisine,count(*) as sales,sum(o.total) as total from public.orders o join public.restaurants r on r.id=o.restaurant_id where o.status='completed' and not r.is_demo and (date_from is null or (o.created_at at time zone 'America/Sao_Paulo')::date>=date_from) and (date_to is null or (o.created_at at time zone 'America/Sao_Paulo')::date<=date_to) and (coalesce(uf,'')='' or r.state=uf) and (coalesce(municipality,'')='' or r.city=municipality) and (coalesce(category,'')='' or r.cuisine=category) group by r.id,r.name,r.city,r.state,r.cuisine order by sales desc,total desc,r.name limit 20) t),'[]'::jsonb);
end $$;
revoke all on function public.fooddf_master_top20(date,date,text,text,text) from public,anon;
grant execute on function public.fooddf_master_top20(date,date,text,text,text) to authenticated;
create table public.platform_banners (id uuid primary key default gen_random_uuid(),title text not null check(length(title) between 1 and 120),image_url text not null,link_url text not null default '' check(link_url='' or link_url ~ '^https?://' or (left(link_url,1)='/' and left(link_url,2)<>'//')),active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now());
alter table public.platform_banners enable row level security;
revoke all on public.platform_banners from anon,authenticated;
grant select on public.platform_banners to anon,authenticated;
grant insert,update,delete on public.platform_banners to authenticated;
create policy banner_public_read on public.platform_banners for select to anon using(active);
create policy banner_master_all on public.platform_banners for all to authenticated using((select fooddf_private.is_admin())) with check((select fooddf_private.is_admin()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('platform-banners','platform-banners',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy master_banner_upload on storage.objects for insert to authenticated with check(bucket_id='platform-banners' and (select fooddf_private.is_admin()));
create policy master_banner_select on storage.objects for select to authenticated using(bucket_id='platform-banners' and (select fooddf_private.is_admin()));
create policy master_banner_delete on storage.objects for delete to authenticated using(bucket_id='platform-banners' and (select fooddf_private.is_admin()));
