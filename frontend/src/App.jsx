import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeTimein from './pages/EmployeeTimein';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import Attendance from './pages/admin/Attendance';
import Reports from './pages/admin/Reports';
import LeaveRequests from './pages/admin/LeaveRequests';
import Managers from './pages/admin/Managers';
import { api } from './api';

function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = pathname.startsWith('/admin') ? 'TimeTrack Console' : 'TimeTrack';
  }, [pathname]);
  return null;
}

function ChangePasswordBanner() {
  const { mustChangePassword, login } = useAuth();
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!mustChangePassword || done) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (next !== confirm) { setError('Passwords do not match'); return; }
    setSaving(true); setError('');
    try {
      await api.changeManagerPassword(current, next);
      // Re-login to get fresh token without must_change_password flag
      const { token } = await api.login(
        JSON.parse(atob(localStorage.getItem('tt_token').split('.')[1])).username,
        next
      );
      login(token);
      setDone(true); setShow(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.12), rgba(251,191,36,0.06))', borderBottom: '1px solid rgba(251,191,36,0.25)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '12px', color: 'var(--late)', fontFamily: 'var(--mono)', margin: 0 }}>
          ⚠ You are using a temporary password. Please set a permanent password before it expires.
        </p>
        <button onClick={() => setShow(true)} style={{ fontSize: '11px', fontFamily: 'var(--mono)', padding: '5px 14px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.1)', color: 'var(--late)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Change Password
        </button>
      </div>

      {show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ height: '3px', background: 'var(--hero-gradient)' }} />
            <div className="panel-header" style={{ borderTop: 'none' }}>
              <span className="panel-title">Set Permanent Password</span>
              <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--ink-3)', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px 22px' }}>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '20px', lineHeight: 1.6 }}>
                Enter your temporary password, then choose a new permanent one.
              </p>
              <div style={{ marginBottom: '14px' }}>
                <label className="field-label">Temporary Password *</label>
                <input type="password" required value={current} onChange={e => setCurrent(e.target.value)} className="dark-input" placeholder="Your temporary password" autoFocus />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="field-label">New Password *</label>
                <input type="password" required minLength={6} value={next} onChange={e => setNext(e.target.value)} className="dark-input" placeholder="Min. 6 characters" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="field-label">Confirm New Password *</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="dark-input" placeholder="Repeat new password" />
              </div>
              {error && <div className="msg-error" style={{ marginBottom: '14px' }}><p>{error}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" onClick={() => setShow(false)} className="btn-ghost">Later</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Set Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--base)' }}>
      <Navbar />
      <ChangePasswordBanner />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TitleManager />
        <Routes>
          <Route path="/" element={<EmployeeLogin />} />
          <Route path="/portal" element={<EmployeeTimein />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute>
              <AdminLayout><Employees /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute>
              <AdminLayout><Attendance /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute>
              <AdminLayout><Reports /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/leave" element={
            <ProtectedRoute>
              <AdminLayout><LeaveRequests /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/managers" element={
            <ProtectedRoute>
              <AdminLayout><Managers /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
