import { useState, type FormEvent } from 'react';
import { useProducts, useCreateProduct } from '../hooks/useProducts';
import { useWarehouses, useCreateWarehouse } from '../hooks/useWarehouses';
import { useStockLevels, useAdjustStock } from '../hooks/useStock';
import Modal from '../components/Modal';

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft';
const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted';

export default function Inventory() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses();
  const { data: stockLevels, isLoading: stockLoading } = useStockLevels();

  const createProduct = useCreateProduct();
  const createWarehouse = useCreateWarehouse();
  const adjustStock = useAdjustStock();

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [whName, setWhName] = useState('');
  const [whLocation, setWhLocation] = useState('');
  const [adjProductId, setAdjProductId] = useState('');
  const [adjWarehouseId, setAdjWarehouseId] = useState('');
  const [adjQty, setAdjQty] = useState(0);

  function handleCreateProduct(e: FormEvent) {
    e.preventDefault();
    createProduct.mutate(
      { sku, name },
      {
        onSuccess: () => {
          setSku('');
          setName('');
          setProductModalOpen(false);
        },
      },
    );
  }

  function handleCreateWarehouse(e: FormEvent) {
    e.preventDefault();
    createWarehouse.mutate(
      { name: whName, location: whLocation },
      {
        onSuccess: () => {
          setWhName('');
          setWhLocation('');
          setWarehouseModalOpen(false);
        },
      },
    );
  }

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

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-signal">02</span>
            <h1 className="font-display text-2xl font-600 tracking-tight">Inventory</h1>
          </div>
          <p className="mt-1 pl-8 text-sm text-muted">
            Products, warehouses, and live stock across every location.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setProductModalOpen(true)}
            className="rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-line/40"
          >
            New product
          </button>
          <button
            onClick={() => setWarehouseModalOpen(true)}
            className="rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-line/40"
          >
            New warehouse
          </button>
          <button
            onClick={() => setAdjustModalOpen(true)}
            className="rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
          >
            Adjust stock
          </button>
        </div>
      </div>

      <section className="mb-6 overflow-hidden rounded-lg border border-line bg-surface">
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
          <p className="px-5 py-8 text-center text-sm text-muted">Loading stock…</p>
        ) : stockLevels && stockLevels.length > 0 ? (
          <table className="w-full text-sm">
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
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted">
              No stock yet. Add a product and a warehouse, then adjust stock to set opening levels.
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Products
            </h2>
            {products && (
              <span className="font-mono text-[11px] text-muted">{products.length}</span>
            )}
          </div>
          {productsLoading ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Loading…</p>
          ) : products && products.length > 0 ? (
            <ul className="divide-y divide-line">
              {products.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="font-mono text-[13px] text-navy">{p.sku}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">No products yet.</p>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Warehouses
            </h2>
            {warehouses && (
              <span className="font-mono text-[11px] text-muted">{warehouses.length}</span>
            )}
          </div>
          {warehousesLoading ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Loading…</p>
          ) : warehouses && warehouses.length > 0 ? (
            <ul className="divide-y divide-line">
              {warehouses.map((w) => (
                <li key={w.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-medium">{w.name}</span>
                  <span className="text-sm text-muted">{w.location || '—'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">No warehouses yet.</p>
          )}
        </section>
      </div>

      <Modal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title="New product"
        description="Add a finished good, assembly, or raw material."
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className={labelClass}>SKU</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <button
            type="submit"
            disabled={createProduct.isPending}
            className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            {createProduct.isPending ? 'Creating…' : 'Create product'}
          </button>
        </form>
      </Modal>

      <Modal
        open={warehouseModalOpen}
        onClose={() => setWarehouseModalOpen(false)}
        title="New warehouse"
        description="Stock is tracked per warehouse."
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={whName}
              onChange={(e) => setWhName(e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              value={whLocation}
              onChange={(e) => setWhLocation(e.target.value)}
              className={fieldClass}
            />
          </div>
          <button
            type="submit"
            disabled={createWarehouse.isPending}
            className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            {createWarehouse.isPending ? 'Creating…' : 'Create warehouse'}
          </button>
        </form>
      </Modal>

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
              className={fieldClass}
            />
            <p className="mt-1.5 text-xs text-muted">
              Use a negative number to remove units.
            </p>
          </div>

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