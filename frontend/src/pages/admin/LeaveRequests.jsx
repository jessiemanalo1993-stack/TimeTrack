import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

const selectStyle = {
  padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '8px',
  fontSize: '12px', color: 'var(--ink)', background: 'var(--surface)',
  fontFamily: 'var(--mono)', outline: 'none', letterSpacing: '0.03em',
  cursor: 'pointer', transition: 'border-color 0.15s',
};

export default function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { api.getEmployees().then(setEmployees); }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (employeeFilter) params.employee_id = employeeFilter;
    api.getLeaveRequests(params).then(setRequests).finally(() => setLoading(false));
  }, [statusFilter, employeeFilter]);

  async function handleApprove(id) {
    setActionLoading(id);
    try {
      const updated = await api.approveLeave(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  }

  async function handleReject(id) {
    setActionLoading(id);
    try {
      const updated = await api.rejectLeave(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  }

  const counts = {
    total: requests.length,
    Pending: requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  const stats = [
    { label: 'Total', value: counts.total, color: 'var(--ink)', accent: 'var(--accent)' },
    { label: 'Pending', value: counts.Pending, color: 'var(--late)', accent: 'var(--late)' },
    { label: 'Approved', value: counts.Approved, color: 'var(--present)', accent: 'var(--present)' },
    { label: 'Rejected', value: counts.Rejected, color: 'var(--absent)', accent: 'var(--absent)' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }} className="page-wrap">

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 6px' }}>Approvals</p>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>Leave Requests</h1>
        <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>Review and approve employee leave requests.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}
        className="stat-grid">
        {stats.map(({ label, value, color, accent }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <p style={{ fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: 0 }}>{label}</p>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: '2px', boxShadow: `0 0 8px ${accent}` }} />
            </div>
            <p style={{ fontSize: '36px', fontWeight: '600', color, margin: 0, fontFamily: 'var(--mono)', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters panel */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="panel-header accent-bar">
          <span className="panel-title">Filters</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }} className="filter-row">
          <div>
            <label className="field-label">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
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

      {/* Table panel */}
      <div className="panel">
        <div className="panel-header accent-bar">
          <span className="panel-title">Leave Requests</span>
        </div>
        {loading ? (
          <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>Loading...</p>
        ) : requests.length === 0 ? (
          <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>No leave requests found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }} className="table-scroll">
            <table className="dark-table">
              <thead>
                <tr>
                  {['Employee', 'Date', 'Day', 'Leave Type', 'Reason', 'Filed On', 'Status', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const dateObj = new Date(r.date + 'T12:00:00');
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const filedOn = new Date(r.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                  const isPending = r.status === 'Pending';
                  const isActioning = actionLoading === r.id;
                  return (
                    <tr key={r.id}>
                      <td>
                        <p style={{ margin: '0 0 2px', fontWeight: '500', color: 'var(--ink)' }}>{r.employees?.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{r.employees?.email}</p>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{r.date}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{dayName}</td>
                      <td style={{ fontSize: '12px' }}>{r.leave_type}</td>
                      <td style={{ fontSize: '12px', color: 'var(--ink-2)', maxWidth: '160px' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.reason || '—'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{filedOn}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleApprove(r.id)} disabled={isActioning} style={{
                              padding: '4px 12px', border: '1px solid rgba(0,229,160,0.3)', borderRadius: '6px',
                              background: 'var(--present-dim)', color: 'var(--present)',
                              fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.05em',
                              cursor: isActioning ? 'not-allowed' : 'pointer', opacity: isActioning ? 0.5 : 1,
                              transition: 'all 0.15s',
                            }}>
                              {isActioning ? '...' : 'Approve'}
                            </button>
                            <button onClick={() => handleReject(r.id)} disabled={isActioning} style={{
                              padding: '4px 12px', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '6px',
                              background: 'var(--absent-dim)', color: 'var(--absent)',
                              fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.05em',
                              cursor: isActioning ? 'not-allowed' : 'pointer', opacity: isActioning ? 0.5 : 1,
                              transition: 'all 0.15s',
                            }}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
