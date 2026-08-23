import { apiClient } from "./client";

export interface BomLineInput {
  componentProductId: string;
  quantity: number;
}

export interface CostNode {
  productId: string;
  sku: string;
  name: string;
  unitCost: number;
  totalCost: number;
  quantity: number;
  components: CostNode[];
}

export interface BomVersion {
  id: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  lines: { id: string; componentProductId: string; quantity: string }[];
}

export async function createBomVersion(data: {
  productId: string;
  lines: BomLineInput[];
}) {
  const res = await apiClient.post("/bom/versions", data);
  return res.data;
}

export async function getBomVersions(productId: string): Promise<BomVersion[]> {
  const res = await apiClient.get(`/bom/${productId}/versions`);
  return res.data;
}

export async function getCostRollup(productId: string): Promise<CostNode> {
  const res = await apiClient.get(`/bom/${productId}/cost-rollup`);
  return res.data;
}