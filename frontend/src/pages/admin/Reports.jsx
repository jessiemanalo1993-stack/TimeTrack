import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

const th = { padding: '10px 16px', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', fontWeight: '500' };
const td = { padding: '11px 16px', fontSize: '13px', color: 'var(--ink)', borderBottom: '1px solid var(--line-2)', verticalAlign: 'middle' };
const selectStyle = { padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '2px', fontSize: '13px', color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'var(--font)', outline: 'none' };

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

  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
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
      const result = await api.sendReport(params);
      setSendResult(result);
    } catch (err) {
      setSendError(err.message);
    } finally { setSending(false); }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 4px' }}>Export</p>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>Reports</h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: 0 }}>Generate and download attendance reports as Excel files.</p>
      </div>

      {/* Filters */}
      <div style={{ border: '1px solid var(--line)', background: 'var(--bg)', marginBottom: '20px' }}>
        <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>Filters</span>
        </div>
        <form onSubmit={handleSearch} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          {[
            { label: 'From', value: dateFrom, set: setDateFrom },
            { label: 'To', value: dateTo, set: setDateTo },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</label>
              <input type="date" value={value} onChange={e => set(e.target.value)}
                style={{ ...selectStyle, padding: '8px 10px' }}
                onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Employee</label>
            <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} style={selectStyle}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button type="submit"
            style={{ padding: '9px 16px', border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)', fontSize: '12px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}>
            Preview
          </button>
          {searched && preview.length > 0 && (
            <button type="button" onClick={handleDownload} disabled={downloading}
              style={{ padding: '9px 16px', border: '1px solid var(--present)', background: 'var(--bg)', color: 'var(--present)', fontSize: '12px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: downloading ? 'not-allowed' : 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ↓ {downloading ? 'Downloading...' : 'Download Excel'}
            </button>
          )}
          </div>
        </form>
      </div>

      {/* Summary row */}
      {searched && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)', marginBottom: '16px' }}
          className="sm:grid-cols-5"
        >
          {[
            { label: 'Total', value: preview.length, color: 'var(--ink)' },
            { label: 'Present', value: counts.Present, color: 'var(--present)' },
            { label: 'Late', value: counts.Late, color: 'var(--late)' },
            { label: 'Absent', value: counts.Absent, color: 'var(--absent)' },
            { label: 'On Leave', value: counts['On Leave'], color: '#4338ca' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--bg)', padding: '12px 20px', flex: 1 }}>
              <p style={{ fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 4px' }}>{label}</p>
              <p style={{ fontSize: '24px', fontWeight: '600', color, margin: 0, fontFamily: 'var(--mono)', lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview table */}
      {searched && (
        <div style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
          <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
              Preview — {dateFrom} to {dateTo}
            </span>
          </div>
          {loading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>Loading...</p>
          ) : preview.length === 0 ? (
            <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>No records found for the selected range.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Employee', 'Date', 'Day', 'Schedule', 'Time In', 'Location', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.map(r => {
                    const dateObj = new Date(r.date + 'T12:00:00');
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <tr key={r.id}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{ transition: 'background 0.1s' }}
                      >
                        <td style={td}>
                          <p style={{ margin: '0 0 1px', fontWeight: '500' }}>{r.employees?.name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{r.employees?.email}</p>
                        </td>
                        <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px' }}>{r.date}</td>
                        <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{dayName}</td>
                        <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{formatTime(r.employees?.shift_start)}</td>
                        <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500' }}>{r.status === 'On Leave' ? 'N/A' : formatTime(r.time_in)}</td>
                        <td style={{ ...td, fontSize: '12px', color: 'var(--ink-2)' }}>{r.status === 'On Leave' ? 'N/A' : (r.work_location || '—')}</td>
                        <td style={td}><StatusBadge status={r.status} /></td>
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
        <div style={{ border: '1px solid var(--line)', background: 'var(--bg)', marginTop: '20px' }}>
          <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>Send Report by Email</span>
          </div>
          <div style={{ padding: '16px' }}>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--ink-3)' }}>
              Send the Excel report by email. Leave recipient blank to send to all employees.
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Recipient</label>
                <select value={emailRecipient} onChange={e => setEmailRecipient(e.target.value)} style={selectStyle}>
                  <option value="">All Employees</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Subject (optional)</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder={`Attendance Report — ${dateFrom === dateTo ? dateFrom : dateFrom + ' to ' + dateTo}`}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '2px', fontSize: '13px', color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending}
                style={{ padding: '9px 16px', border: '1px solid var(--ink)', background: 'var(--bg)', color: 'var(--ink)', fontSize: '12px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: sending ? 'not-allowed' : 'pointer', borderRadius: '2px', whiteSpace: 'nowrap' }}
              >
                ✉ {sending ? 'Sending...' : emailRecipient ? 'Send to Employee' : 'Send to All Employees'}
              </button>
            </div>
            {sendResult && (
              <div style={{ marginTop: '12px', borderLeft: '2px solid var(--present)', paddingLeft: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--present)', fontFamily: 'var(--mono)' }}>
                  Sent to {sendResult.sent_to} recipient{sendResult.sent_to !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
            {sendError && (
              <div style={{ marginTop: '12px', borderLeft: '2px solid var(--absent)', paddingLeft: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--absent)' }}>{sendError}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
