import 'server-only';
import type { AdminRestaurant } from '@/lib/admin';
import { isOpenNowByHours, type PublicCatalog, type Restaurant } from '@/lib/domain';
import { getProductRatings, getRestaurantRatings } from './reviews';
const CATALOG_TIMEOUT_MS = 4000;
const publicFields='id,slug,name,state,city,address,delivery_fee,whatsapp,pix_key,pix_name,pix_city,accepting_orders,is_demo,description,cuisine,logo_url,cover_url,is_open,opening_hours,delivery_enabled,pickup_enabled,min_order,estimated_time,neighborhoods,payment_methods,receipt_required,neighborhood,complement,banner_enabled,banner_image_url,banner_title,banner_info,banner_price_from,banner_price_to,banner_link';
function publicRestaurant(r:AdminRestaurant):Restaurant{return {id:r.id,slug:r.slug,name:r.name,state:r.state,city:r.city,address:[r.address,...[r.complement,r.neighborhood].filter(v=>v&&!r.address.toLocaleLowerCase('pt-BR').includes(v.toLocaleLowerCase('pt-BR')))].filter(Boolean).join(', '),deliveryFee:r.delivery_fee,whatsapp:r.whatsapp,pixKey:r.pix_key,pixName:r.pix_name,pixCity:r.pix_city,isDemo:r.is_demo,acceptingOrders:canCreateOrders()&&Boolean(r.whatsapp),description:r.description,cuisine:r.cuisine,logo:r.logo_url,cover:r.cover_url,isOpen:isOpenNowByHours(r.opening_hours,r.is_open),openingHours:r.opening_hours,deliveryEnabled:r.delivery_enabled,pickupEnabled:r.pickup_enabled,minOrder:r.min_order,estimatedTime:r.estimated_time,neighborhoods:r.neighborhoods,paymentMethods:r.payment_methods?.filter((method): method is 'pix'|'cash'|'card' => method==='pix'||method==='cash'||method==='card'),receiptRequired:r.receipt_required,rating:undefined,reviewCount:0,bannerEnabled:Boolean(r.banner_enabled),bannerImage:r.banner_image_url||null,bannerTitle:r.banner_title||'',bannerInfo:r.banner_info||'',bannerPriceFrom:r.banner_price_from??null,bannerPriceTo:r.banner_price_to??null,bannerLink:r.banner_link||''};}
import { canCreateOrders, database, hasDatabase } from './supabase';

export class RestaurantNotFoundError extends Error {
  constructor() { super('Restaurant not found'); }
}

export const demoProducts = [
  { id: 'brasa-bacon', name: 'Brasa Bacon', description: 'Burger 180 g, cheddar e bacon.', price: 3490, category: 'Lanches', image: 'burger', rating: 4.9, reviewCount: 38 },
  { id: 'prato-da-casa', name: 'Prato da casa', description: 'Bife na brasa, arroz, feijão e salada.', price: 2490, originalPrice: 2990, isPromo: true, category: 'Refeições', image: 'meal', rating: 4.8, reviewCount: 27 },
  { id: 'batata-crocante', name: 'Batata crocante', description: 'Porção individual.', price: 1200, category: 'Lanches', image: 'fries', rating: 4.7, reviewCount: 19 },
  { id: 'combo-brasa', name: 'Combo Brasa', description: 'Brasa Bacon, batata e refrigerante.', price: 4590, category: 'Combos', image: 'combo', rating: 5.0, reviewCount: 42 },
  { id: 'refrigerante-lata', name: 'Refrigerante lata', description: 'Lata 350 ml bem gelada.', price: 600, category: 'Bebidas', image: 'drink', rating: 4.9, reviewCount: 15 },
];

export const demoRestaurant: Restaurant = { id: 'brasa-burger', slug: 'brasa-burger', name: 'Brasa Burger', state: 'DF', city: 'Brasília', address: 'CLS 308, Bloco B, Loja 12 — Asa Sul', deliveryFee: 500, isDemo: true, whatsapp: '5561982429847', pixKey: null, pixName: null, pixCity: null, description: 'Hambúrgueres artesanais, refeições e bebidas na brasa.', cuisine: 'Hambúrguer Artesanal', cover: 'hero', logo: 'logo', isOpen: true, rating: 4.9, reviewCount: 28, acceptingOrders: false, bannerEnabled: true, bannerImage: '/images/store/banner-prato-da-casa.webp', bannerTitle: 'Prato da casa', bannerInfo: 'Bife na brasa, arroz, feijão e salada.', bannerPriceFrom: 2990, bannerPriceTo: 2490, bannerLink: '/restaurantes/brasa-burger#refeicao-prato-da-casa' };

