alter table public.restaurants
  add column if not exists banner_enabled boolean not null default false,
  add column if not exists banner_image_url text,
  add column if not exists banner_title text not null default '' check (char_length(banner_title) <= 80),
  add column if not exists banner_info text not null default '' check (char_length(banner_info) <= 45),
  add column if not exists banner_price_from integer check (banner_price_from is null or banner_price_from between 0 and 1000000),
  add column if not exists banner_price_to integer check (banner_price_to is null or banner_price_to between 0 and 1000000),
  add column if not exists banner_link text not null default '' check (char_length(banner_link) <= 500);

grant select (banner_enabled, banner_image_url, banner_title, banner_info, banner_price_from, banner_price_to, banner_link)
  on public.restaurants to anon, authenticated;

grant insert, update (banner_enabled, banner_image_url, banner_title, banner_info, banner_price_from, banner_price_to, banner_link)
  on public.restaurants to authenticated;

alter table public.products
  add column if not exists is_promo boolean not null default false;

grant select (is_promo) on public.products to anon, authenticated;
grant insert, update (is_promo) on public.products to authenticated;

update public.restaurants
   set banner_enabled = true,
       banner_image_url = '/images/store/banner-prato-da-casa.webp',
       banner_title = 'Prato da casa',
       banner_info = 'Bife na brasa, arroz, feijão e salada.',
       banner_price_from = 2990,
       banner_price_to = 2490,
       banner_link = '/restaurantes/brasa-burger#refeicao-prato-da-casa'
 where id = 'brasa-burger';

update public.products
   set is_promo = true,
       price = 2990,
       promo_price = 2490,
       description = 'Bife na brasa, arroz, feijão e salada.'
 where id = 'prato-da-casa';
