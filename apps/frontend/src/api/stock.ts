import { apiClient } from "./client";

export interface StockLevel {
  id: string;
  quantity: number;
  reserved: number;
  product: { id: string; sku: string; name: string };
  warehouse: { id: string; name: string };
}

export async function getStockLevels(): Promise<StockLevel[]> {
  const res = await apiClient.get("/stock");
  return res.data;
}

export async function adjustStock(data: {
  productId: string;
  warehouseId: string;
  quantityChange: number;
}) {
  const res = await apiClient.post("/stock/adjust", data);
  return res.data;
}