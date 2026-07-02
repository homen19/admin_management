import api from './api';
import { connectWebSocket } from './chatService'; // Reusing the same connection manager if possible, or we can use it directly

const BASE_URL = '/api/transport';

export const transportAPI = {
  getVehicles: () => api.get(`${BASE_URL}/vehicles`),
  createVehicle: (data) => api.post(`${BASE_URL}/vehicles`, data),
  getRoutes: () => api.get(`${BASE_URL}/routes`),
  createRoute: (data) => api.post(`${BASE_URL}/routes`, data),
  getActiveTrips: () => api.get(`${BASE_URL}/trips/active`),
  startTrip: (data) => api.post(`${BASE_URL}/trips/start`, data),
  completeTrip: (tripId) => api.post(`${BASE_URL}/trips/${tripId}/complete`),
  getDrivers: () => api.get(`${BASE_URL}/drivers`),
  registerDriver: (data) => api.post(`/api/users/register`, { ...data, role: 'ROLE_DRIVER' }),
};

export const subscribeToLocations = (client, onLocationUpdate) => {
  if (!client || !client.connected) return null;
  return client.subscribe('/topic/transport/locations', (frame) => {
    const data = JSON.parse(frame.body);
    onLocationUpdate(data);
  });
};
