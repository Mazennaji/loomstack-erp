import { apiClient } from "./client";

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const res = await apiClient.get("/warehouses");
  return res.data;
}

export async function createWarehouse(data: { name: string; location?: string }) {
  const res = await apiClient.post("/warehouses", data);
  return res.data;
}