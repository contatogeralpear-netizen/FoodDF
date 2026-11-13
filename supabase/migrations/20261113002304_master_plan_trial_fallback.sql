create or replace function public.fooddf_current_plan(rid text) returns text language plpgsql stable security definer set search_path='' as $$
begin
 if not fooddf_private.can_manage(rid) then raise exception 'Acesso não autorizado' using errcode='42501'; end if;
 return coalesce((select plan from fooddf_private.plan_assignments where restaurant_id=rid),(select case when trial_started_at is not null and trial_started_at + interval '7 days' > now() then 'trial' end from public.restaurant_plans where restaurant_id=rid),'none');
end $$;
