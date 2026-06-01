const styles = {
  Present:   { background: 'var(--present-bg)', color: 'var(--present)', border: '1px solid #b7deb7' },
  Late:      { background: 'var(--late-bg)',    color: 'var(--late)',    border: '1px solid #fcd48a' },
  Absent:    { background: 'var(--absent-bg)',  color: 'var(--absent)',  border: '1px solid #f5b3b3' },
  'On Leave':{ background: 'var(--leave-bg)',   color: 'var(--leave)',   border: '1px solid #99ccff' },
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const s = styles[status] || { background: 'var(--bg-3)', color: 'var(--ink-2)', border: '1px solid var(--line)' };
  return (
    <span style={{
      ...s,
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: '600', fontFamily: 'var(--font)',
      letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
      {status}
    </span>
  );
}
