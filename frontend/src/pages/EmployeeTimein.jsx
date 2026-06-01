import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

const todayManila = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
function getEmployee() { try { return JSON.parse(localStorage.getItem('tt_employee')); } catch { return null; } }

export default function EmployeeTimein() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [mode, setMode] = useState('timein');

  const [workLocation, setWorkLocation] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [leaveDate, setLeaveDate] = useState('');
  const [leaveRequestType, setLeaveRequestType] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveResult, setLeaveResult] = useState(null);
  const [leaveError, setLeaveError] = useState('');

  const [timeoutLoading, setTimeoutLoading] = useState(false);
  const [timeoutResult, setTimeoutResult] = useState(null);
  const [timeoutError, setTimeoutError] = useState('');

  const [spCurrent, setSpCurrent] = useState('');
  const [spNew, setSpNew] = useState('');
  const [spConfirm, setSpConfirm] = useState('');
  const [spLoading, setSpLoading] = useState(false);
  const [spResult, setSpResult] = useState(null);
  const [spError, setSpError] = useState('');

  useEffect(() => {
    const emp = getEmployee();
    if (!emp) { navigate('/'); return; }
    setEmployee(emp);
  }, [navigate]);

  function signOut() { localStorage.removeItem('tt_employee'); navigate('/'); }

  function switchMode(m) {
    setMode(m);
    setError(''); setLeaveError(''); setTimeoutError(''); setSpError('');
    setResult(null); setLeaveResult(null); setTimeoutResult(null); setSpResult(null);
  }

  async function handleTimein(e) {
    e.preventDefault(); setError(''); setResult(null); setLoading(true);
    try {
      const data = await api.timein(employee.email, workLocation, leaveType || undefined);
      setResult(data); setWorkLocation(''); setLeaveType('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleLeaveSubmit(e) {
    e.preventDefault(); setLeaveError(''); setLeaveResult(null); setLeaveLoading(true);
    try {
      const data = await api.fileLeave({ email: employee.email, date: leaveDate, leave_type: leaveRequestType, reason: leaveReason.trim() || undefined });
      setLeaveResult(data); setLeaveDate(''); setLeaveRequestType(''); setLeaveReason('');
    } catch (err) { setLeaveError(err.message); }
    finally { setLeaveLoading(false); }
  }

  async function handleTimeout(e) {
    e.preventDefault(); setTimeoutError(''); setTimeoutResult(null); setTimeoutLoading(true);
    try {
      const data = await api.timeout(employee.email);
      setTimeoutResult(data);
    } catch (err) { setTimeoutError(err.message); }
    finally { setTimeoutLoading(false); }
  }

  async function handleSetPassword(e) {
    e.preventDefault(); setSpError(''); setSpResult(null);
    if (spNew !== spConfirm) { setSpError('Passwords do not match'); return; }
    if (spNew.length < 6) { setSpError('Password must be at least 6 characters'); return; }
    setSpLoading(true);
    try {
      const data = await api.setPassword({ email: employee.email, current_password: spCurrent || undefined, new_password: spNew });
      setSpResult(data); setSpCurrent(''); setSpNew(''); setSpConfirm('');
    } catch (err) { setSpError(err.message); }
    finally { setSpLoading(false); }
  }

  const hasAnyResult = result || leaveResult || timeoutResult || spResult;
  if (!employee) return null;

  const tabs = [
    { key: 'timein', label: 'Time In' },
    { key: 'timeout', label: 'Time Out' },
    { key: 'leave', label: 'File Leave' },
    { key: 'setpassword', label: 'Password' },
  ];

  const statusHeader = result ? 'Time-In Recorded' : timeoutResult ? 'Time-Out Recorded' : leaveResult ? 'Leave Submitted' : spResult ? 'Password Updated' : 'Employee Portal';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div className="bg-glow" />
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        <div className="animate-fade-down" style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 className="wordmark">Time<span style={{ color: 'var(--accent)' }}>Track</span></h1>
        </div>

        <div className="panel animate-rotate-in">
          {/* Header */}
          <div className="panel-header accent-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: '600', color: 'var(--accent)' }}>
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}>{employee.name}</p>
                <p style={{ fontSize: '10px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', margin: 0 }}>{employee.email}</p>
              </div>
            </div>
            <button onClick={signOut} style={{
              fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--ink-3)',
              background: 'none', border: '1px solid var(--line)', padding: '4px 10px',
              cursor: 'pointer', borderRadius: '6px', letterSpacing: '0.06em',
              textTransform: 'uppercase', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.color = 'var(--absent)'; e.target.style.borderColor = 'rgba(244,63,94,0.3)'; }}
            onMouseLeave={e => { e.target.style.color = 'var(--ink-3)'; e.target.style.borderColor = 'var(--line)'; }}
            >
              Sign Out
            </button>
          </div>

          {/* Status bar */}
          <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--line)', background: 'var(--base-2)' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
              {statusHeader}
            </span>
          </div>

          {/* Tabs */}
          {!hasAnyResult && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
              <div className="tab-group">
                {tabs.map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => switchMode(key)}
                    className={`tab-btn${mode === key ? ' active' : ''}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '24px 20px' }}>

            {/* ── TIME IN ── */}
            {mode === 'timein' && !result && (
              <form onSubmit={handleTimein} className="animate-slide-down">
                <div style={{ marginBottom: '20px' }}>
                  <label className="field-label">Work Location</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {['Onsite', 'Work From Home', 'On Leave'].map(loc => (
                      <button key={loc} type="button" onClick={() => { setWorkLocation(loc); setLeaveType(''); }}
                        className={`option-btn${workLocation === loc ? ' selected' : ''}`}>{loc}</button>
                    ))}
                  </div>
                </div>
                {workLocation === 'On Leave' && (
                  <div style={{ marginBottom: '20px' }} className="animate-slide-down">
                    <label className="field-label">Leave Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {['Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Other'].map(type => (
                        <button key={type} type="button" onClick={() => setLeaveType(type)}
                          className={`option-btn${leaveType === type ? ' selected' : ''}`}>{type}</button>
                      ))}
                    </div>
                  </div>
                )}
                {error && <div className="msg-error"><p>{error}</p></div>}
                <button type="submit" disabled={loading || !workLocation || (workLocation === 'On Leave' && !leaveType)} className="btn-primary">
                  {loading ? 'Recording…' : 'Time In →'}
                </button>
              </form>
            )}

            {/* TIME IN result */}
            {mode === 'timein' && result && (
              <div className="animate-fade-up">
                <div style={{ borderLeft: `2px solid ${result.status === 'Present' ? 'var(--present)' : 'var(--late)'}`, paddingLeft: '14px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>{result.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{result.email}</p>
                </div>
                <div style={{ marginBottom: '16px' }}><StatusBadge status={result.status} /></div>
                <div style={{ borderTop: '1px solid var(--line-2)' }}>
                  {[
                    { label: 'Login Time', value: result.time_in_formatted },
                    { label: 'Scheduled Start', value: result.scheduled_start_formatted },
                    { label: 'Date', value: result.date },
                    ...(result.work_location ? [{ label: 'Location', value: result.work_location }] : []),
                    ...(result.leave_type ? [{ label: 'Leave Type', value: result.leave_type }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{label}</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--ink)', fontFamily: 'var(--mono)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                {result.status === 'Late' && <p style={{ fontSize: '11px', color: 'var(--late)', marginTop: '14px', fontFamily: 'var(--mono)' }}>↑ Arrived after scheduled start time</p>}
                <button onClick={() => setResult(null)} className="btn-ghost" style={{ marginTop: '18px' }}>Done</button>
              </div>
            )}

            {/* ── FILE LEAVE ── */}
            {mode === 'leave' && !leaveResult && (
              <form onSubmit={handleLeaveSubmit} className="animate-slide-down">
                <div style={{ marginBottom: '16px' }}>
                  <label className="field-label">Leave Date</label>
                  <input className="dark-input" type="date" value={leaveDate}
                    onChange={e => setLeaveDate(e.target.value)} min={todayManila()} required
                    style={{ padding: '10px 14px' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label className="field-label">Leave Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Other'].map(type => (
                      <button key={type} type="button" onClick={() => setLeaveRequestType(type)}
                        className={`option-btn${leaveRequestType === type ? ' selected' : ''}`}>{type}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="field-label">Reason <span style={{ color: 'var(--ink-4)' }}>(optional)</span></label>
                  <textarea className="dark-input" value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
                    maxLength={300} rows={3} placeholder="Brief description…"
                    style={{ resize: 'vertical', minHeight: '72px' }} />
                </div>
                {leaveError && <div className="msg-error"><p>{leaveError}</p></div>}
                <button type="submit" disabled={leaveLoading || !leaveDate || !leaveRequestType} className="btn-primary">
                  {leaveLoading ? 'Submitting…' : 'Submit Leave Request →'}
                </button>
              </form>
            )}

            {/* LEAVE result */}
            {mode === 'leave' && leaveResult && (
              <div className="animate-fade-up">
                <div style={{ borderLeft: '2px solid var(--on-leave)', paddingLeft: '14px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>{leaveResult.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{leaveResult.email}</p>
                </div>
                <div style={{ marginBottom: '16px' }}><StatusBadge status="Pending" /></div>
                <div style={{ borderTop: '1px solid var(--line-2)' }}>
                  {[
                    { label: 'Leave Date', value: leaveResult.date },
                    { label: 'Leave Type', value: leaveResult.leave_type },
                    { label: 'Status', value: 'Pending Manager Approval' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{label}</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--ink)', fontFamily: 'var(--mono)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setLeaveResult(null)} className="btn-ghost" style={{ marginTop: '18px' }}>Done</button>
              </div>
            )}

            {/* ── TIME OUT ── */}
            {mode === 'timeout' && !timeoutResult && (
              <form onSubmit={handleTimeout} className="animate-slide-down">
                <div style={{ padding: '16px', background: 'var(--base-2)', borderRadius: '8px', border: '1px solid var(--line)', marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', margin: '0 0 4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recording time-out for</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)', margin: 0 }}>{employee.name}</p>
                </div>
                {timeoutError && <div className="msg-error"><p>{timeoutError}</p></div>}
                <button type="submit" disabled={timeoutLoading} className="btn-primary">
                  {timeoutLoading ? 'Recording…' : 'Time Out →'}
                </button>
              </form>
            )}

            {/* TIME OUT result */}
            {mode === 'timeout' && timeoutResult && (
              <div className="animate-fade-up">
                <div style={{ borderLeft: '2px solid var(--ink-2)', paddingLeft: '14px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>{timeoutResult.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{timeoutResult.email}</p>
                </div>
                <div style={{ marginBottom: '16px' }}><StatusBadge status={timeoutResult.status} /></div>
                <div style={{ borderTop: '1px solid var(--line-2)' }}>
                  {[
                    { label: 'Time In', value: timeoutResult.time_in_formatted },
                    { label: 'Time Out', value: timeoutResult.time_out_formatted },
                    { label: 'Scheduled Start', value: timeoutResult.scheduled_start_formatted },
                    { label: 'Scheduled End', value: timeoutResult.scheduled_end_formatted },
                    { label: 'Date', value: timeoutResult.date },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{label}</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--ink)', fontFamily: 'var(--mono)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setTimeoutResult(null)} className="btn-ghost" style={{ marginTop: '18px' }}>Done</button>
              </div>
            )}

            {/* ── SET PASSWORD ── */}
            {mode === 'setpassword' && !spResult && (
              <form onSubmit={handleSetPassword} className="animate-slide-down">
                <div style={{ marginBottom: '16px' }}>
                  <label className="field-label">Current Password <span style={{ color: 'var(--ink-4)' }}>(if already set)</span></label>
                  <input className="dark-input" type="password" value={spCurrent}
                    onChange={e => setSpCurrent(e.target.value)}
                    placeholder="Leave blank if setting for first time" />
                  <p style={{ fontSize: '10px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', margin: '6px 0 0', letterSpacing: '0.04em' }}>
                    Forgot your password? Contact your manager to reset it.
                  </p>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label className="field-label">New Password</label>
                  <input className="dark-input" type="password" value={spNew}
                    onChange={e => setSpNew(e.target.value)}
                    placeholder="Min 6 characters" required minLength={6} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="field-label">Confirm New Password</label>
                  <input className="dark-input" type="password" value={spConfirm}
                    onChange={e => setSpConfirm(e.target.value)}
                    placeholder="Repeat new password" required />
                </div>
                {spError && <div className="msg-error"><p>{spError}</p></div>}
                <button type="submit" disabled={spLoading || !spNew || !spConfirm} className="btn-primary">
                  {spLoading ? 'Saving…' : 'Set Password →'}
                </button>
              </form>
            )}

            {/* SET PASSWORD result */}
            {mode === 'setpassword' && spResult && (
              <div className="animate-fade-up">
                <div style={{ borderLeft: '2px solid var(--present)', paddingLeft: '14px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 4px' }}>{spResult.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--present)', fontFamily: 'var(--mono)', margin: 0 }}>Password updated successfully</p>
                </div>
                <button onClick={() => { setSpResult(null); switchMode('timein'); }} className="btn-ghost">
                  Go to Time In
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
