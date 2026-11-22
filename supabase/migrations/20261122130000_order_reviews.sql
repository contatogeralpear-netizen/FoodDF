-- Tabela de avaliações de pedidos
-- Regra de negócio: cada cliente pode realizar somente UMA avaliação por pedido (1 a 5 estrelas).

create table if not exists public.order_reviews (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique check (order_reference ~ '^[A-Z0-9-]{1,30}$'),
  order_id uuid references public.orders(id) on delete set null,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 500),
  customer_name text not null default '',
  customer_phone text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists order_reviews_restaurant_idx on public.order_reviews(restaurant_id, created_at desc);
create index if not exists order_reviews_rating_idx on public.order_reviews(restaurant_id, rating);

alter table public.order_reviews enable row level security;

revoke all on public.order_reviews from public, anon;
grant select on public.order_reviews to anon, authenticated;
grant all on public.order_reviews to service_role;

create policy reviews_public_read on public.order_reviews for select to anon, authenticated using (true);
create policy reviews_server_write on public.order_reviews for all to anon, authenticated using (false) with check (false);
