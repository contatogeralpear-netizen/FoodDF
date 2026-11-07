import { database, canCreateOrders } from '@/lib/server/supabase';
import { orderInputSchema, priceOrder } from '@/lib/server/order-validation';
import { checkOrigin, jsonError, rateLimit, tokenHash } from '@/lib/server/http';

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
  const db = database(true);
  const accessHash = tokenHash(input.accessToken);
  const fingerprint = tokenHash(JSON.stringify({ ...input, accessToken: undefined }));
  const responseFor = (order: { id: string; reference: number; subtotal: number; delivery_fee: number; total: number; status: string; payment_status: string }) => Response.json({ orderId: order.id, reference: `FD${order.reference}`, subtotal: order.subtotal, deliveryFee: order.delivery_fee, total: order.total, status: order.status, paymentStatus: order.payment_status, accessToken: input.accessToken }, { headers: { 'Cache-Control': 'no-store' } });
  try {
    const previous = await db.from('orders').select('id,reference,subtotal,delivery_fee,total,status,payment_status,access_token_hash,request_hash').eq('request_id', input.requestId).maybeSingle();
    if (previous.error) throw new Error('Database unavailable');
    if (previous.data) {
      if (previous.data.access_token_hash !== accessHash || previous.data.request_hash !== fingerprint) return jsonError('Este pedido já foi registrado com outros dados. Revise e inicie um novo envio.', 409);
      return responseFor(previous.data);
    }
    if (!(await rateLimit(request, 'orders', 10))) return jsonError('Muitas tentativas. Aguarde um minuto e tente novamente.', 429);
    const restaurantResult = await db.from('restaurants').select('id,delivery_fee,whatsapp,pix_key,pix_name,pix_city,accepting_orders,is_demo').eq('id', input.restaurantId).eq('active', true).eq('status', 'published').single();
    const restaurant = restaurantResult.data;
    if (restaurantResult.error || !restaurant?.accepting_orders || !restaurant.whatsapp || restaurant.is_demo) return jsonError('O restaurante ainda não está recebendo pedidos.', 409);
    if (input.paymentMethod === 'pix' && (!restaurant.pix_key || !restaurant.pix_name || !restaurant.pix_city)) return jsonError('Pix indisponível. Escolha outra forma de pagamento.', 409);
    const productResult = await db.from('products').select('id,name,price').eq('restaurant_id', input.restaurantId).eq('active', true).in('id', input.items.map(item => item.productId));
    if (productResult.error) throw new Error('Catalog unavailable');
    let priced;
    try { priced = priceOrder(input, productResult.data, restaurant.delivery_fee); }
    catch (error) { return jsonError(error instanceof Error ? error.message : 'Não foi possível calcular o pedido.', 409); }
    const created = await db.from('orders').insert({
      request_id: input.requestId, access_token_hash: accessHash, request_hash: fingerprint,
      restaurant_id: input.restaurantId, customer_name: input.customer.name, customer_phone: input.customer.phone,
      fulfillment: input.fulfillment, address: input.fulfillment === 'delivery' ? input.address : null,
      notes: input.notes, payment_method: input.paymentMethod, change_for: input.changeFor,
      items: priced.items, subtotal: priced.subtotal, delivery_fee: priced.deliveryFee, total: priced.total,
    }).select('id,reference,subtotal,delivery_fee,total,status,payment_status').single();
    if (created.error?.code === '23505') return jsonError('Pedido em processamento. Tente novamente com os mesmos dados.', 409);
    if (created.error || !created.data) throw new Error('Order insert failed');
    return responseFor(created.data);
  } catch {
    return jsonError('Não foi possível registrar o pedido. Tente novamente; seu carrinho foi mantido.', 503);
  }
}
