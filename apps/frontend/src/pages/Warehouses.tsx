import { useState, type FormEvent } from 'react';
import { useWarehouses, useCreateWarehouse } from '../hooks/useWarehouses';
import Modal from '../components/Modal';

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft';
const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted';

export default function Warehouses() {
  const { data: warehouses, isLoading } = useWarehouses();
  const createWarehouse = useCreateWarehouse();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    createWarehouse.mutate(
      { name, location },
      {
        onSuccess: () => {
          setName('');
          setLocation('');
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
            <span className="font-mono text-xs text-signal">03</span>
            <h1 className="font-display text-2xl font-600 tracking-tight">Warehouses</h1>
          </div>
          <p className="mt-1 pl-8 text-sm text-muted">
            Stock is tracked separately at each location.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
        >
          New warehouse
        </button>
      </div>

      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
            Locations
          </h2>
          {warehouses && (
            <span className="font-mono text-[11px] text-muted">
              {warehouses.length} location{warehouses.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Loading locations…</p>
        ) : warehouses && warehouses.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                  Name
                </th>
                <th className="px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-line last:border-0 transition-colors hover:bg-paper"
                >
                  <td className="px-5 py-3 font-medium">{w.name}</td>
                  <td className="px-5 py-3 text-muted">{w.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted">
              No warehouses yet. Add a location before tracking stock.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
            >
              New warehouse
            </button>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New warehouse"
        description="Give it a name and an optional location."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={fieldClass}
            />
          </div>
          {createWarehouse.isError && (
            <div className="rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
              Could not create the warehouse.
            </div>
          )}
          <button
            type="submit"
            disabled={createWarehouse.isPending}
            className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            {createWarehouse.isPending ? 'Creating…' : 'Create warehouse'}
          </button>
        </form>
      </Modal>
    </div>
  );
}