import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import {
  chatAPI,
  connectWebSocket,
  disconnectWebSocket,
  subscribeToChannel,
  subscribeToTyping,
  sendMessage,
  sendTypingIndicator,
  subscribeToStatus,
  sendStatusUpdate,
  subscribeToWebRTC,
  sendWebRTCSignal,
} from '../../services/chatService';
import { Phone, Video as VideoIcon } from 'lucide-react';
import { CreateChannelModal, UserSearchModal } from './Modals';
import { playRingtone } from '../../utils/ringtone';
import MessageInput from './MessageInput';
import CallModal from './CallModal';
import './FloatingChat.css';

const ROLE_COLORS = {
  ROLE_ADMIN: '#7c3aed', ROLE_STAFF: '#0ea5e9',
  ROLE_FACULTY: '#10b981', ROLE_LIBRARIAN: '#f59e0b',
};
const ROLE_LABELS = {
  ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff',
  ROLE_FACULTY: 'Faculty', ROLE_LIBRARIAN: 'Librarian',
};

function getInitials(name = '') { return name.slice(0, 2).toUpperCase(); }

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Date.now() - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
const IconExpand = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCollapse = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
const IconDM = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Channel Item (shared between compact & expanded) ──────────────────────────
function ChannelItem({ channel, active, onClick, currentUsername, status }) {
  const other = channel.participants?.find(p => p.username !== currentUsername);
  const isDM = channel.type === 'DIRECT';
  const displayName = isDM ? (other?.username || channel.name) : channel.name;
  const roleColor = ROLE_COLORS[other?.role] || '#7c3aed';

  return (
    <div className={`fc-channel-item ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="fc-item-left" style={{ position: 'relative' }}>
        {isDM ? (
          <>
            <div className="fc-avatar" style={{ background: roleColor }}>
              {getInitials(displayName)}
            </div>
            {status && (
              <span className={`fce-status-indicator ${STATUS_OPTIONS.find(o => o.label === status)?.class || 'available'}`}
                    style={{ bottom: -2, right: -2, width: 10, height: 10, border: '2px solid #0B1320' }} />
            )}
          </>
        ) : (
          <div className="fc-channel-badge">
            {channel.type === 'BROADCAST' ? '📢' : '#'}
          </div>
        )}
      </div>
      <div className="fc-item-body">
        <div className="fc-item-top">
          <span className="fc-item-name">{displayName}</span>
          {channel.lastMessage && (
            <span className="fc-item-time">{formatTime(channel.lastMessage.sentAt)}</span>
          )}
        </div>
        <div className="fc-item-bottom">
          <span className="fc-item-preview">
            {channel.lastMessage
              ? (channel.lastMessage.deleted ? 'Message deleted' : channel.lastMessage.content)
              : (isDM ? `Message ${displayName}` : `#${displayName}`)}
          </span>
          {channel.unreadCount > 0 && (
            <span className="fc-unread-pill">
              {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble (shared) ───────────────────────────────────────────────────
function MessageBubble({ msg, expanded }) {
  return (
    <div className={`fc-msg-row ${msg.isOwn ? 'own' : 'other'} ${expanded ? 'exp' : ''}`}>
      {!msg.isOwn && msg.showAvatar && (
        <div className="fc-msg-avatar" style={{ background: ROLE_COLORS[msg.senderRole] || '#64748b' }}>
          {getInitials(msg.senderUsername)}
        </div>
      )}
      {!msg.isOwn && !msg.showAvatar && <div className="fc-msg-avatar-gap" />}
      <div className="fc-msg-wrap">
        {!msg.isOwn && msg.showAvatar && (
          <div className="fc-msg-meta">
            <span className="fc-msg-sender">{msg.senderUsername}</span>
            {msg.senderRole && (
              <span className="fc-msg-role" style={{ color: ROLE_COLORS[msg.senderRole], background: ROLE_COLORS[msg.senderRole] + '22' }}>
                {ROLE_LABELS[msg.senderRole] || msg.senderRole}
              </span>
            )}
          </div>
        )}
        <div className={`fc-bubble ${msg.isOwn ? 'own' : 'other'}`}>
          {msg.deleted ? <i className="fc-deleted">This message was deleted.</i> : msg.content}
        </div>
        <span className={`fc-msg-time ${msg.isOwn ? 'own-t' : ''}`}>{formatTime(msg.sentAt)}</span>
      </div>
    </div>
  );
}

const STATUS_OPTIONS = [
  { label: 'Available', class: 'available' },
  { label: 'Lunch Break', class: 'lunch-break' },
  { label: 'Tea Break', class: 'tea-break' },
  { label: 'Busy', class: 'busy' },
  { label: 'Away', class: 'away' },
  { label: 'Offline', class: 'away' }
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function FloatingChat() {
  const { user } = useAuth();

  // UI state
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [compactView, setCompactView] = useState('LIST'); // LIST | CHAT
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Zoho Cliq style user status state
  const [userStatus, setUserStatus] = useState('Available');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef(null);
  const [participantsStatus, setParticipantsStatus] = useState({});

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Data state (shared between compact & expanded)
  const [channels, setChannels] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef([]);
  const webrtcSubsRef = useRef({});
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef({});
  const incomingRingtoneRef = useRef(null);

  // ── Handle Incoming Ringtone ─────────────────────────────────────────────
  useEffect(() => {
    if (incomingCall && !activeCall) {
      if (!incomingRingtoneRef.current) {
        incomingRingtoneRef.current = playRingtone('incoming');
      }
    } else {
      if (incomingRingtoneRef.current) {
        incomingRingtoneRef.current.stop();
        incomingRingtoneRef.current = null;
      }
    }
    return () => {
      if (incomingRingtoneRef.current) {
        incomingRingtoneRef.current.stop();
        incomingRingtoneRef.current = null;
      }
    };
  }, [incomingCall, activeCall]);

  // ── Load channels & colleagues ──────────────────────────────────────────
  const loadChannels = useCallback(async () => {
    if (!user) return;
    try {
      const res = await chatAPI.getChannels();
      setChannels(res.data);
      setTotalUnread(res.data.reduce((s, c) => s + (c.unreadCount || 0), 0));
    } catch {}
  }, [user]);

  const loadColleagues = useCallback(async () => {
    if (!user) return;
    try {
      const res = await chatAPI.getColleagues();
      setColleagues(res.data);
    } catch {}
  }, [user]);

  useEffect(() => { loadChannels(); loadColleagues(); }, [loadChannels, loadColleagues]);

  useEffect(() => {
    if (open) return;
    const t = setInterval(() => { loadChannels(); loadColleagues(); }, 30000);
    return () => clearInterval(t);
  }, [open, loadChannels, loadColleagues]);

  // ── WebSocket ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    connectWebSocket(null,
      (client) => {
        stompClientRef.current = client;
        setWsConnected(true);
        
        // Subscribe to presence status updates
        subscribeToStatus(client, (payload) => {
          setParticipantsStatus(prev => ({
            ...prev,
            [payload.username]: payload.status
          }));
        });
        
        // Broadcast our current status upon connection
        sendStatusUpdate(client, userStatus);
      },
      () => setWsConnected(false)
    );
    return () => {
      Object.values(webrtcSubsRef.current).forEach(s => s?.unsubscribe?.());
      subscriptionsRef.current.forEach(s => s?.unsubscribe?.());
      disconnectWebSocket();
    };
  }, [user]);

  // Sync user status changes over WebSocket
  useEffect(() => {
    if (wsConnected && stompClientRef.current) {
      sendStatusUpdate(stompClientRef.current, userStatus);
    }
  }, [userStatus, wsConnected]);

  // ── Subscribe to WebRTC globally for incoming calls ───────────────────────
  useEffect(() => {
    if (!stompClientRef.current || !wsConnected || !user) return;

    channels.forEach(c => {
      if (!webrtcSubsRef.current[c.id]) {
        webrtcSubsRef.current[c.id] = subscribeToWebRTC(stompClientRef.current, c.id, (signal) => {
          if (signal.senderUsername === user.username) return;
          if (signal.type === 'offer') {
            setIncomingCall({
              channelId: c.id,
              caller: signal.senderUsername,
              offer: signal.data.offer,
              isVideo: signal.data.isVideo,
              targetUser: c.participants?.find(p => p.username !== user.username) || { username: signal.senderUsername }
            });
          } else if (signal.type === 'end-call' || signal.type === 'reject-call') {
            setIncomingCall(prev => (prev?.channelId === c.id ? null : prev));
          }
        });
      }
    });

    const currentChannelIds = channels.map(c => c.id.toString());
    Object.keys(webrtcSubsRef.current).forEach(id => {
      if (!currentChannelIds.includes(id)) {
        webrtcSubsRef.current[id]?.unsubscribe?.();
        delete webrtcSubsRef.current[id];
      }
    });
  }, [channels, wsConnected, user]);

  // ── Subscribe to active channel ──────────────────────────────────────────
  useEffect(() => {
    subscriptionsRef.current.forEach(s => s?.unsubscribe?.());
    subscriptionsRef.current = [];
    if (!activeChannel || !stompClientRef.current || !wsConnected) return;

    const msgSub = subscribeToChannel(stompClientRef.current, activeChannel.id, (msg) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      setChannels(prev => prev.map(c =>
        c.id === activeChannel.id ? { ...c, lastMessage: msg, unreadCount: 0 } : c
      ));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    const typingSub = subscribeToTyping(stompClientRef.current, activeChannel.id, (payload) => {
      if (payload.username === user?.username) return;
      if (payload.typing) {
        setTypingUsers(prev => prev.includes(payload.username) ? prev : [...prev, payload.username]);
        clearTimeout(typingTimeoutRef.current[payload.username]);
        typingTimeoutRef.current[payload.username] = setTimeout(() =>
          setTypingUsers(prev => prev.filter(u => u !== payload.username)), 3000);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== payload.username));
      }
    });

    if (msgSub) subscriptionsRef.current.push(msgSub);
    if (typingSub) subscriptionsRef.current.push(typingSub);
  }, [activeChannel, wsConnected, user?.username]);

  // ── Select channel ───────────────────────────────────────────────────────
  const selectChannel = useCallback(async (channel) => {
    setActiveChannel(channel);
    setCompactView('CHAT');
    setMessages([]);
    setTypingUsers([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    try {
      const res = await chatAPI.getMessages(channel.id, 0, 50);
      setMessages(res.data);
      setHasMore(res.data.length === 50);
      await chatAPI.markAsRead(channel.id);
      setChannels(prev => prev.map(c => c.id === channel.id ? { ...c, unreadCount: 0 } : c));
      setTotalUnread(prev => Math.max(0, prev - (channel.unreadCount || 0)));
    } catch {}
    finally {
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, []);

  // ── Load more (infinite scroll up) ──────────────────────────────────────
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore || !activeChannel) return;
    setLoadingMore(true);
    const container = messagesContainerRef.current;
    const prev = container?.scrollHeight;
    try {
      const nextPage = page + 1;
      const res = await chatAPI.getMessages(activeChannel.id, nextPage, 50);
      if (!res.data.length) { setHasMore(false); return; }
      setMessages(p => [...res.data, ...p]);
      setPage(nextPage);
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prev;
      });
    } catch {}
    finally { setLoadingMore(false); }
  }, [loadingMore, hasMore, activeChannel, page]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (el && el.scrollTop < 80) loadMoreMessages();
  }, [loadMoreMessages]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSend = useCallback((content) => {
    if (!activeChannel || !stompClientRef.current) return;
    sendMessage(stompClientRef.current, activeChannel.id, content);
  }, [activeChannel]);

  const handleTyping = useCallback((isTyping) => {
    if (!activeChannel || !stompClientRef.current) return;
    sendTypingIndicator(stompClientRef.current, activeChannel.id, isTyping);
  }, [activeChannel]);

  const handleCreateChannel = useCallback(async (data) => {
    await chatAPI.createChannel(data); await loadChannels();
  }, [loadChannels]);

  const handleStartDM = useCallback(async (targetUser) => {
    const res = await chatAPI.startDM(targetUser.id);
    await loadChannels();
    selectChannel(res.data);
  }, [loadChannels, selectChannel]);

  const goBack = () => {
    setCompactView('LIST'); setActiveChannel(null); setMessages([]); loadChannels();
  };

  // ── Expand / Collapse ────────────────────────────────────────────────────
  const handleExpand = () => { setExpanded(true); setOpen(true); };
  const handleCollapse = () => { setExpanded(false); };
  const handleClose = () => { setOpen(false); setExpanded(false); };

  // ── Call Handlers ────────────────────────────────────────────────────────
  const initiateCall = (isVideo) => {
    if (!activeChannel || !stompClientRef.current) return;
    setActiveCall({
      channelId: activeChannel.id,
      targetUser: getOther(activeChannel),
      isVideo,
      isCaller: true
    });
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    setActiveCall({
      channelId: incomingCall.channelId,
      targetUser: incomingCall.targetUser,
      isVideo: incomingCall.isVideo,
      isCaller: false,
      incomingOffer: incomingCall.offer
    });
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    if (incomingCall && stompClientRef.current) {
      sendWebRTCSignal(stompClientRef.current, incomingCall.channelId, 'reject-call', {});
    }
    setIncomingCall(null);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getDisplayName = (channel) => {
    if (!channel) return '';
    if (channel.type === 'DIRECT') {
      return channel.participants?.find(p => p.username !== user?.username)?.username || channel.name;
    }
    return channel.name;
  };
  const getIcon = (channel) => {
    if (!channel || channel.type === 'DIRECT') return null;
    return channel.type === 'BROADCAST' ? '📢' : '#';
  };
  const getOther = (channel) => channel?.participants?.find(p => p.username !== user?.username);

  const filtered = channels.filter(c => {
    if (!searchQuery) return true;
    return getDisplayName(c).toLowerCase().includes(searchQuery.toLowerCase());
  });
  const groupChannels = filtered.filter(c => c.type !== 'DIRECT');
  const dmChannels = filtered.filter(c => c.type === 'DIRECT');

  const processedMessages = messages.map((msg, i) => ({
    ...msg,
    showAvatar: i === 0 || messages[i - 1]?.senderId !== msg.senderId,
    isOwn: msg.senderUsername === user?.username,
  }));

  const filteredColleagues = colleagues.filter(col => {
    if (!searchQuery) return true;
    return col.username.toLowerCase().includes(searchQuery.toLowerCase());
  }).map(col => ({
    id: `colleague_${col.id}`,
    isColleague: true,
    targetUserId: col.id,
    type: 'DIRECT',
    name: col.username,
    participants: [{ username: col.username, role: col.role }],
    lastMessage: null,
    unreadCount: 0
  }));

  if (!user) return null;

  // ── Shared messages area render ───────────────────────────────────────────
  const renderMessages = (isExpanded) => (
    <div
      className={`fc-messages-scroll ${isExpanded ? 'exp' : ''}`}
      ref={isExpanded ? messagesContainerRef : null}
      onScroll={isExpanded ? handleScroll : undefined}
    >
      {loadingMore && (
        <div className="fc-loading-more"><div className="fc-spinner-sm" /> Loading older…</div>
      )}
      {!hasMore && messages.length > 0 && (
        <div className="fc-start-label">
          <div className="fc-start-line" /><span>Start of conversation</span><div className="fc-start-line" />
        </div>
      )}
      {loading ? (
        <div className="fc-loading"><div className="fc-spinner" /></div>
      ) : messages.length === 0 ? (
        <div className="fc-no-messages"><span>👋</span><p>Say hello!</p></div>
      ) : (
        processedMessages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} expanded={isExpanded} />
        ))
      )}
      {typingUsers.length > 0 && (
        <div className="fc-msg-row other">
          <div className="fc-bubble other fc-typing-bubble">
            <span className="fc-typing-dots"><span /><span /><span /></span>
          </div>
        </div>
      )}
      <div ref={isExpanded ? null : messagesEndRef} />
      <div ref={isExpanded ? messagesEndRef : null} />
    </div>
  );

  // ── Expanded View ───────────────────────────────────────────────────────────
  const expandedView = (
    <div className="fce-overlay">
      <aside className="fce-sidebar">
        <div className="fce-sidebar-top">
          <div className="fce-search-bar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#64748b" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              className="fce-search-input"
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="fce-channels-scroll">
          <div className="fce-section-label">
            <span>Channels</span>
            <button className="fce-add-btn" onClick={() => setShowCreateModal(true)} title="New Channel"><IconPlus /></button>
          </div>
          {groupChannels.map(c => (
            <ChannelItem
              key={c.id} channel={c} currentUsername={user?.username}
              active={activeChannel?.id === c.id}
              onClick={() => selectChannel(c)}
            />
          ))}

          <div className="fce-section-label" style={{ marginTop: 12 }}>
            <span>Direct Messages</span>
            <button className="fce-add-btn" onClick={() => setShowDMModal(true)} title="New DM"><IconDM /></button>
          </div>
          {dmChannels.map(c => (
            <ChannelItem
              key={c.id} channel={c} currentUsername={user?.username}
              active={activeChannel?.id === c.id}
              onClick={() => selectChannel(c)}
              status={participantsStatus[c.participants?.find(p => p.username !== user?.username)?.username]}
            />
          ))}

          <div className="fce-section-label" style={{ marginTop: 12 }}>
            <span>Colleagues</span>
          </div>
          {filteredColleagues.map(c => (
            <ChannelItem
              key={c.id} channel={c} currentUsername={user?.username}
              active={false}
              onClick={() => handleStartDM({ id: c.targetUserId, username: c.name })}
              status={participantsStatus[c.name] || 'Offline'}
            />
          ))}
        </div>

        <div className="fce-user-footer">
          <div className="fce-user-avatar">{getInitials(user?.username)}</div>
          <div className="fce-user-info">
            <span className="fce-user-name">{user?.username}</span>
            <span className="fce-user-role">{user?.role?.replace('ROLE_', '')}</span>
          </div>
          <span className={`fc-ws-dot ${wsConnected ? 'online' : 'offline'}`} title={wsConnected ? 'Connected' : 'Offline'} />
        </div>
      </aside>

      <main className="fce-main">
        <div className="fce-chat-header">
          <div className="fce-header-left">
            {activeChannel ? (
              <>
                {activeChannel.type === 'DIRECT' ? (
                  <div className="fce-avatar-lg" style={{ background: ROLE_COLORS[getOther(activeChannel)?.role] || '#64748b' }}>
                    {getInitials(getDisplayName(activeChannel))}
                  </div>
                ) : (
                  <div className="fce-icon-lg">{getIcon(activeChannel)}</div>
                )}
                <div>
                  <h2 className="fce-channel-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{getDisplayName(activeChannel)}</span>
                    {activeChannel.type === 'DIRECT' && getOther(activeChannel) && participantsStatus[getOther(activeChannel).username] && (
                      <span className={`fce-status-dot ${STATUS_OPTIONS.find(o => o.label === participantsStatus[getOther(activeChannel).username])?.class}`}
                            style={{ width: 8, height: 8 }}
                            title={participantsStatus[getOther(activeChannel).username]} />
                    )}
                  </h2>
                  {activeChannel.description && <p className="fce-channel-desc">{activeChannel.description}</p>}
                </div>
              </>
            ) : (
              <div className="fce-header-brand">
                <span className="fc-brand-icon">💬</span>
                <span className="fc-brand-name">CliqChat</span>
              </div>
            )}
          </div>
          
          <div className="fce-header-right">
            {activeChannel && activeChannel.type === 'DIRECT' && (
              <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
                <button className="fce-header-btn" onClick={() => initiateCall(false)} title="Audio Call"><Phone size={18} /></button>
                <button className="fce-header-btn" onClick={() => initiateCall(true)} title="Video Call"><VideoIcon size={18} /></button>
              </div>
            )}

            {/* Zoho Cliq Status Selector in Top Bar */}
            <div className="fce-topbar-status" ref={statusDropdownRef}>
              <button className="fce-status-select-btn" onClick={() => setShowStatusDropdown(prev => !prev)}>
                <span className={`fce-status-dot ${STATUS_OPTIONS.find(o => o.label === userStatus)?.class || 'available'}`} />
                <span className="fce-status-select-text">{userStatus}</span>
                <svg className="fce-status-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showStatusDropdown && (
                <div className="fce-status-dropdown-menu">
                  {STATUS_OPTIONS.map(opt => (
                    <button 
                      key={opt.label} 
                      type="button"
                      className={`fce-status-dropdown-item ${userStatus === opt.label ? 'active' : ''}`}
                      onClick={() => {
                        setUserStatus(opt.label);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <span className={`fce-status-dot ${opt.class}`} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeChannel && activeChannel.memberCount > 0 && (
              <span className="fce-member-count">👥 {activeChannel.memberCount}</span>
            )}
            {activeChannel && (
              <button className={`fce-header-btn ${showDetails ? 'active' : ''}`} onClick={() => setShowDetails(v => !v)} title="Details">ℹ️</button>
            )}
            <button className="fce-header-btn" onClick={handleCollapse} title="Collapse to widget"><IconCollapse /></button>
            <button className="fce-header-btn danger" onClick={handleClose} title="Close"><IconClose /></button>
          </div>
        </div>
        {activeChannel ? (
          <>
            {renderMessages(true)}
            <MessageInput onSend={handleSend} onTyping={handleTyping} placeholder={`Message ${getDisplayName(activeChannel)}`} />
          </>
        ) : <div className="fce-welcome">Select a channel to chat</div>}
      </main>

      {showDetails && activeChannel && (
        <aside className="fce-details">
          <div className="fce-details-header">
            <h3>Details</h3>
            <button className="fce-header-btn" onClick={() => setShowDetails(false)}><IconClose /></button>
          </div>
          <div className="fce-details-body">
            <div className="fce-detail-icon">{getIcon(activeChannel) || getInitials(getDisplayName(activeChannel))}</div>
            <h4>{getDisplayName(activeChannel)}</h4>
            {activeChannel.description && <p className="fce-detail-desc">{activeChannel.description}</p>}
            <div className="fce-members-title">Members ({activeChannel.memberCount})</div>
            {activeChannel.participants?.map(p => {
              const isSelf = p.username === user?.username;
              const status = isSelf ? userStatus : participantsStatus[p.username];
              return (
                <div key={p.userId} className="fce-member-item">
                  <div className="fce-member-avatar" style={{ background: ROLE_COLORS[p.role] || '#64748b', position: 'relative' }}>
                    {getInitials(p.username)}
                    {status && (
                      <span className={`fce-status-indicator ${STATUS_OPTIONS.find(o => o.label === status)?.class || 'available'}`}
                            style={{ bottom: -2, right: -2, width: 10, height: 10, border: '2px solid #0B1320' }} />
                    )}
                  </div>
                  <div>
                    <div className="fce-member-name">{p.username}</div>
                    <div className="fce-member-role" style={{ color: ROLE_COLORS[p.role] }}>
                      {ROLE_LABELS[p.role] || p.role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );

  return (
    <>
      {/* ── Expanded Overlay View ── */}
      {open && expanded && expandedView}

      {/* ── Compact Floating Widget ── */}
      {!expanded && (
        <div className={`fc-container ${open ? 'open' : ''} ${compactView === 'CHAT' ? 'fc-chat-active' : ''}`}>
          {open && (
            <div className="fc-panel">
              <div className="fc-header">
                {compactView === 'CHAT' ? (
                  <>
                    <button className="fc-back-btn" onClick={goBack}><IconBack /></button>
                    <div className="fc-header-channel">
                      {activeChannel?.type === 'DIRECT' ? (
                        <div className="fc-avatar-sm" style={{ background: ROLE_COLORS[getOther(activeChannel)?.role] || '#64748b' }}>
                          {getInitials(getDisplayName(activeChannel))}
                        </div>
                      ) : (
                        <span className="fc-channel-icon-sm">{getIcon(activeChannel)}</span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="fc-header-name">{getDisplayName(activeChannel)}</div>
                        {typingUsers.length > 0 && (
                          <div className="fc-typing-header">
                            <span className="fc-typing-dots"><span /><span /><span /></span> typing…
                          </div>
                        )}
                      </div>
                      {activeChannel?.type === 'DIRECT' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="fc-icon-action" onClick={() => initiateCall(false)} title="Audio Call"><Phone size={16} /></button>
                          <button className="fc-icon-action" onClick={() => initiateCall(true)} title="Video Call"><VideoIcon size={16} /></button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="fc-header-brand">
                      <span className="fc-brand-icon">💬</span>
                      <span className="fc-brand-name">CliqChat</span>
                      <span className={`fc-ws-dot ${wsConnected ? 'online' : 'offline'}`} />
                    </div>
                    <div className="fc-header-actions">
                      <button className="fc-icon-action" onClick={() => setShowCreateModal(true)} title="New Channel"><IconPlus /></button>
                      <button className="fc-icon-action" onClick={() => setShowDMModal(true)} title="New DM"><IconDM /></button>
                    </div>
                  </>
                )}
                {/* Expand & Close */}
                <button className="fc-icon-action" onClick={handleExpand} title="Expand to full view"><IconExpand /></button>
                <button className="fc-close-btn" onClick={handleClose}><IconClose /></button>
              </div>

              {compactView === 'LIST' && (
                <div className="fc-list-view">
                  <div className="fc-search-bar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="8" stroke="#64748b" strokeWidth="2"/>
                      <path d="M21 21l-4.35-4.35" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input className="fc-search-input" placeholder="Search channels, people…"
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  <div className="fc-channels-scroll">
                    {filtered.length === 0 && filteredColleagues.length === 0 && (
                      <div className="fc-empty">
                        <span>No conversations yet</span>
                        <button className="fc-start-btn" onClick={() => setShowDMModal(true)}>Start a chat</button>
                      </div>
                    )}
                    {filtered.map(c => {
                      const other = c.participants?.find(p => p.username !== user?.username);
                      const status = (c.type === 'DIRECT' && other) ? participantsStatus[other.username] : null;
                      return (
                        <ChannelItem
                          key={c.id} channel={c} currentUsername={user?.username}
                          active={activeChannel?.id === c.id}
                          onClick={() => selectChannel(c)}
                          status={status}
                        />
                      );
                    })}
                    {filteredColleagues.length > 0 && (
                      <>
                        <div className="fce-section-label" style={{ marginTop: 12, fontSize: '10px' }}>
                          <span>Colleagues</span>
                        </div>
                        {filteredColleagues.map(c => {
                          const status = participantsStatus[c.name] || 'Offline';
                          return (
                            <ChannelItem
                              key={c.id} channel={c} currentUsername={user?.username}
                              active={false}
                              onClick={() => handleStartDM({ id: c.targetUserId, username: c.name })}
                              status={status}
                            />
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              )}

              {compactView === 'CHAT' && (
                <div className="fc-chat-view">
                  {renderMessages(false)}
                  <MessageInput
                    onSend={handleSend}
                    onTyping={handleTyping}
                    placeholder={`Message ${getDisplayName(activeChannel)}`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      {!expanded && (
        <button className={`fc-fab ${open ? 'open' : ''}`} onClick={() => {
          if (open) {
            handleClose();
          } else {
            setOpen(true);
            setExpanded(true);
          }
        }} title="CliqChat">
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white"/>
            </svg>
          )}
          {!open && totalUnread > 0 && (
            <span className="fc-fab-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
          )}
        </button>
      )}

      {/* Modals */}
      {showCreateModal && <CreateChannelModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateChannel} currentUserRole={user?.role} />}
      {showDMModal && <UserSearchModal onClose={() => setShowDMModal(false)} onSelect={handleStartDM} currentUsername={user?.username} />}
      
      {/* Call UI */}
      {incomingCall && !activeCall && createPortal(
        <div className="incoming-call-prompt">
          <div className="incoming-caller">{incomingCall.caller} is calling...</div>
          <div className="incoming-type">{incomingCall.isVideo ? '📹 Video Call' : '📞 Audio Call'}</div>
          <div className="incoming-actions">
            <button className="inc-btn accept" onClick={handleAcceptCall}>Accept</button>
            <button className="inc-btn decline" onClick={handleDeclineCall}>Decline</button>
          </div>
        </div>,
        document.body
      )}

      {activeCall && stompClientRef.current && (
        <CallModal
          stompClient={stompClientRef.current}
          channelId={activeCall.channelId}
          currentUser={user}
          targetUser={activeCall.targetUser}
          isVideo={activeCall.isVideo}
          isCaller={activeCall.isCaller}
          incomingOffer={activeCall.incomingOffer}
          onClose={() => setActiveCall(null)}
        />
      )}
    </>
  );
}
