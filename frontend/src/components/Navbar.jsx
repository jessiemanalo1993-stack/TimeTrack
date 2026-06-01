import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navLinks = [
  { to: '/admin',             label: 'Dashboard' },
  { to: '/admin/employees',   label: 'Employees' },
  { to: '/admin/attendance',  label: 'Attendance' },
  { to: '/admin/leave',       label: 'Leave' },
  { to: '/admin/reports',     label: 'Reports' },
];

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() { logout(); navigate('/admin/login'); }

  return (
    <nav style={{
      borderBottom: '1px solid var(--line)',
      background: 'rgba(17,19,24,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '54px' }}>

          {/* Wordmark */}
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '13px', letterSpacing: '0.1em',
            color: 'var(--ink)', fontWeight: '500', textTransform: 'uppercase',
          }}>
            Time<span style={{ color: 'var(--accent)' }}>Track</span>
          </span>

          {/* Desktop links */}
          <div className="hidden sm:flex" style={{ gap: '2px' }}>
            {navLinks.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} style={{
                  fontSize: '12px',
                  fontFamily: 'var(--mono)',
                  letterSpacing: '0.06em',
                  color: active ? 'var(--ink)' : 'var(--ink-3)',
                  background: active ? 'var(--glass-bg)' : 'transparent',
                  border: active ? '1px solid var(--line)' : '1px solid transparent',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  display: 'flex', alignItems: 'center',
                  fontWeight: active ? '500' : '400',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={e => { if (!active) { e.target.style.color = 'var(--ink-2)'; } }}
                onMouseLeave={e => { if (!active) { e.target.style.color = 'var(--ink-3)'; } }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handleLogout} className="hidden sm:block" style={{
              fontSize: '10px', color: 'var(--ink-3)', fontFamily: 'var(--mono)',
              letterSpacing: '0.08em', background: 'none', border: '1px solid var(--line)',
              cursor: 'pointer', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '6px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.color = 'var(--absent)'; e.target.style.borderColor = 'rgba(244,63,94,0.3)'; }}
            onMouseLeave={e => { e.target.style.color = 'var(--ink-3)'; e.target.style.borderColor = 'var(--line)'; }}
            >
              Sign out
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} className="sm:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: 'block', width: '18px', height: '1.5px', background: 'var(--ink-2)',
                  transition: 'all 0.2s',
                  transform: menuOpen ? (i === 0 ? 'rotate(45deg) translate(4px,4px)' : i === 2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none') : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden" style={{ borderTop: '1px solid var(--line)', background: 'var(--base-2)', padding: '8px' }}>
          {navLinks.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                display: 'block', padding: '12px 16px', fontSize: '12px',
                fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
                color: active ? 'var(--accent)' : 'var(--ink-2)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                borderRadius: '8px', marginBottom: '2px',
                textDecoration: 'none', transition: 'all 0.15s',
              }}>
                {label}
              </Link>
            );
          })}
          <button onClick={handleLogout} style={{
            display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left',
            fontSize: '11px', color: 'var(--absent)', fontFamily: 'var(--mono)', letterSpacing: '0.06em',
            background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase',
            borderRadius: '8px', marginTop: '4px',
          }}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
