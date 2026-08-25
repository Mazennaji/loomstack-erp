const config: Record<string, { label: string; cls: string }> = {
  overdue: { label: 'Overdue', cls: 'bg-draft-soft text-draft' },
  due_soon: { label: 'Due soon', cls: 'bg-signal-soft text-signal' },
  monitor: { label: 'Monitor', cls: 'bg-navy-soft text-navy' },
  healthy: { label: 'Healthy', cls: 'bg-done-soft text-done' },
};

export function RiskBadge({ risk }: { risk: string }) {
  const c = config[risk] ?? { label: risk, cls: 'bg-cancel-soft text-muted' };
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider ${c.cls}`}>
      {c.label}
    </span>
  );
}