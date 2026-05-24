import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const INITIAL_STATE = {
  theme: 'dark',
  user: { name: 'Alex Johnson', streak: 7, xp: 2450, level: 8 },
  tasks: [
    { id: 't1', subject: 'Mathematics', title: 'Calculus Chapter 5', deadline: '2026-05-07', priority: 'high', done: false, tags: ['revision'] },
    { id: 't2', subject: 'Physics', title: 'Wave Optics Notes', deadline: '2026-05-08', priority: 'medium', done: false, tags: [] },
    { id: 't3', subject: 'Chemistry', title: 'Organic Reactions', deadline: '2026-05-06', priority: 'high', done: true, tags: ['important'] },
    { id: 't4', subject: 'English', title: 'Essay Writing Practice', deadline: '2026-05-10', priority: 'low', done: false, tags: [] },
  ],
  schedule: [
    { id: 's1', subject: 'Mathematics', time: '09:00', duration: 90, day: 'Mon', color: '#7c3aed' },
    { id: 's2', subject: 'Physics', time: '11:00', duration: 60, day: 'Mon', color: '#06b6d4' },
    { id: 's3', subject: 'Chemistry', time: '14:00', duration: 75, day: 'Tue', color: '#f59e0b' },
    { id: 's4', subject: 'English', time: '16:00', duration: 45, day: 'Wed', color: '#10b981' },
  ],
  goals: [
    { id: 'g1', title: 'Complete 50 Pomodoros this month', progress: 32, total: 50, category: 'short' },
    { id: 'g2', title: 'Score 90%+ in next Math test', progress: 0, total: 1, category: 'short' },
    { id: 'g3', title: 'Master Calculus by semester end', progress: 60, total: 100, category: 'long' },
  ],
  notes: [
    { id: 'n1', subject: 'Mathematics', content: 'Integration by parts: ∫u dv = uv − ∫v du', updatedAt: new Date().toISOString() },
    { id: 'n2', subject: 'Physics', content: 'Speed of light = 3×10⁸ m/s\nSnell\'s law: n₁sinθ₁ = n₂sinθ₂', updatedAt: new Date().toISOString() },
  ],
  moodLog: [],
  pomodoroSessions: 0,
  studyMinutes: 0,
  badges: [
    { id: 'b1', name: 'First Step', icon: '🌱', desc: 'Completed your first task', earned: true },
    { id: 'b2', name: 'On Fire', icon: '🔥', desc: '7-day study streak', earned: true },
    { id: 'b3', name: 'Deep Focus', icon: '🎯', desc: 'Completed 10 Pomodoros', earned: false },
    { id: 'b4', name: 'Scholar', icon: '📚', desc: 'Study 50+ hours total', earned: false },
    { id: 'b5', name: 'Consistent', icon: '⭐', desc: '30-day streak', earned: false },
    { id: 'b6', name: 'Night Owl', icon: '🦉', desc: 'Study after 10 PM', earned: true },
  ],
  weekendTasks: [
    { id: 'w1', title: 'Revise Math formulas', subject: 'Mathematics', priority: 'high', done: false },
    { id: 'w2', title: 'Solve 20 Physics MCQs', subject: 'Physics', priority: 'medium', done: false },
  ],
  streakFreeze: 2,
  toasts: [],
};

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('studyai_state');
      return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
    } catch { return INITIAL_STATE; }
  });

  useEffect(() => {
    const { toasts, ...toSave } = state;
    localStorage.setItem('studyai_state', JSON.stringify(toSave));
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const update = (patch) => setState(s => ({ ...s, ...patch }));

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setState(s => ({ ...s, toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  };

  const addTask = (task) => {
    const newTask = { ...task, id: 't' + Date.now(), done: false };
    update({ tasks: [...state.tasks, newTask] });
    addToast('Task added!', 'success');
  };

  const toggleTask = (id) => {
    update({ tasks: state.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) });
  };

  const deleteTask = (id) => {
    update({ tasks: state.tasks.filter(t => t.id !== id) });
    addToast('Task deleted', 'info');
  };

  const addNote = (note) => {
    const existing = state.notes.find(n => n.subject === note.subject);
    if (existing) {
      update({ notes: state.notes.map(n => n.subject === note.subject ? { ...n, content: note.content, updatedAt: new Date().toISOString() } : n) });
    } else {
      update({ notes: [...state.notes, { ...note, id: 'n' + Date.now(), updatedAt: new Date().toISOString() }] });
    }
    addToast('Note saved!', 'success');
  };

  const logMood = (mood) => {
    const today = new Date().toDateString();
    const filtered = state.moodLog.filter(m => new Date(m.date).toDateString() !== today);
    update({ moodLog: [...filtered, { mood, date: new Date().toISOString() }] });
    addToast(`Mood logged: ${mood}`, 'success');
  };

  const addGoal = (goal) => {
    update({ goals: [...state.goals, { ...goal, id: 'g' + Date.now(), progress: 0 }] });
    addToast('Goal added!', 'success');
  };

  const addWeekendTask = (task) => {
    update({ weekendTasks: [...state.weekendTasks, { ...task, id: 'w' + Date.now(), done: false }] });
    addToast('Weekend task added!', 'success');
  };

  const toggleWeekendTask = (id) => {
    update({ weekendTasks: state.weekendTasks.map(t => t.id === id ? { ...t, done: !t.done } : t) });
  };

  const addPomodoroSession = (minutes) => {
    update({ pomodoroSessions: state.pomodoroSessions + 1, studyMinutes: state.studyMinutes + minutes });
    addToast('🎯 Pomodoro complete! Great focus!', 'success');
  };

  const useStreakFreeze = () => {
    if (state.streakFreeze > 0) {
      update({ streakFreeze: state.streakFreeze - 1 });
      addToast('❄️ Streak freeze used!', 'info');
    }
  };

  return (
    <AppContext.Provider value={{ state, update, addTask, toggleTask, deleteTask, addNote, logMood, addGoal, addWeekendTask, toggleWeekendTask, addPomodoroSession, useStreakFreeze, addToast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
