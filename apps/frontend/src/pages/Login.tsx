import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import logo from '@/assets/logo.png';

function decodeToken(token: string) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    sub: payload.sub,
    email: payload.email,
    tenantId: payload.tenantId,
    role: payload.role,
  };
}

export function Login() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/app" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const newToken =
        res.data.access_token ?? res.data.accessToken ?? res.data.token;
      if (!newToken) throw new Error('No token returned');
      setAuth(newToken, decodeToken(newToken));
      navigate('/app');
    } catch {
      setError('Those credentials did not match. Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div className="absolute inset-0 opacity-[0.08]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-signal) 1px, transparent 1px), linear-gradient(90deg, var(--color-signal) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="LoomStack" className="h-8 w-8 rounded bg-surface p-0.5" />
            <span className="font-display text-xl font-700 tracking-tight text-surface">
              LoomStack
            </span>
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-surface/50">
              ERP
            </span>
          </div>
          <div>
            <p className="max-w-md font-display text-3xl font-500 leading-tight text-surface">
              Plan materials, run the floor, and see every unit move.
            </p>
            <div className="mt-8 flex gap-8 font-mono text-xs text-surface/50">
              <div>
                <div className="text-signal">BOM</div>
                <div>multi-level costing</div>
              </div>
              <div>
                <div className="text-signal">MRP</div>
                <div>demand explosion</div>
              </div>
              <div>
                <div className="text-signal">WIP</div>
                <div>order execution</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src={logo} alt="LoomStack" className="h-7 w-7" />
            <span className="font-display text-xl font-700 tracking-tight">LoomStack</span>
          </div>
          <h1 className="font-display text-2xl font-600 tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Access your workspace</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft"
              />
            </div>
            {error && (
              <p className="rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            No account yet?{' '}
            <Link to="/register" className="font-medium text-navy hover:text-signal">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}