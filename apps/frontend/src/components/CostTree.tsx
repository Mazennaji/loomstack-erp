import type { CostNode } from '../api/bom';

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function TreeNode({ node, depth }: { node: CostNode; depth: number }) {
  const isRoot = depth === 0;
  const hasChildren = node.components.length > 0;

  return (
    <div className={isRoot ? '' : 'ml-4 border-l border-line pl-4'}>
      <div
        className={
          'flex items-baseline justify-between gap-4 py-1.5 ' +
          (isRoot ? 'mb-1' : '')
        }
      >
        <span className="flex items-baseline gap-2">
          {!isRoot && <span className="text-signal">→</span>}
          <span className={isRoot ? 'font-display text-base font-600' : 'text-sm font-medium'}>
            {node.name}
          </span>
          <span className="font-mono text-[12px] text-navy">{node.sku}</span>
          {!isRoot && (
            <span className="font-mono text-[12px] text-muted">× {node.quantity}</span>
          )}
          {hasChildren && (
            <span className="rounded bg-navy-soft px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-navy">
              assembly
            </span>
          )}
        </span>
        <span className="whitespace-nowrap font-mono text-[13px] text-muted">
          {formatCurrency(node.unitCost)}
          <span className="text-muted/50"> / unit </span>
          <span className="mx-1 text-muted/40">=</span>
          <span
            className={
              isRoot ? 'text-base font-600 text-navy' : 'font-600 text-ink'
            }
          >
            {formatCurrency(node.totalCost)}
          </span>
        </span>
      </div>
      {node.components.map((child) => (
        <TreeNode key={child.productId} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CostTree({ root }: { root: CostNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
          Cost rollup
        </span>
        <span className="font-mono text-[11px] text-signal">{root.sku}</span>
      </div>
      <div className="px-5 py-4">
        <TreeNode node={root} depth={0} />
      </div>
      <div className="flex items-center justify-between border-t border-line bg-paper px-5 py-3">
        <span className="text-sm font-medium">Total unit cost</span>
        <span className="font-mono text-lg font-600 text-navy">
          ${formatCurrency(root.totalCost)}
        </span>
      </div>
    </div>
  );
}