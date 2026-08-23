import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBomVersion, getBomVersions, getCostRollup } from "../api/bom";

export function useBomVersions(productId: string | null) {
  return useQuery({
    queryKey: ["bom-versions", productId],
    queryFn: () => getBomVersions(productId as string),
    enabled: !!productId,
  });
}

export function useCostRollup(productId: string | null) {
  return useQuery({
    queryKey: ["bom-cost-rollup", productId],
    queryFn: () => getCostRollup(productId as string),
    enabled: !!productId,
  });
}

export function useCreateBomVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBomVersion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bom-versions", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["bom-cost-rollup", variables.productId] });
    },
  });
}