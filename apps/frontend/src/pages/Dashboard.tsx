import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useProducts } from '../hooks/useProducts';
import { useWarehouses } from '../hooks/useWarehouses';
import { useStockLevels } from '../hooks/useStock';
import { useMrpRuns } from '../hooks/useMrp';

const NAVY = '#152c5b';
const SIGNAL = '#f5a623';
const DONE = '#157347';
const DRAFT = '#b45309';

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

  const withAvailable =
    stockLevels?.map((s) => ({ ...s, available: s.quantity - s.reserved })) ?? [];

  const lowStock = withAvailable
    .filter((s) => s.available <= 10)
    .sort((a, b) => a.available - b.available)
    .slice(0, 5);

  // Stock by warehouse (sum of available)
  const byWarehouse = (() => {
    const map = new Map<string, number>();
    for (const s of withAvailable) {
      map.set(s.warehouse.name, (map.get(s.warehouse.name) ?? 0) + Math.max(0, s.available));
    }
    return Array.from(map.entries()).map(([name, total]) => ({ name, total }));
  })();

  // Available stock per product (top 6 by quantity)
  const byProduct = (() => {
    const map = new Map<string, number>();
    for (const s of withAvailable) {
      map.set(s.product.sku, (map.get(s.product.sku) ?? 0) + Math.max(0, s.available));
    }
    return Array.from(map.entries())
      .map(([sku, total]) => ({ sku, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  })();

  // Stock health split for donut
  const healthy = withAvailable.filter((s) => s.available > 10).length;
  const low = withAvailable.filter((s) => s.available > 0 && s.available <= 10).length;
  const out = withAvailable.filter((s) => s.available <= 0).length;
  const health = [
    { name: 'Healthy', value: healthy, color: DONE },
    { name: 'Low', value: low, color: SIGNAL },
    { name: 'Out', value: out, color: DRAFT },
  ].filter((d) => d.value > 0);

  const metrics = [
    { label: 'Products', value: products?.length, hint: 'in catalog', to: '/app/products' },
    { label: 'Warehouses', value: warehouses?.length, hint: 'locations', to: '/app/warehouses' },
    { label: 'Stock records', value: stockLevels?.length, hint: 'across all sites', to: '/app/inventory' },
    { label: 'MRP runs', value: runs?.length, hint: 'total', to: '/app/mrp' },
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
            <div className="mt-2 font-mono text-3xl font-500 text-ink">{m.value ?? '—'}</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted">{m.hint}</span>
              <span className="font-mono text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
                view →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-lg border border-line bg-surface lg:col-span-2">
          <div className="border-b border-line px-5 py-3">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Available stock by product
            </h2>
          </div>
          <div className="p-5">
            {byProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byProduct} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e6ee" vertical={false} />
                  <XAxis
                    dataKey="sku"
                    tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#6b7280' }}
                    axisLine={{ stroke: '#e3e6ee' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #e3e6ee',
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Bar dataKey="total" fill={NAVY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-16 text-center text-sm text-muted">No stock to chart yet.</p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-5 py-3">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Stock health
            </h2>
          </div>
          <div className="p-5">
            {health.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={health}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {health.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        border: '1px solid #e3e6ee',
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1.5">
                  {health.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-mono text-muted">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-16 text-center text-sm text-muted">No stock records.</p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-5 py-3">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Stock by warehouse
            </h2>
          </div>
          <div className="p-5">
            {byWarehouse.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={byWarehouse} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="whFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SIGNAL} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={SIGNAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e6ee" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#6b7280' }}
                    axisLine={{ stroke: '#e3e6ee' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #e3e6ee',
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke={SIGNAL} strokeWidth={2} fill="url(#whFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted">No warehouse stock yet.</p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Low stock
              </h2>
            </div>
            <Link to="/app/inventory" className="font-mono text-[11px] text-muted transition-colors hover:text-navy">
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
              Nothing running low.
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
            <Link to="/app/mrp" className="font-mono text-[11px] text-muted transition-colors hover:text-navy">
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