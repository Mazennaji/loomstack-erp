import numpy as np
import pandas as pd
from datetime import timedelta
from sklearn.ensemble import GradientBoostingRegressor

from ..models import Machine, MachineUsage, MaintenanceEvent


def _usage_df(machine_id: str) -> pd.DataFrame:
    rows = MachineUsage.objects.filter(machine_id=machine_id).values('date', 'hours_run', 'cycles')
    df = pd.DataFrame(list(rows))
    if df.empty:
        return df
    df['date'] = pd.to_datetime(df['date']).dt.tz_localize(None)
    return df.sort_values('date').reset_index(drop=True)


def _recent_rate(df: pd.DataFrame, window_days: int = 30) -> float:
    if df.empty:
        return 0.0
    cutoff = df['date'].max() - pd.Timedelta(days=window_days)
    recent = df[df['date'] >= cutoff]
    if recent.empty:
        return float(df['hours_run'].mean())
    days = max(1, (recent['date'].max() - recent['date'].min()).days + 1)
    return float(recent['hours_run'].sum() / days)


def _build_training_examples(tenant_id: str):
    X, y = [], []
    machines = Machine.objects.filter(tenant_id=tenant_id)

    for m in machines:
        events = list(
            MaintenanceEvent.objects.filter(machine_id=m.id).order_by('date').values('date', 'hours_at_service')
        )
        if len(events) < 2:
            continue
        usage = _usage_df(m.id)
        for i in range(1, len(events)):
            prev = events[i - 1]
            curr = events[i]
            interval_hours = curr['hours_at_service'] - prev['hours_at_service']
            if interval_hours <= 0:
                continue
            prev_date = pd.to_datetime(prev['date']).tz_localize(None)
            window = usage[
                (usage['date'] <= prev_date) & (usage['date'] >= prev_date - pd.Timedelta(days=30))
            ]
            rate = float(window['hours_run'].mean()) if not window.empty else 0.0
            avg_cycles = float(window['cycles'].mean()) if not window.empty else 0.0
            X.append([rate, avg_cycles, float(m.maintenance_interval_hours)])
            y.append(interval_hours)

    return np.array(X), np.array(y)


def predict_machine(tenant_id: str, machine_id: str):
    machine = Machine.objects.filter(id=machine_id, tenant_id=tenant_id).first()
    if not machine:
        return {'status': 'not_found', 'message': 'Machine not found.'}

    usage = _usage_df(machine_id)
    if usage.empty:
        return {'status': 'insufficient_data', 'message': 'No usage logged for this machine.'}

    total_hours = float(usage['hours_run'].sum())
    rate = _recent_rate(usage)

    last_service = (
        MaintenanceEvent.objects.filter(machine_id=machine_id).order_by('-date').first()
    )
    hours_at_last_service = float(last_service.hours_at_service) if last_service else 0.0
    hours_since_service = total_hours - hours_at_last_service

    X_train, y_train = _build_training_examples(tenant_id)
    interval_pred = None
    model_used = 'interval_fallback'

    if len(X_train) >= 6:
        model = GradientBoostingRegressor(n_estimators=120, max_depth=3, learning_rate=0.06, random_state=42)
        model.fit(X_train, y_train)
        avg_cycles = float(usage['cycles'].tail(30).mean())
        interval_pred = float(
            model.predict([[rate, avg_cycles, float(machine.maintenance_interval_hours)]])[0]
        )
        model_used = 'gradient_boosting'
    else:
        interval_pred = float(machine.maintenance_interval_hours)

    interval_pred = max(1.0, interval_pred)
    hours_remaining = max(0.0, interval_pred - hours_since_service)
    days_remaining = round(hours_remaining / rate, 1) if rate > 0 else None

    pct_consumed = min(1.0, hours_since_service / interval_pred) if interval_pred else 0.0
    if pct_consumed >= 1.0:
        risk = 'overdue'
    elif pct_consumed >= 0.85:
        risk = 'due_soon'
    elif pct_consumed >= 0.6:
        risk = 'monitor'
    else:
        risk = 'healthy'

    projected_date = None
    if days_remaining is not None:
        projected_date = (usage['date'].max() + timedelta(days=days_remaining)).strftime('%Y-%m-%d')

    return {
        'status': 'ok',
        'machine_id': machine_id,
        'code': machine.code,
        'name': machine.name,
        'model_used': model_used,
        'total_hours': round(total_hours, 1),
        'hours_since_service': round(hours_since_service, 1),
        'predicted_interval_hours': round(interval_pred, 1),
        'hours_remaining': round(hours_remaining, 1),
        'daily_usage_rate': round(rate, 2),
        'days_remaining': days_remaining,
        'projected_service_date': projected_date,
        'pct_consumed': round(pct_consumed * 100, 1),
        'risk': risk,
    }


def predict_all(tenant_id: str):
    machines = Machine.objects.filter(tenant_id=tenant_id)
    results = [predict_machine(tenant_id, m.id) for m in machines]
    results = [r for r in results if r['status'] == 'ok']

    order = {'overdue': 0, 'due_soon': 1, 'monitor': 2, 'healthy': 3}
    results.sort(key=lambda r: (order[r['risk']], r['hours_remaining']))
    return {'status': 'ok', 'machine_count': len(results), 'machines': results}