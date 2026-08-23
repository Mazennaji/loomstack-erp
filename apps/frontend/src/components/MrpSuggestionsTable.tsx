import type { MrpSuggestion } from '../api/mrp';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}

function SuggestionTable({
  suggestions,
  accent,
}: {
  suggestions: MrpSuggestion[];
  accent: 'purchase' | 'production';
}) {
  if (suggestions.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-muted">None needed.</p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left">
          <th className="px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
            SKU
          </th>
          <th className="py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
            Product
          </th>
          <th className="py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
            Qty
          </th>
          <th className="px-5 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
            Due
          </th>
        </tr>
      </thead>
      <tbody>
        {suggestions.map((s) => (
          <tr
            key={s.id}
            className="border-b border-line last:border-0 transition-colors hover:bg-paper"
          >
            <td className="px-5 py-3 font-mono text-[13px] text-navy">{s.product.sku}</td>
            <td className="py-3 font-medium">{s.product.name}</td>
            <td
              className={
                'py-3 text-right font-mono font-600 ' +
                (accent === 'purchase' ? 'text-signal' : 'text-navy')
              }
            >
              {s.quantity}
            </td>
            <td className="px-5 py-3 text-right font-mono text-muted">
              {formatDate(s.dueDate)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MrpSuggestionsTable({
  suggestions,
}: {
  suggestions: MrpSuggestion[];
}) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface px-5 py-10 text-center">
        <p className="text-sm text-muted">
          This run produced no suggestions. Stock already covers the demand.
        </p>
      </div>
    );
  }

  const purchases = suggestions.filter((s) => s.type === 'PURCHASE');
  const productions = suggestions.filter((s) => s.type === 'PRODUCTION');

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Suggested purchases
            </h3>
          </div>
          {purchases.length > 0 && (
            <span className="font-mono text-[11px] text-muted">{purchases.length}</span>
          )}
        </div>
        <SuggestionTable suggestions={purchases} accent="purchase" />
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-navy" />
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
              Suggested production
            </h3>
          </div>
          {productions.length > 0 && (
            <span className="font-mono text-[11px] text-muted">{productions.length}</span>
          )}
        </div>
        <SuggestionTable suggestions={productions} accent="production" />
      </div>
    </div>
  );
}