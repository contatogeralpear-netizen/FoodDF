alter table public.orders add column if not exists deleted_at timestamptz;

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

  if not public.fooddf_allow_request(p_bucket_key, 20) then
    return jsonb_build_object('error', 'Muitas tentativas. Aguarde um minuto e tente novamente.', 'status_code', 429);
  end if;

  select * into rest
    from public.restaurants
   where id = p_restaurant_id
     and active = true
     and status = 'published';

  if not found or rest.whatsapp is null then
    return jsonb_build_object('error', 'O restaurante ainda não está recebendo pedidos.', 'status_code', 409);
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

create or replace function public.fooddf_restaurant_orders(rid text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not fooddf_private.can_manage(rid) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(to_jsonb(t) order by t.created_at desc)
    from (
      select
        o.id,
        o.reference,
        o.status,
        o.fulfillment,
        o.customer_name,
        o.customer_phone,
        o.address,
        o.notes,
        o.items,
        o.subtotal,
        o.delivery_fee,
        o.total,
        o.change_for,
        o.payment_method,
        o.payment_status,
        o.created_at,
        coalesce((
          select jsonb_agg(jsonb_build_object('status', e.status, 'at', e.created_at) order by e.created_at)
          from fooddf_private.order_status_events e
          where e.order_id = o.id
        ), '[]'::jsonb) as history
      from public.orders o
      where o.restaurant_id = rid
        and o.deleted_at is null
      order by o.created_at desc
      limit 1000
    ) t
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.fooddf_restaurant_orders(text) to authenticated;

create or replace function public.fooddf_set_order_status(
  rid text,
  p_order_id uuid,
  p_status text,
  p_payment_status text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  ord public.orders;
begin
  if not fooddf_private.can_manage(rid) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  if p_status not in ('awaiting_confirmation','accepted','preparing','ready','delivering','completed','cancelled') then
    raise exception 'Status inválido';
  end if;
  if p_payment_status is not null and p_payment_status not in ('pending','confirmed','rejected') then
    raise exception 'Status de pagamento inválido';
  end if;

  update public.orders
     set status = p_status,
         payment_status = coalesce(p_payment_status, payment_status)
   where id = p_order_id
     and restaurant_id = rid
     and deleted_at is null
  returning * into ord;

  if not found then
    raise exception 'Pedido não encontrado';
  end if;

  return jsonb_build_object('id', ord.id, 'status', ord.status, 'payment_status', ord.payment_status);
end;
$$;

grant execute on function public.fooddf_set_order_status(text, uuid, text, text) to authenticated;

create or replace function public.fooddf_update_order(
  rid text,
  p_order_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_fulfillment text,
  p_address text,
  p_notes text,
  p_payment_method text,
  p_payment_status text,
  p_status text,
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
  ord public.orders;
  clean_phone text := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g');
  clean_address text := trim(coalesce(p_address, ''));
  eff_fee integer := case when p_fulfillment = 'pickup' then 0 else greatest(0, coalesce(p_delivery_fee, 0)) end;
  eff_subtotal integer := greatest(1, coalesce(p_subtotal, 1));
  eff_total integer := eff_subtotal + eff_fee;
begin
  if not fooddf_private.can_manage(rid) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_customer_name, ''))) < 2 then
    raise exception 'Informe o nome do cliente.';
  end if;
  if clean_phone !~ '^(55)?[1-9][0-9]{9,10}$' then
    raise exception 'Informe um WhatsApp válido com DDD.';
  end if;
  if p_fulfillment not in ('delivery', 'pickup') then
    raise exception 'Tipo de entrega inválido.';
  end if;
  if p_fulfillment = 'delivery' and char_length(clean_address) < 10 then
    clean_address := rpad(case when clean_address = '' then 'Endereço informado' else clean_address end, 10, ' ');
  end if;
  if p_payment_method not in ('pix', 'cash', 'card') then
    raise exception 'Forma de pagamento inválida.';
  end if;
  if p_payment_status not in ('pending', 'confirmed', 'rejected') then
    raise exception 'Status de pagamento inválido.';
  end if;
  if p_status not in ('awaiting_confirmation','accepted','preparing','ready','delivering','completed','cancelled') then
    raise exception 'Status do pedido inválido.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then
    raise exception 'O pedido deve ter pelo menos 1 item.';
  end if;
  if eff_total > 1000000 then
    raise exception 'Valor total excede o limite permitido.';
  end if;

  update public.orders
     set customer_name = left(trim(p_customer_name), 100),
         customer_phone = clean_phone,
         fulfillment = p_fulfillment,
         address = case when p_fulfillment = 'delivery' then clean_address else null end,
         notes = left(coalesce(p_notes, ''), 1000),
         payment_method = p_payment_method,
         payment_status = p_payment_status,
         status = p_status,
         items = p_items,
         subtotal = eff_subtotal,
         delivery_fee = eff_fee,
         total = eff_total,
         change_for = case when p_payment_method = 'cash' and change_for is not null and change_for >= eff_total then change_for else null end
   where id = p_order_id
     and restaurant_id = rid
     and deleted_at is null
  returning * into ord;

  if not found then
    raise exception 'Pedido não encontrado.';
  end if;

  return jsonb_build_object('id', ord.id, 'total', ord.total, 'status', ord.status);
end;
$$;

grant execute on function public.fooddf_update_order(text,uuid,text,text,text,text,text,text,text,text,jsonb,integer,integer,integer) to authenticated;

create or replace function public.fooddf_remove_order(
  rid text,
  p_order_id uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not fooddf_private.can_manage(rid) then
    raise exception 'Acesso não autorizado' using errcode = '42501';
  end if;
  update public.orders
     set deleted_at = now()
   where id = p_order_id
     and restaurant_id = rid
     and deleted_at is null;
  if not found then
    raise exception 'Pedido não encontrado.';
  end if;
  return true;
end;
$$;

grant execute on function public.fooddf_remove_order(text, uuid) to authenticated;

create or replace function public.fooddf_track_order(order_number text, phone text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  ref text := upper(trim(coalesce(order_number, '')));
  digits text := regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g');
  ord public.orders;
  result jsonb;
  bucket text;
begin
  if ref !~ '^FD[0-9]{1,15}$' or length(digits) not between 10 and 13 then return null; end if;
  if length(digits) > 11 and left(digits, 2) = '55' then digits := substring(digits from 3); end if;
  bucket := encode(extensions.digest('order-tracking:' || ref, 'sha256'), 'hex');
  if not public.fooddf_allow_request(bucket, 30) then
    raise exception 'Muitas tentativas. Tente novamente em um minuto.';
  end if;
  select * into ord
    from public.orders o
   where o.reference = substring(ref from 3)::bigint
     and o.deleted_at is null
     and (case when length(o.customer_phone) > 11 and left(o.customer_phone, 2) = '55' then substring(o.customer_phone from 3) else o.customer_phone end) = digits;
  if not found then return null; end if;
  select jsonb_build_object(
    'reference', 'FD' || ord.reference,
    'restaurant', r.name,
    'status', ord.status,
    'fulfillment', ord.fulfillment,
    'created_at', ord.created_at,
    'history', coalesce((
      select jsonb_agg(jsonb_build_object('status', e.status, 'at', e.created_at) order by e.created_at)
      from fooddf_private.order_status_events e
      where e.order_id = ord.id
    ), '[]'::jsonb)
  ) into result
  from public.restaurants r
  where r.id = ord.restaurant_id;
  return result;
end;
$$;

grant execute on function public.fooddf_track_order(text, text) to anon, authenticated;
