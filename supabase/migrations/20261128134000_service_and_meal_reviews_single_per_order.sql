create table if not exists public.order_reviews (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique check (order_reference ~ '^[A-Z0-9-]{1,30}$'),
  order_id uuid references public.orders(id),
  restaurant_id text not null references public.restaurants(id),
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 500),
  customer_name text not null default '',
  customer_phone text not null default '',
  meal_ratings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_reviews_restaurant_idx on public.order_reviews(restaurant_id, created_at desc);
create index if not exists order_reviews_rating_idx on public.order_reviews(restaurant_id, rating);
create unique index if not exists order_reviews_order_id_unique_idx on public.order_reviews(order_id) where order_id is not null;

alter table public.order_reviews enable row level security;
grant select on public.order_reviews to anon, authenticated;
grant all on public.order_reviews to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_reviews' and policyname = 'reviews_public_read'
  ) then
    create policy reviews_public_read on public.order_reviews for select to anon, authenticated using (true);
  end if;
end $$;

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  order_review_id uuid references public.order_reviews(id),
  order_reference text not null check (order_reference ~ '^[A-Z0-9-]{1,30}$'),
  restaurant_id text not null references public.restaurants(id),
  product_id text not null check (char_length(product_id) between 1 and 120),
  product_name text not null default '',
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (order_reference, product_id)
);

create index if not exists product_reviews_restaurant_product_idx on public.product_reviews(restaurant_id, product_id);
create index if not exists product_reviews_restaurant_created_idx on public.product_reviews(restaurant_id, created_at desc);

alter table public.product_reviews enable row level security;
grant select on public.product_reviews to anon, authenticated;
grant all on public.product_reviews to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews' and policyname = 'product_reviews_public_read'
  ) then
    create policy product_reviews_public_read on public.product_reviews for select to anon, authenticated using (true);
  end if;
end $$;

create or replace function public.fooddf_submit_review(
  p_bucket_key text,
  p_order_reference text,
  p_phone text,
  p_service_rating integer,
  p_comment text,
  p_meal_ratings jsonb default '[]'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_ref text := upper(trim(coalesce(p_order_reference, '')));
  digits text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  ord public.orders;
  rev_row public.order_reviews;
  meal jsonb;
  m_pid text;
  m_name text;
  m_rating integer;
  normalized_meals jsonb := '[]'::jsonb;
begin
  if clean_ref !~ '^FD[0-9]{1,15}$' then
    return jsonb_build_object('error', 'Número do pedido inválido.', 'status_code', 400);
  end if;

  if p_service_rating is null or p_service_rating < 1 or p_service_rating > 5 then
    return jsonb_build_object('error', 'Selecione de 1 a 5 estrelas para avaliar o atendimento.', 'status_code', 400);
  end if;

  if not public.fooddf_allow_request(p_bucket_key, 15) then
    return jsonb_build_object('error', 'Muitas tentativas. Aguarde um minuto e tente novamente.', 'status_code', 429);
  end if;

  select * into ord
    from public.orders o
   where o.reference = substring(clean_ref from 3)::bigint
     and o.deleted_at is null;

  if not found then
    return jsonb_build_object('error', 'Pedido não encontrado para avaliação.', 'status_code', 404);
  end if;

  if length(digits) > 11 and left(digits, 2) = '55' then
    digits := substring(digits from 3);
  end if;

  if length(digits) >= 10 then
    if (case when length(ord.customer_phone) > 11 and left(ord.customer_phone, 2) = '55' then substring(ord.customer_phone from 3) else ord.customer_phone end) <> digits then
      return jsonb_build_object('error', 'O WhatsApp informado não corresponde a este pedido.', 'status_code', 403);
    end if;
  end if;

  if exists (
    select 1 from public.order_reviews r
     where r.order_reference = clean_ref or r.order_id = ord.id
  ) then
    return jsonb_build_object('error', 'Este pedido já foi avaliado. É permitida somente 1 avaliação por pedido gerado.', 'status_code', 409);
  end if;

  if jsonb_typeof(p_meal_ratings) = 'array' then
    for meal in select * from jsonb_array_elements(p_meal_ratings)
    loop
      m_pid := left(trim(coalesce(meal->>'productId', '')), 120);
      m_name := left(trim(coalesce(meal->>'productName', '')), 120);
      m_rating := coalesce((meal->>'rating')::integer, 0);
      if m_pid <> '' and m_rating between 1 and 5 then
        normalized_meals := normalized_meals || jsonb_build_array(
          jsonb_build_object('productId', m_pid, 'productName', m_name, 'rating', m_rating)
        );
      end if;
    end loop;
  end if;

  insert into public.order_reviews (
    order_reference,
    order_id,
    restaurant_id,
    rating,
    comment,
    customer_name,
    customer_phone,
    meal_ratings
  ) values (
    clean_ref,
    ord.id,
    ord.restaurant_id,
    p_service_rating,
    nullif(left(trim(coalesce(p_comment, '')), 500), ''),
    ord.customer_name,
    ord.customer_phone,
    normalized_meals
  )
  returning * into rev_row;

  for meal in select * from jsonb_array_elements(normalized_meals)
  loop
    insert into public.product_reviews (
      order_review_id,
      order_reference,
      restaurant_id,
      product_id,
      product_name,
      rating
    ) values (
      rev_row.id,
      clean_ref,
      ord.restaurant_id,
      meal->>'productId',
      coalesce(meal->>'productName', ''),
      (meal->>'rating')::integer
    )
    on conflict (order_reference, product_id) do nothing;
  end loop;

  return jsonb_build_object(
    'id', rev_row.id,
    'orderReference', rev_row.order_reference,
    'restaurantId', rev_row.restaurant_id,
    'rating', rev_row.rating,
    'comment', rev_row.comment,
    'customerName', rev_row.customer_name,
    'mealRatings', rev_row.meal_ratings,
    'createdAt', rev_row.created_at
  );
exception
  when unique_violation then
    return jsonb_build_object('error', 'Este pedido já foi avaliado. É permitida somente 1 avaliação por pedido gerado.', 'status_code', 409);
end;
$$;

grant execute on function public.fooddf_submit_review(text, text, text, integer, text, jsonb) to anon, authenticated, service_role;

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
  if not public.fooddf_allow_request(bucket, 60) then
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
    'restaurant_id', ord.restaurant_id,
    'restaurant_slug', r.slug,
    'status', ord.status,
    'fulfillment', ord.fulfillment,
    'created_at', ord.created_at,
    'items', ord.items,
    'history', coalesce((
      select jsonb_agg(jsonb_build_object('status', e.status, 'at', e.created_at) order by e.created_at)
      from fooddf_private.order_status_events e
      where e.order_id = ord.id
    ), '[]'::jsonb),
    'review', (
      select jsonb_build_object(
        'rating', rv.rating,
        'comment', rv.comment,
        'mealRatings', rv.meal_ratings,
        'createdAt', rv.created_at
      )
      from public.order_reviews rv
      where rv.order_reference = 'FD' || ord.reference
         or rv.order_id = ord.id
      limit 1
    )
  ) into result
  from public.restaurants r
  where r.id = ord.restaurant_id;
  return result;
end;
$$;

grant execute on function public.fooddf_track_order(text, text) to anon, authenticated;
