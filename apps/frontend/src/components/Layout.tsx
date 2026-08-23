import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/hooks/useProfile';
import logo from '../assets/logo.png';
import CopilotPanel from './CopilotPanel';

const API_BASE = import.meta.env.VITE_API_BASE;

const navItems = [
  { to: '/app', label: 'Dashboard', index: '01' },
  { to: '/app/products', label: 'Products', index: '02' },
  { to: '/app/warehouses', label: 'Warehouses', index: '03' },
  { to: '/app/inventory', label: 'Inventory', index: '04' },
  { to: '/app/bom', label: 'BOM', index: '05' },
  { to: '/app/mrp', label: 'MRP', index: '06' },
  { to: '/app/anomalies', label: 'Anomalies', index: '07' },
];

function resolveAvatar(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export function Layout() {
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const avatar = resolveAvatar(profile?.avatarUrl);
  const initials = (profile?.name || profile?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="LoomStack" className="h-7 w-7" />
              <span className="font-display text-lg font-700 tracking-tight">LoomStack</span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
                ERP
              </span>
            </div>
            <nav className="flex gap-0.5">
              {navItems.map((item) => {
                const active =
                  item.to === '/app'
                    ? location.pathname === '/app'
                    : location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      'group relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ' +
                      (active ? 'text-ink' : 'text-muted hover:bg-line/50 hover:text-ink')
                    }
                  >
                    <span
                      className={
                        'font-mono text-[10px] ' + (active ? 'text-signal' : 'text-muted/50')
                      }
                    >
                      {item.index}
                    </span>
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-2 -bottom-[13px] h-0.5 bg-signal" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app/profile"
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-ink"
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-line bg-navy-soft">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-mono text-[10px] font-600 text-navy">{initials}</span>
                )}
              </span>
              <span className="hidden lg:inline">{profile?.name || 'Profile'}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-ink"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
      <CopilotPanel />
    </div>
  );
}