import { useState } from 'react';
import { useApp } from '../context/AppContext';
import SubjectSelect from '../components/SubjectSelect';

export default function WeekendTasks() {
  const { state, addWeekendTask, toggleWeekendTask, addToast, update } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', priority: 'medium' });

  const done = state.weekendTasks.filter(t => t.done).length;
  const total = state.weekendTasks.length;

  const aiSuggestions = [
    { title: 'Review weak topics from this week', subject: 'General', priority: 'high' },
    { title: 'Solve previous year question papers', subject: 'Mathematics', priority: 'high' },
    { title: 'Watch explanation videos for hard concepts', subject: 'Physics', priority: 'medium' },
    { title: 'Organize and rewrite messy notes', subject: 'Chemistry', priority: 'low' },
  ];

  const addSuggestion = (s) => {
    addWeekendTask(s);
  };

  const deleteTask = (id) => {
    update({ weekendTasks: state.weekendTasks.filter(t => t.id !== id) });
    addToast('Task removed', 'info');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))', border: '1px solid rgba(245,158,11,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800 }}>📋 Weekend Assignment Hub</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Tackle backlogs & revisions over the weekend</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--accent-tertiary)' }}>{done}/{total}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Completed</div>
          </div>
        </div>
        {total > 0 && <div className="progress-bar" style={{ marginTop: 12 }}><div className="progress-fill" style={{ width: `${Math.round((done/total)*100)}%`, background: 'linear-gradient(90deg,#f59e0b,#ef4444)' }} /></div>}
      </div>

      <div className="grid-2">
        {/* Task List */}
        <div>
          <div className="section-header">
            <div className="section-title">📌 Tasks</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Task</button>
          </div>

          {state.weekendTasks.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">🎉</div><div className="empty-state-text">No weekend tasks! Add some or pick AI suggestions →</div></div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.weekendTasks.map(t => (
                <div key={t.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`checkbox-custom ${t.done ? 'checked' : ''}`} onClick={() => toggleWeekendTask(t.id)}>
                    {t.done && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{t.subject}</div>
                  </div>
                  <span className={`priority-${t.priority}`}>{t.priority}</span>
                  <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        <div>
          <div className="section-title" style={{ marginBottom: 14 }}>🤖 AI Suggestions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {aiSuggestions.map((s, i) => (
              <div key={i} className="card card-sm" style={{ border: '1px solid rgba(124,58,237,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.subject}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`priority-${s.priority}`}>{s.priority}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => addSuggestion(s)}>Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Priority legend */}
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>📊 Priority Distribution</div>
            {['high','medium','low'].map(p => {
              const count = state.weekendTasks.filter(t => t.priority === p).length;
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className={`priority-${p}`} style={{ width: 60, textAlign: 'center' }}>{p}</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: total ? `${(count/total)*100}%` : '0%', background: p==='high'?'#ef4444':p==='medium'?'#f59e0b':'#10b981' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 16 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">➕ Add Weekend Task</div>
            <div className="input-group">
              <label className="input-label">Task Title</label>
              <input className="input" placeholder="e.g. Solve 20 MCQs..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <SubjectSelect
              value={form.subject}
              onChange={sub => setForm(f => ({ ...f, subject: sub }))}
            />
            <div className="input-group">
              <label className="input-label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { if (!form.title) return; addWeekendTask(form); setShowModal(false); setForm({ title:'',subject:'Mathematics',priority:'medium' }); }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
