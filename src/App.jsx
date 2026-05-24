import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

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

  return (
    <AppProvider>
      <Layout page={page} setPage={setPage}>
        {PAGES[page]}
      </Layout>
    </AppProvider>
  );
}
