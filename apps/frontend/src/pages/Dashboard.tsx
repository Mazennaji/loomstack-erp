export function Dashboard() {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-signal">01</span>
        <h1 className="font-display text-2xl font-600 tracking-tight">Dashboard</h1>
      </div>
      <p className="mt-1 pl-8 text-sm text-muted">
        Stock levels, open orders, and recent planning runs.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Products', hint: 'in catalog' },
          { label: 'Open orders', hint: 'awaiting execution' },
          { label: 'MRP runs', hint: 'this week' },
        ].map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-lg border border-line bg-surface p-5"
          >
            <div className="absolute left-0 top-0 h-full w-0.5 bg-signal" />
            <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              {card.label}
            </div>
            <div className="mt-2 font-mono text-3xl font-500 text-ink">—</div>
            <div className="mt-1 text-xs text-muted">{card.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-line bg-surface/50 p-10 text-center">
        <p className="text-sm text-muted">
          Live data lands here once the dashboard queries are wired up.
        </p>
      </div>
    </div>
  );
}