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
  token: sessionStorage.getItem("token"),
  user: JSON.parse(sessionStorage.getItem("user") || "null"),
  setAuth: (token, user) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));