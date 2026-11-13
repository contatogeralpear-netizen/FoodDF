-- Conversas privadas entre restaurantes e FOODDF Master.
create table fooddf_private.support_threads (
 id uuid primary key default gen_random_uuid(), restaurant_id text not null references public.restaurants(id),
 subject text not null check(char_length(subject) between 3 and 120),
 category text not null check(category in ('sugestao','financeiro','erro')),
 priority text not null check(priority in ('normal','medio','urgencia')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 restaurant_cleared_at timestamptz,master_cleared_at timestamptz
);
create index support_threads_restaurant_idx on fooddf_private.support_threads(restaurant_id,updated_at desc);
create table fooddf_private.support_messages (
 id uuid primary key default gen_random_uuid(), thread_id uuid not null references fooddf_private.support_threads(id) on delete cascade,
 sender text not null check(sender in ('restaurant','master')), author_id uuid not null references auth.users(id),
 body text not null check(char_length(body) between 1 and 4000), created_at timestamptz not null default now()
);
create index support_messages_thread_idx on fooddf_private.support_messages(thread_id,created_at);
create table fooddf_private.support_hidden_messages (
 message_id uuid not null references fooddf_private.support_messages(id) on delete cascade,
 side text not null check(side in ('restaurant','master')), primary key(message_id,side)
);
revoke all on fooddf_private.support_threads,fooddf_private.support_messages,fooddf_private.support_hidden_messages from public,anon,authenticated;
create or replace function fooddf_private.support_allowed(rid text,side text) returns boolean language sql stable security definer set search_path='' as $$
 select case when auth.uid() is null then false when side='master' then fooddf_private.master_allowed() when side='restaurant' then fooddf_private.can_manage(rid) else false end;
$$;
revoke all on function fooddf_private.support_allowed(text,text) from public,anon,authenticated;
create or replace function public.fooddf_support_list(rid text,side text) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if side='master' then if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 elsif side='restaurant' then if rid is null or not fooddf_private.support_allowed(rid,side) then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 else raise exception 'Acesso não autorizado' using errcode='42501';end if;
 return coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at desc) from (
  select s.id,s.restaurant_id,r.name as restaurant_name,s.subject,s.category,s.priority,s.created_at,s.updated_at,
  coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'sender',m.sender,'body',m.body,'created_at',m.created_at) order by m.created_at,m.id)
    from fooddf_private.support_messages m where m.thread_id=s.id and m.created_at>coalesce(case when side='master' then s.master_cleared_at else s.restaurant_cleared_at end,'-infinity'::timestamptz)
    and not exists(select 1 from fooddf_private.support_hidden_messages h where h.message_id=m.id and h.side=side)),'[]'::jsonb) as messages
  from fooddf_private.support_threads s join public.restaurants r on r.id=s.restaurant_id
  where (side='master' or s.restaurant_id=rid) and exists(select 1 from fooddf_private.support_messages m where m.thread_id=s.id and m.created_at>coalesce(case when side='master' then s.master_cleared_at else s.restaurant_cleared_at end,'-infinity'::timestamptz) and not exists(select 1 from fooddf_private.support_hidden_messages h where h.message_id=m.id and h.side=side))
  order by s.updated_at desc limit 100
 ) t),'[]'::jsonb);
end $$;
revoke all on function public.fooddf_support_list(text,text) from public,anon;
grant execute on function public.fooddf_support_list(text,text) to authenticated;
create or replace function public.fooddf_support_create(rid text,side text,subject text,category text,priority text,body text) returns uuid language plpgsql security definer set search_path='' as $$
declare tid uuid;
begin
 if not fooddf_private.support_allowed(rid,side) then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 if length(trim(coalesce(subject,''))) not between 3 and 120 or category not in ('sugestao','financeiro','erro') or priority not in ('normal','medio','urgencia') or length(trim(coalesce(body,''))) not between 1 and 4000 then raise exception 'Confira o assunto, categoria, prioridade e mensagem';end if;
 if not public.fooddf_allow_request(encode(extensions.digest('support:'||auth.uid()::text,'sha256'),'hex'),20) then raise exception 'Muitas mensagens. Aguarde um minuto.';end if;
 insert into fooddf_private.support_threads(restaurant_id,subject,category,priority) values(rid,trim(subject),category,priority) returning id into tid;
 insert into fooddf_private.support_messages(thread_id,sender,author_id,body) values(tid,side,auth.uid(),trim(body));return tid;
end $$;
revoke all on function public.fooddf_support_create(text,text,text,text,text,text) from public,anon;
grant execute on function public.fooddf_support_create(text,text,text,text,text,text) to authenticated;
create or replace function public.fooddf_support_reply(thread_id uuid,side text,body text) returns uuid language plpgsql security definer set search_path='' as $$
declare rid text; mid uuid;
begin
 select restaurant_id into rid from fooddf_private.support_threads where id=thread_id for update;
 if rid is null or not fooddf_private.support_allowed(rid,side) then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 if length(trim(coalesce(body,''))) not between 1 and 4000 then raise exception 'Escreva uma mensagem de até 4000 caracteres';end if;
 if not public.fooddf_allow_request(encode(extensions.digest('support:'||auth.uid()::text,'sha256'),'hex'),20) then raise exception 'Muitas mensagens. Aguarde um minuto.';end if;
 insert into fooddf_private.support_messages(thread_id,sender,author_id,body) values(thread_id,side,auth.uid(),trim(body)) returning id into mid;
 update fooddf_private.support_threads set updated_at=now() where id=thread_id;return mid;
end $$;
revoke all on function public.fooddf_support_reply(uuid,text,text) from public,anon;
grant execute on function public.fooddf_support_reply(uuid,text,text) to authenticated;
create or replace function public.fooddf_support_delete_message(message_id uuid,side text) returns void language plpgsql security definer set search_path='' as $$
declare rid text;
begin
 select t.restaurant_id into rid from fooddf_private.support_messages m join fooddf_private.support_threads t on t.id=m.thread_id where m.id=message_id;
 if rid is null or not fooddf_private.support_allowed(rid,side) then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 insert into fooddf_private.support_hidden_messages(message_id,side) values(message_id,side) on conflict on constraint support_hidden_messages_pkey do nothing;
end $$;
revoke all on function public.fooddf_support_delete_message(uuid,text) from public,anon;
grant execute on function public.fooddf_support_delete_message(uuid,text) to authenticated;
create or replace function public.fooddf_support_delete_thread(thread_id uuid,side text) returns void language plpgsql security definer set search_path='' as $$
declare rid text;
begin
 select restaurant_id into rid from fooddf_private.support_threads where id=thread_id for update;
 if rid is null or not fooddf_private.support_allowed(rid,side) then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 if side='master' then update fooddf_private.support_threads set master_cleared_at=clock_timestamp() where id=thread_id;
 else update fooddf_private.support_threads set restaurant_cleared_at=clock_timestamp() where id=thread_id;end if;
end $$;
revoke all on function public.fooddf_support_delete_thread(uuid,text) from public,anon;
grant execute on function public.fooddf_support_delete_thread(uuid,text) to authenticated;
