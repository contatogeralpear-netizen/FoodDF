import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { database, canCreateOrders } from '@/lib/server/supabase';
import { checkOrigin, jsonError, rateLimit, tokenHash } from '@/lib/server/http';
import { detectReceiptType } from '@/lib/server/order-validation';

export const runtime = 'nodejs';
const maxBytes = 4 * 1024 * 1024;
const bucket = 'payment-receipts';

export async function POST(request: Request) {
  if (!checkOrigin(request)) return jsonError('Origem não permitida.', 403);
  if (!canCreateOrders()) return jsonError('Envio de comprovantes indisponível na demonstração.', 503);
  if (Number(request.headers.get('content-length')) > maxBytes + 16384) return jsonError('O comprovante deve ter até 4 MB.', 413);
  try {
    if (!(await rateLimit(request, 'receipts', 10))) return jsonError('Muitas tentativas. Aguarde um minuto.', 429);
    const form = await request.formData();
    const credentials = z.object({ orderId: z.string().uuid(), accessToken: z.string().uuid() }).safeParse({ orderId: form.get('orderId'), accessToken: form.get('accessToken') });
    if (!credentials.success) return jsonError('Identificação do pedido inválida.');
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > maxBytes) return jsonError('Selecione um comprovante de até 4 MB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectReceiptType(bytes);
    if (!type || type.mime !== file.type) return jsonError('Use uma imagem PNG/JPG ou um PDF válido.');
    const db = database(true);
    const { orderId, accessToken } = credentials.data;
    const order = await db.from('orders').select('id,receipt_path,payment_method,created_at').eq('id', orderId).eq('access_token_hash', tokenHash(accessToken)).maybeSingle();
    if (order.error || !order.data) return jsonError('Pedido não encontrado.', 404);
    if (order.data.payment_method !== 'pix') return jsonError('Este pedido não utiliza Pix.', 409);
    if (Date.now() - Date.parse(order.data.created_at) > 86400000) return jsonError('O prazo de envio deste comprovante encerrou.', 410);
    if (order.data.receipt_path) {
      const signed = await db.storage.from(bucket).createSignedUrl(order.data.receipt_path, 86400, { download: `comprovante.${type.extension}` });
      if (signed.error) throw new Error('Receipt unavailable');
      return Response.json({ fileName: `comprovante.${type.extension}`, url: signed.data.signedUrl, expiresIn: 86400 }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const path = `${orderId}/${randomUUID()}.${type.extension}`;
    const uploaded = await db.storage.from(bucket).upload(path, bytes, { contentType: type.mime, upsert: false });
    if (uploaded.error) throw new Error('Upload failed');
    const updated = await db.from('orders').update({ receipt_path: path }).eq('id', orderId).eq('access_token_hash', tokenHash(accessToken)).is('receipt_path', null).select('id').maybeSingle();
    if (updated.error || !updated.data) {
      await db.storage.from(bucket).remove([path]);
      return jsonError('O comprovante já foi anexado. Atualize o pedido para continuar.', 409);
    }
    const signed = await db.storage.from(bucket).createSignedUrl(path, 86400, { download: `comprovante.${type.extension}` });
    if (signed.error) throw new Error('Signed URL failed');
    return Response.json({ fileName: file.name.slice(0,150), url: signed.data.signedUrl, expiresIn: 86400 }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return jsonError('Não foi possível anexar o comprovante. Tente novamente.', 503);
  }
}
