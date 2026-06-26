import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { studyApi } from '../api/api';

const AppContext = createContext(null);

// ── Pure state helpers (no side-effects) ─────────────────────────────────────

const BLANK_STATE = {
  theme: 'dark',
  user: {
    name: '',
    streak: 1, xp: 0, level: 1,
    lastStudyDate: new Date(Date.now() - 864e5).toDateString(),
    lastActiveDate: new Date().toDateString(),
  },
  tasks: [], schedule: [], goals: [], notes: [],
  moodLog: [], weekendTasks: [],
  pomodoroSessions: 0, studyMinutes: 0,
  streakFreeze: 2,
  badges: [
    { id: 'b1', name: 'First Step',  icon: '🌱', desc: 'Completed your first task',   earned: false },
    { id: 'b2', name: 'On Fire',     icon: '🔥', desc: '7-day study streak',           earned: false },
    { id: 'b3', name: 'Deep Focus',  icon: '🎯', desc: 'Completed 10 Pomodoros',       earned: false },
    { id: 'b4', name: 'Scholar',     icon: '📚', desc: 'Study 50+ hours total',        earned: false },
    { id: 'b5', name: 'Consistent',  icon: '⭐', desc: '30-day streak',                earned: false },
    { id: 'b6', name: 'Night Owl',   icon: '🦉', desc: 'Study after 10 PM',            earned: false },
  ],
  toasts: [],
};

const helperAddXp = (s, amount) => {
  const newXp    = s.user.xp + amount;
  const newLevel = Math.floor(newXp / 500) + 1;
  return { ...s, user: { ...s.user, xp: newXp, level: newLevel }, _levelUp: newLevel > s.user.level ? newLevel : null };
};

const helperRecordActivity = (s) => {
  const todayStr = new Date().toDateString();
  if (s.user.lastStudyDate === todayStr) return s;

  const diff = Math.floor(
    (new Date(todayStr) - new Date(s.user.lastStudyDate || 0)) / 864e5
  );
  const newStreak = diff === 1 ? s.user.streak + 1 : 1;

  const badges = s.badges.map(b => {
    if (b.id === 'b1' && s.tasks.some(t => t.done)) return { ...b, earned: true };
    if (b.id === 'b2' && newStreak >= 7)  return { ...b, earned: true };
    if (b.id === 'b5' && newStreak >= 30) return { ...b, earned: true };
    return b;
  });

  return { ...s, badges, user: { ...s.user, streak: newStreak, lastStudyDate: todayStr }, _streakMsg: newStreak };
};

