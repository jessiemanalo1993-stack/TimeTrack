import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

function formatTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const selectStyle = {
  padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '8px',
  fontSize: '12px', color: 'var(--ink)', background: 'var(--surface)',
  fontFamily: 'var(--mono)', outline: 'none', letterSpacing: '0.03em',
  cursor: 'pointer', transition: 'border-color 0.15s',
};

export default function Attendance() {
  const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const [date, setDate] = useState(todayDate);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [absentModal, setAbsentModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.getEmployees().then(setEmployees); }, []);

  async function load() {
    setLoading(true);
    try {
      const params = { date_from: date, date_to: date };
      if (employeeFilter) params.employee_id = employeeFilter;
      setRecords(await api.getAttendance(params));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [date, employeeFilter]);

  const todayDay = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  const scheduledToday = employees.filter(e => e.work_days?.includes(todayDay));
  const timedInIds = new Set(records.map(r => r.employee_id));
  const notTimedIn = scheduledToday.filter(e => !timedInIds.has(e.id));

  async function handleMarkAbsent(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.markAbsent(absentModal.employee_id, absentModal.date, notes);
      setAbsentModal(null); setNotes(''); load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this attendance record?')) return;
    try { await api.deleteRecord(id); load(); }
    catch (err) { alert(err.message); }
  }

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 6px' }}>Records</p>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>Attendance</h1>
      </div>

      {/* Filters panel */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="panel-header accent-bar">
          <span className="panel-title">Filters</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label className="field-label">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={selectStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}
            />
          </div>
          <div>
            <label className="field-label">Employee</label>
            <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} style={selectStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Not timed in alert */}
      {notTimedIn.length > 0 && !employeeFilter && (
        <div style={{
          border: '1px solid rgba(245,158,11,0.3)', borderLeft: '3px solid var(--late)',
          background: 'rgba(245,158,11,0.05)', borderRadius: '10px',
          padding: '14px 16px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--late)', margin: '0 0 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {notTimedIn.length} employee{notTimedIn.length > 1 ? 's' : ''} not yet timed in
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {notTimedIn.map(e => (
              <button key={e.id}
                onClick={() => { setAbsentModal({ employee_id: e.id, name: e.name, date }); setNotes(''); }}
                style={{
                  fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.05em',
                  border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px',
                  background: 'rgba(245,158,11,0.08)', color: 'var(--late)',
                  padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(245,158,11,0.15)'; e.target.style.borderColor = 'var(--late)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(245,158,11,0.08)'; e.target.style.borderColor = 'rgba(245,158,11,0.3)'; }}
              >
                {e.name} — Mark Absent
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table panel */}
      <div className="panel">
        <div className="panel-header accent-bar">
          <span className="panel-title">Records — {date}</span>
        </div>
        {loading ? (
          <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>Loading...</p>
        ) : records.length === 0 ? (
          <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>No records found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dark-table">
              <thead>
                <tr>{['Employee', 'Schedule', 'Time In', 'Time Out', 'Location', 'Status', 'Notes', ''].map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: '500' }}>{r.employees?.name}</td>
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
                    <td style={{ fontSize: '12px', color: 'var(--ink-3)', maxWidth: '160px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.notes || '—'}</span>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(r.id)} style={{
                        fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--ink-3)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        letterSpacing: '0.04em', transition: 'color 0.15s',
                      }}
                        onMouseEnter={e => e.target.style.color = 'var(--absent)'}
                        onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Absent Modal */}
      {absentModal && (
        <div style={overlayStyle}>
          <div className="panel" style={{ width: '100%', maxWidth: '380px' }}>
            <div className="panel-header" style={{ borderTop: '2px solid var(--absent)' }}>
              <span className="panel-title" style={{ color: 'var(--absent)' }}>Mark Absent</span>
              <button onClick={() => setAbsentModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--ink-3)', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <form onSubmit={handleMarkAbsent} style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '2px', fontWeight: '500' }}>{absentModal.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '18px', fontFamily: 'var(--mono)' }}>{absentModal.date}</p>
              <div style={{ marginBottom: '20px' }}>
                <label className="field-label">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Reason or remarks..."
                  className="dark-input" style={{ resize: 'none', height: 'auto' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" onClick={() => setAbsentModal(null)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-danger">
                  {saving ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
