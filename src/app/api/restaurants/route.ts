import { getRestaurants } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const state = params.get('state')?.toUpperCase() || undefined;
  const city = params.get('city')?.trim() || undefined;
  const sort = params.get('sort')?.trim() || 'relevance'; // 'relevance' | 'rating'

  if ((state && !/^[A-Z]{2}$/.test(state)) || (city && city.length > 100)) {
    return Response.json({ error: 'Localização inválida.' }, { status: 400 });
  }

  try {
    const { restaurants, mode } = await getRestaurants(state, city);
    let sorted = [...restaurants];

    if (sort === 'rating') {
      // Ordenação por maior avaliação
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      // Ordenação por relevância: abertos primeiro, depois por mais avaliações / nome
      sorted.sort((a, b) => {
        if (a.isOpen && !b.isOpen) return -1;
        if (!a.isOpen && b.isOpen) return 1;
        if ((b.reviewCount ?? 0) !== (a.reviewCount ?? 0)) {
          return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        }
        return a.name.localeCompare(b.name, 'pt-BR');
      });
    }

    return Response.json({ restaurants: sorted, mode }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Não foi possível buscar os restaurantes. Tente novamente.' }, { status: 503 });
  }
}
