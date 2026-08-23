import { useState, type FormEvent } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCreateSalesOrder, useRunMrp, useMrpRuns, useMrpRun } from '../hooks/useMrp';
import MrpSuggestionsTable from '../components/MrpSuggestionsTable';
import Modal from '../components/Modal';

interface LineDraft {
  productId: string;
  quantity: number;
  dueDate: string;
}

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft';
const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted';

export default function Mrp() {
  const { data: products } = useProducts();
  const createSalesOrder = useCreateSalesOrder();
  const runMrp = useRunMrp();
  const { data: runs } = useMrpRuns();

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { data: selectedRun, isLoading: runLoading } = useMrpRun(selectedRunId);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([{ productId: '', quantity: 1, dueDate: '' }]);
  const [orderSuccess, setOrderSuccess] = useState(false);

  function addLine() {
    setLines([...lines, { productId: '', quantity: 1, dueDate: '' }]);
  }

  function updateLine(index: number, field: keyof LineDraft, value: string | number) {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  }

  function removeLine(index: number) {
    setLines(lines.filter((_, i) => i !== index));
  }

  function handleCreateOrder(e: FormEvent) {
    e.preventDefault();
    createSalesOrder.mutate(
      { customerName, lines },
      {
        onSuccess: () => {
          setCustomerName('');
          setLines([{ productId: '', quantity: 1, dueDate: '' }]);
          setOrderSuccess(true);
          setTimeout(() => setOrderSuccess(false), 3000);
          setOrderModalOpen(false);
        },
      },
    );
  }

  function handleRunMrp() {
    runMrp.mutate(undefined, {
      onSuccess: (data) => setSelectedRunId(data.id),
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-signal">06</span>
            <h1 className="font-display text-2xl font-600 tracking-tight">Material planning</h1>
          </div>
          <p className="mt-1 pl-8 text-sm text-muted">
            Run demand against your BOMs and stock to get purchase and production suggestions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOrderModalOpen(true)}
            className="rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-line/40"
          >
            New sales order
          </button>
          <button
            onClick={handleRunMrp}
            disabled={runMrp.isPending}
            className="rounded-md bg-signal px-3.5 py-2 text-sm font-medium text-navy transition-colors hover:bg-signal/90 disabled:opacity-50"
          >
            {runMrp.isPending ? 'Running…' : 'Run MRP'}
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="mb-4 rounded-md bg-done-soft px-3 py-2 text-sm text-done">
          Sales order created.
        </div>
      )}

      {runMrp.isError && (
        <div className="mb-4 rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
          {(runMrp.error as any)?.response?.data?.message || 'MRP run failed.'}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-5 py-3">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Runs
            </h2>
          </div>
          {runs && runs.length > 0 ? (
            <ul className="divide-y divide-line">
              {runs.map((r) => {
                const active = selectedRunId === r.id;
                return (
                  <li key={r.id} className="relative">
                    <button
                      onClick={() => setSelectedRunId(r.id)}
                      className={
                        'flex w-full flex-col items-start gap-0.5 px-5 py-3 text-left transition-colors ' +
                        (active ? 'bg-navy-soft' : 'hover:bg-paper')
                      }
                    >
                      <span className={'font-mono text-[12px] ' + (active ? 'text-navy' : 'text-ink')}>
                        {new Date(r.runAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-[11px] text-muted">
                        {new Date(r.runAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-signal" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">No runs yet.</p>
          )}
        </section>

        <section className="lg:col-span-3">
          {!selectedRunId ? (
            <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-line bg-surface/50 p-10 text-center">
              <p className="text-sm text-muted">
                Run MRP or pick a previous run to see its suggestions.
              </p>
            </div>
          ) : runLoading ? (
            <div className="rounded-lg border border-line bg-surface px-5 py-10 text-center">
              <p className="text-sm text-muted">Loading run…</p>
            </div>
          ) : selectedRun ? (
            <MrpSuggestionsTable suggestions={selectedRun.suggestions} />
          ) : null}
        </section>
      </div>

      <Modal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title="New sales order"
        description="Demand from open orders drives the next MRP run."
      >
        <form onSubmit={handleCreateOrder}>
          <div className="mb-5">
            <label className={labelClass}>Customer</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className={fieldClass}
            />
          </div>

          <label className={labelClass}>Order lines</label>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="rounded-lg border border-line bg-paper/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                    Line {i + 1}
                  </span>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      aria-label="Remove line"
                      className="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:bg-draft-soft hover:text-draft"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
                <select
                  value={line.productId}
                  onChange={(e) => updateLine(i, 'productId', e.target.value)}
                  required
                  className={`mb-2 ${fieldClass}`}
                >
                  <option value="">Select product</option>
                  {products?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))}
                      required
                      placeholder="Qty"
                      className={`font-mono ${fieldClass}`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="date"
                      value={line.dueDate}
                      onChange={(e) => updateLine(i, 'dueDate', e.target.value)}
                      required
                      className={`font-mono ${fieldClass}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLine}
            className="mt-3 font-mono text-[12px] font-medium text-navy transition-colors hover:text-signal"
          >
            + Add line
          </button>

          {createSalesOrder.isError && (
            <div className="mt-4 rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
              Could not create the sales order.
            </div>
          )}

          <button
            type="submit"
            disabled={createSalesOrder.isPending}
            className="mt-5 w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            {createSalesOrder.isPending ? 'Creating…' : 'Create sales order'}
          </button>
        </form>
      </Modal>
    </div>
  );
}