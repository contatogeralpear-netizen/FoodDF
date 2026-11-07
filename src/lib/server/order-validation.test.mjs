import test from 'node:test';
import assert from 'node:assert/strict';
import { orderInputSchema, priceOrder, detectReceiptType } from './order-validation.ts';

const input = () => ({
  requestId: '550e8400-e29b-41d4-a716-446655440000',
  accessToken: '550e8400-e29b-41d4-a716-446655440001',
  restaurantId: 'brasa-burger',
  items: [{ productId: 'brasa-bacon', quantity: 2 }],
  customer: { name: 'Cliente de teste', phone: '(61) 99999-0000' },
  fulfillment: 'delivery', address: 'Endereço fictício, Brasília, DF',
  notes: '', paymentMethod: 'cash', changeFor: 10000,
});
const products = [{ id: 'brasa-bacon', name: 'Brasa Bacon', price: 3490 }];

test('preço usa catálogo do servidor e taxa é removida na retirada', () => {
  const parsed = orderInputSchema.parse(input());
  assert.equal(parsed.customer.phone, '61999990000');
  assert.equal(priceOrder(parsed, products, 500).total, 7480);
  assert.equal(priceOrder({ ...parsed, fulfillment: 'pickup' }, products, 500).total, 6980);
});

test('cliente não pode enviar preço ou total arbitrários', () => {
  assert.equal(orderInputSchema.safeParse({ ...input(), total: 1 }).success, false);
  assert.equal(orderInputSchema.safeParse({ ...input(), items: [{ productId: 'brasa-bacon', quantity: 1, price: 1 }] }).success, false);
});

test('rejeita quantidade inválida, SKU duplicado, telefone e endereço incompletos', () => {
  assert.equal(orderInputSchema.safeParse({ ...input(), items: [{ productId: 'brasa-bacon', quantity: -1 }] }).success, false);
  assert.equal(orderInputSchema.safeParse({ ...input(), items: [...input().items, ...input().items] }).success, false);
  assert.equal(orderInputSchema.safeParse({ ...input(), customer: { name: 'Teste', phone: '123' } }).success, false);
  assert.equal(orderInputSchema.safeParse({ ...input(), address: '' }).success, false);
});

test('não aceita produto ausente nem troco menor que total', () => {
  const parsed = orderInputSchema.parse(input());
  assert.throws(() => priceOrder(parsed, [], 500), /não está disponível/);
  assert.throws(() => priceOrder({ ...parsed, changeFor: 100 }, products, 500), /troco/);
  assert.equal(orderInputSchema.safeParse({ ...input(), paymentMethod: 'pix' }).success, false);
});

test('tipo do comprovante exige assinatura de arquivo permitida', () => {
  assert.equal(detectReceiptType(new TextEncoder().encode('<script>malicious</script>')), null);
  assert.equal(detectReceiptType(new TextEncoder().encode('%PDF-1.7 test')).mime, 'application/pdf');
  assert.equal(detectReceiptType(new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])).extension, 'png');
  assert.equal(detectReceiptType(new Uint8Array([0xff,0xd8,0xff,0xe0,0,0,0,0])).extension, 'jpg');
});
