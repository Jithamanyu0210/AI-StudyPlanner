import { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 1, name: 'Lo-Fi Study Beats', genre: 'Lo-Fi', icon: '🎵', color: '#7c3aed', freq: [0.5, 0.3, 0.4, 0.2, 0.6, 0.3, 0.5, 0.4] },
  { id: 2, name: 'Rain & Thunder', genre: 'Ambient', icon: '🌧️', color: '#06b6d4', freq: [0.8, 0.6, 0.9, 0.7, 0.8, 0.6, 0.7, 0.9] },
  { id: 3, name: 'White Noise', genre: 'Focus', icon: '🌊', color: '#10b981', freq: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] },
  { id: 4, name: 'Forest Ambience', genre: 'Nature', icon: '🌿', color: '#f59e0b', freq: [0.4, 0.6, 0.3, 0.7, 0.5, 0.4, 0.6, 0.3] },
  { id: 5, name: 'Cafe Sounds', genre: 'Ambient', icon: '☕', color: '#f97316', freq: [0.3, 0.5, 0.7, 0.4, 0.6, 0.3, 0.5, 0.4] },
  { id: 6, name: 'Ocean Waves', genre: 'Nature', icon: '🌊', color: '#0ea5e9', freq: [0.6, 0.8, 0.5, 0.9, 0.6, 0.8, 0.5, 0.7] },
];

function Visualizer({ playing, color, freqs }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {freqs.map((f, i) => (
        <div
          key={i}
          style={{
            width: 6, borderRadius: 3,
            background: color,
            height: playing ? `${f * 36 + 4}px` : '4px',
            transition: `height ${0.3 + i * 0.05}s ease`,
            animation: playing ? `musicBounce ${0.6 + i * 0.1}s ease infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function FocusMusic() {
  const [playing, setPlaying] = useState(null);
  const [volume, setVolume] = useState(70);
  const [timer, setTimer] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const current = TRACKS.find(t => t.id === playing);

  return (
    <div className="page-container">
      {/* Now Playing */}
      <div className="card" style={{ marginBottom: 24, background: playing ? `linear-gradient(135deg,${current.color}18,rgba(0,0,0,0.1))` : undefined, border: playing ? `1px solid ${current?.color}44` : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-lg)',
            background: playing ? `linear-gradient(135deg,${current.color},${current.color}88)` : 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, flexShrink: 0,
            animation: playing ? 'spin 8s linear infinite' : 'none',
            boxShadow: playing ? `0 0 30px ${current?.color}66` : 'none',
          }}>
            {playing ? current.icon : '🎵'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800 }}>
              {playing ? current.name : 'Select a track to play'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              {playing ? `${current.genre} • ${fmt(elapsed)} elapsed` : 'Ambient sounds for deep focus'}
            </div>
            {playing && <Visualizer playing={!!playing} color={current.color} freqs={current.freq} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔊</span>
              <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(e.target.value)}
                style={{ width: 100, accentColor: 'var(--accent-primary)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 30 }}>{volume}%</span>
            </div>
            {playing && <button className="btn btn-danger btn-sm" onClick={() => { setPlaying(null); setElapsed(0); }}>⏹ Stop</button>}
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="section-title" style={{ marginBottom: 16 }}>🎼 Sound Library</div>
      <div className="grid-3">
        {TRACKS.map(t => (
          <div
            key={t.id}
            className="card"
            style={{
              cursor: 'pointer',
              border: playing === t.id ? `2px solid ${t.color}` : '1px solid var(--border-color)',
              background: playing === t.id ? `${t.color}12` : 'var(--bg-card)',
              transition: 'var(--transition)',
            }}
            onClick={() => { setPlaying(playing === t.id ? null : t.id); setElapsed(0); }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: `${t.color}22`, border: `1px solid ${t.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {t.icon}
              </div>
              <span className="badge" style={{ background: `${t.color}22`, color: t.color }}>{t.genre}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.name}</div>
            <div style={{ marginBottom: 12 }}>
              <Visualizer playing={playing === t.id} color={t.color} freqs={t.freq} />
            </div>
            <button
              className="btn"
              style={{
                width: '100%', background: playing === t.id ? t.color : 'transparent',
                border: `1px solid ${t.color}`, color: playing === t.id ? '#fff' : t.color,
                fontSize: 13,
              }}
            >
              {playing === t.id ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        ))}
      </div>

      {/* Timer */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>⏱️ Auto-stop Timer</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[15, 30, 45, 60, 90].map(m => (
            <button
              key={m}
              className={`btn ${timer === m ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTimer(timer === m ? null : m)}
            >
              {m} min
            </button>
          ))}
          {timer && <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>Auto-stop after {timer} minutes</span>}
        </div>
      </div>
    </div>
  );
}
