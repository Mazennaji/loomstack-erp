import { useState, type FormEvent } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useWarehouses } from '../hooks/useWarehouses';
import { useStockLevels, useAdjustStock } from '../hooks/useStock';
import Modal from '../components/Modal';

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft';
const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted';

export default function Inventory() {
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const { data: stockLevels, isLoading: stockLoading } = useStockLevels();
  const adjustStock = useAdjustStock();

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjProductId, setAdjProductId] = useState('');
  const [adjWarehouseId, setAdjWarehouseId] = useState('');
  const [adjQty, setAdjQty] = useState(0);

  function handleAdjustStock(e: FormEvent) {
    e.preventDefault();
    adjustStock.mutate(
      { productId: adjProductId, warehouseId: adjWarehouseId, quantityChange: adjQty },
      {
        onSuccess: () => {
          setAdjQty(0);
          setAdjustModalOpen(false);
        },
      },
    );
  }

  const noPrereqs = !products?.length || !warehouses?.length;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-signal">04</span>
            <h1 className="font-display text-2xl font-600 tracking-tight">Inventory</h1>
          </div>
          <p className="mt-1 pl-8 text-sm text-muted">
            Live stock across every location, net of reservations.
          </p>
        </div>
        <button
          onClick={() => setAdjustModalOpen(true)}
          disabled={noPrereqs}
          className="rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
        >
          Adjust stock
        </button>
      </div>

      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
            Stock levels
          </h2>
          {stockLevels && stockLevels.length > 0 && (
            <span className="font-mono text-[11px] text-muted">
              {stockLevels.length} record{stockLevels.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {stockLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Loading stock…</p>
        ) : stockLevels && stockLevels.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                      SKU
                    </th>
                    <th className="py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                      Product
                    </th>
                    <th className="py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                      Warehouse
                    </th>
                    <th className="py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                      Qty
                    </th>
                    <th className="py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                      Reserved
                    </th>
                    <th className="px-5 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockLevels.map((s) => {
                    const available = s.quantity - s.reserved;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-line last:border-0 transition-colors hover:bg-paper"
                      >
                        <td className="px-5 py-3 font-mono text-[13px] text-navy">{s.product.sku}</td>
                        <td className="py-3 font-medium">{s.product.name}</td>
                        <td className="py-3 text-muted">{s.warehouse.name}</td>
                        <td className="py-3 text-right font-mono">{s.quantity}</td>
                        <td className="py-3 text-right font-mono text-muted">{s.reserved}</td>
                        <td
                          className={
                            'px-5 py-3 text-right font-mono font-600 ' +
                            (available <= 0 ? 'text-draft' : 'text-done')
                          }
                        >
                          {available}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line sm:hidden">
              {stockLevels.map((s) => {
                const available = s.quantity - s.reserved;
                return (
                  <li key={s.id} className="px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-600">{s.product.name}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-navy">{s.product.sku}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-muted">
                          {s.warehouse.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={
                            'font-mono text-lg font-600 ' +
                            (available <= 0 ? 'text-draft' : 'text-done')
                          }
                        >
                          {available}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                          available
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-4 font-mono text-[11px] text-muted">
                      <span>
                        <span className="text-muted/60">qty </span>
                        <span className="text-ink">{s.quantity}</span>
                      </span>
                      <span>
                        <span className="text-muted/60">reserved </span>
                        <span className="text-ink">{s.reserved}</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted">
              {noPrereqs
                ? 'Add a product and a warehouse first, then adjust stock to set opening levels.'
                : 'No stock yet. Adjust stock to set opening levels.'}
            </p>
            {!noPrereqs && (
              <button
                onClick={() => setAdjustModalOpen(true)}
                className="mt-4 rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
              >
                Adjust stock
              </button>
            )}
          </div>
        )}
      </section>

      <Modal
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Adjust stock"
        description="Add or remove units at a specific warehouse."
      >
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div>
            <label className={labelClass}>Product</label>
            <select
              value={adjProductId}
              onChange={(e) => setAdjProductId(e.target.value)}
              required
              className={fieldClass}
            >
              <option value="">Select product</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Warehouse</label>
            <select
              value={adjWarehouseId}
              onChange={(e) => setAdjWarehouseId(e.target.value)}
              required
              className={fieldClass}
            >
              <option value="">Select warehouse</option>
              {warehouses?.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Quantity change</label>
            <input
              type="number"
              value={adjQty}
              onChange={(e) => setAdjQty(Number(e.target.value))}
              required
              className={`font-mono ${fieldClass}`}
            />
            <p className="mt-1.5 text-xs text-muted">Use a negative number to remove units.</p>
          </div>

          {adjustStock.isError && (
            <div className="rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
              Could not adjust stock.
            </div>
          )}

          <button
            type="submit"
            disabled={adjustStock.isPending}
            className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            {adjustStock.isPending ? 'Applying…' : 'Apply adjustment'}
          </button>
        </form>
      </Modal>
    </div>
  );
}