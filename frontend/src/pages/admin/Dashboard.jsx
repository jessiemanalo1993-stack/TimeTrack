import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

const th = { padding: '10px 16px', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', fontWeight: '500' };
const td = { padding: '12px 16px', fontSize: '13px', color: 'var(--ink)', borderBottom: '1px solid var(--line-2)', verticalAlign: 'middle' };

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const todayLabel = new Date().toLocaleDateString('en-US', {
    timeZone: 'Asia/Manila', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    Promise.all([
      api.getAttendance({ date_from: today, date_to: today }),
      api.getEmployees(),
    ]).then(([att, emps]) => {
      setRecords(att);
      setEmployees(emps);
    }).finally(() => setLoading(false));
  }, []);

  const counts = {
    Present: records.filter(r => r.status === 'Present').length,
    Late: records.filter(r => r.status === 'Late').length,
    Absent: records.filter(r => r.status === 'Absent').length,
  };

  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 4px' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{todayLabel}</p>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)', marginBottom: '24px' }}
        className="sm:grid-cols-4"
      >
        {[
          { label: 'Total', value: employees.length, color: 'var(--ink)' },
          { label: 'Present', value: counts.Present, color: 'var(--present)' },
          { label: 'Late', value: counts.Late, color: 'var(--late)' },
          { label: 'Absent', value: counts.Absent, color: 'var(--absent)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg)', padding: '20px 20px 18px' }}>
            <p style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '36px', fontWeight: '600', color, margin: 0, fontFamily: 'var(--mono)', lineHeight: 1 }}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
        <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
            Today's Attendance
          </span>
        </div>
        {loading ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>Loading...</p>
        ) : records.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>No records for today.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Employee', 'Schedule', 'Time In', 'Location', 'Status'].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={td}>
                      <p style={{ margin: '0 0 1px', fontWeight: '500' }}>{r.employees?.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{r.employees?.email}</p>
                    </td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px' }}>{formatTime(r.employees?.shift_start)}</td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500' }}>{formatTime(r.time_in)}</td>
                    <td style={{ ...td, color: 'var(--ink-2)', fontSize: '12px' }}>{r.work_location || '—'}</td>
                    <td style={td}><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
