import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SubjectSelect({ value, onChange, label = 'Subject', style = {} }) {
  const { state, addSubject, deleteSubject } = useApp();
  const subjects = state.customSubjects || ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];
  
  const [isAdding, setIsAdding] = useState(false);
  const [newSub, setNewSub] = useState('');
  const [showManage, setShowManage] = useState(false);

  const handleCreate = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = newSub.trim();
    if (!trimmed) return;
    
    addSubject(trimmed);
    onChange(trimmed);
    setNewSub('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleCreate(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setIsAdding(false);
      setNewSub('');
    }
  };

  return (
    <div className="input-group" style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label className="input-label" style={{ marginBottom: 0 }}>{label}</label>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowManage(true); }}
          style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
        >
          ⚙️ Manage Subjects
        </button>
      </div>

      {!isAdding ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="input"
            value={value}
            onChange={(e) => {
              if (e.target.value === '__ADD_NEW__') {
                setIsAdding(true);
              } else {
                onChange(e.target.value);
              }
            }}
            style={{ flex: 1 }}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="__ADD_NEW__">➕ Add New Subject...</option>
          </select>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAdding(true); }}
            title="Add a custom subject"
            style={{ padding: '0 12px', flexShrink: 0 }}
          >
            + New
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            className="input"
            placeholder="Type new subject name..."
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleCreate}
            style={{ flexShrink: 0 }}
          >
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAdding(false); setNewSub(''); }}
            style={{ flexShrink: 0 }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Manage Subjects Modal */}
      {showManage && (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setShowManage(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="modal-title" style={{ marginBottom: 0 }}>📚 Manage Custom Subjects</div>
              <button onClick={(e) => { e.stopPropagation(); setShowManage(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}>×</button>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Add, view, or delete custom subjects across your study planner.
            </div>

            {/* Quick Add Form inside Manage modal */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                id="managerNewSubInput"
                className="input"
                placeholder="e.g. Machine Learning, Neuroscience..."
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const val = e.target.value.trim();
                    if (val) {
                      addSubject(val);
                      e.target.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const el = document.getElementById('managerNewSubInput');
                  if (el && el.value.trim()) {
                    addSubject(el.value.trim());
                    el.value = '';
                  }
                }}
              >
                + Add Subject
              </button>
            </div>

            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {subjects.map((sub) => (
                <div
                  key={sub}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', background: 'var(--bg-secondary)',
                    borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{sub}</span>
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteSubject(sub); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}
                      title="Delete subject"
                    >🗑️</button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); setShowManage(false); }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
