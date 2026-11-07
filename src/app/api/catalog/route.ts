import { getCatalog } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const restaurant = new URL(request.url).searchParams.get('restaurant') || 'brasa-burger';
    return Response.json(await getCatalog(restaurant), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Não foi possível encontrar este restaurante ou carregar seu cardápio.' }, { status: 404 });
  }
}
