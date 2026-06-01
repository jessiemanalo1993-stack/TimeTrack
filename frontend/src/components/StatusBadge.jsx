const colors = {
  Present:   'border-green-600 text-green-700 bg-white',
  Late:      'border-amber-500 text-amber-700 bg-white',
  Absent:    'border-red-500 text-red-700 bg-white',
  'On Leave':'border-indigo-500 text-indigo-700 bg-white',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span
      style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.04em' }}
      className={`inline-flex items-center px-2 py-0.5 border font-medium uppercase tracking-wide ${colors[status] || 'border-gray-300 text-gray-600 bg-white'}`}
    >
      {status}
    </span>
  );
}
