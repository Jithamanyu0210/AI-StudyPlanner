import { useState } from 'react';
import { useApp } from '../context/AppContext';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function generatePlan(form) {
  const hours = parseInt(form.hours) || 2;
  const days = parseInt(form.days) || 5;
  const subjects = form.subjects.length ? form.subjects : ['Mathematics'];
  const plan = [];
  let dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  for (let d = 0; d < Math.min(days, 7); d++) {
    const dayTasks = [];
    let remaining = hours * 60;
    subjects.forEach((sub, i) => {
      if (remaining <= 0) return;
      const mins = Math.min(Math.floor(remaining / (subjects.length - i)), 90);
      if (mins >= 20) {
        dayTasks.push({ subject: sub, duration: mins, type: form.difficulty === 'Hard' ? 'Deep Study' : 'Review & Practice' });
        remaining -= mins;
      }
    });
    if (dayTasks.length) plan.push({ day: dayNames[d], tasks: dayTasks });
  }
  return plan;
}

export default function AiPlanner() {
  const { state, addTask, addToast, addSubject } = useApp();
  const subjects = state.customSubjects || ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];
  
  const [form, setForm] = useState({ subjects: [], hours: '3', days: '5', difficulty: 'Medium', deadline: '', goal: '' });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const toggle = (sub) => setForm(f => ({
    ...f, subjects: f.subjects.includes(sub) ? f.subjects.filter(s => s !== sub) : [...f.subjects, sub]
  }));

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const added = addSubject(customInput.trim());
    toggle(customInput.trim());
    setCustomInput('');
    setAddingCustom(false);
  };

  const generate = () => {
    if (!form.subjects.length) { addToast('Select at least one subject', 'error'); return; }
    setLoading(true);
    setTimeout(() => { setPlan(generatePlan(form)); setLoading(false); addToast('✨ AI Plan generated!', 'success'); }, 1200);
  };

  const addToTasks = () => {
    if (!plan) return;
    plan.forEach(day => day.tasks.forEach(t => {
      addTask({ subject: t.subject, title: `${t.type} - ${t.subject}`, deadline: form.deadline || new Date(Date.now() + 7*86400000).toISOString().split('T')[0], priority: form.difficulty === 'Hard' ? 'high' : form.difficulty === 'Medium' ? 'medium' : 'low', tags: ['ai-generated'] });
    }));
    addToast('📥 Plan added to tasks!', 'success');
  };

  const COLORS = { Mathematics:'#7c3aed', Physics:'#06b6d4', Chemistry:'#f59e0b', Biology:'#10b981', English:'#ef4444', History:'#8b5cf6', 'Computer Science':'#0ea5e9', Economics:'#f97316' };

  return (
    <div className="page-container">
      <div className="grid-2">
        {/* Form */}
        <div className="card">
          <div className="card-title">🤖 Configure AI Planner</div>
          <div className="card-subtitle" style={{marginBottom:20}}>Tell the AI about your study needs</div>

          <div className="input-group">
            <label className="input-label">Select Subjects</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {subjects.map(s => (
                <div key={s} className={`chip ${form.subjects.includes(s)?'selected':''}`} onClick={() => toggle(s)}>{s}</div>
              ))}
              {!addingCustom ? (
                <div className="chip" style={{ borderStyle: 'dashed', background: 'transparent' }} onClick={() => setAddingCustom(true)}>
                  ➕ Add Subject
                </div>
              ) : (
                <form onSubmit={handleAddCustom} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Subject name..."
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    autoFocus
                    style={{ padding: '4px 10px', fontSize: 13, width: 140 }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '4px 8px', fontSize: 12 }}>Save</button>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setAddingCustom(false)}>×</button>
                </form>
              )}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div className="input-group">
              <label className="input-label">Hours per Day</label>
              <input className="input" type="number" min="1" max="12" value={form.hours} onChange={e=>setForm(f=>({...f,hours:e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Days to Plan</label>
              <input className="input" type="number" min="1" max="7" value={form.days} onChange={e=>setForm(f=>({...f,days:e.target.value}))} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Difficulty Level</label>
            <select className="input" value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}>
              {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Exam/Deadline Date</label>
            <input className="input" type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} />
          </div>

          <div className="input-group">
            <label className="input-label">Study Goal (optional)</label>
            <textarea className="input" placeholder="e.g. Score 90%+ in final exams..." value={form.goal} onChange={e=>setForm(f=>({...f,goal:e.target.value}))} style={{minHeight:60}} />
          </div>

          <button className="btn btn-primary" style={{width:'100%'}} onClick={generate} disabled={loading}>
            {loading ? <><span className="spinner"/>Generating...</> : '✨ Generate AI Schedule'}
          </button>
        </div>

        {/* Plan output */}
        <div>
          {!plan && !loading && (
            <div className="card" style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div className="empty-state">
                <div className="empty-state-icon">🤖</div>
                <div style={{fontFamily:'var(--font-heading)',fontSize:18,fontWeight:700,marginBottom:8}}>AI Ready</div>
                <div className="empty-state-text">Configure your preferences and generate a smart study schedule</div>
              </div>
            </div>
          )}
          {loading && (
            <div className="card" style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div className="empty-state">
                <div style={{fontSize:48,animation:'spin 1s linear infinite',display:'inline-block'}}>⚙️</div>
                <div style={{marginTop:16,fontWeight:600}}>AI is thinking...</div>
              </div>
            </div>
          )}
          {plan && !loading && (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div className="section-title">📅 Your AI Schedule</div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-success btn-sm" onClick={addToTasks}>📥 Save to Tasks</button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setPlan(null)}>🔄 Regenerate</button>
                </div>
              </div>
              {plan.map((day,i) => (
                <div key={i} className="card card-sm">
                  <div style={{fontWeight:700,marginBottom:10,color:'var(--accent-secondary)'}}>{day.day}</div>
                  {day.tasks.map((t,j) => (
                    <div key={j} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border-color)'}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:COLORS[t.subject]||'#7c3aed',flexShrink:0}} />
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600}}>{t.subject}</div>
                        <div style={{fontSize:12,color:'var(--text-secondary)'}}>{t.type}</div>
                      </div>
                      <span className="badge badge-purple">{t.duration} min</span>
                    </div>
                  ))}
                  <div style={{marginTop:8,fontSize:12,color:'var(--text-muted)'}}>Total: {day.tasks.reduce((a,t)=>a+t.duration,0)} min</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Tips */}
      <div className="card" style={{marginTop:24,background:'linear-gradient(135deg,rgba(6,182,212,0.08),rgba(124,58,237,0.08))'}}>
        <div className="section-title" style={{marginBottom:12}}>💡 AI Smart Suggestions</div>
        <div className="grid-3">
          {['Study Math in the morning when focus is highest 🧠','Take a 5-min break every 25 minutes to retain more 🔄','Review notes within 24 hours of learning — 70% better retention! 📖'].map((tip,i)=>(
            <div key={i} style={{padding:'12px 16px',background:'var(--bg-card)',borderRadius:'var(--radius-md)',border:'1px solid var(--border-color)',fontSize:13}}>{tip}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
