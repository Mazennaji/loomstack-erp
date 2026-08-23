export function Products() {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-muted">02</span>
        <h1 className="font-display text-2xl font-600 tracking-tight">Products</h1>
      </div>
      <p className="mt-1 pl-8 text-sm text-muted">
        Your catalog of finished goods, assemblies, and raw materials.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-line bg-surface/50 p-10 text-center">
        <p className="text-sm text-muted">No products yet. The catalog table arrives next.</p>
      </div>
    </div>
  );
}