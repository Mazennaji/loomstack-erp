import { useState, type FormEvent } from 'react';
import {
  useMachines,
  useMaintenancePredictions,
  useCreateMachine,
  useLogUsage,
  useLogMaintenance,
} from '../hooks/useMachines';
import { RiskBadge } from '../components/RiskBadge';
import Modal from '../components/Modal';

const fieldClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft';
const labelClass =
  'mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted';

const RISK_BAR: Record<string, string> = {
  overdue: 'bg-draft',
  due_soon: 'bg-signal',
  monitor: 'bg-navy',
  healthy: 'bg-done',
};

export default function Machines() {
  const { data: machines, isLoading } = useMachines();
  const { data: predictions } = useMaintenancePredictions();
  const createMachine = useCreateMachine();
  const logUsage = useLogUsage();
  const logMaintenance = useLogMaintenance();

  const [machineModal, setMachineModal] = useState(false);
  const [usageModal, setUsageModal] = useState<string | null>(null);
  const [maintModal, setMaintModal] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [interval, setInterval] = useState(500);

  const [uDate, setUDate] = useState('');
  const [uHours, setUHours] = useState(0);
  const [uCycles, setUCycles] = useState(0);

  const [mDate, setMDate] = useState('');
  const [mHours, setMHours] = useState(0);
  const [mNotes, setMNotes] = useState('');

  const predMap = new Map((predictions?.machines ?? []).map((p) => [p.machine_id, p]));

  function handleCreateMachine(e: FormEvent) {
    e.preventDefault();
    createMachine.mutate(
      { name, code, maintenanceIntervalHours: interval },
      {
        onSuccess: () => {
          setName('');
          setCode('');
          setInterval(500);
          setMachineModal(false);
        },
      },
    );
  }

  function handleLogUsage(e: FormEvent) {
    e.preventDefault();
    if (!usageModal) return;
    logUsage.mutate(
      { machineId: usageModal, date: uDate, hoursRun: uHours, cycles: uCycles },
      {
        onSuccess: () => {
          setUDate('');
          setUHours(0);
          setUCycles(0);
          setUsageModal(null);
        },
      },
    );
  }

  function handleLogMaintenance(e: FormEvent) {
    e.preventDefault();
    if (!maintModal) return;
    logMaintenance.mutate(
      { machineId: maintModal, type: 'PREVENTIVE', date: mDate, hoursAtService: mHours, notes: mNotes || undefined },
      {
        onSuccess: () => {
          setMDate('');
          setMHours(0);
          setMNotes('');
          setMaintModal(null);
        },
      },
    );
  }

  const dueCount = (predictions?.machines ?? []).filter(
    (p) => p.risk === 'overdue' || p.risk === 'due_soon',
  ).length;

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-signal">08</span>
            <h1 className="font-display text-2xl font-600 tracking-tight">Machines</h1>
          </div>
          <p className="mt-1 pl-8 text-sm text-muted">
            Equipment health and predicted maintenance windows.
            {dueCount > 0 && (
              <span className="ml-2 font-medium text-draft">
                {dueCount} need attention.
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setMachineModal(true)}
          className="rounded-md bg-navy px-3.5 py-2 text-sm font-medium text-surface transition-colors hover:bg-navy/90"
        >
          New machine
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-line bg-surface px-5 py-12 text-center">
          <p className="text-sm text-muted">Loading machines…</p>
        </div>
      ) : machines && machines.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {machines.map((m) => {
            const p = predMap.get(m.id);
            const pct = p ? Math.min(100, p.pct_consumed) : 0;
            const barColor = p ? RISK_BAR[p.risk] : 'bg-line';
            return (
              <div key={m.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                <div className="flex items-start justify-between border-b border-line px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-600">{m.name}</span>
                      <span className="font-mono text-[12px] text-navy">{m.code}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted">
                      interval {m.maintenanceIntervalHours}h
                    </div>
                  </div>
                  {p ? <RiskBadge risk={p.risk} /> : (
                    <span className="font-mono text-[11px] text-muted">no data</span>
                  )}
                </div>

                <div className="px-5 py-4">
                  {p ? (
                    <>
                      <div className="mb-1 flex items-center justify-between font-mono text-[11px] text-muted">
                        <span>service interval consumed</span>
                        <span className="text-ink">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-line">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="font-mono text-lg font-600 text-ink">
                            {p.days_remaining ?? '—'}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                            days left
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-lg font-600 text-ink">
                            {p.daily_usage_rate}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                            h / day
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-lg font-600 text-ink">
                            {Math.round(p.hours_since_service)}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                            h since svc
                          </div>
                        </div>
                      </div>

                      {p.projected_service_date && (
                        <div className="mt-4 rounded-md bg-paper px-3 py-2 text-center">
                          <span className="font-mono text-[11px] text-muted">next service ≈ </span>
                          <span className="font-mono text-[13px] font-600 text-navy">
                            {p.projected_service_date}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted">
                      Log usage to generate a prediction.
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setUsageModal(m.id)}
                      className="flex-1 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-line/40"
                    >
                      Log usage
                    </button>
                    <button
                      onClick={() => setMaintModal(m.id)}
                      className="flex-1 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-line/40"
                    >
                      Log service
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-surface/50 p-10 text-center">
          <p className="text-sm text-muted">No machines yet. Add one to start tracking.</p>
        </div>
      )}

      <Modal open={machineModal} onClose={() => setMachineModal(false)} title="New machine" description="Register a piece of equipment to track.">
        <form onSubmit={handleCreateMachine} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} required className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Maintenance interval (hours)</label>
            <input type="number" min="1" value={interval} onChange={(e) => setInterval(Number(e.target.value))} required className={`font-mono ${fieldClass}`} />
          </div>
          <button type="submit" disabled={createMachine.isPending} className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50">
            {createMachine.isPending ? 'Creating…' : 'Create machine'}
          </button>
        </form>
      </Modal>

      <Modal open={!!usageModal} onClose={() => setUsageModal(null)} title="Log usage" description="Record hours run and cycles for a day.">
        <form onSubmit={handleLogUsage} className="space-y-4">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={uDate} onChange={(e) => setUDate(e.target.value)} required className={`font-mono ${fieldClass}`} />
          </div>
          <div>
            <label className={labelClass}>Hours run</label>
            <input type="number" min="0" step="0.1" value={uHours} onChange={(e) => setUHours(Number(e.target.value))} required className={`font-mono ${fieldClass}`} />
          </div>
          <div>
            <label className={labelClass}>Cycles</label>
            <input type="number" min="0" value={uCycles} onChange={(e) => setUCycles(Number(e.target.value))} required className={`font-mono ${fieldClass}`} />
          </div>
          <button type="submit" disabled={logUsage.isPending} className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50">
            {logUsage.isPending ? 'Saving…' : 'Log usage'}
          </button>
        </form>
      </Modal>

      <Modal open={!!maintModal} onClose={() => setMaintModal(null)} title="Log service" description="Record a completed maintenance event.">
        <form onSubmit={handleLogMaintenance} className="space-y-4">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} required className={`font-mono ${fieldClass}`} />
          </div>
          <div>
            <label className={labelClass}>Total hours at service</label>
            <input type="number" min="0" step="0.1" value={mHours} onChange={(e) => setMHours(Number(e.target.value))} required className={`font-mono ${fieldClass}`} />
            <p className="mt-1.5 text-xs text-muted">Cumulative machine hours when serviced.</p>
          </div>
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <input value={mNotes} onChange={(e) => setMNotes(e.target.value)} className={fieldClass} />
          </div>
          <button type="submit" disabled={logMaintenance.isPending} className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-surface transition-colors hover:bg-navy/90 disabled:opacity-50">
            {logMaintenance.isPending ? 'Saving…' : 'Log service'}
          </button>
        </form>
      </Modal>
    </div>
  );
}