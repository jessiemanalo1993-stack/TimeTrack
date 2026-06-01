import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showRequest, setShowRequest] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqUsername, setReqUsername] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState('');
  const [reqDone, setReqDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token } = await api.login(username, password);
      login(token); navigate('/admin');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleRequestAccess(e) {
    e.preventDefault();
    setReqError(''); setReqLoading(true);
    try {
      await api.requestAccess({ name: reqName, username: reqUsername, reason: reqReason });
      setReqDone(true);
    } catch (err) { setReqError(err.message); }
    finally { setReqLoading(false); }
  }

  function closeRequest() {
    setShowRequest(false); setReqDone(false);
    setReqName(''); setReqUsername(''); setReqReason(''); setReqError('');
  }

  const disabled = loading || !username || !password;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div className="orb orb-violet" style={{ width: 450, height: 450, top: '-20%', right: '-15%', opacity: 0.35 }} />
      <div className="orb orb-pink"   style={{ width: 300, height: 300, bottom: '-15%', left: '-10%', opacity: 0.25 }} />

      <div style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="animate-fade-down" style={{ marginBottom: '36px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Manager Panel
          </p>
          <h1 className="wordmark" style={{ fontSize: '28px' }}>
            Time<span className="grad-text">Track</span>
          </h1>
        </div>

        <div className="panel animate-rotate-in">
          <div style={{ height: '3px', background: 'var(--hero-gradient)' }} />

          <div className="panel-header" style={{ borderTop: 'none' }}>
            <span className="panel-title">Sign In</span>
            <span className="animate-pulse-glow" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px 22px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className="field-label">Username</label>
              <input className="dark-input" type="text" value={username}
                onChange={e => setUsername(e.target.value)} required autoFocus
                placeholder="admin" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label className="field-label">Password</label>
              <input className="dark-input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" />
            </div>

            {error && <div className="msg-error"><p>{error}</p></div>}

            <button type="submit" disabled={disabled} className="btn-primary">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="animate-fade-up" style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', animationDelay: '0.4s' }}>
          <button onClick={() => setShowRequest(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = '#c084fc'}
            onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>
            Request Manager Access →
          </button>
          <a href="/" style={{ fontSize: '11px', color: 'var(--ink-2)', textDecoration: 'none', fontFamily: 'var(--mono)', transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = '#c084fc'}
            onMouseLeave={e => e.target.style.color = 'var(--ink-2)'}>
            ← Employee Sign In
          </a>
        </div>
      </div>

      {/* Request Access Modal */}
      {showRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ height: '3px', background: 'var(--hero-gradient)' }} />
            <div className="panel-header" style={{ borderTop: 'none' }}>
              <span className="panel-title">Request Manager Access</span>
              <button onClick={closeRequest} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--ink-3)', lineHeight: 1 }}>×</button>
            </div>
            {reqDone ? (
              <div style={{ padding: '32px 22px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '12px' }}>✓</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)', marginBottom: '6px' }}>Request Submitted</p>
                <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '24px', lineHeight: 1.6 }}>Your request has been sent to the admin for review.</p>
                <button onClick={closeRequest} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} style={{ padding: '24px 22px' }}>
                <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '20px', lineHeight: 1.6 }}>
                  Fill out the form below. The admin will review your request and set up your account.
                </p>
                <div style={{ marginBottom: '14px' }}>
                  <label className="field-label">Full Name *</label>
                  <input type="text" required value={reqName} onChange={e => setReqName(e.target.value)} className="dark-input" placeholder="e.g. Jane Santos" />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label className="field-label">Desired Username *</label>
                  <input type="text" required value={reqUsername} onChange={e => setReqUsername(e.target.value)} className="dark-input" placeholder="e.g. jane.santos" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="field-label">Reason <span style={{ color: 'var(--ink-3)', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <textarea value={reqReason} onChange={e => setReqReason(e.target.value)} rows={3} placeholder="Why do you need manager access?" className="dark-input" style={{ resize: 'none', height: 'auto' }} />
                </div>
                {reqError && <div className="msg-error" style={{ marginBottom: '14px' }}><p>{reqError}</p></div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button type="button" onClick={closeRequest} className="btn-ghost">Cancel</button>
                  <button type="submit" disabled={reqLoading} className="btn-primary">{reqLoading ? 'Submitting…' : 'Submit Request'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
