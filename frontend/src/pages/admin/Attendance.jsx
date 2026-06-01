import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

const th = { padding: '10px 16px', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', fontWeight: '500' };
const td = { padding: '12px 16px', fontSize: '13px', color: 'var(--ink)', borderBottom: '1px solid var(--line-2)', verticalAlign: 'middle' };
const selectStyle = { padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '2px', fontSize: '13px', color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'var(--font)', outline: 'none' };

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

  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 4px' }}>Records</p>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--ink)', margin: 0 }}>Attendance</h1>
      </div>

      {/* Filters */}
      <div style={{ border: '1px solid var(--line)', background: 'var(--bg)', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ ...selectStyle, padding: '8px 10px' }}
            onFocus={e => e.target.style.borderColor = 'var(--ink)'}
            onBlur={e => e.target.style.borderColor = 'var(--line)'}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Employee</label>
          <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} style={selectStyle}>
            <option value="">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {/* Not timed in alert */}
      {notTimedIn.length > 0 && !employeeFilter && (
        <div style={{ border: '1px solid var(--late)', borderLeft: '3px solid var(--late)', background: 'var(--bg)', padding: '14px 16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--late)', margin: '0 0 10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {notTimedIn.length} employee{notTimedIn.length > 1 ? 's' : ''} not yet timed in
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {notTimedIn.map(e => (
              <button key={e.id}
                onClick={() => { setAbsentModal({ employee_id: e.id, name: e.name, date }); setNotes(''); }}
                style={{ fontSize: '11px', fontFamily: 'var(--mono)', border: '1px solid var(--late)', background: 'var(--bg)', color: 'var(--late)', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em' }}
              >
                {e.name} — Mark Absent
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
        <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
            Records — {date}
          </span>
        </div>
        {loading ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>Loading...</p>
        ) : records.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>No records found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Employee', 'Schedule', 'Time In', 'Time Out', 'Location', 'Status', 'Notes', ''].map((h, i) => <th key={i} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ transition: 'background 0.1s' }}
                  >
                    <td style={td}>
                      <p style={{ margin: '0 0 1px', fontWeight: '500' }}>{r.employees?.name}</p>
                    </td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>
                      {formatTime(r.employees?.shift_start)}
                      {r.employees?.shift_end && <span> – {formatTime(r.employees.shift_end)}</span>}
                    </td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500' }}>{r.status === 'On Leave' ? 'N/A' : formatTime(r.time_in)}</td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{r.status === 'On Leave' ? 'N/A' : (formatTime(r.time_out))}</td>
                    <td style={{ ...td, fontSize: '12px', color: 'var(--ink-2)' }}>{r.status === 'On Leave' ? 'N/A' : (r.work_location || '—')}</td>
                    <td style={td}><StatusBadge status={r.status} /></td>
                    <td style={{ ...td, fontSize: '12px', color: 'var(--ink-3)', maxWidth: '160px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.notes || '—'}</span>
                    </td>
                    <td style={td}>
                      <button onClick={() => handleDelete(r.id)}
                        style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--absent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', letterSpacing: '0.04em' }}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', width: '100%', maxWidth: '360px' }}>
            <div style={{ borderTop: '2px solid var(--absent)', borderBottom: '1px solid var(--line)', padding: '14px 20px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--absent)', textTransform: 'uppercase' }}>Mark Absent</span>
            </div>
            <form onSubmit={handleMarkAbsent} style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '4px', fontWeight: '500' }}>{absentModal.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '16px', fontFamily: 'var(--mono)' }}>{absentModal.date}</p>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '5px' }}>Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Reason or remarks..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '2px', fontSize: '13px', color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'var(--font)', outline: 'none', resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" onClick={() => setAbsentModal(null)}
                  style={{ padding: '9px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-2)', fontSize: '12px', fontFamily: 'var(--mono)', cursor: 'pointer', borderRadius: '2px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '9px', border: '1px solid var(--absent)', background: 'var(--absent)', color: '#fff', fontSize: '12px', fontFamily: 'var(--mono)', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: '2px', fontWeight: '600' }}>
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
