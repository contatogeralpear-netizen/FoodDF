import test from 'node:test';
import assert from 'node:assert/strict';
import { isFreePromotionActive } from '../src/lib/promotion.ts';

test('a gratuidade termina no início de 2027 no horário de Brasília', () => {
  assert.equal(isFreePromotionActive(new Date('2027-01-01T02:59:59.999Z')), true);
  assert.equal(isFreePromotionActive(new Date('2027-01-01T03:00:00.000Z')), false);
});
