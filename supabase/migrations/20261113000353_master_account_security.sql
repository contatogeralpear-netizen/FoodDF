-- A conta master é identificada pelo UUID autenticado, e não por dados editáveis no navegador.
do $$ begin
 if not exists(select 1 from auth.users where lower(email)='cesarideadigital@gmail.com' and email_confirmed_at is not null) then
  raise exception 'A conta master precisa existir e ter e-mail confirmado';
 end if;
end $$;
delete from fooddf_private.master_users;
insert into fooddf_private.master_users(user_id)
select id from auth.users where lower(email)='cesarideadigital@gmail.com' and email_confirmed_at is not null;
create or replace function public.fooddf_master_update_restaurant(rid text, fields jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not fooddf_private.master_allowed() then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 if length(trim(coalesce(fields->>'name',''))) < 2 or length(coalesce(fields->>'name',''))>120 or length(trim(coalesce(fields->>'city','')))<2 or coalesce(fields->>'state','') !~ '^[A-Z]{2}$' or coalesce(fields->>'status','') not in ('draft','published') then raise exception 'Confira os dados do estabelecimento'; end if;
 if fields->>'status'='published' and (length(trim(coalesce(fields->>'address','')))=0 or coalesce(fields->>'whatsapp','') !~ '^55[1-9][0-9]{9,10}$') then raise exception 'Para publicar, informe endereço e WhatsApp com DDD'; end if;
 update public.restaurants set name=trim(fields->>'name'),city=trim(fields->>'city'),state=fields->>'state',cuisine=left(coalesce(fields->>'cuisine',''),100),address=left(coalesce(fields->>'address',''),300),whatsapp=left(coalesce(fields->>'whatsapp',''),20),status=fields->>'status',active=coalesce((fields->>'active')::boolean,false) where id=rid;
 if not found then raise exception 'Restaurante não encontrado'; end if;
end; $$;
