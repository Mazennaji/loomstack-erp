import { apiClient } from "./client";

export async function askCopilot(message: string): Promise<{ reply: string }> {
  const res = await apiClient.post("/copilot/ask", { message });
  return res.data;
}