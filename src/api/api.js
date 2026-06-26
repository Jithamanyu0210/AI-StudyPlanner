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
  signup: (name, email, password) =>
    request('/auth/signup', 'POST', { name, email, password }),

  login: (email, password) =>
    request('/auth/login', 'POST', { email, password }),
};

// ── Study State ───────────────────────────────────────────────────────────────
export const studyApi = {
  getState: () => request('/study/state'),

  saveState: (statePayload) =>
    request('/study/state', 'POST', statePayload),
};
