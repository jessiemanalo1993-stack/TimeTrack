import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '../api';

const navLinks = [
  { to: '/admin',             label: 'Dashboard' },
  { to: '/admin/employees',   label: 'Employees' },
  { to: '/admin/attendance',  label: 'Attendance' },
  { to: '/admin/leave',       label: 'Leave' },
  { to: '/admin/reports',     label: 'Reports' },
  { to: '/admin/managers',    label: 'Managers' },
];

export default function Navbar() {
  const { logout, username, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getManagerRequests()
      .then(reqs => setPendingCount(reqs.filter(r => r.status === 'Pending').length))
      .catch(() => setPendingCount(0));
  }, [isAuthenticated, pathname]);

  function handleLogout() { logout(); navigate('/admin/login'); }

  return (
    <nav style={{
      borderBottom: '1px solid var(--line)',
      background: 'rgba(20,22,39,0.9)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px' }}>

          {/* Wordmark */}
          <span className="wordmark">
            Time<span className="grad-text">Track</span>
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
                  background: active
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.12) 100%)'
                    : 'transparent',
                  border: active ? '1px solid rgba(168,85,247,0.25)' : '1px solid transparent',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center',
                  fontWeight: active ? '500' : '400',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  boxShadow: active ? '0 0 14px rgba(168,85,247,0.12)' : 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--ink-2)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--ink-3)'; }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Bell notification icon — desktop only */}
            {pendingCount > 0 && (
              <button
                onClick={() => navigate('/admin/managers')}
                className="hidden sm:flex"
                title={`${pendingCount} pending manager request${pendingCount !== 1 ? 's' : ''}`}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span style={{
                  position: 'absolute', top: '2px', right: '2px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#f87171', color: '#fff',
                  fontSize: '9px', fontFamily: 'var(--mono)', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid rgba(20,22,39,0.9)',
                  boxShadow: '0 0 6px rgba(248,113,113,0.6)',
                  lineHeight: 1,
                }}>
                  {pendingCount}
                </span>
              </button>
            )}

            <button onClick={handleLogout} className="hidden sm:block" style={{
              fontSize: '10px', color: 'var(--ink-3)', fontFamily: 'var(--mono)',
              letterSpacing: '0.08em', background: 'none',
              border: '1px solid var(--line)',
              cursor: 'pointer', textTransform: 'uppercase', padding: '6px 14px',
              borderRadius: '10px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.color = 'var(--absent)';
              e.target.style.borderColor = 'rgba(248,113,113,0.35)';
              e.target.style.background = 'rgba(248,113,113,0.06)';
            }}
            onMouseLeave={e => {
              e.target.style.color = 'var(--ink-3)';
              e.target.style.borderColor = 'var(--line)';
              e.target.style.background = 'none';
            }}
            >
              Sign out
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} className="sm:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: 'block', width: '20px', height: '1.5px',
                  background: 'var(--ink-2)',
                  transition: 'all 0.25s',
                  transform: menuOpen ? (i === 0 ? 'rotate(45deg) translate(4.5px,4.5px)' : i === 2 ? 'rotate(-45deg) translate(4.5px,-4.5px)' : 'none') : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden animate-slide-down" style={{ borderTop: '1px solid var(--line)', background: 'rgba(26,29,46,0.98)', padding: '10px 14px 14px', backdropFilter: 'blur(20px)' }}>
          {navLinks.map(({ to, label }) => {
            const active = pathname === to;
            const showBadge = to === '/admin/managers' && pendingCount > 0;
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 14px',
                fontSize: '12px', fontFamily: 'var(--mono)', letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: active ? '#c084fc' : 'var(--ink-2)',
                background: active ? 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.1) 100%)' : 'transparent',
                borderRadius: '12px', marginBottom: '2px', textDecoration: 'none',
                transition: 'all 0.15s',
                borderLeft: active ? '2px solid #a855f7' : '2px solid transparent',
              }}>
                {label}
                {showBadge && (
                  <span style={{
                    fontSize: '9px', fontFamily: 'var(--mono)', fontWeight: '700',
                    background: '#f87171', color: '#fff',
                    borderRadius: '20px', padding: '1px 6px', lineHeight: '16px',
                    minWidth: '16px', textAlign: 'center',
                    boxShadow: '0 0 6px rgba(248,113,113,0.5)',
                  }}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
          <div style={{ height: '1px', background: 'var(--line)', margin: '8px 0 10px' }} />
          <button onClick={handleLogout} style={{
            display: 'flex', width: '100%', padding: '13px 14px', alignItems: 'center',
            fontSize: '11px', color: 'var(--absent)', fontFamily: 'var(--mono)',
            letterSpacing: '0.08em', background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer',
            textTransform: 'uppercase', borderRadius: '12px',
          }}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
