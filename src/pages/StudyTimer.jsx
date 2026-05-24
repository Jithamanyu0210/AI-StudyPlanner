import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const MODES = [
  { label: 'Pomodoro', work: 25, break: 5 },
  { label: 'Long Focus', work: 50, break: 10 },
  { label: 'Short Sprint', work: 15, break: 3 },
];

export default function StudyTimer() {
  const { addPomodoroSession, addToast } = useApp();
  const [modeIdx, setModeIdx] = useState(0);
  const [customWork, setCustomWork] = useState('');
  const [customBreak, setCustomBreak] = useState('');
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(MODES[0].work * 60);
  const [sessions, setSessions] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const intervalRef = useRef(null);

  const mode = MODES[modeIdx];
  const workMins = customWork ? parseInt(customWork) : mode.work;
  const breakMins = customBreak ? parseInt(customBreak) : mode.break;
  const totalSecs = isWork ? workMins * 60 : breakMins * 60;
  const pct = ((totalSecs - seconds) / totalSecs) * 100;
  const radius = 100;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  useEffect(() => {
    setSeconds(workMins * 60);
    setIsWork(true);
    setRunning(false);
  }, [modeIdx, customWork, customBreak]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (isWork) {
              addPomodoroSession(workMins);
              setSessions(prev => [...prev, { type: 'Work', mins: workMins, time: new Date().toLocaleTimeString() }]);
              setIsWork(false);
              setSeconds(breakMins * 60);
              addToast('🍅 Work session done! Time for a break.', 'success');
            } else {
              setIsWork(true);
              setSeconds(workMins * 60);
              addToast('☀️ Break over! Ready to focus?', 'info');
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, isWork]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const reset = () => { setRunning(false); setSeconds(workMins*60); setIsWork(true); };

  return (
    <div className={`page-container ${focusMode ? 'focus-mode' : ''}`} style={focusMode ? {position:'fixed',inset:0,zIndex:300,background:'var(--bg-primary)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40} : {}}>

      {/* Mode tabs */}
      {!focusMode && (
        <div style={{display:'flex',gap:4,background:'var(--bg-secondary)',padding:4,borderRadius:'var(--radius-md)',marginBottom:24,width:'fit-content'}}>
          {MODES.map((m,i) => (
            <button key={i} className={`tab ${modeIdx===i?'active':''}`} onClick={()=>setModeIdx(i)}>{m.label}</button>
          ))}
        </div>
      )}

      <div style={{display:'flex',gap:24,flexWrap:'wrap',justifyContent:'center'}}>
        {/* Timer */}
        <div className="card" style={{textAlign:'center',minWidth:300,flex:'0 0 auto'}}>
          <div style={{marginBottom:12}}>
            <span className={`badge ${isWork?'badge-purple':'badge-green'}`}>{isWork?'🎯 Focus Time':'☕ Break Time'}</span>
          </div>

          <div style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',margin:'16px 0'}}>
            <svg width="240" height="240" viewBox="0 0 240 240">
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isWork?'#7c3aed':'#10b981'} />
                  <stop offset="100%" stopColor={isWork?'#06b6d4':'#06b6d4'} />
                </linearGradient>
              </defs>
              <circle cx="120" cy="120" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="10" />
              <circle cx="120" cy="120" r={radius} fill="none" stroke="url(#timerGrad)" strokeWidth="10"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                style={{transform:'rotate(-90deg)',transformOrigin:'center',transition:'stroke-dashoffset 1s linear'}} />
            </svg>
            <div style={{position:'absolute',textAlign:'center'}}>
              <div style={{fontFamily:'var(--font-heading)',fontSize:48,fontWeight:800,letterSpacing:-2}}>{fmt(seconds)}</div>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>{isWork?'Work Session':'Break'}</div>
            </div>
          </div>

          <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:16}}>
            <button className="btn btn-secondary btn-icon" onClick={reset} title="Reset">↺</button>
            <button className={`btn btn-lg ${running?'btn-danger':'btn-primary'}`} style={{minWidth:120}} onClick={()=>setRunning(r=>!r)}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button className="btn btn-secondary btn-icon" onClick={()=>setFocusMode(f=>!f)} title="Focus Mode">🎯</button>
          </div>

          {/* Custom */}
          <div style={{display:'flex',gap:8}}>
            <div className="input-group" style={{flex:1,marginBottom:0}}>
              <label className="input-label">Work (min)</label>
              <input className="input" type="number" min="1" max="120" placeholder={workMins} value={customWork} onChange={e=>setCustomWork(e.target.value)} />
            </div>
            <div className="input-group" style={{flex:1,marginBottom:0}}>
              <label className="input-label">Break (min)</label>
              <input className="input" type="number" min="1" max="30" placeholder={breakMins} value={customBreak} onChange={e=>setCustomBreak(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Session history */}
        {!focusMode && (
          <div className="card" style={{flex:1,minWidth:260}}>
            <div className="section-title" style={{marginBottom:16}}>📋 Session History</div>
            {sessions.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">⏱️</div><div className="empty-state-text">No sessions yet. Start your first Pomodoro!</div></div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[...sessions].reverse().map((s,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'var(--bg-secondary)',borderRadius:'var(--radius-md)'}}>
                    <span style={{fontSize:20}}>🍅</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{s.type} Session</div>
                      <div style={{fontSize:11,color:'var(--text-secondary)'}}>{s.mins} minutes • {s.time}</div>
                    </div>
                    <span className="badge badge-green">+{s.mins*2} XP</span>
                  </div>
                ))}
              </div>
            )}
            {sessions.length > 0 && (
              <div style={{marginTop:16,padding:'12px 16px',background:'rgba(124,58,237,0.1)',borderRadius:'var(--radius-md)',border:'1px solid rgba(124,58,237,0.2)'}}>
                <div style={{fontSize:13,fontWeight:600}}>Total: {sessions.reduce((a,s)=>a+s.mins,0)} minutes studied today 🎉</div>
              </div>
            )}
          </div>
        )}
      </div>

      {focusMode && (
        <button className="btn btn-secondary" style={{marginTop:32}} onClick={()=>setFocusMode(false)}>Exit Focus Mode</button>
      )}
    </div>
  );
}
