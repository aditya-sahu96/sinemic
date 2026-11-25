export function calculateTotal(items: { price: number; qty: number }[], discountPct = 0): number {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return subtotal * (1 - discountPct / 100);
}
