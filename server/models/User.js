import mongoose from 'mongoose';

const BadgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  desc: { type: String, required: true },
  earned: { type: Boolean, default: false }
});

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  deadline: { type: String, required: true },
  priority: { type: String, required: true },
  done: { type: Boolean, default: false },
  tags: { type: [String], default: [] }
});

const ScheduleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  day: { type: String, required: true },
  color: { type: String, default: '#7c3aed' }
});

const GoalSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  total: { type: Number, required: true },
  category: { type: String, default: 'short' }
});

const NoteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

const MoodLogSchema = new mongoose.Schema({
  mood: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() }
});

const WeekendTaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  priority: { type: String, required: true },
  done: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'A' },
  joined: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
  streak: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streakFreeze: { type: Number, default: 2 },
  lastStudyDate: { type: String, default: () => new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() },
  lastActiveDate: { type: String, default: () => new Date().toDateString() },
  badges: {
    type: [BadgeSchema],
    default: [
      { id: 'b1', name: 'First Step', icon: '🌱', desc: 'Completed your first task', earned: false },
      { id: 'b2', name: 'On Fire', icon: '🔥', desc: '7-day study streak', earned: false },
      { id: 'b3', name: 'Deep Focus', icon: '🎯', desc: 'Completed 10 Pomodoros', earned: false },
      { id: 'b4', name: 'Scholar', icon: '📚', desc: 'Study 50+ hours total', earned: false },
      { id: 'b5', name: 'Consistent', icon: '⭐', desc: '30-day streak', earned: false },
      { id: 'b6', name: 'Night Owl', icon: '🦉', desc: 'Study after 10 PM', earned: false }
    ]
  },
  pomodoroSessions: { type: Number, default: 0 },
  studyMinutes: { type: Number, default: 0 },
  
  // Study State details
  customSubjects: {
    type: [String],
    default: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics']
  },
  tasks: { type: [TaskSchema], default: [] },
  schedule: { type: [ScheduleSchema], default: [] },
  goals: { type: [GoalSchema], default: [] },
  notes: { type: [NoteSchema], default: [] },
  moodLog: { type: [MoodLogSchema], default: [] },
  weekendTasks: { type: [WeekendTaskSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
