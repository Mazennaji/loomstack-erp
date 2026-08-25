import random
from datetime import date, timedelta

import requests

API_BASE = 'http://localhost:3000'
EMAIL = 'admin@acme.com'
PASSWORD = 'password123'

random.seed(7)

MACHINES = [
    ('CNC Mill A', 'CNC-A', 500),
    ('CNC Mill B', 'CNC-B', 500),
    ('Laser Cutter', 'LASER-1', 300),
    ('Press Brake', 'PRESS-1', 800),
    ('Assembly Robot', 'ROBOT-1', 1000),
]

DAYS = 365


def login():
    r = requests.post(f'{API_BASE}/auth/login', json={'email': EMAIL, 'password': PASSWORD})
    r.raise_for_status()
    d = r.json()
    return d.get('access_token') or d.get('accessToken') or d.get('token')


def auth_headers(token):
    return {'Authorization': f'Bearer {token}'}


def create_machine(token, name, code, interval):
    r = requests.post(
        f'{API_BASE}/machines',
        headers=auth_headers(token),
        json={'name': name, 'code': code, 'maintenanceIntervalHours': interval},
    )
    if r.status_code == 404:
        raise SystemExit(
            f"The API has no /machines endpoint (404). "
            f"This seed script requires a machines module on the NestJS API "
            f"at {API_BASE} that isn't implemented yet."
        )
    if r.status_code == 409:  # already exists, look it up
        existing = requests.get(f'{API_BASE}/machines', headers=auth_headers(token)).json()
        items = existing.get('data', existing) if isinstance(existing, dict) else existing
        for m in items:
            if m.get('code') == code:
                return m['id']
    r.raise_for_status()
    return r.json()['id']


def log_usage(token, machine_id, d, hours, cycles):
    r = requests.post(
        f'{API_BASE}/machines/usage',
        headers=auth_headers(token),
        json={'machineId': machine_id, 'date': d.isoformat(), 'hoursRun': hours, 'cycles': cycles},
    )
    r.raise_for_status()


def log_maintenance(token, machine_id, d, hours_at_service):
    r = requests.post(
        f'{API_BASE}/machines/maintenance',
        headers=auth_headers(token),
        json={
            'machineId': machine_id,
            'type': 'PREVENTIVE',
            'date': d.isoformat(),
            'hoursAtService': hours_at_service,
        },
    )
    r.raise_for_status()


def main():
    token = login()
    print('Logged in.')
    start = date.today() - timedelta(days=DAYS)

    for name, code, interval in MACHINES:
        mid = create_machine(token, name, code, interval)
        print(f'{code} -> {mid}')

        cumulative = 0.0
        last_service_hours = 0.0
        avg_daily = random.uniform(4, 14)

        for day in range(DAYS):
            d = start + timedelta(days=day)
            factor = 0.3 if d.weekday() >= 5 else 1.0
            hours = max(0, random.gauss(avg_daily * factor, 2))
            cycles = int(hours * random.uniform(8, 15))
            cumulative += hours
            log_usage(token, mid, d, round(hours, 2), cycles)

            if cumulative - last_service_hours >= interval:
                log_maintenance(token, mid, d, round(cumulative, 1))
                last_service_hours = cumulative

        print(f'  {code}: {round(cumulative)}h logged over {DAYS} days')

    print('\nDone. Machines have usage + maintenance history.')


if __name__ == '__main__':
    main()