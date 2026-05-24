import { useApp } from '../context/AppContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MOTIVATIONS = [
  "Keep pushing — you're closer than you think! 💪",
  "Every study session is a step toward your dream! 🌟",
  "Consistency beats perfection. Keep going! 🎯",
  "You're building your future, one session at a time! 🚀",
];

export default function Dashboard() {
  const { state } = useApp();
  const done = state.tasks.filter(t => t.done).length;
  const total = state.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const motivation = MOTIVATIONS[state.user.streak % MOTIVATIONS.length];

  const subjectMap = {};
  state.tasks.forEach(t => { subjectMap[t.subject] = (subjectMap[t.subject] || 0) + 1; });

  const donutData = {
    labels: Object.keys(subjectMap),
    datasets: [{ data: Object.values(subjectMap), backgroundColor: ['#7c3aed','#06b6d4','#f59e0b','#10b981','#ef4444'], borderWidth: 0 }],
  };

  const barData = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{ label: 'Study Hours', data: [2.5,3,1.5,4,2,3.5,1], backgroundColor: 'rgba(124,58,237,0.7)', borderRadius: 8 }],
  };

  const chartOpts = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } } } };

  const upcoming = state.tasks.filter(t => !t.done).slice(0, 4);

  return (
    <div className="page-container">
      {/* Welcome */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(124,58,237,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>{today}</p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {state.user.name.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{motivation}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="streak-fire">🔥</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800 }}>{state.user.streak}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Day Streak</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Tasks Done', value: `${done}/${total}`, icon: '✅', color: '#10b981' },
          { label: 'Pomodoros', value: state.pomodoroSessions, icon: '🍅', color: '#ef4444' },
          { label: 'Study Mins', value: state.studyMinutes, icon: '⏱️', color: '#06b6d4' },
          { label: 'XP Points', value: state.user.xp, icon: '⚡', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-grad': `linear-gradient(90deg,${s.color},${s.color}88)` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value gradient-text">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Task Progress */}
        <div className="card">
          <div className="card-title">Today's Progress</div>
          <div className="card-subtitle" style={{ marginBottom: 20 }}>Task completion overview</div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 160 }}>
              <Doughnut data={donutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } } }, cutout: '70%' }} />
            </div>
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Complete</div>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 16 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>{done} of {total} tasks completed</div>
        </div>

        {/* Weekly Bar */}
        <div className="card">
          <div className="card-title">Weekly Study Hours</div>
          <div className="card-subtitle" style={{ marginBottom: 16 }}>Hours studied per day</div>
          <Bar data={barData} options={chartOpts} />
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">📌 Upcoming Tasks</div>
          <span className="badge badge-purple">{upcoming.length} pending</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🎉</div><div className="empty-state-text">All tasks completed!</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.subject} • Due {t.deadline}</div>
                </div>
                <span className={`priority-${t.priority}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* XP Progress */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div><div className="card-title">Level {state.user.level}</div><div className="card-subtitle">{state.user.xp} / {state.user.level * 500} XP</div></div>
          <span style={{ fontSize: 32 }}>⚡</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min((state.user.xp % 500) / 5, 100)}%` }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{500 - (state.user.xp % 500)} XP to next level</div>
      </div>
    </div>
  );
}
