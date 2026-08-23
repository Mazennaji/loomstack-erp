import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

from .features import weekly_series, make_lag_features, FEATURE_COLS


def train_and_forecast(tenant_id: str, product_id: str, periods: int = 8):
    df = weekly_series(tenant_id, product_id)
    if df.empty or len(df) < 20:
        return {
            'status': 'insufficient_data',
            'message': 'Need at least ~20 weeks of history for this model.',
            'forecast': [],
        }

    feat = make_lag_features(df)
    if len(feat) < 10:
        return {
            'status': 'insufficient_data',
            'message': 'Not enough usable rows after feature engineering.',
            'forecast': [],
        }

    X = feat[FEATURE_COLS].values
    y = feat['y'].values

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.9,
        random_state=42,
    )
    model.fit(X, y)


    preds_train = model.predict(X)
    mae = float(np.mean(np.abs(preds_train - y)))

    history = df['y'].tolist()
    last_date = df['ds'].max()
    results = []

    for step in range(1, periods + 1):
        lags = [history[-lag] for lag in range(1, 9)]
        recent = history[-4:]
        roll_mean = float(np.mean(recent))
        roll_std = float(np.std(recent, ddof=1)) if len(recent) > 1 else 0.0
        forecast_date = last_date + pd.Timedelta(weeks=step)
        row = lags + [
            roll_mean,
            roll_std,
            int(forecast_date.isocalendar().week),
            int(forecast_date.month),
        ]
        pred = float(model.predict([row])[0])
        pred = max(0, round(pred))
        history.append(pred)
        results.append({
            'date': forecast_date.strftime('%Y-%m-%d'),
            'predicted_demand': pred,
            'lower_bound': max(0, round(pred - mae)),
            'upper_bound': round(pred + mae),
        })

    return {
        'status': 'ok',
        'product_id': product_id,
        'model': 'gradient_boosting',
        'train_mae': round(mae, 2),
        'forecast': results,
    }