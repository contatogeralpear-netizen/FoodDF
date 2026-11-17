import 'server-only';
import type { AdminRestaurant } from '@/lib/admin';
import type { PublicCatalog } from '@/lib/domain';
const CATALOG_TIMEOUT_MS = 4000;
const publicFields='id,slug,name,state,city,address,delivery_fee,whatsapp,pix_key,pix_name,pix_city,accepting_orders,is_demo,description,cuisine,logo_url,cover_url,is_open,opening_hours,delivery_enabled,pickup_enabled,min_order,estimated_time,neighborhoods,payment_methods,receipt_required,neighborhood,complement';
function publicRestaurant(r:AdminRestaurant){return {id:r.id,slug:r.slug,name:r.name,state:r.state,city:r.city,address:[r.address,...[r.complement,r.neighborhood].filter(v=>v&&!r.address.toLocaleLowerCase('pt-BR').includes(v.toLocaleLowerCase('pt-BR')))].filter(Boolean).join(', '),deliveryFee:r.delivery_fee,whatsapp:r.whatsapp,pixKey:r.pix_key,pixName:r.pix_name,pixCity:r.pix_city,isDemo:r.is_demo,acceptingOrders:canCreateOrders()&&r.accepting_orders,description:r.description,cuisine:r.cuisine,logo:r.logo_url,cover:r.cover_url,isOpen:r.is_open,openingHours:r.opening_hours,deliveryEnabled:r.delivery_enabled,pickupEnabled:r.pickup_enabled,minOrder:r.min_order,estimatedTime:r.estimated_time,neighborhoods:r.neighborhoods,paymentMethods:r.payment_methods?.filter((method): method is 'pix'|'cash'|'card' => method==='pix'||method==='cash'||method==='card'),receiptRequired:r.receipt_required};}
import { canCreateOrders, database, hasDatabase } from './supabase';

export class RestaurantNotFoundError extends Error {
  constructor() { super('Restaurant not found'); }
}

export const demoProducts = [
  { id: 'brasa-bacon', name: 'Brasa Bacon', description: 'Burger 180 g, cheddar e bacon', price: 3490, category: 'Lanches', image: 'burger' },
  { id: 'prato-da-casa', name: 'Prato da casa', description: 'Arroz, feijão, bife e salada', price: 2990, category: 'Refeições', image: 'meal' },
  { id: 'batata-crocante', name: 'Batata crocante', description: 'Porção individual', price: 1200, category: 'Lanches', image: 'fries' },
  { id: 'combo-brasa', name: 'Combo Brasa', description: 'Brasa Bacon, batata e refrigerante', price: 4590, category: 'Combos', image: 'combo' },
  { id: 'refrigerante-lata', name: 'Refrigerante lata', description: 'Lata 350 ml bem gelada', price: 600, category: 'Bebidas', image: 'drink' },
];

export const demoRestaurant = { id: 'brasa-burger', slug: 'brasa-burger', name: 'Brasa Burger', state: 'DF', city: 'Brasília', address: 'CLS 308, Bloco B, Loja 12 — Asa Sul', deliveryFee: 500, isDemo: true, whatsapp: '5561982429847' as string | null, pixKey: null as string | null, pixName: null as string | null, pixCity: null as string | null };

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
  const productResult = await db.from('products').select('id,name,description,price,category,image,image_url,promo_price,featured,serves,extras').eq('restaurant_id', r.id).eq('active', true).order('sort_order').abortSignal(AbortSignal.timeout(CATALOG_TIMEOUT_MS));
  if (productResult.error) throw new Error('Catalog unavailable');
  return {
    products: productResult.data.map(p=>({...p,price:p.promo_price??p.price,originalPrice:p.promo_price?p.price:undefined,image:p.image_url||p.image})),
    restaurant: publicRestaurant(r),
    mode: canCreateOrders() && r.accepting_orders && r.whatsapp && !r.is_demo ? 'live' as const : 'demo' as const,
  };
}

export async function getRestaurants(state?: string, city?: string) {
  if (!hasDatabase()) {
    const matches = (!state || state === demoRestaurant.state) && (!city || city.toLocaleLowerCase('pt-BR') === demoRestaurant.city.toLocaleLowerCase('pt-BR'));
    return { restaurants: matches ? [{ ...demoRestaurant, acceptingOrders: false }] : [], mode: 'demo' as const };
  }
  let query = database().from('restaurants').select(publicFields).eq('active', true).eq('status', 'published').order('name').limit(200);
  if (state) query = query.eq('state', state);
  if (city) query = query.eq('city', city);
  const { data, error } = await query.abortSignal(AbortSignal.timeout(CATALOG_TIMEOUT_MS));
  if (error) throw new Error('Restaurants unavailable');
  return { restaurants: data.map(r => publicRestaurant(r as unknown as AdminRestaurant)), mode: canCreateOrders() ? 'live' as const : 'demo' as const };
}

/** Only public, active, non-demo restaurants belong in search indexes. */
export async function getIndexableRestaurantSlugs(): Promise<string[]> {
  if (!hasDatabase()) return [];
  const slugs: string[] = [];
  const pageSize = 500;
  const maxRestaurantUrls = 49998; // Two additional URLs are reserved for the platform.
  for (let offset = 0; offset < maxRestaurantUrls; offset += pageSize) {
    const end = Math.min(offset + pageSize, maxRestaurantUrls) - 1;
    const { data, error } = await database().from('restaurants').select('slug')
      .eq('active', true).eq('status', 'published').eq('is_demo', false)
      .order('slug').range(offset, end).abortSignal(AbortSignal.timeout(CATALOG_TIMEOUT_MS));
    if (error) throw new Error('Restaurants unavailable');
    for (const row of data) if (/^[a-z0-9-]{1,100}$/.test(row.slug)) slugs.push(row.slug);
    if (data.length < end - offset + 1) break;
  }
  return slugs;
}
