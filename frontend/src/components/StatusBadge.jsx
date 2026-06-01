const config = {
  Present:    { color: 'var(--present)',  bg: 'var(--present-dim)',  border: 'rgba(0,229,160,0.3)' },
  Late:       { color: 'var(--late)',     bg: 'var(--late-dim)',     border: 'rgba(245,158,11,0.3)' },
  Absent:     { color: 'var(--absent)',   bg: 'var(--absent-dim)',   border: 'rgba(244,63,94,0.3)' },
  'On Leave': { color: 'var(--on-leave)', bg: 'var(--on-leave-dim)', border: 'rgba(129,140,248,0.3)' },
  Approved:   { color: 'var(--present)',  bg: 'var(--present-dim)',  border: 'rgba(0,229,160,0.3)' },
  Rejected:   { color: 'var(--absent)',   bg: 'var(--absent-dim)',   border: 'rgba(244,63,94,0.3)' },
  Pending:    { color: 'var(--ink-2)',    bg: 'rgba(139,144,160,0.1)', border: 'rgba(139,144,160,0.2)' },
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const c = config[status] || { color: 'var(--ink-2)', bg: 'rgba(139,144,160,0.1)', border: 'rgba(139,144,160,0.2)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '20px',
      fontFamily: 'var(--mono)',
      fontSize: '10px',
      fontWeight: '500',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: c.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      {status}
    </span>
  );
}
