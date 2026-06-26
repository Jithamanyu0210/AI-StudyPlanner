import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

// Pages
import Dashboard from './pages/Dashboard';
import AiPlanner from './pages/AiPlanner';
import ScheduleBuilder from './pages/ScheduleBuilder';
import StudyTimer from './pages/StudyTimer';
import WeekendTasks from './pages/WeekendTasks';
import Progress from './pages/Progress';
import Goals from './pages/Goals';
import MoodTracker from './pages/MoodTracker';
import Notes from './pages/Notes';
import Badges from './pages/Badges';
import FocusMusic from './pages/FocusMusic';

const PAGES = {
  dashboard: <Dashboard />,
  planner: <AiPlanner />,
  schedule: <ScheduleBuilder />,
  timer: <StudyTimer />,
  weekend: <WeekendTasks />,
  progress: <Progress />,
  goals: <Goals />,
  mood: <MoodTracker />,
  notes: <Notes />,
  badges: <Badges />,
  music: <FocusMusic />,
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem('studyai_auth');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (user) => {
    // token is already stored in localStorage by LoginPage
    localStorage.setItem('studyai_auth', JSON.stringify(user));
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('studyai_auth');
    localStorage.removeItem('studyai_token');
    setAuthUser(null);
    setPage('dashboard');
  };

  const handleUpdateProfile = (updatedDetails) => {
    const newUser = { ...authUser, ...updatedDetails };
    localStorage.setItem('studyai_auth', JSON.stringify(newUser));
    setAuthUser(newUser);
  };

  // Show login if not authenticated
  if (!authUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppProvider key={authUser?.email || 'anon'} authUser={authUser}>
      <Layout page={page} setPage={setPage} authUser={authUser} onLogout={handleLogout}>
        {page === 'profile'
          ? <ProfilePage authUser={authUser} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />
          : PAGES[page]
        }
      </Layout>
    </AppProvider>
  );
}