const helperCheckDailyStreak = (s) => {
  const todayStr = new Date().toDateString();
  if (!s.user.lastStudyDate) return { ...s, user: { ...s.user, lastStudyDate: todayStr, lastActiveDate: todayStr } };

  const diff = Math.floor(
    (new Date(todayStr) - new Date(s.user.lastStudyDate)) / 864e5
  );
  if (diff <= 1) return { ...s, user: { ...s.user, lastActiveDate: todayStr } };

  const missed   = diff - 1;
  const freezes  = s.streakFreeze || 0;
  const useFreeze = Math.min(freezes, missed);
  const newFreeze = freezes - useFreeze;
  const newStreak = newFreeze < missed - useFreeze + 1 ? 0 : s.user.streak;
  const yesterday = new Date(new Date(todayStr) - 864e5).toDateString();

  return {
    ...s,
    streakFreeze: newFreeze,
    _missedFreeze: useFreeze > 0 ? useFreeze : null,
    _streakReset:  newStreak === 0 && s.user.streak > 0,
    user: {
      ...s.user,
      streak:         newStreak,
      lastActiveDate: todayStr,
      lastStudyDate:  newStreak > 0 ? yesterday : s.user.lastStudyDate,
    },
  };
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ authUser, children }) {
  const lsKey    = `studyai_state_${authUser?.email || 'guest'}`;
  const syncTimer = useRef(null);
  const isOnline  = useRef(true);

  // Initialise from localStorage synchronously so UI is instant
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(lsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...BLANK_STATE, ...parsed, toasts: [] };
      }
    } catch { /* ignore */ }
    return { ...BLANK_STATE, user: { ...BLANK_STATE.user, name: authUser?.name || '' } };
  });

  const [syncing, setSyncing] = useState(false);

  // ── Toast helpers (defined early so other hooks can reference them) ─────────
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setState(s => ({ ...s, toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  }, []);

  // ── Pull latest state from backend on login (hydrate) ─────────────────────
  useEffect(() => {
    if (!authUser) return;
    const token = localStorage.getItem('studyai_token');
    if (!token) return;   // guest / no token → use localStorage only

    setSyncing(true);
    studyApi.getState()
      .then(remote => {
        isOnline.current = true;
        setState(prev => {
          const merged = { ...BLANK_STATE, ...remote, toasts: [] };
          // run daily streak check on fresh remote data
          const checked = helperCheckDailyStreak(merged);
          if (checked._missedFreeze) addToast(`❄️ Streak protected by using ${checked._missedFreeze} freeze(s)!`, 'info');
          if (checked._streakReset)  addToast('💔 Streak reset — you missed your study target.', 'error');
          return checked;
        });
      })
      .catch(() => {
        isOnline.current = false;
        // still run daily streak check on local data
        setState(prev => {
          const checked = helperCheckDailyStreak(prev);
          if (checked._missedFreeze) addToast(`❄️ Streak protected by using ${checked._missedFreeze} freeze(s)!`, 'info');
          if (checked._streakReset)  addToast('💔 Streak reset — you missed your study target.', 'error');
          return checked;
        });
      })
      .finally(() => setSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email]);

  // ── Persist to localStorage + debounced backend sync on every state change ─
  useEffect(() => {
    const { toasts, ...toSave } = state;
    localStorage.setItem(lsKey, JSON.stringify(toSave));

    // Debounce backend sync (1 s)
    if (syncTimer.current) clearTimeout(syncTimer.current);
    const token = localStorage.getItem('studyai_token');
    if (!token) return;

    syncTimer.current = setTimeout(() => {
      studyApi.saveState({
        theme:            toSave.theme,
        user:             toSave.user,
        tasks:            toSave.tasks,
        schedule:         toSave.schedule,
        goals:            toSave.goals,
        notes:            toSave.notes,
        moodLog:          toSave.moodLog,
        pomodoroSessions: toSave.pomodoroSessions,
        studyMinutes:     toSave.studyMinutes,
        badges:           toSave.badges,
        weekendTasks:     toSave.weekendTasks,
        streakFreeze:     toSave.streakFreeze,
      }).then(() => { isOnline.current = true; })
        .catch(() => { isOnline.current = false; });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // ── Helpers that emit toasts after level-up / streak msgs ─────────────────
  const applyAndNotify = useCallback((transform) => {
    setState(prev => {
      const next = transform(prev);
      if (next._levelUp)   addToast(`🎉 Level Up! You are now Level ${next._levelUp}!`, 'success');
      if (next._streakMsg) addToast(`🔥 Study streak: ${next._streakMsg} day(s)! Keep it up!`, 'success');
      // clean internal flags
      const { _levelUp, _streakMsg, _missedFreeze, _streakReset, ...clean } = next;
      return clean;
    });
  }, [addToast]);

  // ── Public actions ─────────────────────────────────────────────────────────
  const update = useCallback((patch) => setState(s => ({ ...s, ...patch })), []);

  const addTask = useCallback((task) => {
    const newTask = { ...task, id: 't' + Date.now(), done: false };
    applyAndNotify(s => helperAddXp({ ...s, tasks: [...s.tasks, newTask] }, 10));
    addToast('Task added! +10 XP', 'success');
  }, [addToast, applyAndNotify]);

  const toggleTask = useCallback((id) => {
    applyAndNotify(s => {
      const task = s.tasks.find(t => t.id === id);
      if (!task) return s;
      const becameDone = !task.done;
      let next = { ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, done: becameDone } : t) };
      if (becameDone) {
        const xp = task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 15;
        next = helperAddXp(next, xp);
        next = helperRecordActivity(next);
        // First Step badge
        next = { ...next, badges: next.badges.map(b => b.id === 'b1' ? { ...b, earned: true } : b) };
        addToast(`✅ Task done! +${xp} XP`, 'success');
      }
      return next;
    });
  }, [addToast, applyAndNotify]);

  const deleteTask = useCallback((id) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
    addToast('Task deleted', 'info');
  }, [addToast]);

  const addNote = useCallback((note) => {
    applyAndNotify(s => {
      const exists = s.notes.find(n => n.subject === note.subject);
      const newNotes = exists
        ? s.notes.map(n => n.subject === note.subject ? { ...n, content: note.content, updatedAt: new Date().toISOString() } : n)
        : [...s.notes, { ...note, id: 'n' + Date.now(), updatedAt: new Date().toISOString() }];
      return helperRecordActivity(helperAddXp({ ...s, notes: newNotes }, 25));
    });
    addToast('Note saved! +25 XP', 'success');
  }, [addToast, applyAndNotify]);

  const logMood = useCallback((mood) => {
    applyAndNotify(s => {
      const today   = new Date().toDateString();
      const filtered = s.moodLog.filter(m => new Date(m.date).toDateString() !== today);
      return helperRecordActivity(helperAddXp({ ...s, moodLog: [...filtered, { mood, date: new Date().toISOString() }] }, 15));
    });
    addToast(`Mood logged! +15 XP`, 'success');
  }, [addToast, applyAndNotify]);

  const addGoal = useCallback((goal) => {
    applyAndNotify(s => helperAddXp({ ...s, goals: [...s.goals, { ...goal, id: 'g' + Date.now(), progress: 0 }] }, 20));
    addToast('Goal added! +20 XP', 'success');
  }, [addToast, applyAndNotify]);

  const addWeekendTask = useCallback((task) => {
    setState(s => ({ ...s, weekendTasks: [...s.weekendTasks, { ...task, id: 'w' + Date.now(), done: false }] }));
    addToast('Weekend task added!', 'success');
  }, [addToast]);

  const toggleWeekendTask = useCallback((id) => {
    applyAndNotify(s => {
      const task = s.weekendTasks.find(t => t.id === id);
      if (!task) return s;
      const becameDone = !task.done;
      let next = { ...s, weekendTasks: s.weekendTasks.map(t => t.id === id ? { ...t, done: becameDone } : t) };
      if (becameDone) {
        const xp = task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 15;
        next = helperRecordActivity(helperAddXp(next, xp));
        addToast(`✅ Done! +${xp} XP`, 'success');
      }
      return next;
    });
  }, [addToast, applyAndNotify]);

  const addPomodoroSession = useCallback((minutes) => {
    applyAndNotify(s => {
      let next = { ...s, pomodoroSessions: s.pomodoroSessions + 1, studyMinutes: s.studyMinutes + minutes };
      next = helperAddXp(next, 100);
      next = helperRecordActivity(next);
      // Deep Focus badge (10 sessions)
      if (next.pomodoroSessions >= 10) {
        next = { ...next, badges: next.badges.map(b => b.id === 'b3' ? { ...b, earned: true } : b) };
      }
      // Night Owl badge
      if (new Date().getHours() >= 22) {
        next = { ...next, badges: next.badges.map(b => b.id === 'b6' ? { ...b, earned: true } : b) };
      }
      // Scholar badge (50 hrs = 3000 min)
      if (next.studyMinutes >= 3000) {
        next = { ...next, badges: next.badges.map(b => b.id === 'b4' ? { ...b, earned: true } : b) };
      }
      return next;
    });
    addToast('🎯 Pomodoro complete! +100 XP', 'success');
  }, [addToast, applyAndNotify]);

  const useStreakFreeze = useCallback(() => {
    if (state.streakFreeze > 0) {
      setState(s => ({ ...s, streakFreeze: s.streakFreeze - 1 }));
      addToast('❄️ Streak freeze used!', 'info');
    }
  }, [state.streakFreeze, addToast]);

  const simulateNextDay = useCallback(() => {
    applyAndNotify(s => {
      const shd = new Date(s.user.lastStudyDate || new Date());
      shd.setDate(shd.getDate() - 1);
      return helperCheckDailyStreak({ ...s, user: { ...s.user, lastStudyDate: shd.toDateString() } });
    });
  }, [applyAndNotify]);

  const simulateMissedDay = useCallback(() => {
    applyAndNotify(s => {
      const shd = new Date(s.user.lastStudyDate || new Date());
      shd.setDate(shd.getDate() - 2); // 2 days back = missed 1 day
      return helperCheckDailyStreak({ ...s, user: { ...s.user, lastStudyDate: shd.toDateString() } });
    });
  }, [applyAndNotify]);

  return (
    <AppContext.Provider value={{
      state, syncing, isOnline: isOnline.current,
      update, addTask, toggleTask, deleteTask,
      addNote, logMood, addGoal,
      addWeekendTask, toggleWeekendTask,
      addPomodoroSession, useStreakFreeze, addToast,
      simulateNextDay, simulateMissedDay,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
