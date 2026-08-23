import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWarehouses, createWarehouse } from "../api/warehouses";

export function useWarehouses() {
  return useQuery({ queryKey: ["warehouses"], queryFn: getWarehouses });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}