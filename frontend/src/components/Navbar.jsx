import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/employees', label: 'Employees' },
  { to: '/admin/attendance', label: 'Attendance' },
  { to: '/admin/reports', label: 'Reports' },
];

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() { logout(); navigate('/admin/login'); }

  return (
    <nav style={{ background: 'var(--sap-shell)', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px' }}>

          {/* Logo + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="TimeTrack" style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontFamily: 'var(--font)', fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '0.02em' }}>
              TimeTrack
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden sm:flex" style={{ height: '48px' }}>
            {navLinks.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} style={{
                  fontSize: '13px', fontWeight: active ? '600' : '400',
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  borderBottom: active ? '3px solid var(--sap-blue)' : '3px solid transparent',
                  padding: '0 16px', height: '48px', display: 'flex', alignItems: 'center',
                  textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s',
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleLogout} className="hidden sm:flex"
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font)', fontWeight: '500', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              Sign out
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} className="sm:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#fff', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#fff', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: '20px', height: '2px', background: '#fff', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden animate-slide-down" style={{ background: 'var(--sap-shell)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {navLinks.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                display: 'block', padding: '14px 20px', fontSize: '14px',
                color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                fontWeight: active ? '600' : '400',
                borderLeft: active ? '3px solid var(--sap-blue)' : '3px solid transparent',
                textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)',
                transition: 'background 0.15s',
              }}>
                {label}
              </Link>
            );
          })}
          <button onClick={handleLogout} style={{
            display: 'block', width: '100%', padding: '14px 20px', textAlign: 'left',
            fontSize: '14px', color: '#FF8888', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'var(--font)', borderLeft: '3px solid transparent',
          }}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
