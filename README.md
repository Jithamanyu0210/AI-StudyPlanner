# 🧠 StudyAI — Intelligent AI Study Planner

> A full-stack, AI-powered personal study planner with schedule generation, task management, progress tracking, Pomodoro timer, notes, and per-user data isolation.

---

## 🚀 Live Demo

Run locally with:

```bash
npm install
npm run dev
```

Backend (optional, for MongoDB sync):

```bash
cd server
npm install
node server.js
```

---

## ⚙️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 6** | Build tool & dev server |
| **Chart.js + react-chartjs-2** | Dashboard charts (Doughnut, Bar) |
| **Framer Motion** | Page animations & micro-interactions |
| **Lucide React** | Icon library |
| **@hello-pangea/dnd** | Drag-and-drop task management |
| **React Router DOM v6** | Client-side routing |
| **Vanilla CSS** | Custom styling with CSS variables (no Tailwind) |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **bcryptjs** | Password hashing |
| **jsonwebtoken (JWT)** | Authentication tokens |
| **dotenv** | Environment variable management |
| **cors** | Cross-origin resource sharing |

---

## 🔑 Environment Variables & API Keys

### Frontend — `.env` (project root)

```env
# Backend API base URL
VITE_API_URL=http://localhost:5000/api
```

### Backend — `server/.env`

```env
# MongoDB connection string (required for data persistence)
# Free cluster: https://www.mongodb.com/atlas/database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studyplanner

# JWT Secret (change this to a long random string in production)
JWT_SECRET=your_super_secret_jwt_key_here

# Server port (optional, defaults to 5000)
PORT=5000
```

> **Note:** The app works fully offline (no backend required). User data is stored in `localStorage` when the backend is not running. When connected to MongoDB, data is synced across sessions.

---

## 🎨 Main Themes & Design

### Design Language
- **Dark glassmorphism** — translucent cards with backdrop blur on a deep dark background
- **Gradient accents** — purple-to-cyan gradient (`#7c3aed → #06b6d4`) throughout
- **Premium feel** — smooth transitions, micro-animations, hover effects
- **CSS Variables** — full theming system via `--bg-primary`, `--accent-primary`, etc.

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--accent-primary` | `#7c3aed` | Primary purple — buttons, highlights |
| `--accent-secondary` | `#06b6d4` | Cyan — charts, badges, secondary UI |
| `--bg-primary` | `#0d0d1a` | Page background |
| `--bg-card` | `#1a1a2e` | Card surfaces |
| `--bg-secondary` | `#16213e` | Input fields, secondary surfaces |

### Typography
- **Headings**: `Outfit` (Google Fonts) — modern, rounded, confident
- **Body**: `Inter` — clean, highly readable at small sizes

---

## 📋 Key Features

### 🔐 Authentication
- Email + password signup/login (per-user isolated data)
- Google sign-in flow (enter your Gmail → auto-registers account)
- Offline-resilient: works without a backend using localStorage
- Strict validation: login fails if account doesn't exist; wrong password rejected

### 📊 Dashboard
- Personalized greeting with motivational quote
- Real-time stat cards: streak days, XP, study hours, tasks due
- Quick action toolbar (Add Task, Start Pomodoro, AI Planner, Notes, Schedule)
- Interactive pending task checklist
- Doughnut chart (task completion) + Bar chart (weekly study trend)

### 🤖 AI Planner
- Configure subjects, hours/day, number of days, difficulty, deadline
- Generates a smart day-by-day study schedule
- Add AI-generated plan directly to your task list
- Fully customizable subjects (add your own inline)

### 📅 Schedule Builder
- Weekly timetable grid (Mon–Sun)
- Add/delete study sessions per day with subject, time, and duration
- Per-user schedule isolation

### ✅ Task Manager
- Add tasks with subject, title, deadline, priority (high/medium/low), and tags
- Mark tasks complete, delete tasks
- Filters by subject, priority, status

### 📝 Notes
- Create, view, and delete rich notes organized by subject
- Full-text note body with subject tagging

### 🗂️ Weekend Tasks
- Dedicated weekend task tracker separate from regular tasks
- Priority levels and subject tagging

### ⏱️ Pomodoro Timer
- 25-minute focus sessions with short/long break intervals
- Session counter and history tracking

### 📈 Progress Tracker
- Per-subject completion stats
- Weekly study trend bar chart
- Overall completion percentage

### 🎯 Goals
- Set and track personal study goals
- Mark goals as complete

### 😊 Mood Log
- Daily mood tracking (emoji-based)
- Historical mood log

### 📚 Custom Subjects
- Add/delete custom subjects from any form across the app
- Subjects persist globally per user (e.g. *Machine Learning*, *Neuroscience*, *World Lit*)
- Manage subjects via inline add, dropdown selector, or dedicated Manage modal

---

## 🗂️ Project Structure

```
study-planner-ai/
├── src/
│   ├── api/
│   │   └── api.js              # Auth & study state API (with offline fallback)
│   ├── components/
│   │   └── SubjectSelect.jsx   # Reusable subject selector with custom add
│   ├── context/
│   │   └── AppContext.jsx      # Global state, localStorage persistence
│   ├── pages/
│   │   ├── LoginPage.jsx       # Auth (signup/login/Google flow)
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── AiPlanner.jsx       # AI schedule generator
│   │   ├── ScheduleBuilder.jsx # Weekly timetable
│   │   ├── Notes.jsx           # Notes management
│   │   ├── WeekendTasks.jsx    # Weekend task tracker
│   │   ├── Progress.jsx        # Progress charts
│   │   ├── Goals.jsx           # Goal tracking
│   │   ├── MoodLog.jsx         # Mood tracker
│   │   ├── Pomodoro.jsx        # Pomodoro timer
│   │   └── ProfilePage.jsx     # User profile
│   ├── App.jsx                 # App shell + navigation
│   ├── index.css               # Global styles + CSS design system
│   └── main.jsx
├── server/
│   ├── models/User.js          # MongoDB User schema
│   ├── middleware/auth.js      # JWT auth middleware
│   └── server.js               # Express REST API
├── .env                        # Frontend env vars
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔒 Data Isolation

Every user's data is stored under the key `studyai_state_<email>` in localStorage. Users cannot see or access each other's tasks, schedules, notes, or goals. When the MongoDB backend is active, data is associated with the authenticated user's `_id`.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account *(optional, for cloud persistence)*

### Quick Start (Frontend only)

```bash
# Clone the repository
git clone https://github.com/Jithamanyu0210/AI-StudyPlanner.git
cd AI-StudyPlanner

# Install dependencies
npm install

# Start development server
npm run dev
# → Open http://localhost:5173
```

### With Backend

```bash
# Setup server environment
cp server/.env.example server/.env
# Edit server/.env with your MONGODB_URI and JWT_SECRET

# Install server dependencies
cd server
npm install

# Start backend
node server.js
# → API running at http://localhost:5000

# In a new terminal, start frontend
cd ..
npm run dev
```

---

## 📄 License

MIT © Jithamanyu — Built with ❤️ and React
