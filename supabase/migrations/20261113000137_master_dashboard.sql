-- Acesso master independente das permissões dos restaurantes.
create table if not exists fooddf_private.master_users (user_id uuid primary key references auth.users(id) on delete cascade);
revoke all on fooddf_private.master_users from public, anon, authenticated;
insert into fooddf_private.master_users(user_id)
select id from auth.users where lower(email)='contatogeralpear@gmail.com' and email_confirmed_at is not null
on conflict do nothing;
create table if not exists fooddf_private.plan_payments (
 id uuid primary key default gen_random_uuid(), restaurant_id text not null references public.restaurants(id),
 amount integer not null check (amount > 0 and amount <= 100000000), paid_on date not null,
 note text not null default '', created_at timestamptz not null default now(), created_by uuid not null references auth.users(id)
);
revoke all on fooddf_private.plan_payments from public, anon, authenticated;
create or replace function fooddf_private.master_allowed() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from fooddf_private.master_users m join auth.users u on u.id=m.user_id where m.user_id=auth.uid() and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false));
$$;
revoke all on function fooddf_private.master_allowed() from public,anon,authenticated;
create or replace function public.fooddf_master_dashboard() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 return jsonb_build_object(
 'restaurants',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'name',r.name,'slug',r.slug,'state',r.state,'city',r.city,'address',r.address,'whatsapp',r.whatsapp,'cuisine',r.cuisine,'status',r.status,'active',r.active,'is_demo',r.is_demo,'created_at',r.created_at,'trial_started_at',p.trial_started_at,'requested_plan',p.requested_plan,'requested_at',p.requested_at) order by r.created_at desc) from public.restaurants r left join public.restaurant_plans p on p.restaurant_id=r.id),'[]'::jsonb),
 'payments',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'restaurant_id',p.restaurant_id,'amount',p.amount,'paid_on',p.paid_on,'note',p.note) order by p.paid_on desc) from fooddf_private.plan_payments p),'[]'::jsonb));
end; $$;
revoke all on function public.fooddf_master_dashboard() from public,anon;
grant execute on function public.fooddf_master_dashboard() to authenticated;
create or replace function public.fooddf_master_update_restaurant(rid text, fields jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 if length(trim(coalesce(fields->>'name',''))) < 2 or length(coalesce(fields->>'name',''))>120 or length(trim(coalesce(fields->>'city','')))<2 or coalesce(fields->>'state','') !~ '^[A-Z]{2}$' or coalesce(fields->>'status','') not in ('draft','published') then raise exception 'Confira os dados do estabelecimento'; end if;
 update public.restaurants set name=trim(fields->>'name'),city=trim(fields->>'city'),state=fields->>'state',cuisine=left(coalesce(fields->>'cuisine',''),100),address=left(coalesce(fields->>'address',''),300),whatsapp=left(coalesce(fields->>'whatsapp',''),20),status=fields->>'status',active=coalesce((fields->>'active')::boolean,false) where id=rid;
 if not found then raise exception 'Restaurante não encontrado'; end if;
end; $$;
revoke all on function public.fooddf_master_update_restaurant(text,jsonb) from public,anon;
grant execute on function public.fooddf_master_update_restaurant(text,jsonb) to authenticated;
create or replace function public.fooddf_master_add_payment(rid text, amount_cents integer, payment_date date, description text) returns uuid language plpgsql security definer set search_path='' as $$
declare payment_id uuid;
begin
 if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 if amount_cents is null or amount_cents <= 0 or amount_cents > 100000000 or payment_date is null or payment_date > current_date or length(coalesce(description,''))>200 then raise exception 'Confira os dados do pagamento'; end if;
 insert into fooddf_private.plan_payments(restaurant_id,amount,paid_on,note,created_by) values(rid,amount_cents,payment_date,coalesce(description,''),auth.uid()) returning id into payment_id;
 return payment_id;
end; $$;
revoke all on function public.fooddf_master_add_payment(text,integer,date,text) from public,anon;
grant execute on function public.fooddf_master_add_payment(text,integer,date,text) to authenticated;
