update public.restaurants set accepting_orders = true where status = 'published';

create or replace function public.fooddf_place_order(
  p_bucket_key text,
  p_request_id uuid,
  p_access_token_hash text,
  p_request_hash text,
  p_restaurant_id text,
  p_customer_name text,
  p_customer_phone text,
  p_fulfillment text,
  p_address text,
  p_notes text,
  p_payment_method text,
  p_change_for integer,
  p_items jsonb,
  p_subtotal integer,
  p_delivery_fee integer,
  p_total integer
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  prev record;
  rest public.restaurants;
  created_row record;
begin
  select id, reference, subtotal, delivery_fee, total, status, payment_status, access_token_hash, request_hash
    into prev
    from public.orders
   where request_id = p_request_id;

  if found then
    if prev.access_token_hash <> p_access_token_hash or prev.request_hash <> p_request_hash then
      return jsonb_build_object('error', 'Este pedido já foi registrado com outros dados. Revise e inicie um novo envio.', 'status_code', 409);
    end if;
    return jsonb_build_object(
      'id', prev.id,
      'reference', prev.reference,
      'subtotal', prev.subtotal,
      'delivery_fee', prev.delivery_fee,
      'total', prev.total,
      'status', prev.status,
      'payment_status', prev.payment_status
    );
  end if;

  if not public.fooddf_allow_request(p_bucket_key, 10) then
    return jsonb_build_object('error', 'Muitas tentativas. Aguarde um minuto e tente novamente.', 'status_code', 429);
  end if;

  select * into rest
    from public.restaurants
   where id = p_restaurant_id
     and active = true
     and status = 'published';

  if not found or not rest.accepting_orders or rest.whatsapp is null then
    return jsonb_build_object('error', 'O restaurante ainda não está recebendo pedidos.', 'status_code', 409);
  end if;

  if not (p_payment_method = any(rest.payment_methods))
     or (p_fulfillment = 'delivery' and not rest.delivery_enabled)
     or (p_fulfillment = 'pickup' and not rest.pickup_enabled) then
    return jsonb_build_object('error', 'Forma de pagamento ou entrega indisponível.', 'status_code', 409);
  end if;

  if p_subtotal < rest.min_order then
    return jsonb_build_object('error', 'O pedido não atingiu o valor mínimo do restaurante.', 'status_code', 409);
  end if;

  insert into public.orders (
    request_id, access_token_hash, request_hash,
    restaurant_id, customer_name, customer_phone,
    fulfillment, address, notes, payment_method, change_for,
    items, subtotal, delivery_fee, total
  ) values (
    p_request_id, p_access_token_hash, p_request_hash,
    p_restaurant_id, p_customer_name, p_customer_phone,
    p_fulfillment, case when p_fulfillment = 'delivery' then p_address else null end,
    coalesce(p_notes, ''), p_payment_method, p_change_for,
    p_items, p_subtotal, p_delivery_fee, p_total
  )
  returning id, reference, subtotal, delivery_fee, total, status, payment_status
  into created_row;

  return jsonb_build_object(
    'id', created_row.id,
    'reference', created_row.reference,
    'subtotal', created_row.subtotal,
    'delivery_fee', created_row.delivery_fee,
    'total', created_row.total,
    'status', created_row.status,
    'payment_status', created_row.payment_status
  );
exception
  when unique_violation then
    return jsonb_build_object('error', 'Pedido em processamento. Tente novamente com os mesmos dados.', 'status_code', 409);
end;
$$;

grant execute on function public.fooddf_place_order(text,uuid,text,text,text,text,text,text,text,text,text,integer,jsonb,integer,integer,integer) to anon, authenticated, service_role;
