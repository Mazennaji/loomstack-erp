import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from ..models import SalesOrderLine


def _weekly_demand(tenant_id: str, product_id: str) -> pd.DataFrame:
    rows = (
        SalesOrderLine.objects
        .filter(product_id=product_id, sales_order__tenant_id=tenant_id)
        .values('due_date', 'quantity')
    )
    df = pd.DataFrame(list(rows))
    if df.empty:
        return df
    df = df.rename(columns={'due_date': 'ds', 'quantity': 'y'})
    df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
    df = df.groupby(pd.Grouper(key='ds', freq='W')).sum().reset_index()
    return df.sort_values('ds').reset_index(drop=True)


def detect_demand_anomalies(tenant_id: str, product_id: str):
    df = _weekly_demand(tenant_id, product_id)
    if df.empty or len(df) < 12:
        return {
            'status': 'insufficient_data',
            'message': 'Need at least ~12 weeks of history for anomaly detection.',
            'anomalies': [],
        }

    y = df['y'].values.astype(float)

    roll_mean = pd.Series(y).rolling(4, min_periods=1).mean().values
    roll_std = pd.Series(y).rolling(4, min_periods=1).std().fillna(0).values
    wow_change = np.concatenate([[0], np.diff(y)])
    deviation = y - roll_mean

    X = np.column_stack([y, wow_change, deviation, roll_std])

    model = IsolationForest(
        contamination=0.08,
        random_state=42,
        n_estimators=100,
    )
    labels = model.fit_predict(X)
    scores = model.score_samples(X)

    anomalies = []
    for i, (label, score) in enumerate(zip(labels, scores)):
        if label == -1:
            expected = float(roll_mean[i])
            actual = float(y[i])
            anomalies.append({
                'date': df['ds'].iloc[i].strftime('%Y-%m-%d'),
                'actual': round(actual),
                'expected': round(expected),
                'deviation_pct': round((actual - expected) / expected * 100, 1) if expected else None,
                'direction': 'spike' if actual > expected else 'drop',
                'score': round(float(score), 4),
            })

    anomalies.sort(key=lambda a: a['score'])

    return {
        'status': 'ok',
        'product_id': product_id,
        'weeks_analyzed': len(df),
        'anomaly_count': len(anomalies),
        'anomalies': anomalies,
    }


def detect_all_products(tenant_id: str):
    product_ids = (
        SalesOrderLine.objects
        .filter(sales_order__tenant_id=tenant_id)
        .values_list('product_id', flat=True)
        .distinct()
    )

    summary = []
    for pid in product_ids:
        result = detect_demand_anomalies(tenant_id, pid)
        if result['status'] == 'ok' and result['anomaly_count'] > 0:
            product = (
                SalesOrderLine.objects
                .filter(product_id=pid)
                .select_related('product')
                .first()
            )
            summary.append({
                'product_id': pid,
                'sku': product.product.sku if product else '',
                'name': product.product.name if product else '',
                'anomaly_count': result['anomaly_count'],
                'anomalies': result['anomalies'],
            })

    summary.sort(key=lambda s: s['anomaly_count'], reverse=True)
    return {'status': 'ok', 'products_with_anomalies': len(summary), 'results': summary}