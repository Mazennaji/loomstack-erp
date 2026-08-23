import { useState, type FormEvent } from 'react';
import { useProducts, useCreateProduct } from '../hooks/useProducts';
import Modal from '../components/Modal';

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft';
const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted';

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    createProduct.mutate(
      { sku, name },
      {
        onSuccess: () => {
          setSku('');
          setName('');
          setModalOpen(false);
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
            <h1 className="font-display text-2xl font-600 tracking-tight">Products</h1>
          </div>
          <p className="mt-1 pl-8 text-sm text-muted">
            Your catalog of finished goods, assemblies, and raw materials.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
        >
          New product
        </button>
      </div>

      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
            Catalog
          </h2>
          {products && (
            <span className="font-mono text-[11px] text-muted">
              {products.length} item{products.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Loading catalog…</p>
        ) : products && products.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                  SKU
                </th>
                <th className="px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                  Name
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 transition-colors hover:bg-paper"
                >
                  <td className="px-5 py-3 font-mono text-[13px] text-navy">{p.sku}</td>
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted">
              No products yet. Add your first finished good, assembly, or raw material.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
            >
              New product
            </button>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New product"
        description="Add a finished good, assembly, or raw material."
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
          {createProduct.isError && (
            <div className="rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
              Could not create the product. That SKU may already exist.
            </div>
          )}
          <button
            type="submit"
            disabled={createProduct.isPending}
            className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            {createProduct.isPending ? 'Creating…' : 'Create product'}
          </button>
        </form>
      </Modal>
    </div>
  );
}