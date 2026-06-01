import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

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

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontFamily: 'var(--mono)',
  letterSpacing: '0.06em',
  color: 'var(--ink-2)',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

export default function EmployeeLogin() {
  const navigate = useNavigate();

  // login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // forgot password state — 'login' | 'request' | 'verify'
  const [fpMode, setFpMode] = useState('login');
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNew, setFpNew] = useState('');
  const [fpConfirm, setFpConfirm] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.employeeLogin(email.trim(), password);
      localStorage.setItem('tt_employee', JSON.stringify({ name: data.name, email: data.email }));
      navigate('/portal');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestReset(e) {
    e.preventDefault();
    setFpError(''); setFpSuccess('');
    setFpLoading(true);
    try {
      await api.requestPasswordReset(fpEmail.trim());
      setFpSuccess(`A 6-digit code was sent to ${fpEmail.trim()}. Check your inbox.`);
      setFpMode('verify');
    } catch (err) {
      setFpError(err.message);
    } finally {
      setFpLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setFpError('');
    if (fpNew !== fpConfirm) { setFpError('Passwords do not match'); return; }
    if (fpNew.length < 6) { setFpError('Password must be at least 6 characters'); return; }
    setFpLoading(true);
    try {
      await api.resetPassword(fpEmail.trim(), fpOtp.trim(), fpNew);
      // Reset complete — go back to login with a success nudge
      setFpMode('login');
      setFpEmail(''); setFpOtp(''); setFpNew(''); setFpConfirm('');
      setError('');
      setFpSuccess('Password reset successfully. Sign in with your new password.');
    } catch (err) {
      setFpError(err.message);
    } finally {
      setFpLoading(false);
    }
  }

  function backToLogin() {
    setFpMode('login');
    setFpError(''); setFpSuccess('');
    setFpEmail(''); setFpOtp(''); setFpNew(''); setFpConfirm('');
  }

  const loginDisabled = loading || !email || !password;
  const requestDisabled = fpLoading || !fpEmail;
  const resetDisabled = fpLoading || !fpOtp || !fpNew || !fpConfirm;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <div className="animate-fade-down" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: '500', color: 'var(--ink)', letterSpacing: '0.04em', margin: 0 }}>
            TimeTrack
          </h1>
        </div>

        <div className="animate-rotate-in" style={{ border: '1px solid var(--line)', background: 'var(--bg)', borderRadius: '2px' }}>
          <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '14px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
              {fpMode === 'login' ? 'Employee Sign In'
                : fpMode === 'request' ? 'Reset Password'
                : 'Enter Reset Code'}
            </span>
          </div>

          {/* ── LOGIN ── */}
          {fpMode === 'login' && (
            <form onSubmit={handleLogin} style={{ padding: '24px 20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Work Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required autoFocus style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
                <p style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', margin: '5px 0 0' }}>
                  <span
                    style={{ color: 'var(--ink-2)', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => { setFpMode('request'); setFpEmail(email); setFpError(''); setFpSuccess(''); }}
                  >Forgot password?</span>
                </p>
              </div>

              {fpSuccess && (
                <div style={{ borderLeft: '2px solid var(--present)', paddingLeft: '10px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--present)', margin: 0, fontFamily: 'var(--mono)' }}>{fpSuccess}</p>
                </div>
              )}
              {error && (
                <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loginDisabled}
                style={{ width: '100%', padding: '11px', border: '1px solid var(--ink)', background: loginDisabled ? 'var(--line)' : 'var(--ink)', color: loginDisabled ? 'var(--ink-3)' : 'var(--bg)', fontSize: '13px', fontWeight: '600', cursor: loginDisabled ? 'not-allowed' : 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          )}

          {/* ── REQUEST OTP ── */}
          {fpMode === 'request' && (
            <form onSubmit={handleRequestReset} style={{ padding: '24px 20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '20px', fontFamily: 'var(--mono)' }}>
                Enter your work email and we'll send a 6-digit reset code.
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Work Email</label>
                <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                  placeholder="you@company.com" required autoFocus style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>

              {fpError && (
                <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{fpError}</p>
                </div>
              )}

              <button type="submit" disabled={requestDisabled}
                style={{ width: '100%', padding: '11px', border: '1px solid var(--ink)', background: requestDisabled ? 'var(--line)' : 'var(--ink)', color: requestDisabled ? 'var(--ink-3)' : 'var(--bg)', fontSize: '13px', fontWeight: '600', cursor: requestDisabled ? 'not-allowed' : 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                {fpLoading ? 'Sending...' : 'Send Reset Code →'}
              </button>
              <button type="button" onClick={backToLogin}
                style={{ marginTop: '10px', width: '100%', padding: '9px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-3)', fontSize: '12px', cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.04em', transition: 'all 0.15s' }}>
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* ── VERIFY OTP + NEW PASSWORD ── */}
          {fpMode === 'verify' && (
            <form onSubmit={handleResetPassword} style={{ padding: '24px 20px' }}>
              {fpSuccess && (
                <div style={{ borderLeft: '2px solid var(--present)', paddingLeft: '10px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--present)', margin: 0, fontFamily: 'var(--mono)' }}>{fpSuccess}</p>
                </div>
              )}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Reset Code</label>
                <input type="text" value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code" required autoFocus maxLength={6}
                  style={{ ...inputStyle, letterSpacing: '0.2em', fontSize: '18px', textAlign: 'center' }}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={fpNew} onChange={e => setFpNew(e.target.value)}
                  placeholder="Min 6 characters" required minLength={6} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={fpConfirm} onChange={e => setFpConfirm(e.target.value)}
                  placeholder="Repeat new password" required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>

              {fpError && (
                <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{fpError}</p>
                </div>
              )}

              <button type="submit" disabled={resetDisabled}
                style={{ width: '100%', padding: '11px', border: '1px solid var(--ink)', background: resetDisabled ? 'var(--line)' : 'var(--ink)', color: resetDisabled ? 'var(--ink-3)' : 'var(--bg)', fontSize: '13px', fontWeight: '600', cursor: resetDisabled ? 'not-allowed' : 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                {fpLoading ? 'Resetting...' : 'Set New Password →'}
              </button>
              <button type="button" onClick={() => { setFpMode('request'); setFpError(''); setFpSuccess(''); }}
                style={{ marginTop: '10px', width: '100%', padding: '9px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-3)', fontSize: '12px', cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--mono)', letterSpacing: '0.04em', transition: 'all 0.15s' }}>
                Resend code
              </button>
            </form>
          )}
        </div>

        <p className="animate-fade-up" style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-3)', marginTop: '20px', fontFamily: 'var(--mono)', animationDelay: '0.4s' }}>
          Manager?{' '}
          <a href="/admin/login" style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>
            Sign in to Manager Panel
          </a>
        </p>
      </div>
    </div>
  );
}
