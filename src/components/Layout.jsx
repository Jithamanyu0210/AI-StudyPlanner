import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Toast from './Toast';

const NAV = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', section: 'MAIN' },
  { id: 'planner', icon: '🤖', label: 'AI Planner', section: 'MAIN' },
  { id: 'schedule', icon: '📅', label: 'Schedule Builder', section: 'MAIN' },
  { id: 'timer', icon: '⏱️', label: 'Study Timer', section: 'TOOLS' },
  { id: 'weekend', icon: '📋', label: 'Weekend Tasks', section: 'TOOLS' },
  { id: 'progress', icon: '📊', label: 'Progress', section: 'TOOLS' },
  { id: 'goals', icon: '🎯', label: 'Goals', section: 'PERSONAL' },
  { id: 'mood', icon: '😊', label: 'Mood Tracker', section: 'PERSONAL' },
  { id: 'notes', icon: '📝', label: 'Notes', section: 'PERSONAL' },
  { id: 'badges', icon: '🏆', label: 'Badges', section: 'PERSONAL' },
  { id: 'music', icon: '🎵', label: 'Focus Music', section: 'PERSONAL' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard', planner: 'AI Study Planner', schedule: 'Schedule Builder',
  timer: 'Study Timer', weekend: 'Weekend Tasks', progress: 'Progress Tracker',
  goals: 'Goal Setting', mood: 'Mood Tracker', notes: 'Notes', badges: 'Badges & Rewards', music: 'Focus Music',
};

export default function Layout({ page, setPage, authUser, onLogout, children }) {
  const { state, update, addToast } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = [...new Set(NAV.map(n => n.section))];

  return (
    <div className="app-layout">
      {/* Overlay for mobile */}
      {sidebarOpen && <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99 }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🧠</div>
          <span className="sidebar-logo-text">StudyAI</span>
        </div>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {NAV.filter(n => n.section === section).map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${page === item.id ? 'active' : ''}`}
                  onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.id === 'planner' && <span className="badge badge-purple" style={{marginLeft:'auto',fontSize:'9px'}}>AI</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar" style={{width:36,height:36,fontSize:14}}>{state.user.name[0]}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{state.user.name}</div>
            <div className="sidebar-user-role">Level {state.user.level} • {state.user.xp} XP</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <button className="btn btn-secondary btn-icon" style={{display:'none'}} id="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <span className="topbar-title">{PAGE_TITLES[page]}</span>
          </div>
          <div className="topbar-actions">
            <div style={{position:'relative'}}>
              <button className="theme-toggle" onClick={() => {
                const next = state.theme === 'dark' ? 'light' : 'dark';
                update({ theme: next });
                addToast(`${next === 'dark' ? '🌙 Dark' : '☀️ Light'} mode on`, 'info');
              }}>
                {state.theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:13,color:'var(--text-secondary)'}}>🔥 {state.user.streak}</span>
              <div
                className="avatar"
                id="profile-avatar-btn"
                title="View Profile"
                onClick={() => setPage('profile')}
                style={{cursor:'pointer'}}
              >{authUser ? authUser.avatar : state.user.name[0]}</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-enter">
          {children}
        </main>
      </div>

      <Toast toasts={state.toasts} />
    </div>
  );
}
