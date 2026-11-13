alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check check(status in ('awaiting_confirmation','accepted','preparing','ready','delivering','completed','cancelled'));
create table fooddf_private.order_status_events(id bigint generated always as identity primary key,order_id uuid not null references public.orders(id) on delete cascade,status text not null,created_at timestamptz not null default now());
create index order_status_events_order_idx on fooddf_private.order_status_events(order_id,created_at);
revoke all on fooddf_private.order_status_events from public,anon,authenticated;
create or replace function fooddf_private.record_order_status() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then insert into fooddf_private.order_status_events(order_id,status,created_at) values(new.id,new.status,new.created_at);
 elsif new.status is distinct from old.status then insert into fooddf_private.order_status_events(order_id,status) values(new.id,new.status);end if;
 return new;
end $$;
revoke all on function fooddf_private.record_order_status() from public,anon,authenticated;
create trigger order_status_history after insert or update of status on public.orders for each row execute function fooddf_private.record_order_status();
insert into fooddf_private.order_status_events(order_id,status,created_at) select id,status,created_at from public.orders;
create or replace function public.fooddf_restaurant_orders(rid text) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not fooddf_private.can_manage(rid) then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 return coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from (select o.id,o.reference,o.status,o.fulfillment,o.customer_name,o.customer_phone,o.address,o.notes,o.items,o.total,o.payment_method,o.payment_status,o.created_at,coalesce((select jsonb_agg(jsonb_build_object('status',e.status,'at',e.created_at) order by e.created_at) from fooddf_private.order_status_events e where e.order_id=o.id),'[]'::jsonb) as history from public.orders o where o.restaurant_id=rid order by o.created_at desc limit 200) t),'[]'::jsonb);
end $$;
revoke all on function public.fooddf_restaurant_orders(text) from public,anon;
grant execute on function public.fooddf_restaurant_orders(text) to authenticated;
create or replace function public.fooddf_advance_order(rid text,order_id uuid,expected_status text) returns text language plpgsql security definer set search_path='' as $$
declare ord public.orders; next_status text;
begin
 if not fooddf_private.can_manage(rid) then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 select * into ord from public.orders where id=order_id and restaurant_id=rid for update;
 if not found then raise exception 'Pedido não encontrado';end if;
 if ord.status<>expected_status then raise exception 'O pedido foi atualizado. Atualize a lista e tente novamente.';end if;
 next_status:=case when ord.status in ('awaiting_confirmation','accepted') then 'preparing' when ord.status='preparing' then 'ready' when ord.status='ready' and ord.fulfillment='delivery' then 'delivering' when ord.status='ready' and ord.fulfillment='pickup' then 'completed' when ord.status='delivering' then 'completed' else null end;
 if next_status is null then raise exception 'Este pedido não pode avançar';end if;
 update public.orders set status=next_status where id=ord.id;
 return next_status;
end $$;
revoke all on function public.fooddf_advance_order(text,uuid,text) from public,anon;
grant execute on function public.fooddf_advance_order(text,uuid,text) to authenticated;
create or replace function public.fooddf_track_order(order_number text,phone text) returns jsonb language plpgsql security definer set search_path='' as $$
declare ref text:=upper(trim(coalesce(order_number,''))); digits text:=regexp_replace(coalesce(phone,''),'[^0-9]','','g'); ord public.orders; result jsonb; bucket text;
begin
 if ref !~ '^FD[0-9]{1,15}$' or length(digits) not between 10 and 13 then return null;end if;
 if length(digits)>11 and left(digits,2)='55' then digits:=substring(digits from 3);end if;
 bucket:=encode(extensions.digest('order-tracking:'||ref,'sha256'),'hex');
 if not public.fooddf_allow_request(bucket,30) then raise exception 'Muitas tentativas. Tente novamente em um minuto.';end if;
 select * into ord from public.orders o where o.reference=substring(ref from 3)::bigint and (case when length(o.customer_phone)>11 and left(o.customer_phone,2)='55' then substring(o.customer_phone from 3) else o.customer_phone end)=digits;
 if not found then return null;end if;
 select jsonb_build_object('reference','FD'||ord.reference,'restaurant',r.name,'status',ord.status,'fulfillment',ord.fulfillment,'created_at',ord.created_at,'history',coalesce((select jsonb_agg(jsonb_build_object('status',e.status,'at',e.created_at) order by e.created_at) from fooddf_private.order_status_events e where e.order_id=ord.id),'[]'::jsonb)) into result from public.restaurants r where r.id=ord.restaurant_id;
 return result;
end $$;
revoke all on function public.fooddf_track_order(text,text) from public;
grant execute on function public.fooddf_track_order(text,text) to anon,authenticated;
