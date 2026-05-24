import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Goals() {
  const { state, addGoal, update, addToast } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', total: '100', category: 'short', unit: '%' });

  const updateProgress = (id, delta) => {
    update({
      goals: state.goals.map(g => g.id === id
        ? { ...g, progress: Math.max(0, Math.min(g.total, g.progress + delta)) }
        : g)
    });
  };

  const deleteGoal = (id) => {
    update({ goals: state.goals.filter(g => g.id !== id) });
    addToast('Goal removed', 'info');
  };

  const shortGoals = state.goals.filter(g => g.category === 'short');
  const longGoals = state.goals.filter(g => g.category === 'long');

  const GoalCard = ({ g }) => {
    const pct = Math.round((g.progress / g.total) * 100);
    const done = g.progress >= g.total;
    return (
      <div className="card card-sm" style={{ border: done ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-color)', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              {done && <span>✅</span>} {g.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
              {g.progress} / {g.total} • {pct}% complete
            </div>
          </div>
          <button onClick={() => deleteGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        <div className="progress-bar" style={{ marginBottom: 10 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: done ? 'linear-gradient(90deg,#10b981,#059669)' : undefined }} />
        </div>
        {!done && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => updateProgress(g.id, -10)}>−10</button>
            <button className="btn btn-secondary btn-sm" onClick={() => updateProgress(g.id, -1)}>−1</button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={() => updateProgress(g.id, 1)}>+1</button>
            <button className="btn btn-primary btn-sm" onClick={() => updateProgress(g.id, 10)}>+10</button>
          </div>
        )}
        {done && <div style={{ textAlign: 'center', color: '#10b981', fontSize: 13, fontWeight: 600 }}>🎉 Goal Achieved!</div>}
      </div>
    );
  };

  const overallPct = state.goals.length
    ? Math.round(state.goals.reduce((a, g) => a + (g.progress / g.total) * 100, 0) / state.goals.length)
    : 0;

  return (
    <div className="page-container">
      {/* Overall */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.08))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800 }}>🎯 Goal Setting System</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Track your short & long-term ambitions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800, color: 'var(--accent-primary)' }}>{overallPct}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Overall Progress</div>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: 12 }}>
          <div className="progress-fill" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Goal</button>
      </div>

      <div className="grid-2">
        {/* Short Term */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div className="section-title">⚡ Short-term Goals</div>
            <span className="badge badge-amber">{shortGoals.length}</span>
          </div>
          {shortGoals.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">⚡</div><div className="empty-state-text">No short-term goals yet</div></div></div>
          ) : shortGoals.map(g => <GoalCard key={g.id} g={g} />)}
        </div>

        {/* Long Term */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div className="section-title">🌟 Long-term Goals</div>
            <span className="badge badge-purple">{longGoals.length}</span>
          </div>
          {longGoals.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">🌟</div><div className="empty-state-text">No long-term goals yet</div></div></div>
          ) : longGoals.map(g => <GoalCard key={g.id} g={g} />)}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🎯 Create New Goal</div>
            <div className="input-group">
              <label className="input-label">Goal Title</label>
              <input className="input" placeholder="e.g. Score 90%+ in Math finals..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Target Value</label>
                <input className="input" type="number" min="1" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="short">⚡ Short-term</option>
                  <option value="long">🌟 Long-term</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                if (!form.title) return;
                addGoal({ ...form, total: parseInt(form.total) });
                setShowModal(false);
                setForm({ title: '', total: '100', category: 'short', unit: '%' });
              }}>Create Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
