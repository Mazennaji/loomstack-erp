import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMachines,
  createMachine,
  logUsage,
  logMaintenance,
} from '../api/machines';
import { getMaintenancePredictions } from '../api/maintenancePredict';
import { useAuthStore } from '../store/authStore';

export function useMachines() {
  return useQuery({ queryKey: ['machines'], queryFn: getMachines });
}

export function useMaintenancePredictions() {
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: ['maintenance-predictions', tenantId],
    queryFn: () => getMaintenancePredictions(tenantId!),
    enabled: !!tenantId,
  });
}

export function useCreateMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMachine,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  });
}

export function useLogUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logUsage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['machines'] });
      qc.invalidateQueries({ queryKey: ['maintenance-predictions'] });
    },
  });
}

export function useLogMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logMaintenance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['machines'] });
      qc.invalidateQueries({ queryKey: ['maintenance-predictions'] });
    },
  });
}