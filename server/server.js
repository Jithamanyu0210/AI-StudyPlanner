import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import auth from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyplanner';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected →', mongoURI.includes('atlas') ? 'Atlas Cloud' : 'Local'))
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    console.error('👉 Set MONGODB_URI in server/.env to a MongoDB Atlas connection string.');
    console.error('   Free cluster: https://www.mongodb.com/atlas/database');
  });

// Health-check
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disc 1=conn 2=conn 3=disc
  res.json({
    server:   'ok',
    database: ['disconnected','connected','connecting','disconnecting'][dbState] || 'unknown',
  });
});

// 1. SignUp Route
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        joined: user.joined
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        joined: user.joined
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Get study state (Sync)
app.get('/api/study/state', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return all study fields
    res.json({
      theme: user.theme || 'dark',
      user: {
        name: user.name,
        streak: user.streak,
        xp: user.xp,
        level: user.level,
        streakFreeze: user.streakFreeze,
        lastStudyDate: user.lastStudyDate,
        lastActiveDate: user.lastActiveDate
      },
      customSubjects: user.customSubjects || ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'],
      tasks: user.tasks,
      schedule: user.schedule,
      goals: user.goals,
      notes: user.notes,
      moodLog: user.moodLog,
      pomodoroSessions: user.pomodoroSessions,
      studyMinutes: user.studyMinutes,
      badges: user.badges,
      weekendTasks: user.weekendTasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Save/Update study state (Sync)
app.post('/api/study/state', auth, async (req, res) => {
  const { theme, user: userStats, customSubjects, tasks, schedule, goals, notes, moodLog, pomodoroSessions, studyMinutes, badges, weekendTasks, streakFreeze } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user properties
    if (userStats) {
      if (userStats.name) user.name = userStats.name;
      if (userStats.streak !== undefined) user.streak = userStats.streak;
      if (userStats.xp !== undefined) user.xp = userStats.xp;
      if (userStats.level !== undefined) user.level = userStats.level;
      if (userStats.lastStudyDate) user.lastStudyDate = userStats.lastStudyDate;
      if (userStats.lastActiveDate) user.lastActiveDate = userStats.lastActiveDate;
    }
    
    if (streakFreeze !== undefined) user.streakFreeze = streakFreeze;
    if (pomodoroSessions !== undefined) user.pomodoroSessions = pomodoroSessions;
    if (studyMinutes !== undefined) user.studyMinutes = studyMinutes;
    if (customSubjects !== undefined) user.customSubjects = customSubjects;
    
    if (tasks !== undefined) user.tasks = tasks;
    if (schedule !== undefined) user.schedule = schedule;
    if (goals !== undefined) user.goals = goals;
    if (notes !== undefined) user.notes = notes;
    if (moodLog !== undefined) user.moodLog = moodLog;
    if (badges !== undefined) user.badges = badges;
    if (weekendTasks !== undefined) user.weekendTasks = weekendTasks;
    
    await user.save();
    res.json({ message: 'State synced successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
