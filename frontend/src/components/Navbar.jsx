import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <nav style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)' }} className="sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', letterSpacing: '0.08em', color: 'var(--ink)' }} className="font-medium uppercase">
              TimeTrack
            </span>
            <div className="hidden sm:flex gap-0">
              {navLinks.map(({ to, label }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      fontSize: '13px',
                      color: active ? 'var(--ink)' : 'var(--ink-2)',
                      borderBottom: active ? '2px solid var(--ink)' : '2px solid transparent',
                      padding: '0 14px',
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: active ? '600' : '400',
                      transition: 'color 0.15s',
                      textDecoration: 'none',
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}
            className="uppercase hover:text-red-600 transition-colors"
          >
            Sign out
          </button>
        </div>
        {/* Mobile nav */}
        <div className="sm:hidden flex gap-0 overflow-x-auto" style={{ borderTop: '1px solid var(--line-2)' }}>
          {navLinks.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  fontSize: '12px',
                  color: active ? 'var(--ink)' : 'var(--ink-2)',
                  borderBottom: active ? '2px solid var(--ink)' : '2px solid transparent',
                  padding: '10px 14px',
                  fontWeight: active ? '600' : '400',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
