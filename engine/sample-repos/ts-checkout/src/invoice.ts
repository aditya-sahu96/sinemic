import { calculateTotal } from "./pricing";

export interface CartItem { price: number; qty: number; }
export function makeInvoice(cart: CartItem[]): { total: number } {
  return { total: calculateTotal(cart) };
}
