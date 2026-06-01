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
      login(token); navigate('/admin');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const disabled = loading || !username || !password;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
      <div className="bg-glow" />
      <div style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1 }}>

        <div className="animate-fade-down" style={{ marginBottom: '36px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Manager Panel
          </p>
          <h1 className="wordmark">
            Time<span style={{ color: 'var(--accent)' }}>Track</span>
          </h1>
        </div>

        <div className="panel animate-rotate-in">
          <div className="panel-header accent-bar">
            <span className="panel-title">Sign In</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', display: 'inline-block' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px 20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className="field-label">Username</label>
              <input className="dark-input" type="text" value={username}
                onChange={e => setUsername(e.target.value)} required autoFocus
                placeholder="admin" />
            </div>
            <div style={{ marginBottom: '22px' }}>
              <label className="field-label">Password</label>
              <input className="dark-input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" />
            </div>

            {error && (
              <div className="msg-error"><p>{error}</p></div>
            )}

            <button type="submit" disabled={disabled} className="btn-primary">
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="animate-fade-up" style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-3)', marginTop: '20px', fontFamily: 'var(--mono)', animationDelay: '0.4s' }}>
          <a href="/" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>
            ← Employee Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
