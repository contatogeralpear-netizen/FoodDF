-- FOODDF: marketplace público e restaurante fictício para demonstração.
-- Cadastros administrativos serão implementados em uma etapa posterior.
create table public.restaurants (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,100}$'),
  name text not null check (char_length(name) between 2 and 120),
  state text not null check (state ~ '^[A-Z]{2}$'),
  city text not null check (char_length(city) between 2 and 100),
  address text not null default '',
  delivery_fee integer not null default 0 check (delivery_fee between 0 and 100000),
  whatsapp text check (whatsapp is null or whatsapp ~ '^55[1-9][0-9]{9,10}$'),
  pix_key text,
  pix_name text,
  pix_city text,
  is_demo boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  active boolean not null default true,
  accepting_orders boolean not null default false,
  created_at timestamptz not null default now()
);
create index restaurants_owner_id_idx on public.restaurants(owner_id);
create index restaurants_location_idx on public.restaurants(state, city) where status = 'published' and active;

create table public.products (
  id text primary key default gen_random_uuid()::text,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  price integer not null check (price between 1 and 1000000),
  category text not null check (char_length(category) between 1 and 80),
  image text not null default 'burger' check (image in ('burger','meal','fries','combo','drink')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index products_restaurant_idx on public.products(restaurant_id, sort_order);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference bigint generated always as identity (start with 1001) unique,
  request_id uuid not null unique,
  access_token_hash text not null check (access_token_hash ~ '^[a-f0-9]{64}$'),
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  restaurant_id text not null references public.restaurants(id),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (customer_phone ~ '^(55)?[1-9][0-9]{9,10}$'),
  fulfillment text not null check (fulfillment in ('delivery','pickup')),
  address text,
  notes text not null default '' check (char_length(notes) <= 1000),
  payment_method text not null check (payment_method in ('pix','cash','card')),
  payment_status text not null default 'pending' check (payment_status in ('pending','confirmed','rejected')),
  status text not null default 'awaiting_confirmation' check (status in ('awaiting_confirmation','accepted','preparing','delivering','completed','cancelled')),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30),
  subtotal integer not null check (subtotal > 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null check (total = subtotal + delivery_fee and total <= 1000000),
  change_for integer,
  receipt_path text,
  created_at timestamptz not null default now(),
  check (fulfillment <> 'delivery' or char_length(address) >= 10),
  check (fulfillment <> 'pickup' or delivery_fee = 0),
  check (change_for is null or (payment_method = 'cash' and change_for >= total))
);
create index orders_restaurant_created_idx on public.orders(restaurant_id, created_at desc);

create table public.request_limits (
  key text primary key,
  count integer not null,
  expires_at timestamptz not null
);
create index request_limits_expires_idx on public.request_limits(expires_at);

alter table public.restaurants enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.request_limits enable row level security;

revoke all on public.restaurants, public.products, public.orders, public.request_limits from anon, authenticated;
grant select on public.restaurants, public.products to anon, authenticated;
grant all on public.restaurants, public.products, public.orders, public.request_limits to service_role;
grant usage, select on sequence public.orders_reference_seq to service_role;

create policy restaurants_public_catalog on public.restaurants for select to anon, authenticated using (status = 'published' and active);
create policy products_public_catalog on public.products for select to anon, authenticated using (
  active and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.status = 'published' and r.active)
);
-- Nenhum cliente público pode ler, inserir ou alterar pedidos ou limites.
create policy orders_server_only on public.orders for all to anon, authenticated using (false) with check (false);
create policy limits_server_only on public.request_limits for all to anon, authenticated using (false) with check (false);

create function public.fooddf_allow_request(bucket_key text, max_requests integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare request_count integer;
begin
  if bucket_key !~ '^[a-f0-9]{64}$' or max_requests not between 1 and 100 then
    return false;
  end if;
  delete from public.request_limits where expires_at < now() - interval '1 minute';
  insert into public.request_limits as limits(key, count, expires_at)
  values (bucket_key, 1, now() + interval '1 minute')
  on conflict (key) do update set
    count = case when limits.expires_at <= now() then 1 else limits.count + 1 end,
    expires_at = case when limits.expires_at <= now() then now() + interval '1 minute' else limits.expires_at end
  returning count into request_count;
  return request_count <= max_requests;
end;
$$;
revoke all on function public.fooddf_allow_request(text, integer) from public, anon, authenticated;
grant execute on function public.fooddf_allow_request(text, integer) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-receipts', 'payment-receipts', false, 4194304, array['image/jpeg','image/png','application/pdf']);
-- Bucket privado sem políticas para anon/authenticated; somente API server autorizada.

insert into public.restaurants (id,slug,name,state,city,address,delivery_fee,is_demo,status,accepting_orders,whatsapp)
values ('brasa-burger','brasa-burger','Brasa Burger','DF','Brasília','CLS 308, Bloco B, Loja 12 — Asa Sul',500,true,'published',false,'5561982429847');

insert into public.products (id,restaurant_id,name,description,price,category,image,sort_order) values
('brasa-bacon','brasa-burger','Brasa Bacon','Burger 180 g, cheddar e bacon',3490,'Lanches','burger',1),
('prato-da-casa','brasa-burger','Prato da casa','Arroz, feijão, bife e salada',2990,'Refeições','meal',2),
('batata-crocante','brasa-burger','Batata crocante','Porção individual',1200,'Lanches','fries',3),
('combo-brasa','brasa-burger','Combo Brasa','Brasa Bacon, batata e refrigerante',4590,'Combos','combo',4),
('refrigerante-lata','brasa-burger','Refrigerante lata','Lata 350 ml bem gelada',600,'Bebidas','drink',5);
