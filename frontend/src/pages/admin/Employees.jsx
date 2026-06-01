import { useEffect, useState } from 'react';
import { api } from '../../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_FORM = {
  name: '', email: '',
  shift_start: '09:00', work_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

const th = { padding: '10px 16px', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', fontWeight: '500' };
const td = { padding: '12px 16px', fontSize: '13px', color: 'var(--ink)', borderBottom: '1px solid var(--line-2)', verticalAlign: 'middle' };

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '2px',
  fontSize: '13px', color: 'var(--ink)', background: 'var(--bg)', outline: 'none',
  fontFamily: 'var(--font)', transition: 'border-color 0.15s',
};
const labelStyle = {
  display: 'block', fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.06em',
  color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: '5px',
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

  async function load() {
    setLoading(true);
    try { setEmployees(await api.getEmployees()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setError(''); setModal('create'); }
  function openEdit(emp) {
    setForm({ name: emp.name, email: emp.email, shift_start: emp.shift_start?.slice(0, 5) || '09:00', work_days: emp.work_days || [] });
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
      modal === 'create' ? await api.createEmployee(form) : await api.updateEmployee(editId, form);
      setModal(null); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await api.deleteEmployee(id); setConfirmDelete(null); load(); }
    catch (err) { alert(err.message); }
  }

  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 4px' }}>Manage</p>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--ink)', margin: 0 }}>Employees</h1>
        </div>
        <button
          onClick={openCreate}
          style={{ padding: '9px 16px', border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bg)', fontSize: '12px', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}
        >
          + Add Employee
        </button>
      </div>

      <div style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}>
        <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
            {loading ? '...' : `${employees.length} employee${employees.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        {loading ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>Loading...</p>
        ) : employees.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '13px', margin: 0 }}>No employees yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Name', 'Email', 'Shift Start', 'Work Days', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ transition: 'background 0.1s' }}
                  >
                    <td style={{ ...td, fontWeight: '500' }}>{emp.name}</td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{emp.email}</td>
                    <td style={{ ...td, fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '500' }}>{formatTime(emp.shift_start)}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(emp.work_days || []).map(d => (
                          <span key={d} style={{ fontSize: '10px', fontFamily: 'var(--mono)', border: '1px solid var(--line)', color: 'var(--ink-2)', padding: '1px 5px', letterSpacing: '0.04em' }}>
                            {d.slice(0, 3).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => openEdit(emp)} style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Edit</button>
                        <button onClick={() => setConfirmDelete(emp)} style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--absent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Delete</button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '1px solid var(--line)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
                {modal === 'create' ? 'Add Employee' : 'Edit Employee'}
              </span>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--ink-3)', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '20px' }}>
              {[
                { label: 'Full Name *', key: 'name', type: 'text', required: true, placeholder: '' },
                { label: 'Work Email *', key: 'email', type: 'email', required: true, placeholder: '' },
              ].map(({ label, key, type, required, placeholder }) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} required={required} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Shift Start Time *</label>
                <input type="time" required value={form.shift_start}
                  onChange={e => setForm(f => ({ ...f, shift_start: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--ink)'}
                  onBlur={e => e.target.style.borderColor = 'var(--line)'}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Work Days *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {DAYS.map(day => {
                    const on = form.work_days.includes(day);
                    return (
                      <label key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 4px', border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`, background: on ? 'var(--ink)' : 'var(--bg)', color: on ? 'var(--bg)' : 'var(--ink-2)', fontSize: '10px', fontFamily: 'var(--mono)', letterSpacing: '0.04em', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleDay(day)} />
                        {day.slice(0, 3).toUpperCase()}
                      </label>
                    );
                  })}
                </div>
              </div>
              {error && (
                <div style={{ borderLeft: '2px solid var(--absent)', paddingLeft: '10px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--absent)', margin: 0 }}>{error}</p>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" onClick={() => setModal(null)}
                  style={{ padding: '9px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-2)', fontSize: '12px', fontFamily: 'var(--mono)', letterSpacing: '0.04em', cursor: 'pointer', borderRadius: '2px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '9px', border: '1px solid var(--ink)', background: saving ? 'var(--line)' : 'var(--ink)', color: saving ? 'var(--ink-3)' : 'var(--bg)', fontSize: '12px', fontFamily: 'var(--mono)', letterSpacing: '0.04em', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: '2px', fontWeight: '600' }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', width: '100%', maxWidth: '360px' }}>
            <div style={{ borderTop: '2px solid var(--absent)', borderBottom: '1px solid var(--line)', padding: '14px 20px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', color: 'var(--absent)', textTransform: 'uppercase' }}>Delete Employee</span>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '6px' }}>
                Delete <strong>{confirmDelete.name}</strong>?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '20px', fontFamily: 'var(--mono)' }}>
                All attendance records will be removed.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => setConfirmDelete(null)}
                  style={{ padding: '9px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-2)', fontSize: '12px', fontFamily: 'var(--mono)', cursor: 'pointer', borderRadius: '2px' }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete.id)}
                  style={{ padding: '9px', border: '1px solid var(--absent)', background: 'var(--absent)', color: '#fff', fontSize: '12px', fontFamily: 'var(--mono)', cursor: 'pointer', borderRadius: '2px', fontWeight: '600' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
