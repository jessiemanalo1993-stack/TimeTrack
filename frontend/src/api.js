const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('tt_token');
}

async function request(method, path, body = null, requireAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (requireAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

async function downloadFile(path) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Export failed');
  }
  return res;
}

export const api = {
  // Auth
  login: (username, password) =>
    request('POST', '/api/auth/login', { username, password }),
  employeeLogin: (email, password) =>
    request('POST', '/api/auth/employee-login', { email, password }),
  requestPasswordReset: (email) =>
    request('POST', '/api/auth/request-reset', { email }),
  resetPassword: (email, otp, new_password) =>
    request('POST', '/api/auth/reset-password', { email, otp, new_password }),
  verifyAdminPassword: (password) =>
    request('POST', '/api/auth/verify-password', { password }, true),

  // Employees
  getEmployees: () => request('GET', '/api/employees', null, true),
  createEmployee: (data) => request('POST', '/api/employees', data, true),
  updateEmployee: (id, data) => request('PUT', `/api/employees/${id}`, data, true),
  deleteEmployee: (id) => request('DELETE', `/api/employees/${id}`, null, true),

  // Attendance
  timein: (email, work_location, leave_type) => request('POST', '/api/attendance/timein', { email, work_location, leave_type }),
  timeout: (email) => request('POST', '/api/attendance/timeout', { email }),
  getAttendance: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/api/attendance${qs ? '?' + qs : ''}`, null, true);
  },
  markAbsent: (employee_id, date, notes) =>
    request('POST', '/api/attendance/mark-absent', { employee_id, date, notes }, true),
  deleteRecord: (id) => request('DELETE', `/api/attendance/${id}`, null, true),

  // Export
  exportExcel: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return downloadFile(`/api/attendance/export${qs ? '?' + qs : ''}`);
  },

  // Email
  sendReport: (params) => request('POST', '/api/email/send-report', params, true),

  // Leave Requests
  fileLeave: (data) => request('POST', '/api/leave', data),
  getLeaveRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/api/leave${qs ? '?' + qs : ''}`, null, true);
  },
  approveLeave: (id) => request('PUT', `/api/leave/${id}/approve`, null, true),
  rejectLeave: (id) => request('PUT', `/api/leave/${id}/reject`, null, true),

  // Employee password (self-service)
  setPassword: (data) => request('POST', '/api/employees/set-password', data),
};
