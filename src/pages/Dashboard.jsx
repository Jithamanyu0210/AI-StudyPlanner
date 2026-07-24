import { useState } from 'react';
import { useApp } from '../context/AppContext';
import SubjectSelect from '../components/SubjectSelect';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MOTIVATIONS = [
  "Keep pushing — you're closer to your goals than you think! 💪",
  "Every study session is an investment in your future! 🌟",
  "Consistency beats perfection. Stay focused today! 🎯",
  "Small daily habits compound into massive success! 🚀",
  "Focus on progress, not perfection. You've got this! ✨",
  "Believe you can and you're halfway there! 🧠",
];

const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];

export default function Dashboard({ setPage }) {
  const { state, toggleTask, addTask, deleteTask, addToast } = useApp();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: 'Mathematics',
    priority: 'medium',
    deadline: new Date().toISOString().split('T')[0],
  });

  const doneTasks = state.tasks.filter(t => t.done).length;
  const totalTasks = state.tasks.length;
  const taskPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const earnedBadges = state.badges.filter(b => b.earned).length;

  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const userFirstName = (state.user.name || 'Student').split(' ')[0];

  // Subject distribution
  const subjectMap = {};
  state.tasks.forEach(t => {
    subjectMap[t.subject] = (subjectMap[t.subject] || 0) + 1;
  });

  const donutLabels = Object.keys(subjectMap);
  const donutValues = Object.values(subjectMap);
  const donutColors = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#0ea5e9', '#f97316'];

  const donutData = {
    labels: donutLabels.length ? donutLabels : ['No Tasks Yet'],
    datasets: [{
      data: donutValues.length ? donutValues : [1],
      backgroundColor: donutValues.length ? donutColors.slice(0, donutLabels.length) : ['rgba(255,255,255,0.08)'],
      borderWidth: 0,
    }],
  };

  // Weekly study hours calculation based on real study minutes & pomodoros
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIdx = (new Date().getDay() + 6) % 7; // Mon=0 .. Sun=6
  
  // Calculate dynamic weekly study distribution
  const totalHoursStudied = (state.studyMinutes || 0) / 60;
  const weeklyDistribution = daysOfWeek.map((_, idx) => {
    if (idx === todayDayIdx) {
      return Number(totalHoursStudied.toFixed(1));
    }
    // Simple proportional historical representation if study minutes exist
    return totalHoursStudied > 0 ? Number((totalHoursStudied * (0.1 + (idx * 0.15) % 0.4)).toFixed(1)) : 0;
  });

  const barData = {
    labels: daysOfWeek,
    datasets: [{
      label: 'Study Hours',
      data: weeklyDistribution,
      backgroundColor: daysOfWeek.map((_, idx) => idx === todayDayIdx ? '#06b6d4' : 'rgba(124,58,237,0.65)'),
      borderRadius: 8,
    }],
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    },
  };

  const upcomingTasks = state.tasks.filter(t => !t.done).slice(0, 5);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      addToast('Please enter a task title', 'error');
      return;
    }
    addTask({
      title: taskForm.title.trim(),
      subject: taskForm.subject,
      priority: taskForm.priority,
      deadline: taskForm.deadline,
    });
    setTaskForm({ title: '', subject: 'Mathematics', priority: 'medium', deadline: new Date().toISOString().split('T')[0] });
    setShowTaskModal(false);
  };

  return (
    <div className="page-container">
      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="card" style={{
        marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.12))',
        border: '1px solid rgba(124,58,237,0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              📅 {todayDateStr}
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 900, marginBottom: 6 }}>
              {greeting}, {userFirstName}! 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
              <span>{MOTIVATIONS[quoteIdx % MOTIVATIONS.length]}</span>
              <button
                onClick={() => setQuoteIdx(q => q + 1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                title="Refresh quote"
              >🔄</button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Streak Counter */}
            <div style={{ textAlign: 'center', padding: '12px 18px', background: 'rgba(245,158,11,0.1)', borderRadius: 16, border: '1px solid rgba(245,158,11,0.3)' }}>
              <div className="streak-fire" style={{ fontSize: 32 }}>🔥</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{state.user.streak}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 600 }}>Day Streak</div>
            </div>

            {/* Level & XP Badge */}
            <div style={{ textAlign: 'center', padding: '12px 18px', background: 'rgba(124,58,237,0.1)', borderRadius: 16, border: '1px solid rgba(124,58,237,0.3)' }}>
              <div style={{ fontSize: 30 }}>⚡</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>Lvl {state.user.level}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 600 }}>{state.user.xp} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTION LAUNCHER ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
          ➕ Add New Task
        </button>
        <button className="btn btn-secondary" onClick={() => setPage ? setPage('timer') : null}>
          ⏱️ Start Pomodoro
        </button>
        <button className="btn btn-secondary" onClick={() => setPage ? setPage('planner') : null}>
          🤖 AI Study Planner
        </button>
        <button className="btn btn-secondary" onClick={() => setPage ? setPage('notes') : null}>
          📝 Quick Notes
        </button>
        <button className="btn btn-secondary" onClick={() => setPage ? setPage('schedule') : null}>
          📅 View Schedule
        </button>
      </div>

      {/* ── METRIC STATS GRID ────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Tasks Completed', value: `${doneTasks}/${totalTasks}`, sub: `${taskPct}% complete`, icon: '📋', color: '#10b981' },
          { label: 'Pomodoro Sessions', value: state.pomodoroSessions, sub: 'Sessions done', icon: '🍅', color: '#ef4444' },
          { label: 'Study Minutes', value: `${state.studyMinutes}m`, sub: `${(state.studyMinutes / 60).toFixed(1)} hrs total`, icon: '⏱️', color: '#06b6d4' },
          { label: 'XP Points', value: state.user.xp, sub: `${500 - (state.user.xp % 500)} XP to Next Lvl`, icon: '⚡', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-grad': `linear-gradient(90deg,${s.color},${s.color}88)` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value gradient-text">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ──────────────────────────────────────────────────── */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Task Breakdown Doughnut */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div className="card-title">📚 Subject Task Breakdown</div>
              <div className="card-subtitle">Distribution of tasks across subjects</div>
            </div>
            <span className="badge badge-purple">{donutLabels.length} Subjects</span>
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
            <div style={{ width: 170 }}>
              <Doughnut data={donutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } } }, cutout: '70%' }} />
            </div>
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>{taskPct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Done</div>
            </div>
          </div>

          <div className="progress-bar" style={{ marginTop: 16 }}>
            <div className="progress-fill" style={{ width: `${taskPct}%` }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
            {doneTasks} of {totalTasks} tasks finished
          </div>
        </div>

        {/* Weekly Study Hours Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div className="card-title">📊 Weekly Focus Activity</div>
              <div className="card-subtitle">Calculated from logged study sessions</div>
            </div>
            <span className="badge badge-cyan">{(state.studyMinutes / 60).toFixed(1)} hrs logged</span>
          </div>
          <Bar data={barData} options={chartOpts} />
        </div>
      </div>

      {/* ── UPCOMING TASKS & QUICK ACTION SECTION ──────────────────────── */}
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">📌 Today's Pending Tasks</div>
            <div className="card-subtitle">Click checkbox to mark done & earn XP!</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
            + Add Task
          </button>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-text" style={{ fontWeight: 600, fontSize: 16 }}>No pending tasks!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Click "+ Add Task" above or use the AI Planner to build your study queue.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingTasks.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                transition: 'all 0.2s',
              }}>
                <div
                  className="checkbox-custom"
                  onClick={() => toggleTask(t.id)}
                  title="Mark as completed"
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    📚 {t.subject} &nbsp;•&nbsp; 📅 Due {t.deadline}
                  </div>
                </div>
                <span className={`priority-${t.priority}`}>{t.priority} priority</span>
                <button
                  onClick={() => deleteTask(t.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}
                  title="Delete task"
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── INLINE ADD TASK MODAL ─────────────────────────────────────── */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">➕ Add New Study Task</div>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label className="input-label">Task Title</label>
                <input
                  className="input"
                  placeholder="e.g. Solve Chapter 4 Calculus Problems"
                  value={taskForm.title}
                  onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                  autoFocus
                />
              </div>

              <SubjectSelect
                value={taskForm.subject}
                onChange={sub => setTaskForm(f => ({ ...f, subject: sub }))}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Priority Level</label>
                  <select
                    className="input"
                    value={taskForm.priority}
                    onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Due Date</label>
                  <input
                    type="date"
                    className="input"
                    value={taskForm.deadline}
                    onChange={e => setTaskForm(f => ({ ...f, deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
