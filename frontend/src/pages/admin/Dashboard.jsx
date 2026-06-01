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
      setRecords(att);
      setEmployees(emps);
    }).finally(() => setLoading(false));
  }, []);

  const counts = {
    Present: records.filter(r => r.status === 'Present').length,
    Late: records.filter(r => r.status === 'Late').length,
    Absent: records.filter(r => r.status === 'Absent').length,
  };

  const stats = [
    { label: 'Total', value: employees.length, color: 'var(--ink)', accentColor: 'var(--accent)' },
    { label: 'Present', value: counts.Present, color: 'var(--present)', accentColor: 'var(--present)' },
    { label: 'Late', value: counts.Late, color: 'var(--late)', accentColor: 'var(--late)' },
    { label: 'Absent', value: counts.Absent, color: 'var(--absent)', accentColor: 'var(--absent)' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }} className="page-wrap">

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 6px' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Dashboard</h1>
        <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>{todayLabel}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}
        className="stat-grid">
        {stats.map(({ label, value, color, accentColor }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: 0 }}>{label}</p>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, display: 'block', marginTop: '2px', boxShadow: `0 0 8px ${accentColor}` }} />
            </div>
            <p style={{ fontSize: '40px', fontWeight: '600', color, margin: 0, fontFamily: 'var(--mono)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Attendance table */}
      <div className="panel">
        <div className="panel-header accent-bar">
          <span className="panel-title">Today's Attendance</span>
        </div>

        {loading ? (
          <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0, letterSpacing: '0.06em' }}>
            Loading records...
          </p>
        ) : records.length === 0 ? (
          <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>
            No records for today.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }} className="table-scroll">
            <table className="dark-table">
              <thead>
                <tr>
                  {['Employee', 'Schedule', 'Time In', 'Time Out', 'Location', 'Status'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>
                      <p style={{ margin: '0 0 2px', fontWeight: '500', color: 'var(--ink)' }}>{r.employees?.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>{r.employees?.email}</p>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>
                      {formatTime(r.employees?.shift_start)}
                      {r.employees?.shift_end && <span style={{ color: 'var(--ink-3)' }}> – {formatTime(r.employees.shift_end)}</span>}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500', color: 'var(--ink)' }}>
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
