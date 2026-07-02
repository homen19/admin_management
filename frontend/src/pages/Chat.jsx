import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  chatAPI,
  connectWebSocket,
  disconnectWebSocket,
  subscribeToChannel,
  subscribeToTyping,
  sendMessage,
  sendTypingIndicator,
  subscribeToWebRTC,
} from '../services/chatService';
import { ChannelList, DirectMessageList, MessageBubble, TypingIndicator } from '../components/chat/ChatComponents';
import MessageInput from '../components/chat/MessageInput';
import CallOverlay from '../components/chat/CallOverlay';
import { CreateChannelModal, UserSearchModal } from '../components/chat/Modals';
import './Chat.css';

export default function Chat() {
  const { user } = useAuth();
  const { channelId: urlChannelId } = useParams();
  const navigate = useNavigate();

  // State
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // WebRTC Call State
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef([]); // for active channel messages
  const globalWebRtcSubsRef = useRef([]); // for all channels' WebRTC
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // ── Load channels on mount ──────────────────────────────────────
  const loadChannels = useCallback(async () => {
    try {
      const res = await chatAPI.getChannels();
      setChannels(res.data);
    } catch (e) {
      console.error('Failed to load channels', e);
    }
  }, []);

  useEffect(() => { loadChannels(); }, [loadChannels]);

  // ── WebSocket connection ────────────────────────────────────────
  useEffect(() => {
    const token = user?.token || localStorage.getItem('token') ||
      (() => { try { return JSON.parse(localStorage.getItem('user'))?.token; } catch { return null; } })();

    const client = connectWebSocket(
      token,
      (connectedClient) => {
        stompClientRef.current = connectedClient;
        setWsConnected(true);
      },
      () => setWsConnected(false)
    );

    return () => {
      subscriptionsRef.current.forEach(s => s?.unsubscribe?.());
      globalWebRtcSubsRef.current.forEach(s => s?.unsubscribe?.());
      disconnectWebSocket();
    };
  }, [user]);

  // ── Global WebRTC Subscriptions ─────────────────────────────────
  useEffect(() => {
    globalWebRtcSubsRef.current.forEach(s => s?.unsubscribe?.());
    globalWebRtcSubsRef.current = [];

    if (!wsConnected || !stompClientRef.current || channels.length === 0) return;

    channels.forEach(channel => {
      const webrtcSub = subscribeToWebRTC(stompClientRef.current, channel.id, (signal) => {
        if (signal.senderUsername === user?.username) return;
        
        if (signal.type === 'offer') {
          setIncomingCall(prev => {
            if (prev) return prev; // ignore if already ringing
            return {
              channelId: channel.id,
              remoteUsername: signal.senderUsername,
              initialOffer: signal.data
            };
          });
        } else if (signal.type === 'end-call') {
          setIncomingCall(null);
          setActiveCall(prev => {
            if (prev && prev.channelId === channel.id) return null;
            return prev;
          });
        }
      });
      if (webrtcSub) globalWebRtcSubsRef.current.push(webrtcSub);
    });
  }, [channels, wsConnected, user?.username]);

  // ── Subscribe to active channel ─────────────────────────────────
  useEffect(() => {
    subscriptionsRef.current.forEach(s => s?.unsubscribe?.());
    subscriptionsRef.current = [];

    if (!activeChannel || !stompClientRef.current || !wsConnected) return;

    const msgSub = subscribeToChannel(stompClientRef.current, activeChannel.id, (msg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setChannels(prev => prev.map(c =>
        c.id === activeChannel.id ? { ...c, lastMessage: msg, unreadCount: 0 } : c
      ));
      scrollToBottom();
    });

    const typingSub = subscribeToTyping(stompClientRef.current, activeChannel.id, (payload) => {
      if (payload.username === user?.username) return;
      if (payload.typing) {
        setTypingUsers(prev => prev.includes(payload.username) ? prev : [...prev, payload.username]);
        clearTimeout(typingTimeoutRef.current[payload.username]);
        typingTimeoutRef.current[payload.username] = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== payload.username));
        }, 3000);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== payload.username));
      }
    });

    if (msgSub) subscriptionsRef.current.push(msgSub);
    if (typingSub) subscriptionsRef.current.push(typingSub);
  }, [activeChannel, wsConnected, user?.username]);

  // ── Select a channel ────────────────────────────────────────────
  const selectChannel = useCallback(async (channel) => {
    setActiveChannel(channel);
    setMessages([]);
    setPage(0);
    setHasMore(true);
    setTypingUsers([]);
    setLoading(true);

    try {
      const res = await chatAPI.getMessages(channel.id, 0, 50);
      setMessages(res.data);
      setHasMore(res.data.length === 50);
      await chatAPI.markAsRead(channel.id);
      setChannels(prev => prev.map(c => c.id === channel.id ? { ...c, unreadCount: 0 } : c));
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }

    navigate(`/chat/${channel.id}`, { replace: true });
  }, [navigate]);

  // ── Auto-select channel from URL ────────────────────────────────
  useEffect(() => {
    if (urlChannelId && channels.length > 0 && !activeChannel) {
      const ch = channels.find(c => c.id === parseInt(urlChannelId));
      if (ch) selectChannel(ch);
    }
  }, [urlChannelId, channels, activeChannel, selectChannel]);

  // ── Load older messages (infinite scroll up) ────────────────────
  const loadMoreMessages = useCallback(async () => {
    if (loadingHistory || !hasMore || !activeChannel) return;
    setLoadingHistory(true);
    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight;

    try {
      const nextPage = page + 1;
      const res = await chatAPI.getMessages(activeChannel.id, nextPage, 50);
      if (res.data.length === 0) { setHasMore(false); return; }
      setMessages(prev => [...res.data, ...prev]);
      setPage(nextPage);
      // Maintain scroll position
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prevScrollHeight;
      });
    } catch (e) {
      console.error('Failed to load more messages', e);
    } finally {
      setLoadingHistory(false);
    }
  }, [loadingHistory, hasMore, activeChannel, page]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop < 80) loadMoreMessages();
  }, [loadMoreMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Send a message ──────────────────────────────────────────────
  const handleSend = useCallback((content, messageType = 'TEXT', fileUrl = null, fileName = null) => {
    if (!activeChannel || !stompClientRef.current) return;
    sendMessage(stompClientRef.current, activeChannel.id, content, messageType, fileUrl, fileName);
  }, [activeChannel]);

  // ── Typing indicator ────────────────────────────────────────────
  const handleTyping = useCallback((isTyping) => {
    if (!activeChannel || !stompClientRef.current) return;
    sendTypingIndicator(stompClientRef.current, activeChannel.id, isTyping);
  }, [activeChannel]);

  // ── Create channel ──────────────────────────────────────────────
  const handleCreateChannel = useCallback(async (data) => {
    await chatAPI.createChannel(data);
    await loadChannels();
  }, [loadChannels]);

  // ── Start DM ────────────────────────────────────────────────────
  const handleStartDM = useCallback(async (targetUser) => {
    try {
      const res = await chatAPI.startDM(targetUser.id);
      await loadChannels();
      selectChannel(res.data);
    } catch (e) {
      console.error('Failed to start DM', e);
    }
  }, [loadChannels, selectChannel]);

  // ── WebRTC Calls ────────────────────────────────────────────────
  const startCall = () => {
    const remote = activeChannel.participants?.find(p => p.username !== user?.username)?.username || 'User';
    setActiveCall({ 
      isInitiator: true, 
      channelId: activeChannel.id,
      remoteUsername: remote, 
      initialOffer: null 
    });
  };

  const acceptCall = () => {
    setActiveCall({ 
      isInitiator: false, 
      channelId: incomingCall.channelId,
      remoteUsername: incomingCall.remoteUsername, 
      initialOffer: incomingCall.initialOffer 
    });
    setIncomingCall(null);
  };

  const rejectCall = () => {
    setIncomingCall(null);
  };

  // ── Determine channel display name ──────────────────────────────
  const getChannelDisplayName = (channel) => {
    if (!channel) return '';
    if (channel.type === 'DIRECT') {
      const other = channel.participants?.find(p => p.username !== user?.username);
      return other?.username || channel.name;
    }
    return channel.name;
  };

  const getChannelIcon = (channel) => {
    if (!channel) return '';
    if (channel.type === 'DIRECT') return '👤';
    if (channel.type === 'BROADCAST') return '📢';
    return '#';
  };

  // ── Group messages for avatar display ───────────────────────────
  const processedMessages = messages.map((msg, i) => ({
    ...msg,
    showAvatar: i === 0 || messages[i - 1]?.senderId !== msg.senderId,
  }));

  const totalUnread = channels.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="chat-page-wrapper">
    <div className="chat-page">
      {/* ── Left Sidebar ─────────────────────────────────────────── */}
      <aside className="chat-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon">💬</div>
            <div>
              <div className="brand-title">CliqChat</div>
              <div className={`ws-status ${wsConnected ? 'online' : 'offline'}`}>
                <span className="status-dot"></span>
                {wsConnected ? 'Connected' : 'Connecting…'}
              </div>
            </div>
          </div>
          <div className="sidebar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#64748b" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search channels…" className="sidebar-search-input" readOnly
              onClick={() => setShowDMModal(true)} />
          </div>
        </div>

        <div className="sidebar-channels">
          <ChannelList
            channels={channels}
            activeChannelId={activeChannel?.id}
            onChannelSelect={selectChannel}
            onNewChannel={() => setShowCreateModal(true)}
            currentUsername={user?.username}
          />
          <DirectMessageList
            channels={channels}
            activeChannelId={activeChannel?.id}
            onChannelSelect={selectChannel}
            onNewDM={() => setShowDMModal(true)}
            currentUsername={user?.username}
          />
        </div>

        <div className="sidebar-footer">
          <div className="user-info-mini">
            <div className="user-avatar-mini">
              {user?.username?.slice(0, 2).toUpperCase()}
            </div>
            <div className="user-details-mini">
              <span className="user-name-mini">{user?.username}</span>
              <span className="user-role-mini">{user?.role?.replace('ROLE_', '')}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ───────────────────────────────────────── */}
      <main className="chat-main">
        {activeChannel ? (
          <>
            {/* Channel Header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <span className="channel-icon-header">{getChannelIcon(activeChannel)}</span>
                <div>
                  <h2 className="chat-channel-name">{getChannelDisplayName(activeChannel)}</h2>
                  {activeChannel.description && (
                    <p className="chat-channel-desc">{activeChannel.description}</p>
                  )}
                </div>
              </div>
              <div className="chat-header-right">
                <button className="icon-btn call-btn" onClick={startCall} title="Video Call" style={{ marginRight: '10px' }}>
                  📹
                </button>
                {activeChannel.memberCount > 0 && (
                  <span className="member-count">
                    👥 {activeChannel.memberCount} members
                  </span>
                )}
                <button
                  className={`details-btn ${showDetails ? 'active' : ''}`}
                  onClick={() => setShowDetails(v => !v)}
                  title="Channel details"
                >
                  ℹ️
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area" ref={messagesContainerRef} onScroll={handleScroll}>
              {loadingHistory && (
                <div className="loading-more"><div className="spinner-sm"></div> Loading older messages…</div>
              )}
              {!hasMore && messages.length > 0 && (
                <div className="start-of-chat">
                  <div className="start-line"></div>
                  <span>Beginning of conversation</span>
                  <div className="start-line"></div>
                </div>
              )}

              {loading ? (
                <div className="messages-loading">
                  <div className="spinner"></div>
                  <p>Loading messages…</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-icon">💬</div>
                  <h3>No messages yet</h3>
                  <p>Be the first to say something!</p>
                </div>
              ) : (
                <>
                  {processedMessages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.senderUsername === user?.username}
                      showAvatar={msg.showAvatar}
                    />
                  ))}
                  <TypingIndicator typingUsers={typingUsers} />
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput
              onSend={handleSend}
              onTyping={handleTyping}
              placeholder={`Message ${activeChannel.type === 'DIRECT' ? getChannelDisplayName(activeChannel) : '#' + activeChannel.name}`}
            />
          </>
        ) : (
          <div className="no-channel-selected">
            <div className="welcome-icon">💬</div>
            <h2>Welcome to CliqChat</h2>
            <p>Select a channel or start a direct message to begin chatting.</p>
            <div className="welcome-actions">
              <button className="welcome-btn" onClick={() => setShowCreateModal(true)}>
                # New Channel
              </button>
              <button className="welcome-btn secondary" onClick={() => setShowDMModal(true)}>
                💬 New Direct Message
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Right Details Panel ──────────────────────────────────── */}
      {showDetails && activeChannel && (
        <aside className="chat-details">
          <div className="details-header">
            <h3>Channel Details</h3>
            <button className="modal-close" onClick={() => setShowDetails(false)}>✕</button>
          </div>
          <div className="details-body">
            <div className="detail-section">
              <div className="detail-channel-icon">
                {getChannelIcon(activeChannel)}
              </div>
              <h4>{getChannelDisplayName(activeChannel)}</h4>
              {activeChannel.description && <p className="detail-desc">{activeChannel.description}</p>}
            </div>
            <div className="detail-section">
              <h5>Members ({activeChannel.memberCount})</h5>
              <div className="members-list">
                {activeChannel.participants?.map(p => {
                  const ROLE_COLORS = { ROLE_ADMIN: '#7c3aed', ROLE_STAFF: '#0ea5e9', ROLE_FACULTY: '#10b981', ROLE_LIBRARIAN: '#f59e0b' };
                  const ROLE_LABELS = { ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff', ROLE_FACULTY: 'Faculty', ROLE_LIBRARIAN: 'Librarian' };
                  return (
                    <div key={p.userId} className="member-item">
                      <div className="member-avatar" style={{ background: ROLE_COLORS[p.role] || '#64748b' }}>
                        {p.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="member-name">{p.username}</div>
                        <div className="member-role" style={{ color: ROLE_COLORS[p.role] }}>
                          {ROLE_LABELS[p.role] || p.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── Modals ────────────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateChannel}
          currentUserRole={user?.role}
        />
      )}
      {showDMModal && (
        <UserSearchModal
          onClose={() => setShowDMModal(false)}
          onSelect={handleStartDM}
          currentUsername={user?.username}
        />
      )}

      {/* ── Call Overlay ──────────────────────────────────────────── */}
      {activeCall && (
        <CallOverlay
          stompClient={stompClientRef.current}
          channelId={activeCall.channelId}
          currentUsername={user?.username}
          remoteUsername={activeCall.remoteUsername}
          isInitiator={activeCall.isInitiator}
          initialOffer={activeCall.initialOffer}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {/* ── Incoming Call Modal ────────────────────────────────────── */}
      {incomingCall && !activeCall && (
        <div className="incoming-call-modal">
          <p>📞 Incoming call from {incomingCall.remoteUsername}...</p>
          <div className="incoming-call-actions">
            <button className="call-btn-accept" onClick={acceptCall}>Accept</button>
            <button className="call-btn-reject" onClick={rejectCall}>Reject</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
