// client/src/api.js — Centralised API calls
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and reload
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────
export const login    = (creds)    => api.post('/auth/login', creds);
export const getMe    = ()         => api.get('/auth/me');
export const changePassword = (b) => api.put('/auth/password', b);

// ── Dashboard ────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard/summary');

// ── Tasks ────────────────────────────────────────────────
export const getTasks    = (params) => api.get('/tasks', { params });
export const getTask     = (id)     => api.get(`/tasks/${id}`);
export const createTask  = (data)   => api.post('/tasks', data);
export const updateTask  = (id, d)  => api.put(`/tasks/${id}`, d);
export const deleteTask  = (id)     => api.delete(`/tasks/${id}`);

// ── Members ──────────────────────────────────────────────
export const getMembers   = ()       => api.get('/members');
export const createMember = (data)   => api.post('/members', data);
export const updateMember = (id, d)  => api.put(`/members/${id}`, d);
export const deleteMember = (id)     => api.delete(`/members/${id}`);

// ── Phases ───────────────────────────────────────────────
export const getPhases        = ()        => api.get('/phases');
export const updatePhaseProgress = (id,p) => api.put(`/phases/${id}/progress`, { progress: p });

// ── Gates ────────────────────────────────────────────────
export const getGates   = ()       => api.get('/gates');
export const updateGate = (id, d)  => api.put(`/gates/${id}`, d);

// ── Activity ─────────────────────────────────────────────
export const getActivity  = (limit) => api.get('/activity', { params: { limit } });
export const addActivity  = (data)  => api.post('/activity', data);

// ── Users (admin only) ───────────────────────────────────
export const getUsers    = ()       => api.get('/users');
export const createUser  = (data)   => api.post('/users', data);
export const updateUser  = (id, d)  => api.put(`/users/${id}`, d);
export const deleteUser  = (id)     => api.delete(`/users/${id}`);

export default api;
