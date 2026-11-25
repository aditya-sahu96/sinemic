from src.pricing import calculate_total
from src.checkout import checkout

def test_calculate_total():
    assert calculate_total([{"price": 10, "qty": 2}]) == 20

def test_checkout():
    assert checkout([{"price": 10, "qty": 2}]) == 18