export async function getCatalog(identifier = 'brasa-burger'): Promise<PublicCatalog> {
  if (!hasDatabase()) {
    if (identifier !== demoRestaurant.id) throw new RestaurantNotFoundError();
    return { products: demoProducts, restaurant: demoRestaurant, mode: 'demo' as const };
  }
  if (!/^[a-z0-9-]{1,100}$/.test(identifier)) throw new RestaurantNotFoundError();
  const db = database();
  const restaurantResult = await db.from('restaurants').select(publicFields).or(`id.eq.${identifier},slug.eq.${identifier}`).eq('active', true).eq('status', 'published').abortSignal(AbortSignal.timeout(CATALOG_TIMEOUT_MS)).maybeSingle();
  if (restaurantResult.error) throw new Error('Restaurants unavailable');
  if (!restaurantResult.data) throw new RestaurantNotFoundError();
  const r = restaurantResult.data as unknown as AdminRestaurant;
  const [productResult, storeRating, mealRatingsMap] = await Promise.all([
    db.from('products').select('id,name,description,price,category,image,image_url,promo_price,is_promo,featured,serves,extras').eq('restaurant_id', r.id).eq('active', true).order('sort_order').abortSignal(AbortSignal.timeout(CATALOG_TIMEOUT_MS)),
    getRestaurantRatings(r.id, r.is_demo).catch(() => ({ rating: 0, reviewCount: 0 })),
    getProductRatings(r.id, r.is_demo).catch(() => ({} as Record<string, { rating: number; reviewCount: number }>)),
  ]);
  if (productResult.error) throw new Error('Catalog unavailable');
  const pubRest = publicRestaurant(r);
  if (storeRating.reviewCount > 0) {
    pubRest.rating = storeRating.rating;
    pubRest.reviewCount = storeRating.reviewCount;
  }
  return {
    products: productResult.data.map(p => ({
      ...p,
      price: p.promo_price ?? p.price,
      originalPrice: p.promo_price ? p.price : undefined,
      isPromo: Boolean(p.is_promo || p.promo_price),
      image: p.image_url || p.image,
      rating: mealRatingsMap[p.id]?.rating,
      reviewCount: mealRatingsMap[p.id]?.reviewCount || 0,
    })),
    restaurant: pubRest,
    mode: canCreateOrders() && r.accepting_orders && r.whatsapp && !r.is_demo ? 'live' as const : 'demo' as const,
  };
}

export async function getRestaurants(state?: string, city?: string): Promise<{ restaurants: Restaurant[]; mode: 'demo' | 'live' }> {
  let list: Restaurant[] = [];
  let mode: 'demo' | 'live' = 'demo';

  if (hasDatabase()) {
    try {
      let query = database().from('restaurants').select(publicFields).eq('active', true).eq('status', 'published').order('name').limit(200);
      if (state) query = query.eq('state', state);
      if (city) query = query.eq('city', city);
      const { data, error } = await query.abortSignal(AbortSignal.timeout(CATALOG_TIMEOUT_MS));
      if (!error && data) {
        list = data.map(r => publicRestaurant(r as unknown as AdminRestaurant));
        mode = canCreateOrders() ? 'live' : 'demo';
      }
    } catch {
      // Fallback gracioso
    }
  }

  // O restaurante modelo (Brasa Burger) é exclusivo para testes e demonstração.
  // Fica visível apenas se NEXT_PUBLIC_SHOW_DEMO=true ou em ambiente não-produção.
  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO === 'true' || process.env.NODE_ENV !== 'production';
  const matchesDemo = (!state || state === demoRestaurant.state) && (!city || city.toLocaleLowerCase('pt-BR') === demoRestaurant.city.toLocaleLowerCase('pt-BR'));
  if (showDemo && matchesDemo && !list.some(r => r.id === demoRestaurant.id || r.slug === demoRestaurant.slug)) {
    list.push({ ...demoRestaurant, acceptingOrders: false, isDemo: true, rating: undefined, reviewCount: 0 });
  }

  // Anexar avaliações existentes no banco (e exemplo no restaurante modelo)
  for (const r of list) {
    try {
      const stats = await getRestaurantRatings(r.id, r.isDemo);
      r.rating = stats.reviewCount > 0 ? stats.rating : undefined;
      r.reviewCount = stats.reviewCount;
    } catch {
      r.rating = undefined;
      r.reviewCount = 0;
    }
  }

  return { restaurants: list, mode };
}

/** Only public, active, non-demo restaurants belong in search indexes. */
export type IndexableRestaurant = {slug:string;name:string;state:string;city:string;description:string|null;cuisine:string|null};
export async function getIndexableRestaurants(): Promise<IndexableRestaurant[]> {
  if (!hasDatabase()) return [];
  const restaurants: IndexableRestaurant[] = [];
  const pageSize = 500;
  const maxRestaurantUrls = 44398; // Reserve space for all 5,571 municipalities, states and platform URLs.
  for (let offset = 0; offset < maxRestaurantUrls; offset += pageSize) {
    const end = Math.min(offset + pageSize, maxRestaurantUrls) - 1;
    const { data, error } = await database().from('restaurants').select('slug,name,state,city,description,cuisine')
      .eq('active', true).eq('status', 'published').eq('is_demo', false)
      .order('slug').range(offset, end).abortSignal(AbortSignal.timeout(CATALOG_TIMEOUT_MS));
    if (error) throw new Error('Restaurants unavailable');
    for (const row of data) if (/^[a-z0-9-]{1,100}$/.test(row.slug)) restaurants.push(row as IndexableRestaurant);
    if (data.length < end - offset + 1) break;
  }
  return restaurants;
}
export async function getIndexableRestaurantSlugs(): Promise<string[]> {
  return (await getIndexableRestaurants()).map(r=>r.slug);
}
