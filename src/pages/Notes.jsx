import { useState } from 'react';
import { useApp } from '../context/AppContext';

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','History','Computer Science','Economics'];
const COLORS = { Mathematics:'#7c3aed', Physics:'#06b6d4', Chemistry:'#f59e0b', Biology:'#10b981', English:'#ef4444', History:'#8b5cf6', 'Computer Science':'#0ea5e9', Economics:'#f97316' };

export default function Notes() {
  const { state, addNote, addToast } = useApp();
  const [active, setActive] = useState(state.notes[0]?.subject || SUBJECTS[0]);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('Mathematics');

  const note = state.notes.find(n => n.subject === active);

  const startEdit = () => { setContent(note?.content || ''); setEditing(true); };
  const saveNote = () => { addNote({ subject: active, content }); setEditing(false); };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 160px)', minHeight: 500 }}>

        {/* Sidebar list */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: 8 }} onClick={() => setShowNew(true)}>+ New Note</button>
          {state.notes.map(n => (
            <button
              key={n.subject}
              onClick={() => { setActive(n.subject); setEditing(false); }}
              style={{
                padding: '12px 14px', borderRadius: 'var(--radius-md)', border: 'none',
                background: active === n.subject ? `${COLORS[n.subject] || '#7c3aed'}22` : 'var(--bg-card)',
                borderLeft: `3px solid ${active === n.subject ? COLORS[n.subject] || '#7c3aed' : 'transparent'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: active === n.subject ? COLORS[n.subject] || '#7c3aed' : 'var(--text-primary)' }}>{n.subject}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{new Date(n.updatedAt).toLocaleDateString()}</div>
            </button>
          ))}
          {state.notes.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notes yet.<br />Create one!</div>
          )}
        </div>

        {/* Note editor */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {note ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: COLORS[note.subject] || '#7c3aed' }}>{note.subject}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated: {new Date(note.updatedAt).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {editing
                    ? <><button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                       <button className="btn btn-success btn-sm" onClick={saveNote}>💾 Save</button></>
                    : <button className="btn btn-primary btn-sm" onClick={startEdit}>✏️ Edit</button>
                  }
                </div>
              </div>
              <div className="divider" />
              {editing ? (
                <textarea
                  className="input"
                  style={{ flex: 1, resize: 'none', minHeight: 300, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  autoFocus
                  placeholder="Write your notes here..."
                />
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', lineHeight: 1.8, fontSize: 14, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {note.content || <span style={{ color: 'var(--text-muted)' }}>No content yet. Click Edit to start writing.</span>}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="empty-state-icon">📝</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No note selected</div>
              <div className="empty-state-text">Select a subject or create a new note</div>
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">📝 New Note</div>
            <div className="input-group">
              <label className="input-label">Subject</label>
              <select className="input" value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                addNote({ subject: newSubject, content: '' });
                setActive(newSubject);
                setShowNew(false);
                setEditing(true);
                setContent('');
              }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
