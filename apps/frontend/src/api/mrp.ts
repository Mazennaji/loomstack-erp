import { apiClient } from "./client";

export interface SalesOrderLineInput {
  productId: string;
  quantity: number;
  dueDate: string;
}

export interface SalesOrder {
  id: string;
  customerName: string;
  status: string;
  createdAt: string;
  lines: {
    id: string;
    quantity: number;
    dueDate: string;
    productId: string;
  }[];
}

export interface MrpSuggestion {
  id: string;
  type: "PURCHASE" | "PRODUCTION";
  quantity: number;
  dueDate: string;
  product: { id: string; sku: string; name: string };
}

export interface MrpRun {
  id: string;
  runAt: string;
  suggestions: MrpSuggestion[];
}

export interface MrpRunSummary {
  id: string;
  runAt: string;
}

export async function createSalesOrder(data: {
  customerName: string;
  lines: SalesOrderLineInput[];
}) {
  const res = await apiClient.post("/mrp/sales-orders", data);
  return res.data;
}

export async function runMrp(): Promise<MrpRun> {
  const res = await apiClient.post("/mrp/run");
  return res.data;
}

export async function listMrpRuns(): Promise<MrpRunSummary[]> {
  const res = await apiClient.get("/mrp/runs");
  return res.data;
}

export async function getMrpRun(id: string): Promise<MrpRun> {
  const res = await apiClient.get(`/mrp/runs/${id}`);
  return res.data;
}