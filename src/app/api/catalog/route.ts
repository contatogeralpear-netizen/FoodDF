import { getCatalog, RestaurantNotFoundError } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const restaurant = new URL(request.url).searchParams.get('restaurant') || 'brasa-burger';
    return Response.json(await getCatalog(restaurant), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof RestaurantNotFoundError ? 404 : 503;
    return Response.json({ error: 'Não foi possível encontrar este restaurante ou carregar seu cardápio.' }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
