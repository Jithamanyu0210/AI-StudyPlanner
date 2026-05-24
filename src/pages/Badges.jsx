import { useApp } from '../context/AppContext';

export default function Badges() {
  const { state } = useApp();
  const earned = state.badges.filter(b => b.earned).length;

  const LEADERBOARD = [
    { rank: 1, name: 'Sarah K.', streak: 34, xp: 8200, avatar: 'S' },
    { rank: 2, name: state.user.name, streak: state.user.streak, xp: state.user.xp, avatar: state.user.name[0], isYou: true },
    { rank: 3, name: 'Mike T.', streak: 5, xp: 1900, avatar: 'M' },
    { rank: 4, name: 'Priya S.', streak: 3, xp: 1400, avatar: 'P' },
    { rank: 5, name: 'James L.', streak: 2, xp: 980, avatar: 'J' },
  ].sort((a,b) => b.xp - a.xp).map((u,i) => ({...u, rank: i+1}));

  const rankColors = ['#f59e0b','#94a3b8','#cd7c41'];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(124,58,237,0.08))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800 }}>🏆 Badges & Rewards</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Earn badges by achieving study milestones</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800, color: '#f59e0b' }}>{earned}/{state.badges.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Badges Earned</div>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: 12 }}>
          <div className="progress-fill" style={{ width: `${Math.round((earned/state.badges.length)*100)}%`, background: 'linear-gradient(90deg,#f59e0b,#ef4444)' }} />
        </div>
      </div>

      <div className="grid-2">
        {/* Badges Grid */}
        <div>
          <div className="section-title" style={{ marginBottom: 16 }}>🎖️ Your Badges</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {state.badges.map(b => (
              <div
                key={b.id}
                className="card card-sm"
                style={{
                  textAlign: 'center',
                  opacity: b.earned ? 1 : 0.45,
                  border: b.earned ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border-color)',
                  background: b.earned ? 'rgba(245,158,11,0.06)' : 'var(--bg-card)',
                  transition: 'var(--transition)',
                  filter: b.earned ? 'none' : 'grayscale(1)',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{b.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>{b.desc}</div>
                {b.earned && <div style={{ marginTop: 6, fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>✓ Earned</div>}
                {!b.earned && <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>🔒 Locked</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="section-title" style={{ marginBottom: 16 }}>🥇 Leaderboard</div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LEADERBOARD.map((u, i) => (
                <div
                  key={u.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    background: u.isYou ? 'rgba(124,58,237,0.12)' : 'var(--bg-secondary)',
                    border: u.isYou ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i < 3 ? rankColors[i] : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                    color: i < 3 ? '#000' : 'var(--text-secondary)',
                  }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : u.rank}
                  </div>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: u.isYou ? 'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))' : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                    border: u.isYou ? 'none' : '1px solid var(--border-color)',
                  }}>
                    {u.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name} {u.isYou && <span className="badge badge-purple" style={{ fontSize: 9 }}>You</span>}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>🔥 {u.streak} streak</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, color: 'var(--accent-tertiary)' }}>{u.xp}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Streak section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="card-title">❄️ Streak Freeze</div>
              <span className="badge badge-cyan">{state.streakFreeze} remaining</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              Use a streak freeze to protect your streak on days you can't study. You have <strong style={{ color: 'var(--text-primary)' }}>{state.streakFreeze}</strong> freeze(s) available.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: 3 }).map((_,i) => (
                <div key={i} style={{ fontSize: 28, opacity: i < state.streakFreeze ? 1 : 0.25 }}>❄️</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
