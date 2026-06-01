import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

const th = {
  padding: '10px 16px', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.07em',
  color: 'var(--ink-3)', textTransform: 'uppercase', textAlign: 'left',
  borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', fontWeight: '600',
};
const td = {
  padding: '13px 16px', fontSize: '13px', color: 'var(--ink)',
  borderBottom: '1px solid var(--line-2)', verticalAlign: 'middle',
};

const statCards = [
  { label: 'Total Employees', key: 'total', color: 'var(--sap-blue)', bg: 'var(--sap-blue-light)', icon: '👥' },
  { label: 'Present',         key: 'present', color: 'var(--present)', bg: 'var(--present-bg)',   icon: '✓' },
  { label: 'Late',            key: 'late',    color: 'var(--late)',    bg: 'var(--late-bg)',       icon: '⏰' },
  { label: 'Absent',          key: 'absent',  color: 'var(--absent)',  bg: 'var(--absent-bg)',     icon: '✗' },
];

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
    total:   employees.length,
    present: records.filter(r => r.status === 'Present').length,
    late:    records.filter(r => r.status === 'Late').length,
    absent:  records.filter(r => r.status === 'Absent').length,
  };

  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }} className="animate-fade-in">
        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--sap-blue)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--ink)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{todayLabel}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}
        className="sm:grid-cols-4 animate-fade-in">
        {statCards.map(({ label, key, color, bg, icon }, i) => (
          <div key={key} className="sap-card" style={{ padding: '18px 20px', transition: 'transform 0.2s, box-shadow 0.2s', animationDelay: `${i * 0.05}s` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
              <div style={{ width: '28px', height: '28px', background: bg, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                {icon}
              </div>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color, margin: 0, fontFamily: 'var(--mono)', lineHeight: 1 }}>
              {loading ? <span className="skeleton" style={{ display: 'inline-block', width: '40px', height: '32px' }} /> : counts[key]}
            </p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="sap-card animate-fade-in" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 1px' }}>Today's Attendance</p>
            <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{today}</p>
          </div>
          {!loading && (
            <span style={{ fontSize: '12px', background: 'var(--sap-blue-light)', color: 'var(--sap-blue)', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
              {records.length} records
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '32px 20px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                <span className="skeleton" style={{ width: '160px', height: '18px' }} />
                <span className="skeleton" style={{ width: '80px', height: '18px' }} />
                <span className="skeleton" style={{ width: '80px', height: '18px' }} />
                <span className="skeleton" style={{ width: '100px', height: '18px' }} />
                <span className="skeleton" style={{ width: '70px', height: '20px', borderRadius: '20px' }} />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📋</p>
            <p style={{ fontSize: '14px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>No records for today yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Employee', 'Schedule', 'Time In', 'Location', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="table-row-hover">
                    <td style={td}>
                      <p style={{ margin: '0 0 1px', fontWeight: '600', fontSize: '13px' }}>{r.employees?.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{r.employees?.email}</p>
                    </td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{formatTime(r.employees?.shift_start)}</td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '600', color: 'var(--ink)' }}>{formatTime(r.time_in)}</td>
                    <td style={{ ...td, fontSize: '12px', color: 'var(--ink-2)' }}>{r.work_location || '—'}</td>
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
