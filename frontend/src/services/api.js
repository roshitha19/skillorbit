/**
 * SKILLORBIT - API Client
 * Connects frontend to the Flask REST backend at http://127.0.0.1:5000
 * Transmits HttpOnly session cookies via credentials: 'include'.
 */

let inMemoryAuthToken = null;

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export function setAuthToken(token) {
  inMemoryAuthToken = token;
}

export function getAuthToken() {
  return inMemoryAuthToken;
}

async function fetchJson(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (inMemoryAuthToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${inMemoryAuthToken}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers,
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const err = new Error(errorData.error || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.code = errorData.code;
      throw err;
    }

    return await res.json();
  } catch (err) {
    if (err.status !== 401) {
      console.warn(`API Error [${endpoint}]:`, err.message);
    }
    throw err;
  }
}

export const api = {
  setAuthToken,
  getAuthToken,
  // Health
  getHealth: () => fetchJson('/health'),

  // Authentication
  register: (payload) => fetchJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  login: (credentials) => fetchJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  logout: () => fetchJson('/auth/logout', {
    method: 'POST',
  }),
  getMe: () => fetchJson('/auth/me'),
  forgotPassword: (email) => fetchJson('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (payload) => fetchJson('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Roles Catalog (Public)
  getRoles: () => fetchJson('/roles'),
  getRole: (roleId) => fetchJson(`/roles/${roleId}`),

  // Candidate Profile (Authenticated User)
  getCandidate: () => fetchJson('/candidate'),
  updateCandidate: (data) => fetchJson('/candidate', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Resume Intelligence (Authenticated User)
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    if (inMemoryAuthToken) {
      headers['Authorization'] = `Bearer ${inMemoryAuthToken}`;
    }
    const res = await fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const err = new Error(errorData.error || `Upload failed with status ${res.status}`);
      err.status = res.status;
      err.code = errorData.code;
      throw err;
    }
    return await res.json();
  },
  parseResumeText: (text) => fetchJson('/resume/parse-text', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  commitResume: (payload) => fetchJson('/resume/commit', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Skills & Atlas (Authenticated User)
  getSkills: () => fetchJson('/skills'),
  addSkill: (payload) => fetchJson('/skills', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Job Match & Gap Analysis (Authenticated User)
  getJobMatch: (roleId) => {
    const q = roleId ? `?role=${roleId}` : '';
    return fetchJson(`/match${q}`);
  },

  // Interview Lab (Authenticated User)
  getQuestions: (roleId, category) => {
    const params = new URLSearchParams();
    if (roleId) params.append('role', roleId);
    if (category) params.append('category', category);
    return fetchJson(`/interview/questions?${params.toString()}`);
  },
  evaluateAnswer: (payload) => fetchJson('/interview/evaluate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getInterviewHistory: () => fetchJson('/interview/history'),

  // Roadmap (Authenticated User)
  getRoadmap: (roleId) => {
    const q = roleId ? `?role=${roleId}` : '';
    return fetchJson(`/roadmap${q}`);
  },
  toggleRoadmapTask: (taskId) => fetchJson('/roadmap/toggle', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  }),
  regenerateRoadmap: (roleId) => fetchJson('/roadmap/regenerate', {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId }),
  }),

  // Progress Analytics (Authenticated User)
  getAnalytics: () => fetchJson('/analytics'),
  getActivity: () => fetchJson('/activity'),
};
