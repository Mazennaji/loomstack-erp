const styles: Record<string, { fg: string; bg: string }> = {
  DRAFT: { fg: 'text-draft', bg: 'bg-draft-soft' },
  APPLIED: { fg: 'text-applied', bg: 'bg-applied-soft' },
  COMPLETED: { fg: 'text-done', bg: 'bg-done-soft' },
  RELEASED: { fg: 'text-applied', bg: 'bg-applied-soft' },
  PLANNED: { fg: 'text-draft', bg: 'bg-draft-soft' },
  CANCELLED: { fg: 'text-cancel', bg: 'bg-cancel-soft' },
  OPEN: { fg: 'text-done', bg: 'bg-done-soft' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = styles[status] ?? { fg: 'text-muted', bg: 'bg-cancel-soft' };
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider ${s.fg} ${s.bg}`}
    >
      {status}
    </span>
  );
}