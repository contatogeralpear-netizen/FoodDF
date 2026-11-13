create or replace function public.fooddf_support_list(rid text,side text) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if $2='master' then if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 elsif $2='restaurant' then if $1 is null or not fooddf_private.support_allowed($1,$2) then raise exception 'Acesso não autorizado' using errcode='42501';end if;
 else raise exception 'Acesso não autorizado' using errcode='42501';end if;
 return coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at desc) from (
  select s.id,s.restaurant_id,r.name as restaurant_name,s.subject,s.category,s.priority,s.created_at,s.updated_at,
  coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'sender',m.sender,'body',m.body,'created_at',m.created_at) order by m.created_at,m.id)
    from fooddf_private.support_messages m where m.thread_id=s.id and m.created_at>coalesce(case when $2='master' then s.master_cleared_at else s.restaurant_cleared_at end,'-infinity'::timestamptz)
    and not exists(select 1 from fooddf_private.support_hidden_messages h where h.message_id=m.id and h.side=$2)),'[]'::jsonb) as messages
  from fooddf_private.support_threads s join public.restaurants r on r.id=s.restaurant_id
  where ($2='master' or s.restaurant_id=$1) and exists(select 1 from fooddf_private.support_messages m where m.thread_id=s.id and m.created_at>coalesce(case when $2='master' then s.master_cleared_at else s.restaurant_cleared_at end,'-infinity'::timestamptz) and not exists(select 1 from fooddf_private.support_hidden_messages h where h.message_id=m.id and h.side=$2))
  order by s.updated_at desc limit 100
 ) t),'[]'::jsonb);
end $$;
