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
    setForm({
      name: emp.name, email: emp.email,
      shift_start: emp.shift_start?.slice(0, 5) || '09:00',
      shift_end: emp.shift_end?.slice(0, 5) || '18:00',
      work_days: emp.work_days || [], password: '',
    });
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
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px',
  };
  const boxClass = 'panel modal-box';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }} className="page-wrap">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 6px' }}>Manage</p>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>Employees</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ padding: '9px 18px' }}>
          + Add Employee
        </button>
      </div>

      {/* Table panel */}
      <div className="panel">
        <div className="panel-header accent-bar">
          <span className="panel-title">
            {loading ? '...' : `${employees.length} employee${employees.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {loading ? (
          <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>Loading...</p>
        ) : employees.length === 0 ? (
          <p style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>No employees yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }} className="table-scroll">
            <table className="dark-table">
              <thead>
                <tr>{['Name', 'Email', 'Shift', 'Work Days', 'Password', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: '500' }}>{emp.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{emp.email}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500' }}>
                      {formatTime(emp.shift_start)}
                      {emp.shift_end && <span style={{ color: 'var(--ink-3)', fontWeight: '400' }}> – {formatTime(emp.shift_end)}</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(emp.work_days || []).map(d => (
                          <span key={d} style={{
                            fontSize: '9px', fontFamily: 'var(--mono)', letterSpacing: '0.06em',
                            padding: '2px 6px', borderRadius: '4px',
                            background: 'var(--accent-dim)', color: 'var(--accent)',
                            border: '1px solid rgba(0,229,160,0.2)',
                          }}>
                            {d.slice(0, 3).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.06em',
                        padding: '3px 8px', borderRadius: '4px',
                        background: emp.password_hash ? 'var(--present-dim)' : 'rgba(139,144,160,0.08)',
                        color: emp.password_hash ? 'var(--present)' : 'var(--ink-3)',
                        border: `1px solid ${emp.password_hash ? 'rgba(0,229,160,0.25)' : 'rgba(139,144,160,0.15)'}`,
                      }}>
                        {emp.password_hash ? 'SET' : 'NONE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => openEdit(emp)} style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.04em', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.target.style.color = 'var(--ink-2)'}>
                          Edit
                        </button>
                        <button onClick={() => setConfirmDelete(emp)} style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.04em', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.target.style.color = 'var(--absent)'}
                          onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>
                          Delete
                        </button>
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
          <div className={`${boxClass}`} style={{ width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="panel-header" style={{ borderTop: `2px solid ${modal === 'create' ? 'var(--accent)' : 'var(--ink-2)'}` }}>
              <span className="panel-title">{modal === 'create' ? 'Add Employee' : 'Edit Employee'}</span>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--ink-3)', lineHeight: 1, padding: '0 4px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--ink)'}
                onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>
                ×
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '24px 20px' }}>
              {[
                { label: 'Full Name *', key: 'name', type: 'text', required: true },
                { label: 'Work Email *', key: 'email', type: 'email', required: true },
              ].map(({ label, key, type, required }) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <label className="field-label">{label}</label>
                  <input type={type} required={required} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="dark-input" />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="field-label">Shift Start *</label>
                  <input type="time" required value={form.shift_start}
                    onChange={e => setForm(f => ({ ...f, shift_start: e.target.value }))}
                    className="dark-input" />
                </div>
                <div>
                  <label className="field-label">Shift End *</label>
                  <input type="time" required value={form.shift_end}
                    onChange={e => setForm(f => ({ ...f, shift_end: e.target.value }))}
                    className="dark-input" />
                </div>
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
                <input type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={modal === 'edit' ? 'Enter new password to reset' : 'Leave blank — employee can set their own'}
                  minLength={6}
                  className="dark-input" />
              </div>
              {error && <div className="msg-error" style={{ marginBottom: '16px' }}><p>{error}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div style={overlayStyle} className="modal-overlay">
          <div className={`${boxClass}`} style={{ width: '100%', maxWidth: '380px' }}>
            <div className="panel-header" style={{ borderTop: '2px solid var(--absent)' }}>
              <span className="panel-title" style={{ color: 'var(--absent)' }}>Delete Employee</span>
              <button onClick={() => { setConfirmDelete(null); setDeletePassword(''); setDeleteError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--ink-3)', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '4px', fontWeight: '500' }}>
                Delete <span style={{ color: 'var(--absent)' }}>{confirmDelete.name}</span>?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '20px', fontFamily: 'var(--mono)', lineHeight: 1.6 }}>
                All attendance records for this employee will be permanently removed.
              </p>
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Manager Password</label>
                <input type="password" value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  placeholder="Confirm with your password" autoFocus
                  className="dark-input" />
              </div>
              {deleteError && <div className="msg-error" style={{ marginBottom: '14px' }}><p>{deleteError}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => { setConfirmDelete(null); setDeletePassword(''); setDeleteError(''); }} className="btn-ghost">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete.id)} disabled={deleting || !deletePassword} className="btn-danger">
                  {deleting ? 'Verifying...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
