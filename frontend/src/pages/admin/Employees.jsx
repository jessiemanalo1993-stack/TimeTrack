import { useEffect, useState } from 'react';
import { api } from '../../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_FORM = {
  name: '', email: '',
  shift_start: '09:00', shift_end: '18:00',
  work_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  password: '',
};

function formatTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const selectStyle = {
  width: '100%', padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '12px',
  fontSize: '14px', color: 'var(--ink)', background: 'var(--base-2)', outline: 'none',
  fontFamily: 'var(--font)', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try { setEmployees(await api.getEmployees()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setError(''); setModal('create'); }
  function openEdit(emp) {
    setForm({ name: emp.name, email: emp.email, shift_start: emp.shift_start?.slice(0,5) || '09:00', shift_end: emp.shift_end?.slice(0,5) || '18:00', work_days: emp.work_days || [], password: '' });
    setEditId(emp.id); setError(''); setModal('edit');
  }
  function toggleDay(day) {
    setForm(f => ({ ...f, work_days: f.work_days.includes(day) ? f.work_days.filter(d => d !== day) : [...f.work_days, day] }));
  }
  async function handleSave(e) {
    e.preventDefault();
    if (!form.work_days.length) { setError('Select at least one work day'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      modal === 'create' ? await api.createEmployee(payload) : await api.updateEmployee(editId, payload);
      setModal(null); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function handleDelete(id) {
    setDeleteError(''); setDeleting(true);
    try {
      await api.verifyAdminPassword(deletePassword);
      await api.deleteEmployee(id);
      setConfirmDelete(null); setDeletePassword(''); load();
    } catch (err) { setDeleteError(err.message); }
    finally { setDeleting(false); }
  }

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }} className="page-wrap">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 6px' }}>Manage</p>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>Employees</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ width: 'auto', padding: '10px 22px' }}>
          + Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="panel">
        <div className="panel-header accent-bar">
          <span className="panel-title">{loading ? '…' : `${employees.length} employee${employees.length !== 1 ? 's' : ''}`}</span>
        </div>
        {loading ? (
          <p style={{ padding: '52px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>Loading…</p>
        ) : employees.length === 0 ? (
          <p style={{ padding: '52px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>No employees yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="dark-table">
              <thead>
                <tr>{['Name', 'Email', 'Shift', 'Work Days', 'Password', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: '600' }}>{emp.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{emp.email}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500' }}>
                      {formatTime(emp.shift_start)}
                      {emp.shift_end && <span style={{ color: 'var(--ink-3)', fontWeight: '400' }}> – {formatTime(emp.shift_end)}</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(emp.work_days || []).map(d => (
                          <span key={d} style={{ fontSize: '9px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', padding: '2px 7px', borderRadius: '6px', background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                            {d.slice(0,3).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', padding: '3px 9px', borderRadius: '6px', background: emp.password_hash ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)', color: emp.password_hash ? 'var(--present)' : 'var(--ink-3)', border: `1px solid ${emp.password_hash ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
                        {emp.password_hash ? 'SET' : 'NONE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '18px' }}>
                        <button onClick={() => openEdit(emp)} style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                          onMouseEnter={e => e.target.style.color = '#c084fc'}
                          onMouseLeave={e => e.target.style.color = 'var(--ink-2)'}>Edit</button>
                        <button onClick={() => setConfirmDelete(emp)} style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                          onMouseEnter={e => e.target.style.color = 'var(--absent)'}
                          onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div style={overlayStyle} className="modal-overlay">
          <div className="panel modal-box" style={{ width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ height: '3px', background: 'var(--hero-gradient)' }} />
            <div className="panel-header" style={{ borderTop: 'none' }}>
              <span className="panel-title">{modal === 'create' ? 'Add Employee' : 'Edit Employee'}</span>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--ink-3)', lineHeight: 1, padding: '0 4px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--ink)'}
                onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '24px 22px' }}>
              {[{ label: 'Full Name *', key: 'name', type: 'text', required: true }, { label: 'Work Email *', key: 'email', type: 'email', required: true }].map(({ label, key, type, required }) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <label className="field-label">{label}</label>
                  <input type={type} required={required} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="dark-input" />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[{ label: 'Shift Start *', key: 'shift_start' }, { label: 'Shift End *', key: 'shift_end' }].map(({ label, key }) => (
                  <div key={key}>
                    <label className="field-label">{label}</label>
                    <input type="time" required value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="dark-input" />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Work Days *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {DAYS.map(day => {
                    const on = form.work_days.includes(day);
                    return (
                      <label key={day} className={`day-toggle${on ? ' active' : ''}`}>
                        <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleDay(day)} />
                        {day.slice(0, 3).toUpperCase()}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginBottom: '22px' }}>
                <label className="field-label">
                  {modal === 'edit' ? 'Reset Password' : 'Password'}
                  <span style={{ color: 'var(--ink-3)', fontWeight: '400', marginLeft: '6px', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={modal === 'edit' ? 'Enter new password to reset' : 'Leave blank — employee can set their own'} minLength={6} className="dark-input" />
              </div>
              {error && <div className="msg-error" style={{ marginBottom: '16px' }}><p>{error}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div style={overlayStyle} className="modal-overlay">
          <div className="panel modal-box" style={{ width: '100%', maxWidth: '380px' }}>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #f87171, #ef4444)' }} />
            <div className="panel-header" style={{ borderTop: 'none' }}>
              <span className="panel-title" style={{ color: 'var(--absent)' }}>Delete Employee</span>
              <button onClick={() => { setConfirmDelete(null); setDeletePassword(''); setDeleteError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--ink-3)', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '22px' }}>
              <p style={{ fontSize: '15px', color: 'var(--ink)', marginBottom: '4px', fontWeight: '600' }}>Delete <span style={{ color: 'var(--absent)' }}>{confirmDelete.name}</span>?</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '22px', lineHeight: 1.6 }}>All attendance records for this employee will be permanently removed.</p>
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Manager Password</label>
                <input type="password" value={deletePassword} onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }} placeholder="Confirm with your password" autoFocus className="dark-input" />
              </div>
              {deleteError && <div className="msg-error" style={{ marginBottom: '14px' }}><p>{deleteError}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => { setConfirmDelete(null); setDeletePassword(''); setDeleteError(''); }} className="btn-ghost">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete.id)} disabled={deleting || !deletePassword} className="btn-danger">{deleting ? 'Verifying…' : 'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
