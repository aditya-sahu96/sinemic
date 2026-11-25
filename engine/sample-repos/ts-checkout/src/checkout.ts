import { calculateTotal } from "./pricing";

export interface CartItem { price: number; qty: number; }
export function checkout(cart: CartItem[]): number {
  return calculateTotal(cart, 10);
}
