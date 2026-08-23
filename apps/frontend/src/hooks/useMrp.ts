import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSalesOrder, runMrp, listMrpRuns, getMrpRun } from "../api/mrp";

export function useCreateSalesOrder() {
  return useMutation({ mutationFn: createSalesOrder });
}

export function useRunMrp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runMrp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mrp-runs"] });
    },
  });
}

export function useMrpRuns() {
  return useQuery({ queryKey: ["mrp-runs"], queryFn: listMrpRuns });
}

export function useMrpRun(id: string | null) {
  return useQuery({
    queryKey: ["mrp-run", id],
    queryFn: () => getMrpRun(id as string),
    enabled: !!id,
  });
}