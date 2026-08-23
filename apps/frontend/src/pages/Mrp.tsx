import { useState, FormEvent } from "react";
import { useProducts } from "../hooks/useProducts";
import { useCreateSalesOrder, useRunMrp, useMrpRuns, useMrpRun } from "../hooks/useMrp";
import MrpSuggestionsTable from "../components/MrpSuggestionsTable";
import Modal from "../components/Modal";

interface LineDraft {
  productId: string;
  quantity: number;
  dueDate: string;
}

export default function Mrp() {
  const { data: products } = useProducts();
  const createSalesOrder = useCreateSalesOrder();
  const runMrp = useRunMrp();
  const { data: runs } = useMrpRuns();

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { data: selectedRun, isLoading: runLoading } = useMrpRun(selectedRunId);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([
    { productId: "", quantity: 1, dueDate: "" },
  ]);
  const [orderSuccess, setOrderSuccess] = useState(false);

  function addLine() {
    setLines([...lines, { productId: "", quantity: 1, dueDate: "" }]);
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
          setCustomerName("");
          setLines([{ productId: "", quantity: 1, dueDate: "" }]);
          setOrderSuccess(true);
          setTimeout(() => setOrderSuccess(false), 3000);
          setOrderModalOpen(false);
        },
      },
    );
  }

  function handleRunMrp() {
    runMrp.mutate(undefined, {
      onSuccess: (data) => {
        setSelectedRunId(data.id);
      },
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">MRP</h1>
        <div className="space-x-2">
          <button
            onClick={() => setOrderModalOpen(true)}
            className="bg-navy text-white px-4 py-2 rounded text-sm"
          >
            + Sales Order
          </button>
          <button
            onClick={handleRunMrp}
            disabled={runMrp.isPending}
            className="bg-amber text-navy font-medium px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {runMrp.isPending ? "Running..." : "Run MRP"}
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="bg-green-50 text-green-700 text-sm p-2 rounded mb-4">
          Sales order created.
        </div>
      )}

      {runMrp.isError && (
        <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4">
          {(runMrp.error as any)?.response?.data?.message || "MRP run failed."}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        <section className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-semibold mb-3">Runs</h2>
          {runs && runs.length > 0 ? (
            <ul className="text-sm divide-y">
              {runs.map((r) => (
                <li
                  key={r.id}
                  onClick={() => setSelectedRunId(r.id)}
                  className={`py-2 px-2 -mx-2 rounded cursor-pointer ${
                    selectedRunId === r.id ? "bg-amber/20 font-medium" : "hover:bg-slate-50"
                  }`}
                >
                  {new Date(r.runAt).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">No runs yet.</p>
          )}
        </section>

        <section className="col-span-3">
          {!selectedRunId ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-slate-400">
              Run MRP or select a previous run to view suggestions
            </div>
          ) : runLoading ? (
            <p className="text-slate-400 text-sm">Loading run...</p>
          ) : selectedRun ? (
            <MrpSuggestionsTable suggestions={selectedRun.suggestions} />
          ) : null}
        </section>
      </div>

      <Modal open={orderModalOpen} onClose={() => setOrderModalOpen(false)} title="New Sales Order">
        <form onSubmit={handleCreateOrder}>
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 mb-4"
          />

          {lines.map((line, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select
                value={line.productId}
                onChange={(e) => updateLine(i, "productId", e.target.value)}
                required
                className="flex-1 border rounded px-2 py-1.5 text-sm"
              >
                <option value="">Select product</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={line.quantity}
                onChange={(e) => updateLine(i, "quantity", Number(e.target.value))}
                required
                className="w-20 border rounded px-2 py-1.5 text-sm"
              />
              <input
                type="date"
                value={line.dueDate}
                onChange={(e) => updateLine(i, "dueDate", e.target.value)}
                required
                className="w-40 border rounded px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="text-red-400 hover:text-red-600 px-2"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addLine}
            className="text-sm text-navy hover:underline mb-4"
          >
            + Add line
          </button>

          {createSalesOrder.isError && (
            <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">
              Failed to create sales order
            </div>
          )}

          <button
            type="submit"
            disabled={createSalesOrder.isPending}
            className="w-full bg-navy text-white rounded py-2"
          >
            {createSalesOrder.isPending ? "Creating..." : "Create Sales Order"}
          </button>
        </form>
      </Modal>
    </div>
  );
}