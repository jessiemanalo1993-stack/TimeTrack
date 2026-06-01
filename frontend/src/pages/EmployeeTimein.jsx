import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: '2px',
  fontSize: '14px',
  color: 'var(--ink)',
  background: 'var(--bg)',
  outline: 'none',
  fontFamily: 'var(--font)',
  transition: 'border-color 0.15s',
};

const locationBtnStyle = (selected) => ({
  padding: '10px 8px',
  border: selected ? '1px solid var(--ink)' : '1px solid var(--line)',
  background: selected ? 'var(--ink)' : 'var(--bg)',
  color: selected ? 'var(--bg)' : 'var(--ink-2)',
  fontSize: '11px',
  cursor: 'pointer',
  borderRadius: '2px',
  fontFamily: 'var(--font)',
  fontWeight: selected ? '600' : '400',
  transition: 'all 0.15s',
  textAlign: 'center',
});

const todayManila = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

function getEmployee() {
  try { return JSON.parse(localStorage.getItem('tt_employee')); } catch { return null; }
}

export default function EmployeeTimein() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [mode, setMode] = useState('timein'); // 'timein' | 'timeout' | 'leave' | 'setpassword'

  // Time-in state
  const [workLocation, setWorkLocation] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Leave request state
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveRequestType, setLeaveRequestType] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveResult, setLeaveResult] = useState(null);
  const [leaveError, setLeaveError] = useState('');

  // Time-out state
  const [timeoutLoading, setTimeoutLoading] = useState(false);
  const [timeoutResult, setTimeoutResult] = useState(null);
  const [timeoutError, setTimeoutError] = useState('');

  // Set password state
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

  function signOut() {
    localStorage.removeItem('tt_employee');
    navigate('/');
  }

  function switchMode(m) {
    setMode(m);
    setError(''); setLeaveError(''); setTimeoutError(''); setSpError('');
    setResult(null); setLeaveResult(null); setTimeoutResult(null); setSpResult(null);
  }

  async function handleTimein(e) {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const data = await api.timein(employee.email, workLocation, leaveType || undefined);
      setResult(data);
      setWorkLocation(''); setLeaveType('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaveSubmit(e) {
    e.preventDefault();
    setLeaveError(''); setLeaveResult(null); setLeaveLoading(true);
    try {
      const data = await api.fileLeave({
        email: employee.email,
        date: leaveDate,
        leave_type: leaveRequestType,
        reason: leaveReason.trim() || undefined,
      });
      setLeaveResult(data);
      setLeaveDate(''); setLeaveRequestType(''); setLeaveReason('');
    } catch (err) {
      setLeaveError(err.message);
    } finally {
      setLeaveLoading(false);
    }
  }

  async function handleTimeout(e) {
    e.preventDefault();
    setTimeoutError(''); setTimeoutResult(null); setTimeoutLoading(true);
    try {
      const data = await api.timeout(employee.email);
      setTimeoutResult(data);
    } catch (err) {
      setTimeoutError(err.message);
    } finally {
      setTimeoutLoading(false);
    }
  }

  async function handleSetPassword(e) {
    e.preventDefault();
    setSpError(''); setSpResult(null);
    if (spNew !== spConfirm) { setSpError('New passwords do not match'); return; }
    if (spNew.length < 6) { setSpError('Password must be at least 6 characters'); return; }
    setSpLoading(true);
    try {
      const data = await api.setPassword({ email: employee.email, current_password: spCurrent || undefined, new_password: spNew });
      setSpResult(data);
      setSpCurrent(''); setSpNew(''); setSpConfirm('');
    } catch (err) {
      setSpError(err.message);
    } finally {
      setSpLoading(false);
    }
  }

  const timeinDisabled = loading || !workLocation || (workLocation === 'On Leave' && !leaveType);
  const leaveDisabled = leaveLoading || !leaveDate || !leaveRequestType;
  const timeoutDisabled = timeoutLoading;
  const spDisabled = spLoading || !spNew || !spConfirm;

  const hasAnyResult = result || leaveResult || timeoutResult || spResult;

  if (!employee) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Wordmark */}
        <div className="animate-fade-down" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: '500', color: 'var(--ink)', letterSpacing: '0.04em', margin: 0 }}>
            TimeTrack
          </h1>
        </div>

        {/* Panel */}
        <div className="animate-rotate-in" style={{ border: '1px solid var(--line)', background: 'var(--bg)', borderRadius: '2px' }}>
          {/* Panel header */}
          <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)', margin: 0 }}>{employee.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', margin: 0 }}>{employee.email}</p>
            </div>
            <button
              onClick={signOut}
              style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--ink-3)', background: 'none', border: '1px solid var(--line)', padding: '4px 10px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.04em', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.color = 'var(--ink)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink-3)'; }}
            >
              Sign Out
            </button>
          </div>

          {/* Status bar */}
          <div style={{ borderBottom: '1px solid var(--line)', padding: '8px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)' }}>
              {result ? 'Time-In Recorded'
                : timeoutResult ? 'Time-Out Recorded'
                : leaveResult ? 'Leave Submitted'
                : spResult ? 'Password Updated'
                : 'Employee Portal'}
            </span>
          </div>

          {/* Mode toggle */}
          {!hasAnyResult && (
            <div style={{ borderBottom: '1px solid var(--line)', padding: '12px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'timein', label: 'Time In' },
                { key: 'timeout', label: 'Time Out' },
                { key: 'leave', label: 'File Leave' },
                { key: 'setpassword', label: 'Set Password' },
              ].map(({ key, label }) => {
                const active = mode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchMode(key)}
                    style={{
                      padding: '6px 12px',
                      border: active ? '1px solid var(--ink)' : '1px solid var(--line)',
                      background: active ? 'var(--ink)' : 'var(--bg)',
                      color: active ? 'var(--bg)' : 'var(--ink-3)',
                      fontSize: '11px',
                      fontFamily: 'var(--mono)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ padding: '24px 20px' }}>

            {/* ── TIME IN form ── */}
            {mode === 'timein' && !result && (
              <form onSubmit={handleTimein}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px' }}>Work Location</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {['Onsite', 'Work From Home', 'On Leave'].map(loc => (
                      <button key={loc} type="button" onClick={() => { setWorkLocation(loc); setLeaveType(''); }}
                        style={locationBtnStyle(workLocation === loc)}>{loc}</button>
                    ))}
                  </div>
                </div>

                {workLocation === 'On Leave' && (
                  <div className="animate-slide-down" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px' }}>Leave Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {['Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Other'].map(type => (
                        <button key={type} type="button" onClick={() => setLeaveType(type)}
                          style={locationBtnStyle(leaveType === type)}>{type}</button>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={timeinDisabled}
                  style={{ width: '100%', padding: '11px', border: '1px solid var(--ink)', background: timeinDisabled ? 'var(--line)' : 'var(--ink)', color: timeinDisabled ? 'var(--ink-3)' : 'var(--bg)', fontSize: '13px', fontWeight: '600', cursor: timeinDisabled ? 'not-allowed' : 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                  {loading ? 'Recording...' : 'Time In →'}
                </button>
              </form>
            )}

            {/* ── TIME IN result ── */}
            {mode === 'timein' && result && (
              <div className="animate-fade-up">
                <div style={{ borderLeft: `3px solid ${result.status === 'Present' ? 'var(--present)' : 'var(--late)'}`, paddingLeft: '14px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>{result.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{result.email}</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <StatusBadge status={result.status} />
                </div>
                <div style={{ borderTop: '1px solid var(--line-2)' }}>
                  {[
                    { label: 'Login Time', value: result.time_in_formatted, mono: true },
                    { label: 'Scheduled Start', value: result.scheduled_start_formatted, mono: true },
                    { label: 'Date', value: result.date, mono: true },
                    ...(result.work_location ? [{ label: 'Location', value: result.work_location, mono: false }] : []),
                    ...(result.leave_type ? [{ label: 'Leave Type', value: result.leave_type, mono: false }] : []),
                  ].map(({ label, value, mono }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', fontFamily: mono ? 'var(--mono)' : 'var(--font)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                {result.status === 'Late' && (
                  <p style={{ fontSize: '12px', color: 'var(--late)', marginTop: '16px', fontFamily: 'var(--mono)' }}>↑ Arrived after scheduled start time</p>
                )}
                <button onClick={() => setResult(null)}
                  style={{ marginTop: '20px', width: '100%', padding: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-2)', fontSize: '13px', cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--font)', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.color = 'var(--ink)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink-2)'; }}>
                  Done
                </button>
              </div>
            )}

            {/* ── FILE LEAVE form ── */}
            {mode === 'leave' && !leaveResult && (
              <form onSubmit={handleLeaveSubmit} className="animate-slide-down">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>Leave Date</label>
                  <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)}
                    min={todayManila()} required
                    style={{ ...inputStyle, padding: '9px 10px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px' }}>Leave Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Other'].map(type => (
                      <button key={type} type="button" onClick={() => setLeaveRequestType(type)}
                        style={locationBtnStyle(leaveRequestType === type)}>{type}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Reason <span style={{ color: 'var(--ink-3)', fontWeight: '400' }}>(optional)</span>
                  </label>
                  <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
                    maxLength={300} rows={3} placeholder="Brief description..."
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>

                {leaveError && (
                  <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{leaveError}</p>
                  </div>
                )}

                <button type="submit" disabled={leaveDisabled}
                  style={{ width: '100%', padding: '11px', border: '1px solid var(--ink)', background: leaveDisabled ? 'var(--line)' : 'var(--ink)', color: leaveDisabled ? 'var(--ink-3)' : 'var(--bg)', fontSize: '13px', fontWeight: '600', cursor: leaveDisabled ? 'not-allowed' : 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                  {leaveLoading ? 'Submitting...' : 'Submit Leave Request →'}
                </button>
              </form>
            )}

            {/* ── FILE LEAVE result ── */}
            {mode === 'leave' && leaveResult && (
              <div className="animate-fade-up">
                <div style={{ borderLeft: '3px solid #4338ca', paddingLeft: '14px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>{leaveResult.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{leaveResult.email}</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <StatusBadge status="Pending" />
                </div>
                <div style={{ borderTop: '1px solid var(--line-2)' }}>
                  {[
                    { label: 'Leave Date', value: leaveResult.date, mono: true },
                    { label: 'Leave Type', value: leaveResult.leave_type, mono: false },
                    { label: 'Status', value: 'Pending Manager Approval', mono: false },
                  ].map(({ label, value, mono }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', fontFamily: mono ? 'var(--mono)' : 'var(--font)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '16px', fontFamily: 'var(--mono)' }}>
                  Your request will be reviewed by the manager.
                </p>
                <button onClick={() => setLeaveResult(null)}
                  style={{ marginTop: '20px', width: '100%', padding: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-2)', fontSize: '13px', cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--font)', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.color = 'var(--ink)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink-2)'; }}>
                  Done
                </button>
              </div>
            )}

            {/* ── TIME OUT form ── */}
            {mode === 'timeout' && !timeoutResult && (
              <form onSubmit={handleTimeout} className="animate-slide-down">
                <p style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '20px', fontFamily: 'var(--mono)' }}>
                  Recording time-out for <strong style={{ color: 'var(--ink)' }}>{employee.name}</strong>.
                </p>

                {timeoutError && (
                  <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{timeoutError}</p>
                  </div>
                )}

                <button type="submit" disabled={timeoutDisabled}
                  style={{ width: '100%', padding: '11px', border: '1px solid var(--ink)', background: timeoutDisabled ? 'var(--line)' : 'var(--ink)', color: timeoutDisabled ? 'var(--ink-3)' : 'var(--bg)', fontSize: '13px', fontWeight: '600', cursor: timeoutDisabled ? 'not-allowed' : 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                  {timeoutLoading ? 'Recording...' : 'Time Out →'}
                </button>
              </form>
            )}

            {/* ── TIME OUT result ── */}
            {mode === 'timeout' && timeoutResult && (
              <div className="animate-fade-up">
                <div style={{ borderLeft: '3px solid var(--ink)', paddingLeft: '14px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>{timeoutResult.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{timeoutResult.email}</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <StatusBadge status={timeoutResult.status} />
                </div>
                <div style={{ borderTop: '1px solid var(--line-2)' }}>
                  {[
                    { label: 'Time In', value: timeoutResult.time_in_formatted, mono: true },
                    { label: 'Time Out', value: timeoutResult.time_out_formatted, mono: true },
                    { label: 'Scheduled Start', value: timeoutResult.scheduled_start_formatted, mono: true },
                    { label: 'Scheduled End', value: timeoutResult.scheduled_end_formatted, mono: true },
                    { label: 'Date', value: timeoutResult.date, mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', fontFamily: mono ? 'var(--mono)' : 'var(--font)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setTimeoutResult(null)}
                  style={{ marginTop: '20px', width: '100%', padding: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-2)', fontSize: '13px', cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--font)', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.color = 'var(--ink)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink-2)'; }}>
                  Done
                </button>
              </div>
            )}

            {/* ── SET PASSWORD form ── */}
            {mode === 'setpassword' && !spResult && (
              <form onSubmit={handleSetPassword} className="animate-slide-down">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Current Password <span style={{ color: 'var(--ink-3)', fontWeight: '400' }}>(if already set)</span>
                  </label>
                  <input type="password" value={spCurrent} onChange={e => setSpCurrent(e.target.value)}
                    placeholder="Leave blank if setting for first time" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line)'}
                  />
                  <p style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', margin: '5px 0 0' }}>
                    If you forgot your current password, contact your manager to reset it.
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>New Password</label>
                  <input type="password" value={spNew} onChange={e => setSpNew(e.target.value)}
                    placeholder="Min 6 characters" required minLength={6} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>Confirm New Password</label>
                  <input type="password" value={spConfirm} onChange={e => setSpConfirm(e.target.value)}
                    placeholder="Repeat new password" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>

                {spError && (
                  <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{spError}</p>
                  </div>
                )}

                <button type="submit" disabled={spDisabled}
                  style={{ width: '100%', padding: '11px', border: '1px solid var(--ink)', background: spDisabled ? 'var(--line)' : 'var(--ink)', color: spDisabled ? 'var(--ink-3)' : 'var(--bg)', fontSize: '13px', fontWeight: '600', cursor: spDisabled ? 'not-allowed' : 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                  {spLoading ? 'Saving...' : 'Set Password →'}
                </button>
              </form>
            )}

            {/* ── SET PASSWORD result ── */}
            {mode === 'setpassword' && spResult && (
              <div className="animate-fade-up">
                <div style={{ borderLeft: '3px solid var(--present)', paddingLeft: '14px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 4px' }}>{spResult.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--present)', fontFamily: 'var(--mono)', margin: 0 }}>Password updated successfully</p>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '20px' }}>
                  Your password has been saved.
                </p>
                <button onClick={() => { setSpResult(null); switchMode('timein'); }}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-2)', fontSize: '13px', cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--font)', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.color = 'var(--ink)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink-2)'; }}>
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
