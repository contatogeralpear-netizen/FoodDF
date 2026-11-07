import { getRestaurants } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const state = params.get('state')?.toUpperCase();
  const city = params.get('city')?.trim();
  if ((state && !/^[A-Z]{2}$/.test(state)) || (city && city.length > 100)) return Response.json({ error: 'Localização inválida.' }, { status: 400 });
  try {
    return Response.json(await getRestaurants(state, city), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Não foi possível buscar os restaurantes. Tente novamente.' }, { status: 503 });
  }
}
