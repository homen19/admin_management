import React from 'react';
import './ChatComponents.css';

const ROLE_COLORS = {
  ROLE_ADMIN: '#7c3aed',
  ROLE_STAFF: '#0ea5e9',
  ROLE_FACULTY: '#10b981',
  ROLE_LIBRARIAN: '#f59e0b',
};

const ROLE_LABELS = {
  ROLE_ADMIN: 'Admin',
  ROLE_STAFF: 'Staff',
  ROLE_FACULTY: 'Faculty',
  ROLE_LIBRARIAN: 'Librarian',
};

function getInitials(username) {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ChannelList({ channels, activeChannelId, onChannelSelect, onNewChannel, currentUsername }) {
  const groups = channels.filter(c => c.type === 'GROUP' || c.type === 'BROADCAST');

  return (
    <div className="channel-section">
      <div className="channel-section-header">
        <span className="section-label">Channels</span>
        <button className="new-channel-btn" onClick={onNewChannel} title="New Channel">＋</button>
      </div>
      {groups.length === 0 && <p className="empty-hint">No channels yet</p>}
      {groups.map(channel => (
        <div
          key={channel.id}
          className={`channel-item ${activeChannelId === channel.id ? 'active' : ''}`}
          onClick={() => onChannelSelect(channel)}
        >
          <div className="channel-icon">
            {channel.type === 'BROADCAST' ? '📢' : '#'}
          </div>
          <div className="channel-info">
            <span className="channel-name">{channel.name}</span>
            {channel.lastMessage && (
              <span className="channel-preview">{channel.lastMessage.content}</span>
            )}
          </div>
          {channel.unreadCount > 0 && (
            <span className="unread-badge">{channel.unreadCount > 99 ? '99+' : channel.unreadCount}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function DirectMessageList({ channels, activeChannelId, onChannelSelect, onNewDM, currentUsername }) {
  const dms = channels.filter(c => c.type === 'DIRECT');

  const getOtherParticipant = (channel) => {
    if (!channel.participants) return null;
    return channel.participants.find(p => p.username !== currentUsername);
  };

  return (
    <div className="channel-section">
      <div className="channel-section-header">
        <span className="section-label">Direct Messages</span>
        <button className="new-channel-btn" onClick={onNewDM} title="New DM">＋</button>
      </div>
      {dms.length === 0 && <p className="empty-hint">No direct messages yet</p>}
      {dms.map(channel => {
        const other = getOtherParticipant(channel);
        const roleColor = ROLE_COLORS[other?.role] || '#64748b';
        return (
          <div
            key={channel.id}
            className={`channel-item dm-item ${activeChannelId === channel.id ? 'active' : ''}`}
            onClick={() => onChannelSelect(channel)}
          >
            <div className="avatar-small" style={{ background: roleColor }}>
              {getInitials(other?.username)}
            </div>
            <div className="channel-info">
              <span className="channel-name">{other?.username || channel.name}</span>
              {other?.role && (
                <span className="role-tag" style={{ color: roleColor }}>
                  {ROLE_LABELS[other.role] || other.role}
                </span>
              )}
            </div>
            {channel.unreadCount > 0 && (
              <span className="unread-badge">{channel.unreadCount}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MessageBubble({ message, isOwn, showAvatar }) {
  const roleColor = ROLE_COLORS[message.senderRole] || '#64748b';

  if (message.deleted) {
    return (
      <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
        <div className="message-deleted">This message was deleted.</div>
      </div>
    );
  }

  return (
    <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && showAvatar && (
        <div className="avatar-msg" style={{ background: roleColor }}>
          {getInitials(message.senderUsername)}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="avatar-placeholder" />}
      <div className="message-content-wrap">
        {!isOwn && showAvatar && (
          <div className="message-meta">
            <span className="msg-sender">{message.senderUsername}</span>
            <span className="msg-role-badge" style={{ background: roleColor + '22', color: roleColor }}>
              {ROLE_LABELS[message.senderRole] || message.senderRole}
            </span>
            <span className="msg-time">{formatTime(message.sentAt)}</span>
          </div>
        )}
        <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
          {message.messageType === 'IMAGE' && message.fileUrl ? (
            <div className="message-image-container">
              <img src={message.fileUrl} alt={message.fileName || 'Image'} className="message-image" />
              {message.content && message.content !== 'Sent an image' && <p className="bubble-text mt-2">{message.content}</p>}
            </div>
          ) : message.messageType === 'FILE' && message.fileUrl ? (
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="message-file-card" download>
              <div className="file-icon">📄</div>
              <div className="file-details">
                <span className="file-name">{message.fileName || 'Attachment'}</span>
                <span className="file-download-text">Click to download</span>
              </div>
            </a>
          ) : (
            <p className="bubble-text">{message.content}</p>
          )}
        </div>
        {isOwn && <span className="msg-time own-time">{formatTime(message.sentAt)}</span>}
      </div>
    </div>
  );
}

export function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return null;
  const names = typingUsers.join(', ');
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span></span><span></span><span></span>
      </div>
      <span className="typing-text">
        {names} {typingUsers.length === 1 ? 'is' : 'are'} typing…
      </span>
    </div>
  );
}
