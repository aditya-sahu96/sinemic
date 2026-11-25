package invoice

import "go-checkout/pricing"

type Invoice struct {
	Total float64
}

func MakeInvoice(cart []pricing.Item) Invoice {
	return Invoice{Total: pricing.CalculateTotal(cart, 0)}
}
