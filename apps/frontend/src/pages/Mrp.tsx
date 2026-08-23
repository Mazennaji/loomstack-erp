export function Mrp() {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-muted">03</span>
        <h1 className="font-display text-2xl font-600 tracking-tight">
          Material planning
        </h1>
      </div>
      <p className="mt-1 pl-8 text-sm text-muted">
        Run demand against your BOMs and stock to get purchase and production suggestions.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-line bg-surface/50 p-10 text-center">
        <p className="text-sm text-muted">
          Run planning and review suggestions here, coming in the next step.
        </p>
      </div>
    </div>
  );
}