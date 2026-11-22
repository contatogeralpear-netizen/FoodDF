import { getOrderReview, submitOrderReview } from '@/lib/server/reviews';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderRef = url.searchParams.get('order')?.trim().toUpperCase();

  if (!orderRef) {
    return Response.json({ error: 'Informe a referência do pedido.' }, { status: 400 });
  }

  try {
    const data = await getOrderReview(orderRef);
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Erro ao consultar avaliação.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderReference, rating, comment, customerName, phone, restaurantId } = body;

    if (!orderReference || !rating) {
      return Response.json({ error: 'Referência do pedido e nota (1 a 5 estrelas) são obrigatórios.' }, { status: 400 });
    }

    const result = await submitOrderReview({
      orderReference,
      rating: Number(rating),
      comment: typeof comment === 'string' ? comment : undefined,
      customerName: typeof customerName === 'string' ? customerName : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
      restaurantId: typeof restaurantId === 'string' ? restaurantId : undefined,
    });

    return Response.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao registrar avaliação.';
    const isConflict = message.includes('já foi avaliado');
    return Response.json({ error: message }, { status: isConflict ? 409 : 400 });
  }
}
