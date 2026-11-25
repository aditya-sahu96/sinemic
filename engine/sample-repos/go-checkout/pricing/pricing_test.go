package pricing

import "testing"

func TestCalculateTotal(t *testing.T) {
	got := CalculateTotal([]Item{{Price: 10, Qty: 2}}, 0)
	if got != 20 {
		t.Fatalf("got %v", got)
	}
}
