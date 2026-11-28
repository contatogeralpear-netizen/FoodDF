import { createHmac } from 'node:crypto';
import { isOpenNowByHours, type ScheduleHour } from '@/lib/domain';
import { database, canCreateOrders } from '@/lib/server/supabase';
import { orderInputSchema, priceOrder } from '@/lib/server/order-validation';
import { checkOrigin, jsonError, tokenHash } from '@/lib/server/http';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!checkOrigin(request)) return jsonError('Origem não permitida.', 403);
  if (!canCreateOrders()) return jsonError('Esta loja está em demonstração e ainda não recebe pedidos reais.', 503);
  if (!request.headers.get('content-type')?.includes('application/json')) return jsonError('Envie o pedido em JSON.', 415);
  if (Number(request.headers.get('content-length')) > 32768) return jsonError('Pedido muito grande.', 413);
  let raw: unknown;
  try {
    const body = await request.text();
    if (body.length > 32768) return jsonError('Pedido muito grande.', 413);
    raw = JSON.parse(body);
  } catch { return jsonError('Pedido inválido.'); }
  const parsed = orderInputSchema.safeParse(raw);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Confira os dados do pedido.');
  const input = parsed.data;
  const db = database();
  const accessHash = tokenHash(input.accessToken);
  const fingerprint = tokenHash(JSON.stringify({ ...input, accessToken: undefined }));
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const bucketKey = createHmac('sha256', process.env.SUPABASE_SECRET_KEY || 'fooddf-orders-rate').update(`orders:${ip}`).digest('hex');

  try {
    const restaurantResult = await db.from('restaurants').select('id,delivery_fee,whatsapp,pix_key,pix_name,pix_city,accepting_orders,is_demo,is_open,opening_hours,delivery_enabled,pickup_enabled,payment_methods,min_order').eq('id', input.restaurantId).eq('active', true).eq('status', 'published').single();
    const restaurant = restaurantResult.data;
    const currentlyOpen = restaurant ? isOpenNowByHours(restaurant.opening_hours as ScheduleHour[] | undefined, restaurant.is_open) : false;
    if (restaurantResult.error || !restaurant?.accepting_orders || !restaurant.whatsapp || !currentlyOpen) {
      return jsonError('O restaurante ainda não está recebendo pedidos.', 409);
    }
    if (!restaurant.payment_methods.includes(input.paymentMethod) || (input.fulfillment === 'delivery' ? !restaurant.delivery_enabled : !restaurant.pickup_enabled)) {
      return jsonError('Forma de pagamento ou entrega indisponível.', 409);
    }
    if (input.paymentMethod === 'pix' && !restaurant.is_demo && (!restaurant.pix_key || !restaurant.pix_name)) {
      return jsonError('Pix indisponível. Escolha outra forma de pagamento.', 409);
    }
    const productResult = await db.from('products').select('id,name,price,promo_price,extras').eq('restaurant_id', input.restaurantId).eq('active', true).in('id', input.items.map(item => item.productId));
    if (productResult.error) throw new Error('Catalog unavailable');
    let priced;
    try { priced = priceOrder(input, productResult.data, restaurant.delivery_fee); }
    catch (error) { return jsonError(error instanceof Error ? error.message : 'Não foi possível calcular o pedido.', 409); }
    if (priced.subtotal < restaurant.min_order) return jsonError('O pedido não atingiu o valor mínimo do restaurante.', 409);

    const { data: rpcData, error: rpcError } = await db.rpc('fooddf_place_order', {
      p_bucket_key: bucketKey,
      p_request_id: input.requestId,
      p_access_token_hash: accessHash,
      p_request_hash: fingerprint,
      p_restaurant_id: input.restaurantId,
      p_customer_name: input.customer.name,
      p_customer_phone: input.customer.phone,
      p_fulfillment: input.fulfillment,
      p_address: input.fulfillment === 'delivery' ? input.address : '',
      p_notes: input.notes,
      p_payment_method: input.paymentMethod,
      p_change_for: input.changeFor,
      p_items: priced.items,
      p_subtotal: priced.subtotal,
      p_delivery_fee: priced.deliveryFee,
      p_total: priced.total,
    });
    if (rpcError || !rpcData) throw new Error('Order insert failed');
    const order = rpcData as { error?: string; status_code?: number; id: string; reference: number; subtotal: number; delivery_fee: number; total: number; status: string; payment_status: string };
    if (order.error) return jsonError(order.error, order.status_code || 409);

    return Response.json({
      orderId: order.id,
      reference: `FD${order.reference}`,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
      status: order.status,
      paymentStatus: order.payment_status,
      accessToken: input.accessToken,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return jsonError('Não foi possível registrar o pedido. Tente novamente; seu carrinho foi mantido.', 503);
  }
}
