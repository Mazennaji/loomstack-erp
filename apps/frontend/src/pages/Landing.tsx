import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const flow = [
  { tier: 'Raw materials', items: ['Frame', 'Rim', 'Tire'], mono: 'RAW' },
  { tier: 'Sub-assemblies', items: ['Wheel'], mono: 'WIP' },
  { tier: 'Finished goods', items: ['Bicycle'], mono: 'FG' },
];

const features = [
  {
    index: '01',
    title: 'Multi-level BOM',
    body: 'Nest assemblies inside assemblies. Cost rolls up automatically from every raw material to the finished unit.',
  },
  {
    index: '02',
    title: 'Material planning',
    body: 'Explode demand through your BOMs, net against live stock, and get purchase and production suggestions in one run.',
  },
  {
    index: '03',
    title: 'Order execution',
    body: 'Release, receive, and complete orders. Stock moves the moment work is done, with component shortages caught before they bite.',
  },
  {
    index: '04',
    title: 'Demand forecasting',
    body: 'Turn sales history into forward demand with built-in models, then feed it straight into planning.',
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="LoomStack" className="h-7 w-7" />
            <span className="font-display text-lg font-700 tracking-tight">LoomStack</span>
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
              ERP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-line/50 hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-widest text-signal">
              Manufacturing resource planning
            </span>
            <h1 className="mt-4 font-display text-5xl font-700 leading-[1.05] tracking-tight">
              Every part accounted for.
              <span className="block text-muted">From raw stock to shipped unit.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              LoomStack plans your materials, runs your floor, and tracks every
              component as it moves through production, so nothing is over-ordered
              and nothing runs short.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/register"
                className="rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
              >
                Create your workspace
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/40"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative rounded-xl border border-line bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                Live cost rollup
              </span>
              <span className="font-mono text-[11px] text-signal">BIKE-01</span>
            </div>
            <div className="space-y-3">
              {flow.map((tier, ti) => (
                <div key={tier.tier}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-signal">
                      {tier.mono}
                    </span>
                    <span className="text-xs text-muted">{tier.tier}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tier.items.map((item, ii) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-1.5"
                        style={{
                          animation: `floatIn 0.5s ease-out ${(ti * 3 + ii) * 0.12}s both`,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  {ti < flow.length - 1 && (
                    <div className="my-2 ml-1 h-4 w-px bg-line" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm font-medium">Total unit cost</span>
              <span className="font-mono text-lg font-600 text-navy">$80.00</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-line md:grid-cols-4">
          {[
            { value: '∞', label: 'BOM depth' },
            { value: '1', label: 'run to plan' },
            { value: '100%', label: 'stock netted' },
            { value: '0', label: 'shortages missed' },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <div className="font-mono text-3xl font-600 text-navy">{stat.value}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-signal">
            What's inside
          </span>
          <h2 className="mt-3 font-display text-3xl font-700 tracking-tight">
            The full production loop, in one system.
          </h2>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.index} className="bg-surface p-8">
              <span className="font-mono text-xs font-medium text-signal">{f.index}</span>
              <h3 className="mt-3 font-display text-lg font-600 tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-navy px-8 py-14 text-center">
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
          <div className="relative">
            <h2 className="font-display text-3xl font-700 tracking-tight text-surface">
              Bring your floor into focus.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-surface/70">
              Set up your workspace and run your first material plan today.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-block rounded-md bg-signal px-6 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-signal/90"
            >
              Start free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="LoomStack" className="h-5 w-5" />
            <span className="font-mono text-xs text-muted">LoomStack ERP</span>
          </div>
          <span className="font-mono text-xs text-muted">© 2026</span>
        </div>
      </footer>
    </div>
  );
}