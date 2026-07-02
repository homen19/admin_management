import api from './api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE_URL = '/api/chat';

// ── REST API ────────────────────────────────────────────────────────────────

export const chatAPI = {
  getChannels: () => api.get(`${BASE_URL}/channels`),
  createChannel: (data) => api.post(`${BASE_URL}/channels`, data),
  archiveChannel: (channelId) => api.delete(`${BASE_URL}/channels/${channelId}`),
  startDM: (targetUserId) => api.post(`${BASE_URL}/dm/${targetUserId}`),
  getMessages: (channelId, page = 0, size = 50) =>
    api.get(`${BASE_URL}/channels/${channelId}/messages?page=${page}&size=${size}`),
  markAsRead: (channelId) => api.post(`${BASE_URL}/channels/${channelId}/read`),
  deleteMessage: (messageId) => api.delete(`${BASE_URL}/messages/${messageId}`),
  searchUsers: (q) => api.get(`${BASE_URL}/users/search?q=${encodeURIComponent(q)}`),
  getColleagues: () => api.get(`${BASE_URL}/colleagues`),
  uploadFile: (formData) => api.post(`${BASE_URL}/upload`, formData),
};

// ── WebSocket Client ─────────────────────────────────────────────────────────

let stompClient = null;

export const connectWebSocket = (token, onConnected, onDisconnected) => {
  // Resolve token — same pattern as api.js interceptor
  const resolvedToken = token || (() => {
    try { return JSON.parse(localStorage.getItem('user'))?.token; } catch { return null; }
  })();

  const socketFactory = () =>
    new SockJS(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}/ws`);

  stompClient = new Client({
    webSocketFactory: socketFactory,
    connectHeaders: {
      Authorization: `Bearer ${resolvedToken}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[Chat] WebSocket connected');
      onConnected && onConnected(stompClient);
    },
    onDisconnect: () => {
      console.log('[Chat] WebSocket disconnected');
      onDisconnected && onDisconnected();
    },
    onStompError: (frame) => {
      console.error('[Chat] STOMP error:', frame);
    },
  });

  stompClient.activate();
  return stompClient;
};

export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
  }
};

export const subscribeToChannel = (client, channelId, onMessage) => {
  if (!client || !client.connected) return null;
  return client.subscribe(`/topic/channel/${channelId}`, (frame) => {
    const message = JSON.parse(frame.body);
    onMessage(message);
  });
};

export const subscribeToTyping = (client, channelId, onTyping) => {
  if (!client || !client.connected) return null;
  return client.subscribe(`/topic/channel/${channelId}/typing`, (frame) => {
    const typing = JSON.parse(frame.body);
    onTyping(typing);
  });
};

export const sendMessage = (client, channelId, content, messageType = 'TEXT', fileUrl = null, fileName = null) => {
  if (!client || !client.connected) return;
  client.publish({
    destination: '/app/chat.send',
    body: JSON.stringify({ channelId, content, messageType, fileUrl, fileName }),
  });
};

export const sendTypingIndicator = (client, channelId, isTyping) => {
  if (!client || !client.connected) return;
  client.publish({
    destination: '/app/chat.typing',
    body: JSON.stringify({ channelId, typing: isTyping }),
  });
};

export const subscribeToWebRTC = (client, channelId, onSignal) => {
  if (!client || !client.connected) return null;
  return client.subscribe(`/topic/channel/${channelId}/webrtc`, (frame) => {
    const signal = JSON.parse(frame.body);
    onSignal(signal);
  });
};

export const sendWebRTCSignal = (client, channelId, type, data) => {
  if (!client || !client.connected) return;
  client.publish({
    destination: '/app/chat.webrtc',
    body: JSON.stringify({ channelId, type, data }),
  });
};

export const subscribeToStatus = (client, onStatusUpdate) => {
  if (!client || !client.connected) return null;
  return client.subscribe('/topic/status', (frame) => {
    const data = JSON.parse(frame.body);
    onStatusUpdate(data);
  });
};

export const sendStatusUpdate = (client, status) => {
  if (!client || !client.connected) return;
  client.publish({
    destination: '/app/chat.status',
    body: JSON.stringify({ status }),
  });
};
