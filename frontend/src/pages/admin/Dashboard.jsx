import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

function formatTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

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
      setRecords(att); setEmployees(emps);
    }).finally(() => setLoading(false));
  }, []);

  const counts = {
    Present: records.filter(r => r.status === 'Present').length,
    Late:    records.filter(r => r.status === 'Late').length,
    Absent:  records.filter(r => r.status === 'Absent').length,
  };

  const stats = [
    { label: 'Total',   value: employees.length, color: 'var(--ink)',    accent: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
    { label: 'Present', value: counts.Present,   color: 'var(--present)', accent: '#4ade80', glow: 'rgba(74,222,128,0.4)' },
    { label: 'Late',    value: counts.Late,       color: 'var(--late)',    accent: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
    { label: 'Absent',  value: counts.Absent,     color: 'var(--absent)',  accent: '#f87171', glow: 'rgba(248,113,113,0.4)' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }} className="page-wrap">

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 6px' }}>Overview</p>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{todayLabel}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }} className="stat-grid">
        {stats.map(({ label, value, color, accent, glow }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <p style={{ fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: 0 }}>{label}</p>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, display: 'block', boxShadow: `0 0 10px ${glow}` }} />
            </div>
            <p style={{ fontSize: '44px', fontWeight: '700', color, margin: 0, fontFamily: 'var(--mono)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Attendance table */}
      <div className="panel">
        <div className="panel-header accent-bar">
          <span className="panel-title">Today's Attendance</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>{today}</span>
        </div>

        {loading ? (
          <p style={{ padding: '52px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>Loading records…</p>
        ) : records.length === 0 ? (
          <p style={{ padding: '52px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>No records for today.</p>
        ) : (
          <div className="table-scroll">
            <table className="dark-table">
              <thead>
                <tr>{['Employee', 'Schedule', 'Time In', 'Time Out', 'Location', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>
                      <p style={{ margin: '0 0 2px', fontWeight: '600', color: 'var(--ink)' }}>{r.employees?.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{r.employees?.email}</p>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>
                      {formatTime(r.employees?.shift_start)}
                      {r.employees?.shift_end && <span style={{ color: 'var(--ink-3)' }}> – {formatTime(r.employees.shift_end)}</span>}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500' }}>
                      {r.status === 'On Leave' ? <span style={{ color: 'var(--ink-3)' }}>N/A</span> : formatTime(r.time_in)}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>
                      {r.status === 'On Leave' ? <span style={{ color: 'var(--ink-3)' }}>N/A</span> : formatTime(r.time_out)}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--ink-2)' }}>
                      {r.status === 'On Leave' ? <span style={{ color: 'var(--ink-3)' }}>N/A</span> : (r.work_location || '—')}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
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
