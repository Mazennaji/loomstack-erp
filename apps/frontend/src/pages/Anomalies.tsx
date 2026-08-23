import { useAnomalies } from '../hooks/useAnomalies';

export default function Anomalies() {
  const { data, isLoading, error } = useAnomalies();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-signal">07</span>
          <h1 className="font-display text-2xl font-600 tracking-tight">Anomalies</h1>
        </div>
        <p className="mt-1 pl-8 text-sm text-muted">
          Unusual demand patterns flagged by the detection model.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-line bg-surface px-5 py-12 text-center">
          <p className="text-sm text-muted">Analyzing demand patterns…</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-line bg-surface px-5 py-10 text-center">
          <p className="text-sm text-draft">
            Couldn't reach the detection service. Is the forecasting service running?
          </p>
        </div>
      ) : data && data.results.length > 0 ? (
        <div className="space-y-4">
          <p className="font-mono text-[11px] text-muted">
            {data.products_with_anomalies} product{data.products_with_anomalies === 1 ? '' : 's'} with anomalies
          </p>
          {data.results.map((product) => (
            <section
              key={product.product_id}
              className="overflow-hidden rounded-lg border border-line bg-surface"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-sm font-600">{product.name}</span>
                  <span className="font-mono text-[12px] text-navy">{product.sku}</span>
                </div>
                <span className="rounded bg-signal-soft px-2 py-0.5 font-mono text-[11px] font-medium text-signal">
                  {product.anomaly_count} flagged
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="px-5 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">Week</th>
                    <th className="py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">Type</th>
                    <th className="py-2 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted">Actual</th>
                    <th className="py-2 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted">Expected</th>
                    <th className="px-5 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted">Deviation</th>
                  </tr>
                </thead>
                <tbody>
                  {product.anomalies.map((a, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="px-5 py-2.5 font-mono text-[13px]">{a.date}</td>
                      <td className="py-2.5">
                        <span
                          className={
                            'rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase ' +
                            (a.direction === 'spike'
                              ? 'bg-done-soft text-done'
                              : 'bg-draft-soft text-draft')
                          }
                        >
                          {a.direction}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono">{a.actual}</td>
                      <td className="py-2.5 text-right font-mono text-muted">{a.expected}</td>
                      <td
                        className={
                          'px-5 py-2.5 text-right font-mono font-600 ' +
                          (a.direction === 'spike' ? 'text-done' : 'text-draft')
                        }
                      >
                        {a.deviation_pct !== null ? `${a.deviation_pct > 0 ? '+' : ''}${a.deviation_pct}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-surface/50 p-10 text-center">
          <p className="text-sm text-muted">
            No anomalies detected. Demand is following expected patterns.
          </p>
        </div>
      )}
    </div>
  );
}