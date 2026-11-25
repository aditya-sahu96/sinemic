package checkout

import "go-checkout/pricing"

func Checkout(cart []pricing.Item) float64 {
	return pricing.CalculateTotal(cart, 10)
}
