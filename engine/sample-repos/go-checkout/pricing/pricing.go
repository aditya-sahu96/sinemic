package pricing

type Item struct {
	Price float64
	Qty   float64
}

func CalculateTotal(items []Item, discountPct float64) float64 {
	sub := 0.0
	for _, i := range items {
		sub += i.Price * i.Qty
	}
	return sub * (1 - discountPct/100)
}
