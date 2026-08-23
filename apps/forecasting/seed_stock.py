import random
import requests

API_BASE = 'http://localhost:3000'
EMAIL = 'admin@acme.com'
PASSWORD = 'password123'

random.seed(42)


def login():
    r = requests.post(f'{API_BASE}/auth/login', json={'email': EMAIL, 'password': PASSWORD})
    r.raise_for_status()
    data = r.json()
    token = data.get('access_token') or data.get('accessToken') or data.get('token')
    if not token:
        raise SystemExit(f'No token in login response: {data}')
    return token


def get_products(token):
    r = requests.get(f'{API_BASE}/products', headers={'Authorization': f'Bearer {token}'})
    r.raise_for_status()
    return r.json()


def create_warehouse(token, name, location):
    r = requests.post(
        f'{API_BASE}/warehouses',
        headers={'Authorization': f'Bearer {token}'},
        json={'name': name, 'location': location},
    )
    if r.status_code >= 400:
        existing = requests.get(f'{API_BASE}/warehouses', headers={'Authorization': f'Bearer {token}'}).json()
        for w in existing:
            if w['name'] == name:
                return w['id']
        raise SystemExit(f'Failed to create warehouse {name}: {r.status_code} {r.text}')
    return r.json()['id']


def adjust_stock(token, product_id, warehouse_id, qty):
    r = requests.post(
        f'{API_BASE}/stock/adjust',
        headers={'Authorization': f'Bearer {token}'},
        json={'productId': product_id, 'warehouseId': warehouse_id, 'quantityChange': qty},
    )
    if r.status_code >= 400:
        raise SystemExit(f'Failed to adjust stock: {r.status_code} {r.text}')


def main():
    token = login()
    print('Logged in.')

    products = get_products(token)
    print(f'Found {len(products)} products.')

    wh_main = create_warehouse(token, 'Main Warehouse', 'Beirut')
    wh_north = create_warehouse(token, 'North Depot', 'Tripoli')
    print(f'Warehouses: main={wh_main} north={wh_north}')

    for p in products:
        adjust_stock(token, p['id'], wh_main, random.randint(5, 200))
        adjust_stock(token, p['id'], wh_north, random.randint(0, 50))
        print(f"  stocked {p['sku']}")

    print('\nDone. Refresh the dashboard — Warehouses and Stock Records will fill.')


if __name__ == '__main__':
    main()