def calculate_total(items, discount_pct=0):
    subtotal = sum(i["price"] * i["qty"] for i in items)
    return subtotal * (1 - discount_pct / 100)
