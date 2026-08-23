import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Those credentials did not match. Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 opacity-[0.15]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-surface) 1px, transparent 1px), linear-gradient(90deg, var(--color-surface) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-baseline gap-2">
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
                <div className="text-surface">BOM</div>
                <div>multi-level costing</div>
              </div>
              <div>
                <div className="text-surface">MRP</div>
                <div>demand explosion</div>
              </div>
              <div>
                <div className="text-surface">WIP</div>
                <div>order execution</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
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
              className="w-full rounded-md bg-signal py-2.5 text-sm font-medium text-surface transition-colors hover:bg-signal/90 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}