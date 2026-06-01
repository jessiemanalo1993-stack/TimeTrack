import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

const selectStyle = {
  padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '8px',
  fontSize: '12px', color: 'var(--ink)', background: 'var(--surface)',
  fontFamily: 'var(--mono)', outline: 'none', letterSpacing: '0.03em',
  cursor: 'pointer', transition: 'border-color 0.15s',
};

function formatTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function Reports() {
  const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const [dateFrom, setDateFrom] = useState(todayDate);
  const [dateTo, setDateTo] = useState(todayDate);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [sendError, setSendError] = useState('');

  useEffect(() => { api.getEmployees().then(setEmployees); }, []);

  async function handleSearch(e) {
    e.preventDefault(); setLoading(true); setSearched(true);
    try {
      const params = { date_from: dateFrom, date_to: dateTo };
      if (employeeFilter) params.employee_id = employeeFilter;
      setPreview(await api.getAttendance(params));
    } finally { setLoading(false); }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const params = { date_from: dateFrom, date_to: dateTo };
      if (employeeFilter) params.employee_id = employeeFilter;
      const res = await api.exportExcel(params);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${dateFrom}_to_${dateTo}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { alert(err.message); }
    finally { setDownloading(false); }
  }

  const counts = {
    Present: preview.filter(r => r.status === 'Present').length,
    Late: preview.filter(r => r.status === 'Late').length,
    Absent: preview.filter(r => r.status === 'Absent').length,
    'On Leave': preview.filter(r => r.status === 'On Leave').length,
  };

  async function handleSendEmail() {
    setSending(true); setSendResult(null); setSendError('');
    try {
      const params = { date_from: dateFrom, date_to: dateTo };
      if (employeeFilter) params.employee_id = employeeFilter;
      if (emailSubject.trim()) params.subject = emailSubject.trim();
      if (emailRecipient) params.recipient_id = emailRecipient;
      setSendResult(await api.sendReport(params));
    } catch (err) { setSendError(err.message); }
    finally { setSending(false); }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }} className="page-wrap">

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 6px' }}>Export</p>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>Reports</h1>
        <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>Generate and download attendance reports as Excel files.</p>
      </div>

      {/* Filters panel */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header accent-bar">
          <span className="panel-title">Filters</span>
        </div>
        <form onSubmit={handleSearch} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }} className="filter-row">
            {[
              { label: 'From', value: dateFrom, set: setDateFrom },
              { label: 'To', value: dateTo, set: setDateTo },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="field-label">{label}</label>
                <input type="date" value={value} onChange={e => set(e.target.value)}
                  style={selectStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
            ))}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '9px 20px' }}>
              Preview
            </button>
            {searched && preview.length > 0 && (
              <button type="button" onClick={handleDownload} disabled={downloading} className="btn-ghost" style={{ padding: '9px 20px' }}>
                ↓ {downloading ? 'Downloading...' : 'Download Excel'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Summary stats */}
      {searched && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}
          className="stat-grid">
          {[
            { label: 'Total', value: preview.length, color: 'var(--ink)', accent: 'var(--accent)' },
            { label: 'Present', value: counts.Present, color: 'var(--present)', accent: 'var(--present)' },
            { label: 'Late', value: counts.Late, color: 'var(--late)', accent: 'var(--late)' },
            { label: 'Absent', value: counts.Absent, color: 'var(--absent)', accent: 'var(--absent)' },
            { label: 'On Leave', value: counts['On Leave'], color: 'var(--on-leave)', accent: 'var(--on-leave)' },
          ].map(({ label, value, color, accent }) => (
            <div key={label} className="stat-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <p style={{ fontSize: '9px', fontFamily: 'var(--mono)', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: 0 }}>{label}</p>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: '2px' }} />
              </div>
              <p style={{ fontSize: '28px', fontWeight: '600', color, margin: 0, fontFamily: 'var(--mono)', lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview table */}
      {searched && (
        <div className="panel" style={{ marginBottom: '20px' }}>
          <div className="panel-header accent-bar">
            <span className="panel-title">Preview — {dateFrom}{dateFrom !== dateTo ? ` to ${dateTo}` : ''}</span>
          </div>
          {loading ? (
            <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>Loading...</p>
          ) : preview.length === 0 ? (
            <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>No records found for the selected range.</p>
          ) : (
            <div style={{ overflowX: 'auto' }} className="table-scroll">
              <table className="dark-table">
                <thead>
                  <tr>{['Employee', 'Date', 'Day', 'Schedule', 'Time In', 'Time Out', 'Location', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.map(r => {
                    const dateObj = new Date(r.date + 'T12:00:00');
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <tr key={r.id}>
                        <td>
                          <p style={{ margin: '0 0 2px', fontWeight: '500', color: 'var(--ink)' }}>{r.employees?.name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{r.employees?.email}</p>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{r.date}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{dayName}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>
                          {formatTime(r.employees?.shift_start)}
                          {r.employees?.shift_end && <span> – {formatTime(r.employees.shift_end)}</span>}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Send Email panel */}
      {searched && preview.length > 0 && (
        <div className="panel">
          <div className="panel-header accent-bar">
            <span className="panel-title">Send Report by Email</span>
          </div>
          <div style={{ padding: '20px' }}>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', lineHeight: 1.6 }}>
              Send the Excel report by email. Leave recipient blank to send to all employees.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }} className="email-row">
              <div>
                <label className="field-label">Recipient</label>
                <select value={emailRecipient} onChange={e => setEmailRecipient(e.target.value)} style={{ ...selectStyle, minWidth: '180px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}>
                  <option value="">All Employees</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <label className="field-label">Subject (optional)</label>
                <input type="text" value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder={`Attendance Report — ${dateFrom === dateTo ? dateFrom : dateFrom + ' to ' + dateTo}`}
                  className="dark-input" />
              </div>
              <button type="button" onClick={handleSendEmail} disabled={sending} className="btn-primary" style={{ padding: '9px 20px', whiteSpace: 'nowrap' }}>
                ✉ {sending ? 'Sending...' : emailRecipient ? 'Send to Employee' : 'Send to All'}
              </button>
            </div>
            {sendResult && (
              <div className="msg-success">
                <p>Sent to {sendResult.sent_to} recipient{sendResult.sent_to !== 1 ? 's' : ''}.</p>
              </div>
            )}
            {sendError && (
              <div className="msg-error"><p>{sendError}</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
