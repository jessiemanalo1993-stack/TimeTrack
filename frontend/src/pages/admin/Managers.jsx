import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Managers() {
  const { username } = useAuth();
  const isOwner = username === 'admin';
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    setLoading(true);
    try { setManagers(await api.getManagers()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.createManager(form);
      setModal(false); setForm({ name: '', username: '', password: '' }); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    setDeleting(true); setDeleteError('');
    try { await api.deleteManager(id); setConfirmDelete(null); load(); }
    catch (err) { setDeleteError(err.message); }
    finally { setDeleting(false); }
  }

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }} className="page-wrap">

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 0 6px' }}>Access</p>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>Managers</h1>
        </div>
        {isOwner && (
          <button onClick={() => { setModal(true); setError(''); setForm({ name: '', username: '', password: '' }); }} className="btn-primary" style={{ width: 'auto', padding: '10px 22px' }}>
            + Add Manager
          </button>
        )}
      </div>

      <div className="panel">
        <div className="panel-header accent-bar">
          <span className="panel-title">{loading ? '…' : `${managers.length} manager${managers.length !== 1 ? 's' : ''}`}</span>
        </div>
        {loading ? (
          <p style={{ padding: '52px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>Loading…</p>
        ) : managers.length === 0 ? (
          <p style={{ padding: '52px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>No managers yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="dark-table">
              <thead>
                <tr>{['Name', 'Username', 'Added On', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {managers.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: '600' }}>{m.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{m.username}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>
                      {new Date(m.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })}
                    </td>
                    <td>
                      {isOwner && (
                        <button onClick={() => setConfirmDelete(m)}
                          style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                          onMouseEnter={e => e.target.style.color = 'var(--absent)'}
                          onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Manager Modal */}
      {modal && (
        <div style={overlayStyle} className="modal-overlay">
          <div className="panel modal-box" style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ height: '3px', background: 'var(--hero-gradient)' }} />
            <div className="panel-header" style={{ borderTop: 'none' }}>
              <span className="panel-title">Add Manager</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--ink-3)', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '24px 22px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Full Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="dark-input" placeholder="e.g. Jane Santos" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Username *</label>
                <input type="text" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="dark-input" placeholder="e.g. jane.santos" />
              </div>
              <div style={{ marginBottom: '22px' }}>
                <label className="field-label">Password *</label>
                <input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="dark-input" placeholder="Min. 6 characters" />
              </div>
              {error && <div className="msg-error" style={{ marginBottom: '16px' }}><p>{error}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Add Manager'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div style={overlayStyle} className="modal-overlay">
          <div className="panel modal-box" style={{ width: '100%', maxWidth: '360px' }}>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #f87171, #ef4444)' }} />
            <div className="panel-header" style={{ borderTop: 'none' }}>
              <span className="panel-title" style={{ color: 'var(--absent)' }}>Delete Manager</span>
              <button onClick={() => setConfirmDelete(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--ink-3)', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '22px' }}>
              <p style={{ fontSize: '15px', color: 'var(--ink)', marginBottom: '4px', fontWeight: '600' }}>
                Delete <span style={{ color: 'var(--absent)' }}>{confirmDelete.name}</span>?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '22px', lineHeight: 1.6 }}>
                This manager will lose access to the console immediately.
              </p>
              {deleteError && <div className="msg-error" style={{ marginBottom: '14px' }}><p>{deleteError}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete.id)} disabled={deleting} className="btn-danger">
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
