import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/hooks/useProfile';
import logo from '../assets/logo.png';
import CopilotPanel from './CopilotPanel';

const API_BASE = import.meta.env.VITE_API_BASE;

const navSections = [
  {
    heading: 'Overview',
    items: [{ to: '/app', label: 'Dashboard', index: '01' }],
  },
  {
    heading: 'Catalog',
    items: [
      { to: '/app/products', label: 'Products', index: '02' },
      { to: '/app/warehouses', label: 'Warehouses', index: '03' },
      { to: '/app/inventory', label: 'Inventory', index: '04' },
      { to: '/app/bom', label: 'BOM', index: '05' },
    ],
  },
  {
    heading: 'Planning',
    items: [
      { to: '/app/mrp', label: 'MRP', index: '06' },
      { to: '/app/anomalies', label: 'Anomalies', index: '07' },
      { to: '/app/machines', label: 'Machines', index: '08' },
    ],
  },
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

  function isActive(to: string) {
    return to === '/app' ? location.pathname === '/app' : location.pathname === to;
  }

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-line bg-surface">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <img src={logo} alt="LoomStack" className="h-7 w-7" />
          <span className="font-display text-lg font-700 tracking-tight">LoomStack</span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
            ERP
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navSections.map((section) => (
            <div key={section.heading} className="mb-4">
              <div className="px-2 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted/60">
                {section.heading}
              </div>
              {section.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
                      (active
                        ? 'bg-navy-soft text-navy'
                        : 'text-muted hover:bg-line/50 hover:text-ink')
                    }
                  >
                    {active && (
                      <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-signal" />
                    )}
                    <span
                      className={
                        'font-mono text-[10px] ' + (active ? 'text-signal' : 'text-muted/50')
                      }
                    >
                      {item.index}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <Link
            to="/app/profile"
            className="mb-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-ink"
          >
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-line bg-navy-soft">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-mono text-[10px] font-600 text-navy">{initials}</span>
              )}
            </span>
            <span className="truncate">{profile?.name || 'Profile'}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-ink"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <main className="mx-auto max-w-6xl px-8 py-10">
          <Outlet />
        </main>
      </div>
      <CopilotPanel />
    </div>
  );
}