import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function EmployeeLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fpMode, setFpMode] = useState('login'); // 'login' | 'request' | 'verify'
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNew, setFpNew] = useState('');
  const [fpConfirm, setFpConfirm] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');

  async function handleLogin(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await api.employeeLogin(email.trim(), password);
      localStorage.setItem('tt_employee', JSON.stringify({ name: data.name, email: data.email }));
      navigate('/portal');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleRequestReset(e) {
    e.preventDefault(); setFpError(''); setFpSuccess(''); setFpLoading(true);
    try {
      await api.requestPasswordReset(fpEmail.trim());
      setFpSuccess(`Code sent to ${fpEmail.trim()}. Check your inbox.`);
      setFpMode('verify');
    } catch (err) { setFpError(err.message); }
    finally { setFpLoading(false); }
  }

  async function handleResetPassword(e) {
    e.preventDefault(); setFpError('');
    if (fpNew !== fpConfirm) { setFpError('Passwords do not match'); return; }
    if (fpNew.length < 6) { setFpError('Password must be at least 6 characters'); return; }
    setFpLoading(true);
    try {
      await api.resetPassword(fpEmail.trim(), fpOtp.trim(), fpNew);
      setFpMode('login');
      setFpEmail(''); setFpOtp(''); setFpNew(''); setFpConfirm(''); setFpError('');
      setFpSuccess('Password reset. Sign in with your new password.');
    } catch (err) { setFpError(err.message); }
    finally { setFpLoading(false); }
  }

  function backToLogin() {
    setFpMode('login'); setFpError(''); setFpSuccess('');
    setFpEmail(''); setFpOtp(''); setFpNew(''); setFpConfirm('');
  }

  const modeLabel = { login: 'Employee Sign In', request: 'Reset Password', verify: 'Enter Reset Code' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
      <div className="bg-glow" />
      <div style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}>

        <div className="animate-fade-down" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 className="wordmark">Time<span style={{ color: 'var(--accent)' }}>Track</span></h1>
        </div>

        <div className="panel animate-rotate-in">
          <div className="panel-header accent-bar">
            <span className="panel-title">{modeLabel[fpMode]}</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', display: 'inline-block' }} />
          </div>

          {/* ── LOGIN ── */}
          {fpMode === 'login' && (
            <form onSubmit={handleLogin} style={{ padding: '24px 20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Work Email</label>
                <input className="dark-input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required autoFocus />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label className="field-label">Password</label>
                <input className="dark-input" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </div>
              <div style={{ marginBottom: '22px', textAlign: 'right' }}>
                <span onClick={() => { setFpMode('request'); setFpEmail(email); setFpError(''); setFpSuccess(''); }}
                  style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', cursor: 'pointer', letterSpacing: '0.04em', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>
                  Forgot password?
                </span>
              </div>

              {fpSuccess && <div className="msg-success"><p>{fpSuccess}</p></div>}
              {error && <div className="msg-error"><p>{error}</p></div>}

              <button type="submit" disabled={loading || !email || !password} className="btn-primary">
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          )}

          {/* ── REQUEST OTP ── */}
          {fpMode === 'request' && (
            <form onSubmit={handleRequestReset} style={{ padding: '24px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--ink-2)', marginBottom: '20px', fontFamily: 'var(--mono)', lineHeight: 1.6 }}>
                Enter your work email and we'll send a 6-digit reset code.
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label className="field-label">Work Email</label>
                <input className="dark-input" type="email" value={fpEmail}
                  onChange={e => setFpEmail(e.target.value)}
                  placeholder="you@company.com" required autoFocus />
              </div>
              {fpError && <div className="msg-error"><p>{fpError}</p></div>}
              <button type="submit" disabled={fpLoading || !fpEmail} className="btn-primary" style={{ marginBottom: '8px' }}>
                {fpLoading ? 'Sending…' : 'Send Reset Code →'}
              </button>
              <button type="button" onClick={backToLogin} className="btn-ghost">
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* ── VERIFY OTP ── */}
          {fpMode === 'verify' && (
            <form onSubmit={handleResetPassword} style={{ padding: '24px 20px' }}>
              {fpSuccess && <div className="msg-success"><p>{fpSuccess}</p></div>}
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Reset Code</label>
                <input className="dark-input" type="text"
                  value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" required autoFocus maxLength={6}
                  style={{ letterSpacing: '0.3em', fontSize: '20px', textAlign: 'center' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="field-label">New Password</label>
                <input className="dark-input" type="password" value={fpNew}
                  onChange={e => setFpNew(e.target.value)}
                  placeholder="Min 6 characters" required minLength={6} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="field-label">Confirm New Password</label>
                <input className="dark-input" type="password" value={fpConfirm}
                  onChange={e => setFpConfirm(e.target.value)}
                  placeholder="Repeat new password" required />
              </div>
              {fpError && <div className="msg-error"><p>{fpError}</p></div>}
              <button type="submit" disabled={fpLoading || !fpOtp || !fpNew || !fpConfirm} className="btn-primary" style={{ marginBottom: '8px' }}>
                {fpLoading ? 'Resetting…' : 'Set New Password →'}
              </button>
              <button type="button" onClick={() => { setFpMode('request'); setFpError(''); setFpSuccess(''); }} className="btn-ghost">
                Resend code
              </button>
            </form>
          )}
        </div>

        <p className="animate-fade-up" style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-3)', marginTop: '20px', fontFamily: 'var(--mono)', animationDelay: '0.4s' }}>
          Manager?{' '}
          <a href="/admin/login" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
            onMouseLeave={e => e.target.style.color = 'var(--ink-2)'}>
            Sign in to Manager Panel →
          </a>
        </p>
      </div>
    </div>
  );
}
