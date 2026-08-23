import math
import random
from datetime import date, timedelta

import requests

API_BASE = 'http://localhost:3000'
EMAIL = 'admin@acme.com'
PASSWORD = 'password123'

# Products to create: (sku, name, base_weekly_demand, trend_per_week, seasonal_amp)
PRODUCTS = [
    ('WIDGET-A', 'Widget A', 40, 0.3, 12),
    ('WIDGET-B', 'Widget B', 25, -0.1, 6),
    ('GADGET-X', 'Gadget X', 60, 0.5, 20),
    ('GADGET-Y', 'Gadget Y', 15, 0.05, 4),
    ('PART-100', 'Part 100', 80, 0.2, 25),
    ('PART-200', 'Part 200', 10, 0.4, 3),
]

WEEKS = 78  # ~1.5 years of history
random.seed(42)


def login():
    r = requests.post(f'{API_BASE}/auth/login', json={'email': EMAIL, 'password': PASSWORD})
    r.raise_for_status()
    data = r.json()
    token = data.get('access_token') or data.get('accessToken') or data.get('token')
    if not token:
        raise SystemExit(f'No token in login response: {data}')
    return token


def create_product(token, sku, name):
    r = requests.post(
        f'{API_BASE}/products',
        headers={'Authorization': f'Bearer {token}'},
        json={'sku': sku, 'name': name},
    )
    if r.status_code >= 400:
        # product may already exist; try to find it
        existing = requests.get(f'{API_BASE}/products', headers={'Authorization': f'Bearer {token}'}).json()
        for p in existing:
            if p['sku'] == sku:
                return p['id']
        raise SystemExit(f'Failed to create {sku}: {r.status_code} {r.text}')
    return r.json()['id']


def weekly_quantity(week_index, base, trend, seasonal_amp):
    # trend + yearly seasonality (52-week cycle) + noise, floored at 0
    seasonal = seasonal_amp * math.sin(2 * math.pi * week_index / 52)
    noise = random.gauss(0, base * 0.15)
    qty = base + trend * week_index + seasonal + noise
    return max(0, round(qty))


def create_sales_order(token, product_id, quantity, due_date):
    r = requests.post(
        f'{API_BASE}/mrp/sales-orders',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'customerName': 'SEED',
            'lines': [
                {
                    'productId': product_id,
                    'quantity': quantity,
                    'dueDate': due_date.isoformat(),
                }
            ],
        },
    )
    if r.status_code >= 400:
        raise SystemExit(f'Failed to create order: {r.status_code} {r.text}')


def main():
    token = login()
    print('Logged in.')

    start = date.today() - timedelta(weeks=WEEKS)

    for sku, name, base, trend, amp in PRODUCTS:
        pid = create_product(token, sku, name)
        print(f'Product {sku} -> {pid}')
        created = 0
        for w in range(WEEKS):
            qty = weekly_quantity(w, base, trend, amp)
            if qty <= 0:
                continue
            due = start + timedelta(weeks=w)
            create_sales_order(token, pid, qty, due)
            created += 1
        print(f'  seeded {created} weekly orders for {sku}')

    print('\nDone. Run check_data.py to verify.')


if __name__ == '__main__':
    main()