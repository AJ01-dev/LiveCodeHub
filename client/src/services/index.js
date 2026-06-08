import api from './api';

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/password', data),
};

export const roomService = {
  createRoom: (data) => api.post('/rooms', typeof data === 'string' ? { language: data } : data),
  getMyRooms: () => api.get('/rooms/my'),
  getRecentRooms: () => api.get('/rooms/recent'),
  getRoom: (roomId) => api.get(`/rooms/${roomId}`),
  joinRoom: (roomId) => api.post(`/rooms/${roomId}/join`),
  getMessages: (roomId, params) => api.get(`/rooms/${roomId}/messages`, { params }),
  getRoomHistory: (roomId) => api.get(`/rooms/${roomId}/history`),
  updateLanguage: (roomId, language) => api.patch(`/rooms/${roomId}/language`, { language }),
  updateSettings: (roomId, data) => api.patch(`/rooms/${roomId}/settings`, data),
  deleteRoom: (roomId) => api.delete(`/rooms/${roomId}`),
};

export const interviewService = {
  getInterview: (roomId) => api.get(`/rooms/${roomId}/interview`),
  enableInterview: (roomId, durationMinutes = 60) =>
    api.post(`/rooms/${roomId}/interview/enable`, { durationMinutes }),
  startInterview: (roomId) => api.post(`/rooms/${roomId}/interview/start`),
  endInterview: (roomId) => api.post(`/rooms/${roomId}/interview/end`),
  getAnalytics: (roomId) => api.get(`/rooms/${roomId}/interview/analytics`),
  assignRole: (roomId) => api.post(`/rooms/${roomId}/interview/role`),
};

export const executionService = {
  runCode: (data) => api.post('/execute/run', data),
  getLanguages: () => api.get('/execute/languages'),
};
