import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/chatService';
import './Modals.css';

export function CreateChannelModal({ onClose, onCreate, currentUserRole }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('GROUP');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await chatAPI.searchUsers(search);
        setSearchResults(res.data);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.find(u => u.id === user.id) ? prev.filter(u => u.id !== user.id) : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate({ name: name.trim(), description, type, participantUserIds: selectedUsers.map(u => u.id) });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const ROLE_COLORS = { ROLE_ADMIN: '#7c3aed', ROLE_STAFF: '#0ea5e9', ROLE_FACULTY: '#10b981', ROLE_LIBRARIAN: '#f59e0b' };
  const ROLE_LABELS = { ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff', ROLE_FACULTY: 'Faculty', ROLE_LIBRARIAN: 'Librarian' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Channel</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Channel Name <span className="required">*</span></label>
            <input
              className="modal-input"
              placeholder="e.g. general-announcements"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              className="modal-input"
              placeholder="What's this channel about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {currentUserRole === 'ROLE_ADMIN' && (
            <div className="form-group">
              <label>Channel Type</label>
              <div className="type-toggle">
                <button className={`type-btn ${type === 'GROUP' ? 'active' : ''}`} onClick={() => setType('GROUP')}>
                  # Group
                </button>
                <button className={`type-btn ${type === 'BROADCAST' ? 'active' : ''}`} onClick={() => setType('BROADCAST')}>
                  📢 Broadcast
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Add Members</label>
            <input
              className="modal-input"
              placeholder="Search by username or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(u => (
                  <div
                    key={u.id}
                    className={`search-result-item ${selectedUsers.find(s => s.id === u.id) ? 'selected' : ''}`}
                    onClick={() => toggleUser(u)}
                  >
                    <div className="search-avatar" style={{ background: ROLE_COLORS[u.role] || '#64748b' }}>
                      {u.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="search-name">{u.username}</div>
                      <div className="search-role" style={{ color: ROLE_COLORS[u.role] }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </div>
                    </div>
                    {selectedUsers.find(s => s.id === u.id) && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            )}
            {selectedUsers.length > 0 && (
              <div className="selected-tags">
                {selectedUsers.map(u => (
                  <span key={u.id} className="selected-tag">
                    {u.username}
                    <button onClick={() => toggleUser(u)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-create" onClick={handleCreate} disabled={!name.trim() || loading}>
            {loading ? 'Creating…' : 'Create Channel'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserSearchModal({ onClose, onSelect, currentUsername }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await chatAPI.searchUsers(search);
        setResults(res.data);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const ROLE_COLORS = { ROLE_ADMIN: '#7c3aed', ROLE_STAFF: '#0ea5e9', ROLE_FACULTY: '#10b981', ROLE_LIBRARIAN: '#f59e0b' };
  const ROLE_LABELS = { ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff', ROLE_FACULTY: 'Faculty', ROLE_LIBRARIAN: 'Librarian' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Direct Message</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <input
            className="modal-input"
            placeholder="Search people…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="dm-results">
            {results.length === 0 && search.length >= 2 && (
              <p className="no-results">No users found</p>
            )}
            {results.map(u => (
              <div key={u.id} className="dm-result-item" onClick={() => { onSelect(u); onClose(); }}>
                <div className="search-avatar" style={{ background: ROLE_COLORS[u.role] || '#64748b' }}>
                  {u.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="search-name">{u.username}</div>
                  <div className="search-role" style={{ color: ROLE_COLORS[u.role] }}>
                    {ROLE_LABELS[u.role] || u.role}
                  </div>
                </div>
                <span className="dm-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
