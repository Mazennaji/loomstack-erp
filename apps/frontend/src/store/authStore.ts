import { create } from "zustand";

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: JwtPayload | null;
  setAuth: (token: string, user: JwtPayload) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));