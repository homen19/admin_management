import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatAPI } from '../../services/chatService';
import './MessageInput.css';

const EMOJIS = ['😀','😂','😍','🎉','👍','❤️','🔥','✅','🙏','😎','🤔','💯','🎯','📌','⚡','🚀'];

export default function MessageInput({ onSend, onTyping, disabled, placeholder }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping && onTyping(true);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping && onTyping(false);
    }, 2000);
  }, [onTyping]);

  const handleChange = (e) => {
    setText(e.target.value);
    handleTyping();
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isUploading) return;
    onSend(trimmed, 'TEXT');
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    // Clear typing
    clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    onTyping && onTyping(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await chatAPI.uploadFile(formData);
      
      const { url, fileName } = res.data;
      const isImage = file.type.startsWith('image/');
      
      onSend(isImage ? 'Sent an image' : 'Sent a file', isImage ? 'IMAGE' : 'FILE', url, fileName);
    } catch (err) {
      console.error('File upload failed', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  return (
    <div className="message-input-container">
      {showEmoji && (
        <div className="emoji-picker">
          {EMOJIS.map(e => (
            <button key={e} className="emoji-btn" onClick={() => insertEmoji(e)}>{e}</button>
          ))}
        </div>
      )}
      <div className="input-row">
        <button
          className={`icon-btn ${showEmoji ? 'active' : ''}`}
          onClick={() => setShowEmoji(v => !v)}
          title="Emoji"
          type="button"
          disabled={isUploading}
        >
          😊
        </button>
        <button
          className="icon-btn attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload file"
          type="button"
          disabled={disabled || isUploading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isUploading ? 'Uploading file...' : (placeholder || 'Type a message… (Enter to send, Shift+Enter for newline)')}
          disabled={disabled || isUploading}
          rows={1}
        />
        <button
          className={`send-btn ${text.trim() ? 'ready' : ''}`}
          onClick={handleSend}
          disabled={!text.trim() || disabled || isUploading}
          title="Send"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="input-hint">
        <span>{text.length}/2000</span>
        <span>Shift+Enter for new line</span>
      </div>
    </div>
  );
}
