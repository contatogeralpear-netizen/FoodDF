// The offer ends at midnight at the start of 2027 in Brasília (UTC−03:00).
export const FREE_PROMOTION_END = '2027-01-01T03:00:00.000Z';

export function isFreePromotionActive(date: Date = new Date()): boolean {
  return date.getTime() < Date.parse(FREE_PROMOTION_END);
}
