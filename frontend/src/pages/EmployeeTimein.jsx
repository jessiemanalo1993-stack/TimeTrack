import { useState } from 'react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function EmployeeTimein() {
  const [email, setEmail] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const data = await api.timein(email.trim(), workLocation, leaveType || undefined);
      setResult(data);
      setEmail(''); setWorkLocation(''); setLeaveType('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const disabled = loading || !email || !workLocation || (workLocation === 'On Leave' && !leaveType);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0040B0 0%, #0070F2 50%, #00A3FF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', background: 'rgba(255,255,255,0.15)', borderRadius: '18px', marginBottom: '14px', backdropFilter: 'blur(8px)' }}>
            <img src="/logo.png" alt="TimeTrack" style={{ width: '52px', height: '52px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font)', fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            TimeTrack
          </h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '500' }}>
            Prototype Time Tracking Application
          </p>
        </div>

        {/* Card */}
        <div className="animate-rotate-in" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

          {/* Card top accent */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--sap-blue), #00A3FF)' }} />

          <div style={{ padding: '28px 28px 24px' }}>
            {result ? (
              <div className="animate-scale-in">
                {/* Success header */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: result.status === 'On Leave' ? 'var(--leave-bg)' : result.status === 'Absent' ? 'var(--absent-bg)' : result.status === 'Late' ? 'var(--late-bg)' : 'var(--present-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke={result.status === 'Present' ? 'var(--present)' : result.status === 'Late' ? 'var(--late)' : result.status === 'On Leave' ? 'var(--leave)' : 'var(--absent)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ strokeDasharray: 50, strokeDashoffset: 0, animation: 'checkmark 0.4s ease 0.1s both' }}
                      />
                    </svg>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', margin: '0 0 2px' }}>{result.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: '0 0 12px', fontFamily: 'var(--mono)' }}>{result.email}</p>
                  <StatusBadge status={result.status} />
                </div>

                {/* Details */}
                <div style={{ background: 'var(--bg-2)', borderRadius: '8px', padding: '4px 0', marginBottom: '20px' }}>
                  {[
                    { label: 'Login Time', value: result.time_in_formatted },
                    { label: 'Scheduled Start', value: result.scheduled_start_formatted },
                    { label: 'Date', value: result.date },
                    ...(result.work_location ? [{ label: 'Location', value: result.work_location }] : []),
                    ...(result.leave_type ? [{ label: 'Leave Type', value: result.leave_type }] : []),
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                      <span style={{ fontSize: '12px', color: 'var(--ink-3)', fontWeight: '500' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)', fontFamily: 'var(--mono)' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {result.status === 'Late' && (
                  <div style={{ background: 'var(--late-bg)', border: '1px solid #fcd48a', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⏰</span>
                    <p style={{ fontSize: '12px', color: 'var(--late)', margin: 0, fontWeight: '500' }}>Arrived after scheduled start time</p>
                  </div>
                )}

                <button onClick={() => setResult(null)} className="sap-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                  Record another time-in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="animate-fade-in">
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
                  Record Attendance
                </h2>

                <div style={{ marginBottom: '18px' }}>
                  <label className="sap-label">Work Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com" required autoFocus className="sap-input"
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label className="sap-label">Work Location</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {[
                      { val: 'Onsite', icon: '🏢' },
                      { val: 'Work From Home', icon: '🏠' },
                      { val: 'On Leave', icon: '🌴' },
                    ].map(({ val, icon }) => {
                      const selected = workLocation === val;
                      return (
                        <button key={val} type="button" onClick={() => { setWorkLocation(val); setLeaveType(''); }}
                          style={{
                            padding: '12px 6px', border: selected ? '2px solid var(--sap-blue)' : '1px solid var(--line)',
                            background: selected ? 'var(--sap-blue-light)' : 'var(--bg)',
                            color: selected ? 'var(--sap-blue)' : 'var(--ink-2)',
                            fontSize: '11px', fontWeight: selected ? '600' : '400',
                            cursor: 'pointer', borderRadius: '8px', fontFamily: 'var(--font)',
                            transition: 'all 0.2s', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                          }}>
                          <span style={{ fontSize: '18px' }}>{icon}</span>
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {workLocation === 'On Leave' && (
                  <div className="animate-slide-down" style={{ marginBottom: '18px' }}>
                    <label className="sap-label">Leave Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {['Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Other'].map(type => {
                        const selected = leaveType === type;
                        return (
                          <button key={type} type="button" onClick={() => setLeaveType(type)}
                            style={{
                              padding: '10px 8px', border: selected ? '2px solid var(--sap-blue)' : '1px solid var(--line)',
                              background: selected ? 'var(--sap-blue-light)' : 'var(--bg)',
                              color: selected ? 'var(--sap-blue)' : 'var(--ink-2)',
                              fontSize: '12px', fontWeight: selected ? '600' : '400',
                              cursor: 'pointer', borderRadius: '8px', fontFamily: 'var(--font)',
                              transition: 'all 0.2s', textAlign: 'center',
                            }}>
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="animate-slide-down" style={{ background: 'var(--absent-bg)', border: '1px solid #f5b3b3', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--absent)', fontSize: '16px' }}>⚠</span>
                    <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={disabled} className="sap-btn-primary" style={{ width: '100%', fontSize: '14px', padding: '13px' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Recording...
                    </span>
                  ) : 'Time In →'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '20px' }}>
          Admin?{' '}
          <a href="/admin/login" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline', fontWeight: '500' }}>
            Sign in to console
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes checkmark { from { stroke-dashoffset: 50; } to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}
