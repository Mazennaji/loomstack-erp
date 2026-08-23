import numpy as np
import pandas as pd

from ..models import SalesOrderLine


def weekly_series(tenant_id: str, product_id: str) -> pd.DataFrame:
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
    df = df.sort_values('ds').reset_index(drop=True)
    return df


def make_lag_features(df: pd.DataFrame, n_lags: int = 8) -> pd.DataFrame:
    out = df.copy()
    for lag in range(1, n_lags + 1):
        out[f'lag_{lag}'] = out['y'].shift(lag)
    out['roll_mean_4'] = out['y'].shift(1).rolling(4).mean()
    out['roll_std_4'] = out['y'].shift(1).rolling(4).std()
    out['week_of_year'] = out['ds'].dt.isocalendar().week.astype(int)
    out['month'] = out['ds'].dt.month
    out = out.dropna().reset_index(drop=True)
    return out


FEATURE_COLS = (
    [f'lag_{i}' for i in range(1, 9)]
    + ['roll_mean_4', 'roll_std_4', 'week_of_year', 'month']
)