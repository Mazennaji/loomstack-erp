import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import logo from '../assets/logo.png';

export function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/app" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ companyName, email, password });
      navigate('/app');
    } catch {
      setError('Could not create your workspace. That email may already be in use.');
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
              Set up your workspace and start planning in minutes.
            </p>
            <ul className="mt-8 space-y-3 font-mono text-xs text-surface/60">
              <li className="flex items-center gap-3">
                <span className="text-signal">→</span> Multi-level BOM with live cost rollup
              </li>
              <li className="flex items-center gap-3">
                <span className="text-signal">→</span> Demand-driven material planning
              </li>
              <li className="flex items-center gap-3">
                <span className="text-signal">→</span> Purchase &amp; production order execution
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src={logo} alt="LoomStack" className="h-7 w-7" />
            <span className="font-display text-xl font-700 tracking-tight">LoomStack</span>
          </div>
          <h1 className="font-display text-2xl font-600 tracking-tight">Create your workspace</h1>
          <p className="mt-1 text-sm text-muted">Start your 14-day trial. No card required.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Company name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Work email
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
                minLength={8}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft"
              />
              <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>
            </div>
            {error && (
              <p className="rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
            >
              {loading ? 'Creating workspace…' : 'Create workspace'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-navy hover:text-signal">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}