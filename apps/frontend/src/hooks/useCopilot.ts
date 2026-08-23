import { useMutation } from "@tanstack/react-query";
import { askCopilot } from "../api/copilot";

export function useCopilot() {
  return useMutation({ mutationFn: askCopilot });
}