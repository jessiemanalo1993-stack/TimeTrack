import { useState } from 'react';
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

export default function EmployeeTimein() {
  const [email, setEmail] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api.timein(email.trim(), workLocation, leaveType || undefined);
      setResult(data);
      setEmail('');
      setWorkLocation('');
      setLeaveType('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Wordmark */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: '500', color: 'var(--ink)', letterSpacing: '0.04em', margin: 0 }}>
            TimeTrack
          </h1>
        </div>

        {/* Panel */}
        <div style={{ border: '1px solid var(--line)', background: 'var(--bg)', borderRadius: '2px' }}>
          {/* Panel header rule */}
          <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '14px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)' }}>
              {result ? 'Time-In Recorded' : 'This is a prototype'}
            </span>
          </div>

          <div style={{ padding: '24px 20px' }}>
            {result ? (
              <div>
                {/* Status indicator */}
                <div style={{
                  borderLeft: `3px solid ${result.status === 'Present' ? 'var(--present)' : 'var(--late)'}`,
                  paddingLeft: '14px',
                  marginBottom: '24px',
                }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', margin: '0 0 2px' }}>{result.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--mono)' }}>{result.email}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <StatusBadge status={result.status} />
                </div>

                {/* Details grid */}
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
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', fontFamily: mono ? 'var(--mono)' : 'var(--font)' }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {result.status === 'Late' && (
                  <p style={{ fontSize: '12px', color: 'var(--late)', marginTop: '16px', fontFamily: 'var(--mono)' }}>
                    ↑ Arrived after scheduled start time
                  </p>
                )}

                <button
                  onClick={() => setResult(null)}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--ink-2)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    fontFamily: 'var(--font)',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--ink)'; e.target.style.color = 'var(--ink)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink-2)'; }}
                >
                  Record another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoFocus
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Work Location
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {['Onsite', 'Work From Home', 'On Leave'].map(loc => {
                      const selected = workLocation === loc;
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => { setWorkLocation(loc); setLeaveType(''); }}
                          style={{
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
                          }}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {workLocation === 'On Leave' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Leave Type
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {['Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Other'].map(type => {
                        const selected = leaveType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setLeaveType(type)}
                            style={{
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
                            }}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !workLocation || (workLocation === 'On Leave' && !leaveType)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    border: '1px solid var(--ink)',
                    background: (loading || !email || !workLocation || (workLocation === 'On Leave' && !leaveType)) ? 'var(--line)' : 'var(--ink)',
                    color: (loading || !email || !workLocation || (workLocation === 'On Leave' && !leaveType)) ? 'var(--ink-3)' : 'var(--bg)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: (loading || !email || !workLocation || (workLocation === 'On Leave' && !leaveType)) ? 'not-allowed' : 'pointer',
                    borderRadius: '2px',
                    fontFamily: 'var(--mono)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                >
                  {loading ? 'Recording...' : 'Time In →'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-3)', marginTop: '20px', fontFamily: 'var(--mono)' }}>
          Admin?{' '}
          <a href="/admin/login" style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>
            Sign in to admin panel
          </a>
        </p>
      </div>
    </div>
  );
}
