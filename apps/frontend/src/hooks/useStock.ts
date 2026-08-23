import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockLevels, adjustStock } from "../api/stock";

export function useStockLevels() {
  return useQuery({ queryKey: ["stock"], queryFn: getStockLevels });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}