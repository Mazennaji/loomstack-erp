import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useWarehouses } from '../hooks/useWarehouses';
import { useStockLevels } from '../hooks/useStock';
import { useMrpRuns } from '../hooks/useMrp';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function Dashboard() {
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const { data: stockLevels } = useStockLevels();
  const { data: runs } = useMrpRuns();

  const lowStock =
    stockLevels
      ?.map((s) => ({ ...s, available: s.quantity - s.reserved }))
      .filter((s) => s.available <= 10)
      .sort((a, b) => a.available - b.available)
      .slice(0, 5) ?? [];

  const metrics = [
    {
      label: 'Products',
      value: products?.length,
      hint: 'in catalog',
      to: '/app/products',
    },
    {
      label: 'Warehouses',
      value: warehouses?.length,
      hint: 'locations',
      to: '/app/warehouses',
    },
    {
      label: 'Stock records',
      value: stockLevels?.length,
      hint: 'across all sites',
      to: '/app/inventory',
    },
    {
      label: 'MRP runs',
      value: runs?.length,
      hint: 'total',
      to: '/app/mrp',
    },
  ];

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-signal">01</span>
        <h1 className="font-display text-2xl font-600 tracking-tight">Dashboard</h1>
      </div>
      <p className="mt-1 pl-8 text-sm text-muted">
        A live view of your catalog, stock, and planning activity.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            to={m.to}
            className="group relative overflow-hidden rounded-lg border border-line bg-surface p-5 transition-colors hover:border-signal/40"
          >
            <span className="absolute left-0 top-0 h-full w-0.5 bg-signal" />
            <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              {m.label}
            </div>
            <div className="mt-2 font-mono text-3xl font-500 text-ink">
              {m.value ?? '—'}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted">{m.hint}</span>
              <span className="font-mono text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
                view →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Low stock
              </h2>
            </div>
            <Link
              to="/app/inventory"
              className="font-mono text-[11px] text-muted transition-colors hover:text-navy"
            >
              all →
            </Link>
          </div>
          {lowStock.length > 0 ? (
            <ul className="divide-y divide-line">
              {lowStock.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium">{s.product.name}</div>
                    <div className="font-mono text-[11px] text-muted">
                      {s.product.sku} · {s.warehouse.name}
                    </div>
                  </div>
                  <span
                    className={
                      'font-mono text-sm font-600 ' +
                      (s.available <= 0 ? 'text-draft' : 'text-done')
                    }
                  >
                    {s.available}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">
              Nothing running low. Everything's above threshold.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-navy" />
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Recent MRP runs
              </h2>
            </div>
            <Link
              to="/app/mrp"
              className="font-mono text-[11px] text-muted transition-colors hover:text-navy"
            >
              all →
            </Link>
          </div>
          {runs && runs.length > 0 ? (
            <ul className="divide-y divide-line">
              {runs.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-3">
                  <span className="font-mono text-[13px] text-ink">{formatDate(r.runAt)}</span>
                  <span className="font-mono text-[11px] text-muted">{formatTime(r.runAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted">No runs yet.</p>
              <Link
                to="/app/mrp"
                className="mt-3 inline-block rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
              >
                Run material planning
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}