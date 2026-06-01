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
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [approveModal, setApproveModal] = useState(null);
  const [approvePassword, setApprovePassword] = useState('');
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');
  const [rejecting, setRejecting] = useState(null);

  async function loadRequests() {
    setReqLoading(true);
    try { setRequests(await api.getManagerRequests()); }
    finally { setReqLoading(false); }
  }

  async function handleApprove(e) {
    e.preventDefault(); setApproving(true); setApproveError('');
    try {
      await api.approveManagerRequest(approveModal.id, approvePassword);
      setApproveModal(null); setApprovePassword('');
      load(); loadRequests();
    } catch (err) { setApproveError(err.message); }
    finally { setApproving(false); }
  }

  async function handleReject(id) {
    setRejecting(id);
    try { await api.rejectManagerRequest(id); loadRequests(); }
    catch (err) { alert(err.message); }
    finally { setRejecting(null); }
  }

  async function load() {
    setLoading(true);
    try { setManagers(await api.getManagers()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); loadRequests(); }, []);

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
    try {
      await api.verifyAdminPassword(deletePassword);
      await api.deleteManager(id);
      setConfirmDelete(null); setDeletePassword(''); load();
    }
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

      {/* Access Requests panel — visible to all managers */}
      <div className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-header accent-bar">
          <span className="panel-title">Access Requests</span>
          {requests.filter(r => r.status === 'Pending').length > 0 && (
            <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', background: 'rgba(251,191,36,0.15)', color: 'var(--late)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', padding: '2px 8px' }}>
              {requests.filter(r => r.status === 'Pending').length} pending
            </span>
          )}
        </div>
        {reqLoading ? (
          <p style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>Loading…</p>
        ) : requests.length === 0 ? (
          <p style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '12px', margin: 0 }}>No access requests.</p>
        ) : (
          <div className="table-scroll">
            <table className="dark-table">
              <thead>
                <tr>{['Name', 'Username', 'Reason', 'Requested On', 'Status', isOwner ? 'Actions' : ''].map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: '600' }}>{r.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>{r.username}</td>
                    <td style={{ fontSize: '12px', color: 'var(--ink-2)', maxWidth: '180px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason || '—'}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink-2)' }}>
                      {new Date(r.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '10px', fontFamily: 'var(--mono)', padding: '3px 9px', borderRadius: '6px',
                        background: r.status === 'Pending' ? 'rgba(251,191,36,0.12)' : r.status === 'Approved' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                        color: r.status === 'Pending' ? 'var(--late)' : r.status === 'Approved' ? 'var(--present)' : 'var(--absent)',
                        border: `1px solid ${r.status === 'Pending' ? 'rgba(251,191,36,0.3)' : r.status === 'Approved' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                      }}>{r.status}</span>
                    </td>
                    <td>
                      {isOwner && r.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setApproveModal(r); setApprovePassword(''); setApproveError(''); }}
                            style={{ padding: '4px 12px', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', background: 'rgba(74,222,128,0.1)', color: 'var(--present)', fontSize: '11px', fontFamily: 'var(--mono)', cursor: 'pointer', transition: 'all 0.15s' }}>
                            Approve
                          </button>
                          <button onClick={() => handleReject(r.id)} disabled={rejecting === r.id}
                            style={{ padding: '4px 12px', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', color: 'var(--absent)', fontSize: '11px', fontFamily: 'var(--mono)', cursor: 'pointer', opacity: rejecting === r.id ? 0.5 : 1, transition: 'all 0.15s' }}>
                            {rejecting === r.id ? '…' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <div style={overlayStyle} className="modal-overlay">
          <div className="panel modal-box" style={{ width: '100%', maxWidth: '380px' }}>
            <div style={{ height: '3px', background: 'var(--hero-gradient)' }} />
            <div className="panel-header" style={{ borderTop: 'none' }}>
              <span className="panel-title">Approve Request</span>
              <button onClick={() => setApproveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--ink-3)', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleApprove} style={{ padding: '22px' }}>
              <p style={{ fontSize: '15px', color: 'var(--ink)', marginBottom: '2px', fontWeight: '600' }}>{approveModal.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '18px', fontFamily: 'var(--mono)' }}>@{approveModal.username}</p>
              <div style={{ marginBottom: '20px' }}>
                <label className="field-label">Set Initial Password *</label>
                <input type="password" required minLength={6} value={approvePassword}
                  onChange={e => { setApprovePassword(e.target.value); setApproveError(''); }}
                  placeholder="Min. 6 characters" autoFocus className="dark-input" />
                <p style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '6px' }}>The new manager will use this password to sign in.</p>
              </div>
              {approveError && <div className="msg-error" style={{ marginBottom: '14px' }}><p>{approveError}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" onClick={() => setApproveModal(null)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={approving} className="btn-primary">{approving ? 'Approving…' : 'Approve'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <button onClick={() => { setConfirmDelete(null); setDeletePassword(''); setDeleteError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--ink-3)', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '22px' }}>
              <p style={{ fontSize: '15px', color: 'var(--ink)', marginBottom: '4px', fontWeight: '600' }}>
                Delete <span style={{ color: 'var(--absent)' }}>{confirmDelete.name}</span>?
              </p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '18px', lineHeight: 1.6 }}>
                This manager will lose access to the console immediately.
              </p>
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">Your Password</label>
                <input type="password" value={deletePassword} onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  placeholder="Confirm with your password" autoFocus className="dark-input" />
              </div>
              {deleteError && <div className="msg-error" style={{ marginBottom: '14px' }}><p>{deleteError}</p></div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => { setConfirmDelete(null); setDeletePassword(''); setDeleteError(''); }} className="btn-ghost">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete.id)} disabled={deleting || !deletePassword} className="btn-danger">
                  {deleting ? 'Verifying…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
