// Central API service for communicating with the backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper: get auth header
const authHeader = () => {
  const token = localStorage.getItem('studyai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper: unified fetch wrapper
async function request(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

// ── Local User Registry (offline fallback) ────────────────────────────────────
// Stores accounts as { email -> { name, passwordHash, avatar, joined } }
const LOCAL_USERS_KEY = 'studyai_local_users';

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// Simple deterministic hash (for offline-only use, not cryptographic)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function buildUserFromRecord(email, record) {
  return {
    id: 'user_' + email,
    name: record.name,
    email,
    avatar: (record.name[0] || 'S').toUpperCase(),
    joined: record.joined,
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      return await request('/auth/signup', 'POST', { name, email: cleanEmail, password });
    } catch (err) {
      // Only use local fallback when backend is truly unreachable (network error)
      const isNetworkError = !err.message || err.message === 'Failed to fetch' || err.name === 'TypeError';
      if (isNetworkError) {
        console.warn('Backend unavailable — using local signup mode.');
        const users = getLocalUsers();
        if (users[cleanEmail]) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        const record = {
          name,
          passwordHash: simpleHash(password),
          joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
        users[cleanEmail] = record;
        saveLocalUsers(users);
        const mockToken = 'local_token_' + cleanEmail;
        return { token: mockToken, user: buildUserFromRecord(cleanEmail, record), isLocal: true };
      }
      throw err;
    }
  },

  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      return await request('/auth/login', 'POST', { email: cleanEmail, password });
    } catch (err) {
      // Only use local fallback when backend is truly unreachable (network error)
      const isNetworkError = !err.message || err.message === 'Failed to fetch' || err.name === 'TypeError';
      if (isNetworkError) {
        console.warn('Backend unavailable — using local login mode.');
        const users = getLocalUsers();
        const record = users[cleanEmail];
        if (!record) {
          throw new Error('No account found with this email. Please sign up first.');
        }
        if (record.passwordHash !== simpleHash(password)) {
          throw new Error('Incorrect password. Please try again.');
        }
        const mockToken = 'local_token_' + cleanEmail;
        return { token: mockToken, user: buildUserFromRecord(cleanEmail, record), isLocal: true };
      }
      throw err;
    }
  },

  // For demo accounts — creates account if not exists, then logs in
  demoLogin: async (name, email) => {
    const cleanEmail = email.trim().toLowerCase();
    const demoPassword = 'demo12345';
    const users = getLocalUsers();
    if (!users[cleanEmail]) {
      // Auto-register demo account on first use
      users[cleanEmail] = {
        name,
        passwordHash: simpleHash(demoPassword),
        joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
      saveLocalUsers(users);
    }
    const record = users[cleanEmail];
    const mockToken = 'local_token_' + cleanEmail;
    return { token: mockToken, user: buildUserFromRecord(cleanEmail, record), isLocal: true };
  },
};

// ── Study State ───────────────────────────────────────────────────────────────
export const studyApi = {
  getState: () => request('/study/state'),

  saveState: (statePayload) =>
    request('/study/state', 'POST', statePayload),
};
