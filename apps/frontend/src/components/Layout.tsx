import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import logo from '../assets/logo.png';

const navItems = [
  { to: '/app', label: 'Dashboard', index: '01' },
  { to: '/app/products', label: 'Products', index: '02' },
  { to: '/app/warehouses', label: 'Warehouses', index: '03' },
  { to: '/app/inventory', label: 'Inventory', index: '04' },
  { to: '/app/bom', label: 'BOM', index: '05' },
  { to: '/app/mrp', label: 'MRP', index: '06' },
];

export function Layout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="LoomStack" className="h-7 w-7" />
              <span className="font-display text-lg font-700 tracking-tight">LoomStack</span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
                ERP
              </span>
            </div>
            <nav className="flex gap-1">
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
                      'group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
                      (active ? 'text-ink' : 'text-muted hover:bg-line/50 hover:text-ink')
                    }
                  >
                    <span
                      className={
                        'font-mono text-[10px] ' +
                        (active ? 'text-signal' : 'text-muted/50')
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
          <button
            onClick={handleLogout}
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