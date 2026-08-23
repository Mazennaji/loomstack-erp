import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', index: '01' },
  { to: '/products', label: 'Products', index: '02' },
  { to: '/mrp', label: 'MRP', index: '03' },
];

export function Layout() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-10">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-700 tracking-tight">
                LoomStack
              </span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
                ERP
              </span>
            </div>
            <nav className="flex gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      'group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
                      (active
                        ? 'bg-ink text-surface'
                        : 'text-muted hover:bg-line/50 hover:text-ink')
                    }
                  >
                    <span
                      className={
                        'font-mono text-[10px] ' +
                        (active ? 'text-surface/60' : 'text-muted/50')
                      }
                    >
                      {item.index}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            onClick={logout}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-ink"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}