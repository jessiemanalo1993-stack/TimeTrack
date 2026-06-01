import { useEffect, useState } from 'react';
import { api } from '../../api';
import StatusBadge from '../../components/StatusBadge';

const th = { padding: '10px 16px', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', fontWeight: '500' };
const td = { padding: '11px 16px', fontSize: '13px', color: 'var(--ink)', borderBottom: '1px solid var(--line-2)', verticalAlign: 'middle' };
const selectStyle = { padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '2px', fontSize: '13px', color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'var(--font)', outline: 'none' };

export default function LeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of request being actioned

  useEffect(() => {
    api.getEmployees().then(setEmployees);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (employeeFilter) params.employee_id = employeeFilter;
    api.getLeaveRequests(params)
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [statusFilter, employeeFilter]);

  async function handleApprove(id) {
    setActionLoading(id);
    try {
      const updated = await api.approveLeave(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    setActionLoading(id);
    try {
      const updated = await api.rejectLeave(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const counts = {
    total: requests.length,
    Pending: requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 4px' }}>Approvals</p>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>Leave Requests</h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: 0 }}>Review and approve employee leave requests.</p>
      </div>

      {/* Filters */}
      <div style={{ border: '1px solid var(--line)', background: 'var(--bg)', marginBottom: '20px' }}>
        <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>Filters</span>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Employee</label>
            <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} style={selectStyle}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)', marginBottom: '16px' }}
        className="sm:grid-cols-4">
        {[
          { label: 'Total', value: counts.total, color: 'var(--ink)' },
          { label: 'Pending', value: counts.Pending, color: 'var(--late)' },
          { label: 'Approved', value: counts.Approved, color: 'var(--present)' },
          { label: 'Rejected', value: counts.Rejected, color: 'var(--absent)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg)', padding: '12px 20px' }}>
            <p style={{ fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 4px' }}>{label}</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color, margin: 0, fontFamily: 'var(--mono)', lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
        <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
            Leave Requests
          </span>
        </div>
        {loading ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>Loading...</p>
        ) : requests.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>No leave requests found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Employee', 'Date', 'Day', 'Leave Type', 'Reason', 'Filed On', 'Status', 'Actions'].map(h => (
                    <th key={h} style={th}>{h}</th>
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
                      <td style={{ ...td, fontSize: '12px' }}>{r.leave_type}</td>
                      <td style={{ ...td, fontSize: '12px', color: 'var(--ink-2)', maxWidth: '160px' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.reason || '—'}
                        </span>
                      </td>
                      <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{filedOn}</td>
                      <td style={td}><StatusBadge status={r.status} /></td>
                      <td style={td}>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={isActioning}
                              style={{ padding: '5px 10px', border: '1px solid var(--present)', background: 'var(--bg)', color: 'var(--present)', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: isActioning ? 'not-allowed' : 'pointer', borderRadius: '2px', opacity: isActioning ? 0.5 : 1 }}
                            >
                              {isActioning ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              disabled={isActioning}
                              style={{ padding: '5px 10px', border: '1px solid var(--absent)', background: 'var(--bg)', color: 'var(--absent)', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.04em', textTransform: 'uppercase', cursor: isActioning ? 'not-allowed' : 'pointer', borderRadius: '2px', opacity: isActioning ? 0.5 : 1 }}
                            >
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
