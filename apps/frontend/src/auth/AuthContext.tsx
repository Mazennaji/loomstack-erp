import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';

interface AuthState {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterInput {
  companyName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function extractToken(data: Record<string, unknown>): string | null {
  return (
    (data.access_token as string) ??
    (data.accessToken as string) ??
    (data.token as string) ??
    null
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const newToken = extractToken(res.data);
    if (!newToken) throw new Error('No token returned from login');
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  async function register(input: RegisterInput) {
    const res = await api.post('/auth/register', {
      companyName: input.companyName,
      email: input.email,
      password: input.password,
    });
    const newToken = extractToken(res.data);
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      await login(input.email, input.password);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, login, register, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}