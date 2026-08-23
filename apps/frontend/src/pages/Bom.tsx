import { useState, type FormEvent } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useBomVersions, useCostRollup, useCreateBomVersion } from '../hooks/useBom';
import CostTree from '../components/CostTree';
import Modal from '../components/Modal';

interface LineDraft {
  componentProductId: string;
  quantity: number;
}

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft';
const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted';

export default function Bom() {
  const { data: products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [lines, setLines] = useState<LineDraft[]>([{ componentProductId: '', quantity: 1 }]);

  const { data: versions } = useBomVersions(selectedProductId);
  const { data: rollup, isLoading: rollupLoading, error: rollupError } =
    useCostRollup(selectedProductId);
  const createVersion = useCreateBomVersion();

  function addLine() {
    setLines([...lines, { componentProductId: '', quantity: 1 }]);
  }

  function updateLine(index: number, field: keyof LineDraft, value: string | number) {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  }

  function removeLine(index: number) {
    setLines(lines.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedProductId) return;
    createVersion.mutate(
      {
        productId: selectedProductId,
        lines: lines
          .filter((l) => l.componentProductId)
          .map((l) => ({ componentProductId: l.componentProductId, quantity: l.quantity })),
      },
      {
        onSuccess: () => {
          setLines([{ componentProductId: '', quantity: 1 }]);
          setEditorOpen(false);
        },
      },
    );
  }

  const availableComponents = products?.filter((p) => p.id !== selectedProductId);
  const selectedProduct = products?.find((p) => p.id === selectedProductId);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-signal">05</span>
          <h1 className="font-display text-2xl font-600 tracking-tight">Bill of materials</h1>
        </div>
        <p className="mt-1 pl-8 text-sm text-muted">
          Define what each product is made of. Costs roll up through every level.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="h-fit overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Products
            </h2>
            {products && (
              <span className="font-mono text-[11px] text-muted">{products.length}</span>
            )}
          </div>
          {products && products.length > 0 ? (
            <ul className="divide-y divide-line">
              {products.map((p) => {
                const active = selectedProductId === p.id;
                return (
                  <li key={p.id} className="relative">
                    <button
                      onClick={() => setSelectedProductId(p.id)}
                      className={
                        'flex w-full items-center justify-between px-5 py-3 text-left transition-colors ' +
                        (active ? 'bg-navy-soft' : 'hover:bg-paper')
                      }
                    >
                      <span className={'text-sm ' + (active ? 'font-600' : 'font-medium')}>
                        {p.name}
                      </span>
                      <span className="font-mono text-[13px] text-navy">{p.sku}</span>
                      {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-signal" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">No products yet.</p>
          )}
        </section>

        <section className="space-y-6 lg:col-span-2">
          {!selectedProductId ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface/50 p-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy-soft">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z M12 3v18 M4 7.5l8 4.5 8-4.5"
                    stroke="var(--color-navy)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-ink">Select a product</p>
              <p className="mt-1 max-w-xs text-sm text-muted">
                Pick a product to view its multi-level cost rollup or define a new BOM version.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2.5">
                  <h2 className="font-display text-lg font-600 tracking-tight">
                    {selectedProduct?.name}
                  </h2>
                  <span className="font-mono text-[13px] text-navy">{selectedProduct?.sku}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-muted">
                    {versions && versions.length > 0
                      ? `${versions.length} version${versions.length === 1 ? '' : 's'}`
                      : 'no BOM yet'}
                  </span>
                  <button
                    onClick={() => setEditorOpen(true)}
                    className="rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
                  >
                    New version
                  </button>
                </div>
              </div>

              {rollupLoading ? (
                <div className="rounded-lg border border-line bg-surface px-5 py-12 text-center">
                  <p className="text-sm text-muted">Calculating rollup…</p>
                </div>
              ) : rollupError ? (
                <div className="rounded-lg border border-line bg-surface px-5 py-10 text-center">
                  <p className="text-sm text-draft">
                    No cost rollup yet. Define a BOM version to see costs.
                  </p>
                </div>
              ) : rollup ? (
                <CostTree root={rollup} />
              ) : null}
            </>
          )}
        </section>
      </div>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title="New BOM version"
        description="List the components and quantities to build one unit. Saving deactivates the previous version."
      >
        <form onSubmit={handleSubmit}>
          <label className={labelClass}>Components</label>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="rounded-lg border border-line bg-paper/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                    Component {i + 1}
                  </span>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      aria-label="Remove component"
                      className="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:bg-draft-soft hover:text-draft"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
                <select
                  value={line.componentProductId}
                  onChange={(e) => updateLine(i, 'componentProductId', e.target.value)}
                  required
                  className={`mb-2 ${fieldClass}`}
                >
                  <option value="">Select component</option>
                  {availableComponents?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    Qty / unit
                  </span>
                  <input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))}
                    required
                    className={`w-28 font-mono ${fieldClass}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLine}
            className="mt-3 font-mono text-[12px] font-medium text-navy transition-colors hover:text-signal"
          >
            + Add component
          </button>

          {createVersion.isError && (
            <div className="mt-4 rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
              {(createVersion.error as any)?.response?.data?.message ||
                'Could not save the BOM version.'}
            </div>
          )}

          <button
            type="submit"
            disabled={createVersion.isPending}
            className="mt-5 w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            {createVersion.isPending ? 'Saving…' : 'Save BOM version'}
          </button>
        </form>
      </Modal>
    </div>
  );
}