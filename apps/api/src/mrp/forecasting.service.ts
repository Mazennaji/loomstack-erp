import { Injectable, HttpException } from '@nestjs/common';

@Injectable()
export class ForecastingClientService {
  private baseUrl = process.env.FORECASTING_SERVICE_URL || 'http://forecasting:8000';

  async getForecast(tenantId: string, productId: string, periodsWeeks = 8) {
    const res = await fetch(`${this.baseUrl}/api/forecast/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: tenantId,
        product_id: productId,
        periods_weeks: periodsWeeks,
      }),
    });

    if (!res.ok) {
      throw new HttpException('Forecasting service error', res.status);
    }

    return res.json();
  }
}