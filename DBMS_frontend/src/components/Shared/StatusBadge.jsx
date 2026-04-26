/* StatusBadge — returns a colour-coded pill for any schedule/complaint status */
export default function StatusBadge({ status }) {
  const map = {
    COMPLETED: 'badge-completed',
    MISSED:    'badge-missed',
    PENDING:   'badge-pending',
    DELAYED:   'badge-delayed',
    OPEN:      'badge-open',
    ASSIGNED:  'badge-assigned',
    RESOLVED:  'badge-resolved',
  };

  const dots = {
    COMPLETED: '●',
    MISSED:    '●',
    PENDING:   '●',
    DELAYED:   '●',
    OPEN:      '●',
    ASSIGNED:  '●',
    RESOLVED:  '●',
  };

  const cls = map[status?.toUpperCase()] || 'badge-pending';
  return (
    <span className={`badge ${cls}`}>
      <span style={{ fontSize: '0.6rem' }}>{dots[status?.toUpperCase()] || '●'}</span>
      {status}
    </span>
  );
}
