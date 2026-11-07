import 'server-only';
import { canCreateOrders, database, hasDatabase } from './supabase';

export const demoProducts = [
  { id: 'brasa-bacon', name: 'Brasa Bacon', description: 'Burger 180 g, cheddar e bacon', price: 3490, category: 'Lanches', image: 'burger' },
  { id: 'prato-da-casa', name: 'Prato da casa', description: 'Arroz, feijão, bife e salada', price: 2990, category: 'Refeições', image: 'meal' },
  { id: 'batata-crocante', name: 'Batata crocante', description: 'Porção individual', price: 1200, category: 'Lanches', image: 'fries' },
  { id: 'combo-brasa', name: 'Combo Brasa', description: 'Brasa Bacon, batata e refrigerante', price: 4590, category: 'Combos', image: 'combo' },
  { id: 'refrigerante-lata', name: 'Refrigerante lata', description: 'Lata 350 ml bem gelada', price: 600, category: 'Bebidas', image: 'drink' },
];

export const demoRestaurant = { id: 'brasa-burger', slug: 'brasa-burger', name: 'Brasa Burger', state: 'DF', city: 'Brasília', address: 'CLS 308, Bloco B, Loja 12 — Asa Sul', deliveryFee: 500, isDemo: true, whatsapp: '5561982429847' as string | null, pixKey: null as string | null, pixName: null as string | null, pixCity: null as string | null };

export async function getCatalog(identifier = 'brasa-burger') {
  if (!hasDatabase()) {
    if (identifier !== demoRestaurant.id) throw new Error('Restaurant not found');
    return { products: demoProducts, restaurant: demoRestaurant, mode: 'demo' as const };
  }
  if (!/^[a-z0-9-]{1,100}$/.test(identifier)) throw new Error('Restaurant not found');
  const db = database();
  const restaurantResult = await db.from('restaurants').select('id,slug,name,state,city,address,delivery_fee,whatsapp,pix_key,pix_name,pix_city,accepting_orders,is_demo').or(`id.eq.${identifier},slug.eq.${identifier}`).eq('active', true).eq('status', 'published').single();
  if (restaurantResult.error) throw new Error('Restaurant not found');
  const r = restaurantResult.data;
  const productResult = await db.from('products').select('id,name,description,price,category,image').eq('restaurant_id', r.id).eq('active', true).order('sort_order');
  if (productResult.error) throw new Error('Catalog unavailable');
  return {
    products: productResult.data,
    restaurant: { id: r.id, slug: r.slug, name: r.name, state: r.state, city: r.city, address: r.address, deliveryFee: r.delivery_fee, whatsapp: r.whatsapp, pixKey: r.pix_key, pixName: r.pix_name, pixCity: r.pix_city, isDemo: r.is_demo },
    mode: canCreateOrders() && r.accepting_orders && r.whatsapp && !r.is_demo ? 'live' as const : 'demo' as const,
  };
}

export async function getRestaurants(state?: string, city?: string) {
  if (!hasDatabase()) {
    const matches = (!state || state === demoRestaurant.state) && (!city || city.toLocaleLowerCase('pt-BR') === demoRestaurant.city.toLocaleLowerCase('pt-BR'));
    return { restaurants: matches ? [{ ...demoRestaurant, acceptingOrders: false }] : [], mode: 'demo' as const };
  }
  let query = database().from('restaurants').select('id,slug,name,state,city,address,delivery_fee,is_demo,accepting_orders').eq('active', true).eq('status', 'published').order('name').limit(200);
  if (state) query = query.eq('state', state);
  if (city) query = query.eq('city', city);
  const { data, error } = await query;
  if (error) throw new Error('Restaurants unavailable');
  return { restaurants: data.map(r => ({ id: r.id, slug: r.slug, name: r.name, state: r.state, city: r.city, address: r.address, deliveryFee: r.delivery_fee, isDemo: r.is_demo, acceptingOrders: r.accepting_orders })), mode: canCreateOrders() ? 'live' as const : 'demo' as const };
}
