import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.login(username, password);
      login(token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <div className="animate-fade-down" style={{ marginBottom: '36px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Manager Panel
          </p>
          <h1 style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: '500', color: 'var(--ink)', letterSpacing: '0.04em', margin: 0 }}>
            TimeTrack
          </h1>
        </div>

        <div className="animate-rotate-in" style={{ border: '1px solid var(--line)', background: 'var(--bg)', borderRadius: '2px' }}>
          <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '14px 20px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
              Sign In
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px 20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />
            </div>

            {error && (
              <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                border: '1px solid var(--ink)',
                background: loading ? 'var(--line)' : 'var(--ink)',
                color: loading ? 'var(--ink-3)' : 'var(--bg)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '2px',
                fontFamily: 'var(--mono)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="animate-fade-up" style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-3)', marginTop: '20px', fontFamily: 'var(--mono)', animationDelay: '0.4s' }}>
          <a href="/" style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>
            ← Employee Time-In
          </a>
        </p>
      </div>
    </div>
  );
}
