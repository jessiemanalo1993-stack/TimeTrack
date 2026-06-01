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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token } = await api.login(username, password);
      login(token);
      navigate('/admin');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1D2D3E 0%, #354A5E 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '380px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '96px', height: '96px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px', marginBottom: '14px', backdropFilter: 'blur(8px)' }}>
            <img src="/logo.png" alt="TimeTrack" style={{ width: '72px', height: '72px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            TimeTrack Console
          </h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Administrator Access
          </p>
        </div>

        {/* Card */}
        <div className="animate-rotate-in" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--sap-blue), #00A3FF)' }} />
          <div style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="sap-label">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  required autoFocus className="sap-input" placeholder="Enter username"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="sap-label">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required className="sap-input" placeholder="Enter password"
                />
              </div>

              {error && (
                <div className="animate-slide-down" style={{ background: 'var(--absent-bg)', border: '1px solid #f5b3b3', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--absent)' }}>⚠</span>
                  <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="sap-btn-primary" style={{ width: '100%', padding: '13px', fontSize: '14px' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '20px' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'underline' }}>
            ← Employee Time-In
          </a>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
