from .pricing import calculate_total

def make_invoice(cart):
    return {"total": calculate_total(cart)}
