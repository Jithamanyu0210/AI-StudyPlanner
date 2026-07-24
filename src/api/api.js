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

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      return await request('/auth/signup', 'POST', { name, email: cleanEmail, password });
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('failed')) {
        console.warn('Backend server unavailable, using local authentication mode.');
        const mockUser = {
          id: 'user_' + Date.now(),
          name,
          email: cleanEmail,
          avatar: (name[0] || 'U').toUpperCase(),
          joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
        const mockToken = 'local_token_' + Date.now();
        return { token: mockToken, user: mockUser, isLocal: true };
      }
      throw err;
    }
  },

  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      return await request('/auth/login', 'POST', { email: cleanEmail, password });
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('failed')) {
        console.warn('Backend server unavailable, using local authentication mode.');
        const defaultName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const mockUser = {
          id: 'user_' + cleanEmail,
          name: defaultName || 'Student',
          email: cleanEmail,
          avatar: (defaultName[0] || 'S').toUpperCase(),
          joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
        const mockToken = 'local_token_' + cleanEmail;
        return { token: mockToken, user: mockUser, isLocal: true };
      }
      throw err;
    }
  },
};

// ── Study State ───────────────────────────────────────────────────────────────
export const studyApi = {
  getState: () => request('/study/state'),

  saveState: (statePayload) =>
    request('/study/state', 'POST', statePayload),
};

