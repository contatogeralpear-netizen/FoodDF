-- O master pode administrar estabelecimentos; demais usuários mantêm acesso apenas aos seus.
create or replace function fooddf_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select fooddf_private.master_allowed();
$$;
create or replace function fooddf_private.can_manage(rid text) returns boolean language sql stable security definer set search_path='' as $$
 select fooddf_private.master_allowed() or exists(select 1 from auth.users u join fooddf_private.restaurant_members m on m.email=lower(u.email) where u.id=auth.uid() and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false) and m.restaurant_id=rid);
$$;
