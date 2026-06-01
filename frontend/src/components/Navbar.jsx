import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/employees', label: 'Employees' },
  { to: '/admin/attendance', label: 'Attendance' },
  { to: '/admin/leave', label: 'Leave Requests' },
  { to: '/admin/reports', label: 'Reports' },
];

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <nav style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', letterSpacing: '0.08em', color: 'var(--ink)', fontWeight: '500', textTransform: 'uppercase' }}>
            TimeTrack
          </span>

          {/* Desktop nav links */}
          <div className="hidden sm:flex">
            {navLinks.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} style={{
                  fontSize: '13px',
                  color: active ? 'var(--ink)' : 'var(--ink-2)',
                  borderBottom: active ? '2px solid var(--ink)' : '2px solid transparent',
                  padding: '0 14px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: active ? '600' : '400',
                  transition: 'color 0.15s',
                  textDecoration: 'none',
                }}>
                  {label}
                </Link>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handleLogout} className="hidden sm:block"
              style={{ fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
              Sign out
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} className="sm:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--ink)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--ink)', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--ink)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden" style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
          {navLinks.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                display: 'block', padding: '14px 20px', fontSize: '14px',
                color: active ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: active ? '600' : '400',
                borderLeft: active ? '3px solid var(--ink)' : '3px solid transparent',
                textDecoration: 'none', borderBottom: '1px solid var(--line-2)',
              }}>
                {label}
              </Link>
            );
          })}
          <button onClick={handleLogout} style={{
            display: 'block', width: '100%', padding: '14px 20px', textAlign: 'left',
            fontSize: '13px', color: 'var(--absent)', fontFamily: 'var(--mono)', letterSpacing: '0.04em',
            background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase',
            borderLeft: '3px solid transparent',
          }}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
