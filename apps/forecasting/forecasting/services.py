from datetime import timedelta

import pandas as pd

from .models import SalesOrderLine
from .forecasters import SIMPLE_FORECASTERS
from .ml.gbr_forecaster import train_and_forecast as gbr_forecast


def get_historical_demand(tenant_id: str, product_id: str) -> pd.DataFrame:
    lines = SalesOrderLine.objects.filter(
        product_id=product_id,
        sales_order__tenant_id=tenant_id,
    ).values('due_date', 'quantity')

    df = pd.DataFrame(list(lines))
    if df.empty:
        return df

    df = df.rename(columns={'due_date': 'ds', 'quantity': 'y'})
    df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
    df = df.groupby(pd.Grouper(key='ds', freq='W')).sum().reset_index()
    return df


def _forecast_prophet(df, periods_weeks):
    try:
        from prophet import Prophet
    except ImportError:
        return None

    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
    )
    model.fit(df)

    future = model.make_future_dataframe(periods=periods_weeks, freq='W')
    forecast = model.predict(future)
    future_only = forecast[forecast['ds'] > df['ds'].max()]

    return [
        {
            'date': row['ds'].strftime('%Y-%m-%d'),
            'predicted_demand': max(0, round(row['yhat'])),
            'lower_bound': max(0, round(row['yhat_lower'])),
            'upper_bound': max(0, round(row['yhat_upper'])),
        }
        for _, row in future_only.iterrows()
    ]


def _forecast_simple(df, periods_weeks, method):
    fn = SIMPLE_FORECASTERS[method]
    y_values = [int(v) for v in df['y'].tolist()]
    predicted = fn(y_values, periods_weeks)

    last_date = df['ds'].max()
    result = []
    for k, qty in enumerate(predicted, start=1):
        forecast_date = last_date + timedelta(weeks=k)
        result.append({
            'date': forecast_date.strftime('%Y-%m-%d'),
            'predicted_demand': qty,
            'lower_bound': qty,
            'upper_bound': qty,
        })
    return result


def forecast_demand(tenant_id: str, product_id: str, periods_weeks: int = 8, method: str = 'prophet'):
    if method == 'gradient_boosting':
        return gbr_forecast(tenant_id, product_id, periods_weeks)

    df = get_historical_demand(tenant_id, product_id)

    if df.empty or len(df) < 3:
        return {
            'status': 'insufficient_data',
            'message': 'Not enough historical sales data to generate a forecast (minimum 3 data points required).',
            'forecast': [],
        }

    used_method = method

    if method == 'prophet':
        forecast = _forecast_prophet(df, periods_weeks)
        if forecast is None:
            used_method = 'moving_average'
            forecast = _forecast_simple(df, periods_weeks, 'moving_average')
    else:
        forecast = _forecast_simple(df, periods_weeks, method)

    return {
        'status': 'ok',
        'product_id': product_id,
        'method': used_method,
        'forecast': forecast,
    }