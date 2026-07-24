import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { studyApi } from '../api/api';

const AppContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// Pure state helpers  (no side-effects, no setState calls inside)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];

const BLANK_STATE = {
  theme: 'dark',
  user: {
    name: '',
    streak: 0, xp: 0, level: 1,
    lastStudyDate: null,       // null = never studied
    lastActiveDate: null,
  },
  customSubjects: DEFAULT_SUBJECTS,
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

/** Returns midnight timestamp for a date-string ("Mon Jul 15 2026" etc.) */
const midnight = (dateStr) => {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Add XP, recalculate level, set _levelUp flag if levelled up */
const helperAddXp = (s, amount) => {
  const newXp    = s.user.xp + amount;
  const newLevel = Math.floor(newXp / 500) + 1;
  const levelUp  = newLevel > s.user.level ? newLevel : null;
  return { ...s, user: { ...s.user, xp: newXp, level: newLevel }, _levelUp: levelUp };
};

/**
 * Record a study activity for TODAY.
 * - If already recorded today → no change
 * - If last study was yesterday → streak +1
 * - Otherwise → streak = 1 (fresh start)
 * Sets _streakMsg to new streak value so caller can toast.
 */
const helperRecordActivity = (s) => {
  const todayStr = new Date().toDateString();
  if (s.user.lastStudyDate === todayStr) return s;   // already counted today

  const todayTs    = midnight(todayStr);
  const lastTs     = midnight(s.user.lastStudyDate);
  const diffDays   = lastTs > 0 ? Math.round((todayTs - lastTs) / 864e5) : 999;
  const newStreak  = diffDays === 1 ? (s.user.streak || 0) + 1 : 1;

  const badges = s.badges.map(b => {
    if (b.id === 'b1' && s.tasks.some(t => t.done)) return { ...b, earned: true };
    if (b.id === 'b2' && newStreak >= 7)              return { ...b, earned: true };
    if (b.id === 'b5' && newStreak >= 30)             return { ...b, earned: true };
    return b;
  });

  return {
    ...s,
    badges,
    user: { ...s.user, streak: newStreak, lastStudyDate: todayStr },
    _streakMsg: newStreak,
  };
};

/**
 * Daily streak health-check — call on app open.
 * If last study was >1 day ago:
 *   - consume 1 freeze per missed day
 *   - if not enough freezes → reset streak to 0
 * Sets _missedFreeze / _streakReset flags for caller to toast.
 */
const helperCheckDailyStreak = (s) => {
  const todayStr = new Date().toDateString();

  // No history yet — initialise dates
  if (!s.user.lastStudyDate) {
    return { ...s, user: { ...s.user, lastActiveDate: todayStr } };
  }

  const todayTs  = midnight(todayStr);
  const lastTs   = midnight(s.user.lastStudyDate);
  const diffDays = Math.round((todayTs - lastTs) / 864e5);

  // Studied yesterday or today → just update lastActiveDate
  if (diffDays <= 1) {
    return { ...s, user: { ...s.user, lastActiveDate: todayStr } };
  }

  // Missed days
  const missedDays = diffDays - 1;          // days skipped (no study logged)
  const freezes    = s.streakFreeze || 0;
  const useFreeze  = Math.min(freezes, missedDays);
  const newFreeze  = freezes - useFreeze;
  const streakSaved = useFreeze >= missedDays;  // freeze covered ALL missed days
  const newStreak  = streakSaved ? s.user.streak : 0;

  return {
    ...s,
    streakFreeze:   newFreeze,
    _missedFreeze:  useFreeze > 0 ? useFreeze : null,
    _streakReset:   !streakSaved && (s.user.streak || 0) > 0,
    user: {
      ...s.user,
      streak:         newStreak,
      lastActiveDate: todayStr,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AppProvider({ authUser, children }) {
  const cleanEmail = (authUser?.email || 'guest').trim().toLowerCase();
  const lsKey     = `studyai_state_${cleanEmail}`;
  const syncTimer = useRef(null);
  const isOnline  = useRef(true);

  // Initialise from localStorage synchronously so UI is instant
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(lsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge: BLANK_STATE provides defaults for any missing keys
        return {
          ...BLANK_STATE,
          ...parsed,
          user: {
            ...BLANK_STATE.user,
            ...parsed.user,
            name: parsed.user?.name || authUser?.name || 'Student',
          },
          toasts: [],
        };
      }
    } catch { /* ignore */ }
    return {
      ...BLANK_STATE,
      user: { ...BLANK_STATE.user, name: authUser?.name || 'Student' },
    };
  });

  const [syncing, setSyncing] = useState(false);

  // ── Toasts (defined before any other hooks reference them) ─────────────────
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setState(s => ({ ...s, toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(
      () => setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) })),
      3500,
    );
  }, []);

  // ── applyAndNotify: apply a pure transform then fire any toast flags ───────
  const applyAndNotify = useCallback((transform) => {
    setState(prev => {
      const next = transform(prev);
      // Toast for level-up / streak increase (called inside setTimeout so React
      // doesn't complain about state updates during render)
      if (next._levelUp)   setTimeout(() => addToast(`🎉 Level Up! You are now Level ${next._levelUp}!`, 'success'), 0);
      if (next._streakMsg) setTimeout(() => addToast(`🔥 Streak: ${next._streakMsg} day(s)! Keep it up!`, 'success'), 0);
      // Strip internal flags before storing
      const { _levelUp, _streakMsg, _missedFreeze, _streakReset, ...clean } = next;
      return clean;
    });
  }, [addToast]);

  // ── Run daily streak check on mount (always, even without a backend token) ─
  useEffect(() => {
    applyAndNotify(prev => {
      const checked = helperCheckDailyStreak(prev);
      if (checked._missedFreeze) setTimeout(() => addToast(`❄️ Streak protected – used ${checked._missedFreeze} freeze(s)!`, 'info'), 100);
      if (checked._streakReset)  setTimeout(() => addToast('💔 Streak reset — you missed your study target.', 'error'), 100);
      return checked;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← run once on mount

  // ── Hydrate from backend when logged in ───────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const token = localStorage.getItem('studyai_token');
    if (!token) return;  // No backend token → stay with localStorage

    setSyncing(true);
    studyApi.getState()
      .then(remote => {
        isOnline.current = true;
        setState(() => {
          const merged  = { ...BLANK_STATE, ...remote, toasts: [] };
          const checked = helperCheckDailyStreak(merged);
          if (checked._missedFreeze) setTimeout(() => addToast(`❄️ Streak protected – used ${checked._missedFreeze} freeze(s)!`, 'info'), 100);
          if (checked._streakReset)  setTimeout(() => addToast('💔 Streak reset — you missed your study target.', 'error'), 100);
          const { _levelUp, _streakMsg, _missedFreeze, _streakReset, ...clean } = checked;
          return clean;
        });
      })
      .catch(() => { isOnline.current = false; })
      .finally(() => setSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email]);

  // ── Persist to localStorage + debounce backend sync on every state change ──
  useEffect(() => {
    const { toasts, ...toSave } = state;
    localStorage.setItem(lsKey, JSON.stringify(toSave));

    if (syncTimer.current) clearTimeout(syncTimer.current);
    const token = localStorage.getItem('studyai_token');
    if (!token) return;

    syncTimer.current = setTimeout(() => {
      studyApi.saveState({
        theme:            toSave.theme,
        user:             toSave.user,
        customSubjects:   toSave.customSubjects,
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
      })
        .then(() => { isOnline.current = true; })
        .catch(() => { isOnline.current = false; });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Public actions
  // ─────────────────────────────────────────────────────────────────────────────

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
        setTimeout(() => addToast(`✅ Task done! +${xp} XP`, 'success'), 0);
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
      const exists   = s.notes.find(n => n.subject === note.subject);
      const newNotes = exists
        ? s.notes.map(n => n.subject === note.subject
            ? { ...n, content: note.content, updatedAt: new Date().toISOString() }
            : n)
        : [...s.notes, { ...note, id: 'n' + Date.now(), updatedAt: new Date().toISOString() }];
      return helperRecordActivity(helperAddXp({ ...s, notes: newNotes }, 25));
    });
    addToast('Note saved! +25 XP', 'success');
  }, [addToast, applyAndNotify]);

  const logMood = useCallback((mood) => {
    applyAndNotify(s => {
      const today    = new Date().toDateString();
      const filtered = s.moodLog.filter(m => new Date(m.date).toDateString() !== today);
      return helperRecordActivity(
        helperAddXp({ ...s, moodLog: [...filtered, { mood, date: new Date().toISOString() }] }, 15)
      );
    });
    addToast('Mood logged! +15 XP', 'success');
  }, [addToast, applyAndNotify]);

  const addGoal = useCallback((goal) => {
    applyAndNotify(s =>
      helperAddXp({ ...s, goals: [...s.goals, { ...goal, id: 'g' + Date.now(), progress: 0 }] }, 20)
    );
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
        setTimeout(() => addToast(`✅ Done! +${xp} XP`, 'success'), 0);
      }
      return next;
    });
  }, [addToast, applyAndNotify]);

  const addPomodoroSession = useCallback((minutes) => {
    applyAndNotify(s => {
      let next = { ...s, pomodoroSessions: s.pomodoroSessions + 1, studyMinutes: s.studyMinutes + minutes };
      next = helperAddXp(next, 100);
      next = helperRecordActivity(next);
      if (next.pomodoroSessions >= 10)   next = { ...next, badges: next.badges.map(b => b.id === 'b3' ? { ...b, earned: true } : b) };
      if (new Date().getHours() >= 22)   next = { ...next, badges: next.badges.map(b => b.id === 'b6' ? { ...b, earned: true } : b) };
      if (next.studyMinutes >= 3000)     next = { ...next, badges: next.badges.map(b => b.id === 'b4' ? { ...b, earned: true } : b) };
      return next;
    });
    addToast('🎯 Pomodoro complete! +100 XP', 'success');
  }, [addToast, applyAndNotify]);

  const useStreakFreeze = useCallback(() => {
    setState(s => {
      if (s.streakFreeze <= 0) return s;
      setTimeout(() => addToast('❄️ Streak freeze used!', 'info'), 0);
      return { ...s, streakFreeze: s.streakFreeze - 1 };
    });
  }, [addToast]);

  // ── Dev / test helpers ─────────────────────────────────────────────────────

  /** Simulate "a new day has passed AND user studied" → streak should go up */
  const simulateNextDay = useCallback(() => {
    applyAndNotify(s => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // Pretend we studied yesterday so today counts as consecutive
      const base = { ...s, user: { ...s.user, lastStudyDate: yesterday.toDateString() } };
      return helperRecordActivity(base);
    });
  }, [applyAndNotify]);

  /** Simulate "a day was MISSED" → should consume freeze or reset */
  const simulateMissedDay = useCallback(() => {
    applyAndNotify(s => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const base = { ...s, user: { ...s.user, lastStudyDate: twoDaysAgo.toDateString() } };
      const checked = helperCheckDailyStreak(base);
      if (checked._missedFreeze) setTimeout(() => addToast(`❄️ Streak protected – used ${checked._missedFreeze} freeze(s)!`, 'info'), 0);
      if (checked._streakReset)  setTimeout(() => addToast('💔 Streak reset — missed a day.', 'error'), 0);
      return checked;
    });
  }, [addToast, applyAndNotify]);

  const addSubject = useCallback((subjectName) => {
    const trimmed = (subjectName || '').trim();
    if (!trimmed) {
      addToast('Subject name cannot be empty', 'error');
      return false;
    }
    let added = false;
    setState(s => {
      const current = s.customSubjects || DEFAULT_SUBJECTS;
      if (current.some(sub => sub.toLowerCase() === trimmed.toLowerCase())) {
        setTimeout(() => addToast(`Subject "${trimmed}" already exists`, 'info'), 0);
        return s;
      }
      added = true;
      setTimeout(() => addToast(`📚 Subject "${trimmed}" added!`, 'success'), 0);
      return { ...s, customSubjects: [...current, trimmed] };
    });
    return added;
  }, [addToast]);

  const deleteSubject = useCallback((subjectName) => {
    setState(s => {
      const current = s.customSubjects || DEFAULT_SUBJECTS;
      const updated = current.filter(sub => sub.toLowerCase() !== subjectName.toLowerCase());
      setTimeout(() => addToast(`Subject "${subjectName}" removed`, 'info'), 0);
      return { ...s, customSubjects: updated };
    });
  }, [addToast]);

  return (
    <AppContext.Provider value={{
      state, syncing, isOnline: isOnline.current,
      update,
      addSubject, deleteSubject,
      addTask, toggleTask, deleteTask,
      addNote, logMood, addGoal,
      addWeekendTask, toggleWeekendTask,
      addPomodoroSession, useStreakFreeze,
      addToast,
      simulateNextDay, simulateMissedDay,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
