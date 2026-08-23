import { apiClient } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  tenantId: string;
}

export async function login(payload: LoginPayload) {
  const res = await apiClient.post("/auth/login", payload);
  return res.data;
}

export async function register(payload: RegisterPayload) {
  const res = await apiClient.post("/auth/register", payload);
  return res.data;
}

export async function getProfile() {
  const res = await apiClient.get("/auth/me");
  return res.data;
}