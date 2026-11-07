import { z } from 'zod';

export const orderInputSchema = z.object({
  requestId: z.string().uuid(),
  accessToken: z.string().uuid(),
  restaurantId: z.string().regex(/^[a-z0-9-]{1,80}$/),
  items: z.array(z.object({ productId: z.string().regex(/^[a-z0-9-]{1,80}$/), quantity: z.number().int().min(1).max(20) }).strict()).min(1).max(30),
  customer: z.object({ name: z.string().trim().min(2).max(100), phone: z.string().transform(value => value.replace(/\D/g, '')).refine(value => /^(?:55)?[1-9]{2}\d{8,9}$/.test(value), 'Informe um WhatsApp válido com DDD.') }).strict(),
  fulfillment: z.enum(['delivery', 'pickup']),
  address: z.string().trim().max(500).default(''),
  notes: z.string().trim().max(1000).default(''),
  paymentMethod: z.enum(['pix', 'cash', 'card']),
  changeFor: z.number().int().positive().max(100000).nullable().default(null),
}).strict().superRefine((data, ctx) => {
  if (data.fulfillment === 'delivery' && data.address.length < 10) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Informe o endereço completo para entrega.' });
  if (data.paymentMethod !== 'cash' && data.changeFor !== null) ctx.addIssue({ code: 'custom', path: ['changeFor'], message: 'Troco é válido somente para dinheiro.' });
  if (new Set(data.items.map(item => item.productId)).size !== data.items.length) ctx.addIssue({ code: 'custom', path: ['items'], message: 'Agrupe as quantidades do mesmo produto.' });
});

export type OrderInput = z.infer<typeof orderInputSchema>;
export type PricedProduct = { id: string; name: string; price: number };

export function priceOrder(input: OrderInput, products: PricedProduct[], deliveryFee: number) {
  const byId = new Map(products.map(product => [product.id, product]));
  const items = input.items.map(item => {
    const product = byId.get(item.productId);
    if (!product || !Number.isSafeInteger(product.price) || product.price < 0) throw new Error('Um item do pedido não está disponível. Atualize o cardápio.');
    return { productId: product.id, name: product.name, quantity: item.quantity, unitPrice: product.price, total: product.price * item.quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const fee = input.fulfillment === 'delivery' ? deliveryFee : 0;
  const total = subtotal + fee;
  if (!Number.isSafeInteger(total) || total < 1 || total > 1000000 || !Number.isSafeInteger(fee) || fee < 0) throw new Error('Valor do pedido inválido.');
  if (input.changeFor !== null && input.changeFor < total) throw new Error('O valor para troco precisa ser igual ou maior que o total.');
  return { items, subtotal, deliveryFee: fee, total };
}

export function detectReceiptType(bytes: Uint8Array): { mime: string; extension: string } | null {
  if (bytes.length < 8) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: 'image/jpeg', extension: 'jpg' };
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)) return { mime: 'image/png', extension: 'png' };
  if (new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-') return { mime: 'application/pdf', extension: 'pdf' };
  return null;
}
