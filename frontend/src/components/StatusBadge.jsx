const config = {
  Present:    { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   border: 'rgba(74,222,128,0.3)' },
  Late:       { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   border: 'rgba(251,191,36,0.3)' },
  Absent:     { color: '#f87171', bg: 'rgba(248,113,113,0.12)',  border: 'rgba(248,113,113,0.3)' },
  'On Leave': { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',  border: 'rgba(167,139,250,0.3)' },
  Approved:   { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   border: 'rgba(74,222,128,0.3)' },
  Rejected:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)',  border: 'rgba(248,113,113,0.3)' },
  Pending:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',   border: 'rgba(251,191,36,0.25)' },
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const c = config[status] || { color: 'var(--ink-2)', bg: 'rgba(139,144,160,0.1)', border: 'rgba(139,144,160,0.2)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '20px',
      fontFamily: 'var(--mono)',
      fontSize: '10px',
      fontWeight: '500',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      color: c.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, flexShrink: 0, boxShadow: `0 0 6px ${c.color}` }} />
      {status}
    </span>
  );
}
