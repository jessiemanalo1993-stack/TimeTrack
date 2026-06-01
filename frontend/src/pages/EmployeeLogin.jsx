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

export default function EmployeeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
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

  const disabled = loading || !email || !password;

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
              Employee Sign In
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px 20px' }}>
            <div style={{ marginBottom: '14px' }}>
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
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />
              <p style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', margin: '5px 0 0' }}>
                Forgot password? Contact your manager.
              </p>
            </div>

            {error && (
              <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--absent)', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={disabled}
              style={{
                width: '100%',
                padding: '11px',
                border: '1px solid var(--ink)',
                background: disabled ? 'var(--line)' : 'var(--ink)',
                color: disabled ? 'var(--ink-3)' : 'var(--bg)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: disabled ? 'not-allowed' : 'pointer',
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
          Manager?{' '}
          <a href="/admin/login" style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>
            Sign in to Manager Panel
          </a>
        </p>
      </div>
    </div>
  );
}
