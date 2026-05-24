import { useApp } from '../context/AppContext';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

export default function Progress() {
  const { state } = useApp();
  const tasks = state.tasks;
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;

  // Subject-wise
  const subjects = [...new Set(tasks.map(t => t.subject))];
  const subjectStats = subjects.map(sub => ({
    subject: sub,
    total: tasks.filter(t => t.subject === sub).length,
    done: tasks.filter(t => t.subject === sub && t.done).length,
  }));

  const barData = {
    labels: subjects,
    datasets: [
      { label: 'Completed', data: subjectStats.map(s => s.done), backgroundColor: '#7c3aed', borderRadius: 6 },
      { label: 'Remaining', data: subjectStats.map(s => s.total - s.done), backgroundColor: 'rgba(124,58,237,0.2)', borderRadius: 6 },
    ],
  };

  const lineData = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Study Hours',
      data: [2.5, 3.2, 1.8, 4.1, 2.9, 3.5, 1.2],
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#06b6d4',
      pointRadius: 4,
    }],
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    },
  };

  const stats = [
    { label: 'Total Tasks', value: total, icon: '📋', color: '#7c3aed' },
    { label: 'Completed', value: done, icon: '✅', color: '#10b981' },
    { label: 'Pending', value: total - done, icon: '⏳', color: '#f59e0b' },
    { label: 'Completion Rate', value: `${total ? Math.round((done/total)*100) : 0}%`, icon: '📈', color: '#06b6d4' },
  ];

  return (
    <div className="page-container">
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-grad': `linear-gradient(90deg,${s.color},${s.color}88)` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Subject-wise Bar */}
        <div className="card">
          <div className="card-title">📚 Subject-wise Progress</div>
          <div className="card-subtitle" style={{ marginBottom: 16 }}>Tasks completed per subject</div>
          <Bar data={barData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
        </div>

        {/* Weekly Line */}
        <div className="card">
          <div className="card-title">📈 Weekly Study Trend</div>
          <div className="card-subtitle" style={{ marginBottom: 16 }}>Hours studied each day</div>
          <Line data={lineData} options={chartOpts} />
        </div>
      </div>

      {/* Subject Progress Bars */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>🎯 Subject Completion</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {subjectStats.map((s, i) => {
            const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
            const colors = ['#7c3aed','#06b6d4','#f59e0b','#10b981','#ef4444'];
            const color = colors[i % colors.length];
            return (
              <div key={s.subject}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{s.subject}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.done}/{s.total} tasks • {pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}88)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pomodoro Stats */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">🍅 Pomodoro Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            {[
              { label: 'Sessions', value: state.pomodoroSessions, icon: '🍅' },
              { label: 'Total Minutes', value: state.studyMinutes, icon: '⏱️' },
              { label: 'Hours Studied', value: Math.round(state.studyMinutes / 60), icon: '📚' },
              { label: 'Avg per Day', value: Math.round(state.studyMinutes / 7) + 'm', icon: '📅' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">🔥 Streak Info</div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56 }}>🔥</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 48, fontWeight: 800, color: '#f59e0b' }}>{state.user.streak}</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Day Streak</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: i < (state.user.streak % 7) || state.user.streak >= 7 ? '#f59e0b' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {i < (state.user.streak % 7) || state.user.streak >= 7 ? '🔥' : ''}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>❄️ Streak Freezes: {state.streakFreeze}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
