import axios from 'axios';

const FORECAST_BASE = import.meta.env.VITE_FORECAST_BASE ?? 'http://localhost:8000';

export interface Anomaly {
  date: string;
  actual: number;
  expected: number;
  deviation_pct: number | null;
  direction: 'spike' | 'drop';
  score: number;
}

export interface ProductAnomalies {
  product_id: string;
  sku: string;
  name: string;
  anomaly_count: number;
  anomalies: Anomaly[];
}

export async function getAllAnomalies(tenantId: string): Promise<{
  products_with_anomalies: number;
  results: ProductAnomalies[];
}> {
  const res = await axios.post(`${FORECAST_BASE}/api/anomalies/`, { tenant_id: tenantId });
  return res.data;
}