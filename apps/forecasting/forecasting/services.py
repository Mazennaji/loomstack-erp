import pandas as pd
from prophet import Prophet
from .models import SalesOrderLine


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


def forecast_demand(tenant_id: str, product_id: str, periods_weeks: int = 8):
    df = get_historical_demand(tenant_id, product_id)

    if df.empty or len(df) < 3:
        return {
            'status': 'insufficient_data',
            'message': 'Not enough historical sales data to generate a forecast (minimum 3 data points required).',
            'forecast': [],
        }

    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
    )
    model.fit(df)

    future = model.make_future_dataframe(periods=periods_weeks, freq='W')
    forecast = model.predict(future)

    future_only = forecast[forecast['ds'] > df['ds'].max()]

    result = [
        {
            'date': row['ds'].strftime('%Y-%m-%d'),
            'predicted_demand': max(0, round(row['yhat'])),
            'lower_bound': max(0, round(row['yhat_lower'])),
            'upper_bound': max(0, round(row['yhat_upper'])),
        }
        for _, row in future_only.iterrows()
    ]

    return {
        'status': 'ok',
        'product_id': product_id,
        'forecast': result,
    }