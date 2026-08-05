import { WIP_BODY, WIP_HEADLINE } from '../../lib/status';

// Shown wherever a visitor might otherwise expect to be able to buy.
// Remove nothing to launch — flip PURCHASING_ENABLED in src/lib/status.ts.
export default function WipNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`wip-notice${compact ? ' wip-compact' : ''}`} role="status">
      <strong className="wip-headline">{WIP_HEADLINE}</strong>
      {!compact && <p className="wip-body">{WIP_BODY}</p>}
    </div>
  );
}
