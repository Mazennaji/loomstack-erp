import { useQuery } from '@tanstack/react-query';
import { getAllAnomalies } from '../api/anomalies';
import { useAuthStore } from '../store/authStore';

export function useAnomalies() {
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: ['anomalies', tenantId],
    queryFn: () => getAllAnomalies(tenantId!),
    enabled: !!tenantId,
  });
}