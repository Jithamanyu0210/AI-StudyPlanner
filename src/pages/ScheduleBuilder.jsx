import { useState } from 'react';
import { useApp } from '../context/AppContext';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const COLORS = ['#7c3aed','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6','#f97316','#0ea5e9'];
const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','History','Computer Science','Economics'];

export default function ScheduleBuilder() {
  const { state, update, addToast } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject:'Mathematics', time:'09:00', duration:'60', day:'Mon', color:COLORS[0] });
  const [dragItem, setDragItem] = useState(null);

  const addSlot = () => {
    if (!form.subject || !form.time) { addToast('Fill all fields', 'error'); return; }
    const slot = { ...form, id: 's' + Date.now(), duration: parseInt(form.duration) };
    update({ schedule: [...state.schedule, slot] });
    setShowModal(false);
    addToast('✅ Session added to schedule!', 'success');
  };

  const deleteSlot = (id) => {
    update({ schedule: state.schedule.filter(s => s.id !== id) });
    addToast('Session removed', 'info');
  };

  const getSlotsForDay = (day) => state.schedule.filter(s => s.day === day).sort((a,b) => a.time.localeCompare(b.time));

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <div className="section-title">📅 Weekly Timetable</div>
          <div style={{color:'var(--text-secondary)',fontSize:13,marginTop:2}}>Drag to rearrange • Click + to add sessions</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Add Session</button>
      </div>

      {/* Timetable Grid */}
      <div style={{overflowX:'auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8,minWidth:700}}>
          {DAYS.map(day => (
            <div key={day}>
              <div style={{textAlign:'center',padding:'8px',fontWeight:700,fontSize:13,color:'var(--text-secondary)',marginBottom:6,background:'var(--bg-secondary)',borderRadius:'var(--radius-sm)'}}>{day}</div>
              <div style={{display:'flex',flexDirection:'column',gap:6,minHeight:200}}>
                {getSlotsForDay(day).map(slot => (
                  <div
                    key={slot.id}
                    draggable
                    onDragStart={() => setDragItem(slot)}
                    style={{
                      background: slot.color + '22',
                      border: `2px solid ${slot.color}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      cursor: 'grab',
                      position: 'relative',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{fontSize:11,fontWeight:700,color:slot.color}}>{slot.time}</div>
                    <div style={{fontSize:12,fontWeight:600,marginTop:2}}>{slot.subject}</div>
                    <div style={{fontSize:11,color:'var(--text-secondary)'}}>{slot.duration}m</div>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      style={{position:'absolute',top:4,right:4,background:'none',border:'none',cursor:'pointer',fontSize:14,color:'var(--text-muted)',lineHeight:1}}
                    >×</button>
                  </div>
                ))}
                {getSlotsForDay(day).length === 0 && (
                  <div
                    style={{flex:1,border:'1px dashed var(--border-color)',borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',justifyContent:'center',minHeight:60,cursor:'pointer',color:'var(--text-muted)',fontSize:20}}
                    onClick={() => { setForm(f=>({...f,day})); setShowModal(true); }}
                  >+</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="card" style={{marginTop:20}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'center'}}>
          <span style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)'}}>Subjects:</span>
          {[...new Set(state.schedule.map(s=>s.subject))].map(sub => {
            const slot = state.schedule.find(s=>s.subject===sub);
            return <div key={sub} style={{display:'flex',alignItems:'center',gap:6,fontSize:13}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:slot?.color||'#7c3aed'}} />
              {sub}
            </div>;
          })}
          <div style={{marginLeft:'auto',fontSize:13,color:'var(--text-secondary)'}}>Total: {state.schedule.reduce((a,s)=>a+s.duration,0)} min/week</div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">➕ Add Study Session</div>
            <div className="input-group">
              <label className="input-label">Subject</label>
              <select className="input" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
                {SUBJECTS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="input-group">
                <label className="input-label">Day</label>
                <select className="input" value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}>
                  {DAYS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Start Time</label>
                <input className="input" type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Duration (minutes)</label>
              <input className="input" type="number" min="15" max="180" step="15" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Color</label>
              <div style={{display:'flex',gap:8}}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?'3px solid white':'3px solid transparent',transition:'border 0.2s'}} />
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:8}}>
              <button className="btn btn-secondary" style={{flex:1}} onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={addSlot}>Add Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
