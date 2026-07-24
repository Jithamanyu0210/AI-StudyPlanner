// Central API service for communicating with the backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper: get auth header
const authHeader = () => {
  const token = localStorage.getItem('studyai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Local User Registry (offline fallback) ─────────────────────────────────
const LOCAL_USERS_KEY = 'studyai_local_users';

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}'); }
  catch { return {}; }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// Simple hash (offline use only — not cryptographic)
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h.toString(36);
}

function buildUser(email, record) {
  return {
    id: 'user_' + email,
    name: record.name,
    email,
    avatar: (record.name[0] || 'S').toUpperCase(),
    joined: record.joined,
  };
}

// Detect a true network-level failure (not an HTTP error from the server)
function isNetworkFailure(err) {
  return (
    err instanceof TypeError ||
    err.message === 'Failed to fetch' ||
    err.message === 'Network request failed' ||
    err.message === 'Load failed' ||
    err.message === '' ||
    !err.message
  );
}

// ── Unified fetch wrapper ───────────────────────────────────────────────────
async function request(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  // ── Sign Up ──────────────────────────────────────────────────────────────
  signup: async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      return await request('/auth/signup', 'POST', { name, email: cleanEmail, password });
    } catch (err) {
      if (!isNetworkFailure(err)) throw err; // Real server error → propagate
      // Offline fallback
      console.warn('[StudyAI] Backend offline — using local registry.');
      const users = getLocalUsers();
      if (users[cleanEmail]) {
        throw new Error('An account with this email already exists. Please sign in.');
      }
      const record = {
        name,
        passwordHash: simpleHash(password),
        joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
      users[cleanEmail] = record;
      saveLocalUsers(users);
      return { token: 'local_' + cleanEmail, user: buildUser(cleanEmail, record), isLocal: true };
    }
  },

  // ── Sign In ──────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      return await request('/auth/login', 'POST', { email: cleanEmail, password });
    } catch (err) {
      if (!isNetworkFailure(err)) throw err; // Real server error → propagate
      // Offline fallback — MUST have a registered account
      console.warn('[StudyAI] Backend offline — checking local registry.');
      const users = getLocalUsers();
      const record = users[cleanEmail];
      if (!record) {
        throw new Error('No account found for this email. Please sign up first.');
      }
      if (record.passwordHash !== simpleHash(password)) {
        throw new Error('Incorrect password. Please try again.');
      }
      return { token: 'local_' + cleanEmail, user: buildUser(cleanEmail, record), isLocal: true };
    }
  },

  // ── Google / OAuth login (no password needed) ─────────────────────────
  // Creates account on first use, returns existing on subsequent uses.
  googleLogin: async (name, email) => {
    const cleanEmail = email.trim().toLowerCase();
    const users = getLocalUsers();
    if (!users[cleanEmail]) {
      users[cleanEmail] = {
        name,
        passwordHash: simpleHash('google_oauth_' + cleanEmail),
        joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
      saveLocalUsers(users);
    }
    const record = users[cleanEmail];
    return { token: 'local_' + cleanEmail, user: buildUser(cleanEmail, record), isLocal: true };
  },
};

// ── Study State ────────────────────────────────────────────────────────────
export const studyApi = {
  getState: () => request('/study/state'),
  saveState: (payload) => request('/study/state', 'POST', payload),
};
