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


def create_machine(token, name, code, interval):
    r = requests.post(
        f'{API_BASE}/machines',
        headers={'Authorization': f'Bearer {token}'},
        json={'name': name, 'code': code, 'maintenanceIntervalHours': interval},
    )
    if r.status_code >= 400:
        existing = requests.get(f'{API_BASE}/machines', headers={'Authorization': f'Bearer {token}'}).json()
        for m in existing:
            if m['code'] == code:
                return m['id']
        raise SystemExit(f'create machine failed: {r.status_code} {r.text}')
    return r.json()['id']


def log_usage(token, machine_id, d, hours, cycles):
    requests.post(
        f'{API_BASE}/machines/usage',
        headers={'Authorization': f'Bearer {token}'},
        json={'machineId': machine_id, 'date': d.isoformat(), 'hoursRun': hours, 'cycles': cycles},
    )


def log_maintenance(token, machine_id, d, hours_at_service):
    requests.post(
        f'{API_BASE}/machines/maintenance',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'machineId': machine_id,
            'type': 'PREVENTIVE',
            'date': d.isoformat(),
            'hoursAtService': hours_at_service,
        },
    )


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
            weekday = d.weekday()
            factor = 0.3 if weekday >= 5 else 1.0
            hours = max(0, random.gauss(avg_daily * factor, 2))
            cycles = int(hours * random.uniform(8, 15))
            cumulative += hours
            log_usage(token, mid, d, round(hours, 2), cycles)

            if cumulative - last_service_hours >= interval:
                log_maintenance(token, mid, d, round(cumulative, 1))
                last_service_hours = cumulative

        print(f'  {code}: {round(cumulative)}h logged over {DAYS} days')

    print('\nDone. Machines have usage + maintenance history.')


def log_usage(token, machine_id, d, hours, cycles):
    r = requests.post(
        f'{API_BASE}/machines/usage',
        headers={'Authorization': f'Bearer {token}'},
        json={'machineId': machine_id, 'date': d.isoformat(), 'hoursRun': hours, 'cycles': cycles},
    )
    r.raise_for_status()

if __name__ == '__main__':
    main()