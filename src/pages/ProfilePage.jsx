import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProfilePage({ authUser, onLogout, onUpdateProfile }) {
  const { state, update, addToast, simulateNextDay, simulateMissedDay } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: authUser.name, email: authUser.email });

  const totalTasks = state.tasks.length;
  const doneTasks = state.tasks.filter(t => t.done).length;
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const earnedBadges = state.badges.filter(b => b.earned);

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'tasks', label: '✅ Tasks' },
    { id: 'badges', label: '🏆 Badges' },
    { id: 'stats', label: '📈 Stats' },
  ];

  return (
    <div className="page-container">
      {/* Profile Hero */}
      <div className="card" style={{
        marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.12))',
        border: '1px solid rgba(124,58,237,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 100, width: 120, height: 120, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 800, color: 'white',
            border: '4px solid rgba(124,58,237,0.4)',
            boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
            flexShrink: 0,
          }}>
            {authUser.avatar}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14,
                  }}
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  style={{
                    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14,
                  }}
                  placeholder="Gmail Address"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      if (!editForm.name || !editForm.email) {
                        addToast('Please fill in all fields', 'error');
                        return;
                      }
                      if (!editForm.email.endsWith('@gmail.com')) {
                        addToast('Email must end with @gmail.com', 'error');
                        return;
                      }
                      onUpdateProfile({ name: editForm.name, email: editForm.email, avatar: editForm.name[0].toUpperCase() });
                      update({ user: { ...state.user, name: editForm.name } });
                      addToast('Profile updated!', 'success');
                      setIsEditing(false);
                    }}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={() => {
                      setEditForm({ name: authUser.name, email: authUser.email });
                      setIsEditing(false);
                    }}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, marginBottom: 0 }}>
                    {authUser.name}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4,
                      opacity: 0.7, transition: 'opacity 0.2s',
                    }}
                    title="Edit Profile"
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.7}
                  >
                    ✏️
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4, marginBottom: 10 }}>
                  📧 {authUser.email} &nbsp;•&nbsp; 📅 Joined {authUser.joined}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-purple">⚡ Level {state.user.level}</span>
                  <span className="badge badge-amber">🔥 {state.user.streak} Day Streak</span>
                  <span className="badge badge-cyan">{state.user.xp} XP</span>
                  <span className="badge badge-green">{earnedBadges.length} Badges</span>
                </div>
              </>
            )}
          </div>

          {/* Logout */}
          <button
            id="profile-logout-btn"
            onClick={onLogout}
            style={{
              padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.4)',
              background: 'rgba(239,68,68,0.08)', color: '#ef4444',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.18)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            🚪 Sign Out
          </button>
        </div>

        {/* XP Bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            <span>Level {state.user.level} Progress</span>
            <span>{state.user.xp % 500} / 500 XP</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min((state.user.xp % 500) / 5, 100)}%`,
              height: '100%', borderRadius: 100,
              background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {500 - (state.user.xp % 500)} XP to Level {state.user.level + 1}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              background: activeTab === t.id ? 'var(--bg-card)' : 'transparent',
              color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === t.id ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.2s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total Tasks', value: totalTasks, icon: '📋', color: '#7c3aed' },
              { label: 'Completed', value: doneTasks, icon: '✅', color: '#10b981' },
              { label: 'Pomodoros', value: state.pomodoroSessions, icon: '🍅', color: '#ef4444' },
              { label: 'Study Mins', value: state.studyMinutes, icon: '⏱️', color: '#06b6d4' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ '--accent-grad': `linear-gradient(90deg,${s.color},${s.color}88)` }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value gradient-text">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            {/* Completion Rate */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>Task Completion Rate</div>
              <div className="card-subtitle" style={{ marginBottom: 16 }}>Overall progress across all tasks</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: `conic-gradient(#7c3aed ${completionRate * 3.6}deg, var(--bg-secondary) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 66, height: 66, borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800,
                  }}>{completionRate}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{doneTasks} of {totalTasks} done</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {completionRate >= 80 ? '🔥 Excellent progress!' : completionRate >= 50 ? '💪 Good work, keep going!' : '📚 Keep studying!'}
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Info */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>Streak & Freezes</div>
              <div className="card-subtitle" style={{ marginBottom: 16 }}>Your study consistency</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ textAlign: 'center', flex: 1, padding: '16px', background: 'rgba(245,158,11,0.08)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: 32 }}>🔥</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>{state.user.streak}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Day Streak</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, padding: '16px', background: 'rgba(6,182,212,0.08)', borderRadius: 12, border: '1px solid rgba(6,182,212,0.2)' }}>
                  <div style={{ fontSize: 32 }}>❄️</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>{state.streakFreeze}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Freezes Left</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>🧪 Day Simulator</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Simulate day changes to test streak tracking & freezes</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={simulateNextDay}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(124,58,237,0.3)',
                        background: 'rgba(124,58,237,0.08)', color: '#a78bfa',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(124,58,237,0.18)'; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(124,58,237,0.08)'; }}
                    >
                      ⏭️ Next Day
                    </button>
                    <button
                      onClick={simulateMissedDay}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.08)', color: '#f87171',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.18)'; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(239,68,68,0.08)'; }}
                    >
                      ⚠️ Miss 1 Day
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div>
          <div className="section-header">
            <div className="section-title">All Tasks</div>
            <span className="badge badge-purple">{totalTasks} total</span>
          </div>
          {state.tasks.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-text">No tasks yet. Add tasks from the Dashboard!</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.tasks.map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', background: 'var(--bg-card)',
                  borderRadius: 12, border: '1px solid var(--border-color)',
                  opacity: t.done ? 0.65 : 1,
                }}>
                  <div style={{ fontSize: 18 }}>{t.done ? '✅' : '⏳'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {t.subject} &nbsp;•&nbsp; Due {t.deadline}
                    </div>
                  </div>
                  <span className={`priority-${t.priority}`}>{t.priority}</span>
                  {t.done && <span className="badge badge-green">Done</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BADGES TAB */}
      {activeTab === 'badges' && (
        <div>
          <div className="section-header">
            <div className="section-title">My Badges</div>
            <span className="badge badge-amber">{earnedBadges.length} earned</span>
          </div>
          <div className="grid-3">
            {state.badges.map(b => (
              <div key={b.id} className="card" style={{
                textAlign: 'center', opacity: b.earned ? 1 : 0.45,
                border: b.earned ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border-color)',
                background: b.earned ? 'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(6,182,212,0.05))' : 'var(--bg-card)',
              }}>
                <div style={{ fontSize: 44, marginBottom: 10, filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{b.desc}</div>
                <span className={`badge ${b.earned ? 'badge-green' : 'badge-purple'}`}>
                  {b.earned ? '✅ Earned' : '🔒 Locked'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Total XP Earned', value: `${state.user.xp} XP`, icon: '⚡', color: '#f59e0b' },
            { label: 'Current Level', value: `Level ${state.user.level}`, icon: '🏅', color: '#7c3aed' },
            { label: 'Study Minutes Logged', value: `${state.studyMinutes} min`, icon: '⏱️', color: '#06b6d4' },
            { label: 'Pomodoro Sessions', value: state.pomodoroSessions, icon: '🍅', color: '#ef4444' },
            { label: 'Longest Streak', value: `${state.user.streak} days`, icon: '🔥', color: '#f97316' },
            { label: 'Goals Set', value: state.goals.length, icon: '🎯', color: '#10b981' },
            { label: 'Notes Written', value: state.notes.length, icon: '📝', color: '#8b5cf6' },
            { label: 'Badges Earned', value: `${earnedBadges.length} / ${state.badges.length}`, icon: '🏆', color: '#eab308' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px', background: 'var(--bg-card)',
              borderRadius: 12, border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: 28, width: 44, textAlign: 'center' }}>{s.icon}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
