-- O bootstrap da plataforma pode criar este event trigger no schema público.
-- Clientes da aplicação não precisam executar funções administrativas.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

alter table public.orders add constraint orders_delivery_address_required
  check (fulfillment <> 'delivery' or (address is not null and char_length(address) >= 10));
