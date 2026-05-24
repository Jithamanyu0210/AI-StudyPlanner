import { useState } from 'react';
import { useApp } from '../context/AppContext';

const MOODS = [
  { emoji: '😄', label: 'Great', color: '#10b981', intensity: 5 },
  { emoji: '🙂', label: 'Good', color: '#06b6d4', intensity: 4 },
  { emoji: '😐', label: 'Okay', color: '#f59e0b', intensity: 3 },
  { emoji: '😔', label: 'Tired', color: '#8b5cf6', intensity: 2 },
  { emoji: '😫', label: 'Burnt Out', color: '#ef4444', intensity: 1 },
];

const AI_ADVICE = {
  '😄': { msg: 'You\'re in peak form! 🚀 Take on your hardest subjects now.', intensity: 'high' },
  '🙂': { msg: 'Great energy! 💪 Tackle medium-difficulty tasks and revisions.', intensity: 'medium-high' },
  '😐': { msg: 'Steady pace today. 📖 Focus on lighter reading and review.', intensity: 'medium' },
  '😔': { msg: 'Take it easy. 🌿 Do just 1 Pomodoro then rest.', intensity: 'low' },
  '😫': { msg: 'Rest is part of studying. 😴 Take a full break today — you\'ve earned it.', intensity: 'rest' },
};

export default function MoodTracker() {
  const { state, logMood } = useApp();
  const [selected, setSelected] = useState(null);

  const todayMood = state.moodLog.find(m => new Date(m.date).toDateString() === new Date().toDateString());
  const advice = todayMood ? AI_ADVICE[todayMood.mood] : null;

  const weekLog = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const entry = state.moodLog.find(m => new Date(m.date).toDateString() === d.toDateString());
    return { date: d, mood: entry?.mood || null };
  });

  return (
    <div className="page-container">
      {/* Today */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>😊 How are you feeling today?</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Log your mood — AI will adjust your study intensity accordingly</div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          {MOODS.map(m => (
            <button
              key={m.emoji}
              className={`mood-btn ${selected === m.emoji ? 'selected' : ''}`}
              onClick={() => setSelected(m.emoji)}
              style={{ flex: '1', minWidth: 80 }}
            >
              <div style={{ fontSize: 36 }}>{m.emoji}</div>
              <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600, color: selected === m.emoji ? m.color : 'var(--text-secondary)' }}>{m.label}</div>
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={!selected}
          onClick={() => { logMood(selected); setSelected(null); }}
        >
          Log Mood {selected || ''}
        </button>
      </div>

      {/* AI Advice */}
      {advice && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.08))', border: '1px solid rgba(124,58,237,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 40 }}>{todayMood.mood}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🤖 AI Study Advice</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{advice.msg}</div>
              <div style={{ marginTop: 8 }}>
                <span className="badge badge-purple">Study Intensity: {advice.intensity}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Week log */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>📅 This Week's Mood</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {weekLog.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                  {d.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{
                  width: '100%', aspectRatio: '1',
                  background: d.mood ? 'rgba(124,58,237,0.15)' : 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                  border: d.date.toDateString() === new Date().toDateString() ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                }}>
                  {d.mood || <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>–</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood history */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>📊 Mood History</div>
          {state.moodLog.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">😶</div><div className="empty-state-text">No moods logged yet</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...state.moodLog].reverse().slice(0, 7).map((m, i) => {
                const moodObj = MOODS.find(mo => mo.emoji === m.mood);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: 22 }}>{m.mood}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{moodObj?.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(m.date).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: j < (moodObj?.intensity || 0) ? moodObj?.color : 'var(--bg-card)' }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
