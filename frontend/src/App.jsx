import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import EmployeeTimein from './pages/EmployeeTimein';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import Attendance from './pages/admin/Attendance';
import Reports from './pages/admin/Reports';
import LeaveRequests from './pages/admin/LeaveRequests';

function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = pathname.startsWith('/admin') ? 'TimeTrack Console' : 'TimeTrack';
  }, [pathname]);
  return null;
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
          <Route path="/" element={<EmployeeTimein />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
