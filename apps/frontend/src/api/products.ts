import { apiClient } from "./client";

export interface Product {
  id: string;
  sku: string;
  name: string;
  createdAt: string;
}

export async function getProducts(): Promise<Product[]> {
  const res = await apiClient.get("/products");
  return res.data;
}

export async function createProduct(data: { sku: string; name: string }) {
  const res = await apiClient.post("/products", data);
  return res.data;
}