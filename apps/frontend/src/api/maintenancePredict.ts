import axios from 'axios';

const FORECAST_BASE =
  (import.meta as ImportMeta & { env?: { VITE_FORECAST_BASE?: string } }).env?.VITE_FORECAST_BASE ??
  'http://localhost:8000';

export interface MaintenancePrediction {
  machine_id: string;
  code: string;
  name: string;
  model_used: string;
  total_hours: number;
  hours_since_service: number;
  predicted_interval_hours: number;
  hours_remaining: number;
  daily_usage_rate: number;
  days_remaining: number | null;
  projected_service_date: string | null;
  pct_consumed: number;
  risk: 'overdue' | 'due_soon' | 'monitor' | 'healthy';
}

export async function getMaintenancePredictions(tenantId: string): Promise<{
  machine_count: number;
  machines: MaintenancePrediction[];
}> {
  const res = await axios.post(`${FORECAST_BASE}/api/maintenance/`, { tenant_id: tenantId });
  return res.data;
}