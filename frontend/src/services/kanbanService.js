import api from './api';

export const kanbanAPI = {
  getAllTasks: () => api.get('/api/kanban-tasks'),
  createTask: (data) => api.post('/api/kanban-tasks', data),
  updateTask: (taskId, data) => api.put(`/api/kanban-tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/api/kanban-tasks/${taskId}`),
  getUsers: () => api.get('/api/kanban-tasks/users'),
};
