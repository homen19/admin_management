import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  Send,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  CalendarPlus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { sendChatMessage, executeCalendarAction } from '../services/geminiCalendarService';

// ─────────────────────────────────────────────────────────────────────────────
// Markdown-lite renderer for bot messages (bold, bullet lists, line breaks)
// ─────────────────────────────────────────────────────────────────────────────
function RenderMarkdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
              <span>{parts}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <div key={i}>{parts}</div>;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Action confirmation card
// ─────────────────────────────────────────────────────────────────────────────
function ActionConfirmCard({ action, onConfirm, onCancel, isExecuting }) {
  const { name, args } = action;
  const isDelete = name === 'delete_event' || name === 'delete_holiday';
  const isHoliday = name === 'add_holiday' || name === 'delete_holiday';
  const isTask = name === 'create_task';

  const actionLabels = {
    create_event:   { icon: <CalendarPlus size={13} />, label: 'Create Event',   color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
    create_task:    { icon: <CalendarPlus size={13} />, label: 'Create Task',    color: 'text-blue-700 border-blue-200 bg-blue-50' },
    add_holiday:    { icon: <CalendarPlus size={13} />, label: 'Add Holiday',    color: 'text-amber-700 border-amber-200 bg-amber-50' },
    delete_event:   { icon: <Trash2 size={13} />,       label: 'Delete Event',   color: 'text-rose-700 border-rose-200 bg-rose-50' },
    delete_holiday: { icon: <Trash2 size={13} />,       label: 'Delete Holiday', color: 'text-rose-700 border-rose-200 bg-rose-50' },
  };

  const meta = actionLabels[name] || { icon: <Sparkles size={13} />, label: name, color: 'text-indigo-700 border-indigo-200 bg-indigo-50' };

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className={`flex items-center gap-2 px-3 py-2 border-b border-slate-100 text-[10px] font-bold ${meta.color.split(' ')[0]}`}>
        {meta.icon}
        <span>{meta.label}</span>
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        {args.title && (
          <div className="flex gap-2">
            <span className="text-[10px] text-slate-500 w-14 shrink-0 pt-0.5">Title</span>
            <span className="text-[11px] text-slate-800 font-semibold">{args.title}</span>
          </div>
        )}
        {(args.startDate || args.dueDate || args.date) && (
          <div className="flex gap-2">
            <span className="text-[10px] text-slate-500 w-14 shrink-0 pt-0.5">Date</span>
            <span className="text-[10px] text-slate-600 font-mono">{args.startDate || args.dueDate || args.date}</span>
          </div>
        )}
        {args.endDate && !isTask && (
          <div className="flex gap-2">
            <span className="text-[10px] text-slate-500 w-14 shrink-0 pt-0.5">End</span>
            <span className="text-[10px] text-slate-600 font-mono">{args.endDate}</span>
          </div>
        )}
        {args.type && (
          <div className="flex gap-2">
            <span className="text-[10px] text-slate-500 w-14 shrink-0 pt-0.5">Type</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.color}`}>{args.type}</span>
          </div>
        )}
        {args.isPublic !== undefined && !isTask && !isHoliday && (
          <div className="flex gap-2">
            <span className="text-[10px] text-slate-500 w-14 shrink-0 pt-0.5">Visible</span>
            <span className="text-[10px] text-slate-600">{args.isPublic ? 'Public' : 'Private'}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 px-3 pb-3">
        <button
          onClick={onCancel}
          disabled={isExecuting}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 text-[10px] font-semibold transition-all"
        >
          <XCircle size={12} /> Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isExecuting}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow ${
            isDelete ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isExecuting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
          {isDelete ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion chips shown on first open
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTION_CHIPS = [
  { label: '📅 List holidays',    prompt: 'List all holidays' },
  { label: '📋 Upcoming events',  prompt: 'Show upcoming events' },
  { label: '➕ Schedule event',   prompt: 'Schedule a new event' },
  { label: '✅ Add task',         prompt: 'Create a task for me' },
];

const INITIAL_MESSAGE = {
  id: 'init',
  role: 'model',
  text: "👋 Hi! I'm your **AI Calendar Assistant**, powered by Gemini.\n\nI can help you:\n• Schedule meetings & events\n• Add holidays\n• Create tasks & reminders\n• List what's on the calendar\n\nWhat would you like to do?",
  type: 'text',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component — controlled by isOpen / setIsOpen from Calendar.jsx header
// Panel appears as a dropdown from the header, full height of the calendar body
// ─────────────────────────────────────────────────────────────────────────────
export default function CalendarAIChat({ events, holidays, fetchData, user, isOpen, setIsOpen }) {
  const [messages, setMessages]       = useState([INITIAL_MESSAGE]);
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [retryCountdown, setRetryCountdown]   = useState(null);
  const [pendingRetryText, setPendingRetryText] = useState(null);

  const messagesEndRef  = useRef(null);
  const inputRef        = useRef(null);
  const retryTimerRef   = useRef(null);
  const retryIntervalRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => () => {
    clearTimeout(retryTimerRef.current);
    clearInterval(retryIntervalRef.current);
  }, []);

  // Auto-scroll and auto-focus when opening / new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, messages, scrollToBottom]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const buildHistory = () =>
    messages
      .filter((m) => m.id !== 'init' && m.type === 'text' && m.role !== 'system')
      .map((m) => ({ role: m.role, text: m.text }));

  const addMessage = (msg) => {
    const id = Date.now().toString() + Math.random();
    setMessages((prev) => [...prev, { id, ...msg }]);
    return id;
  };

  const parseRetrySeconds = (errMsg) => {
    const match = errMsg?.match(/retry in ([\d.]+)s/i);
    return match ? Math.ceil(parseFloat(match[1])) : 60;
  };

  const startRetryCountdown = (seconds, textToRetry) => {
    setPendingRetryText(textToRetry);
    setRetryCountdown(seconds);

    clearInterval(retryIntervalRef.current);
    retryIntervalRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) { clearInterval(retryIntervalRef.current); return null; }
        return prev - 1;
      });
    }, 1000);

    clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      setPendingRetryText(null);
      setRetryCountdown(null);
      handleSendInternal(textToRetry);
    }, seconds * 1000);
  };

  // ── Core Gemini call ─────────────────────────────────────────────────────

  const handleSendInternal = async (text) => {
    setIsLoading(true);
    try {
      const response = await sendChatMessage(
        buildHistory(), text,
        user?.role || 'ROLE_STUDENT',
        events, holidays
      );
      if (response.type === 'function_call') {
        const msgId = addMessage({
          role: 'model', type: 'action_preview',
          text: `I'll ${response.name.replace(/_/g, ' ')} for you. Please confirm:`,
          action: { name: response.name, args: response.args },
        });
        setPendingAction({ name: response.name, args: response.args, messageId: msgId });
      } else {
        addMessage({ role: 'model', type: 'text', text: response.text });
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('429') || msg.toLowerCase().includes('quota exceeded')) {
        const retrySec = parseRetrySeconds(msg);
        addMessage({ role: 'system', type: 'rate_limit',
          text: `⏳ Rate limit hit. Auto-retrying in **${retrySec}s**...` });
        startRetryCountdown(retrySec, text);
      } else if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
        addMessage({ role: 'system', type: 'error',
          text: '⚠️ API key issue. Check **VITE_GEMINI_API_KEY** in your `.env` file.\n\nGet a free key at **aistudio.google.com/apikey**' });
      } else {
        addMessage({ role: 'system', type: 'error',
          text: `❌ Something went wrong: ${msg || 'Unknown error'}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (overrideText = null) => {
    const text = (overrideText || input).trim();
    if (!text || isLoading || retryCountdown !== null) return;
    setInput('');
    addMessage({ role: 'user', type: 'text', text });
    await handleSendInternal(text);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setIsExecuting(true);
    try {
      const resultText = await executeCalendarAction(
        pendingAction.name, pendingAction.args, api, events, holidays
      );
      setMessages((prev) =>
        prev.map((m) => m.id === pendingAction.messageId ? { ...m, type: 'text', text: resultText } : m)
      );
      setPendingAction(null);
      if (fetchData) fetchData();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      setMessages((prev) =>
        prev.map((m) => m.id === pendingAction.messageId
          ? { ...m, type: 'error', text: `❌ Action failed: ${errMsg}`, action: null }
          : m)
      );
      setPendingAction(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancelAction = () => {
    setMessages((prev) =>
      prev.map((m) => m.id === pendingAction?.messageId
        ? { ...m, type: 'text', text: '↩️ Action cancelled.' }
        : m)
    );
    setPendingAction(null);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setPendingAction(null);
    setInput('');
    clearTimeout(retryTimerRef.current);
    clearInterval(retryIntervalRef.current);
    setRetryCountdown(null);
    setPendingRetryText(null);
  };

  // ── Render: only the panel — no FAB (button lives in Calendar.jsx header) ─

  if (!isOpen) return null;

  return (
    <>
      {/* ── Chat Panel — positioned as a dropdown from the header button ─── */}
      <div
        id="ai-calendar-chat-panel"
        className="absolute top-full right-0 mt-2 z-50 w-[340px] h-[480px] max-h-[75vh] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden origin-top-right"
        style={{ animation: 'aiChatSlideDown 0.22s ease-out' }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 leading-none">AI Calendar Assistant</h3>
              <span className="text-[9px] text-indigo-600 font-medium">Powered by Gemini 1.5 Flash</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all"
            >
              <RefreshCw size={13} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {messages.map((msg) => {
            const isUser   = msg.role === 'user';
            const isSystem = msg.role === 'system' || msg.type === 'error' || msg.type === 'rate_limit';

            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="flex items-end gap-1.5 max-w-[82%]">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white text-[11px] px-3 py-2 rounded-2xl rounded-br-sm shadow-lg">
                      {msg.text}
                    </div>
                    <div className="h-5 w-5 shrink-0 rounded-full bg-indigo-800 flex items-center justify-center mb-0.5">
                      <User size={10} className="text-indigo-300" />
                    </div>
                  </div>
                </div>
              );
            }

            if (isSystem) {
              const isRateLimit = msg.type === 'rate_limit';
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className={`text-[11px] px-3 py-2 rounded-xl max-w-[92%] border ${
                    isRateLimit
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {isRateLimit && retryCountdown !== null ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={11} className="animate-spin text-amber-600 shrink-0" />
                        <span>
                          Rate limited — retrying in{' '}
                          <strong className="font-mono text-amber-700">{retryCountdown}s</strong>
                        </span>
                        <button
                          onClick={() => {
                            clearTimeout(retryTimerRef.current);
                            clearInterval(retryIntervalRef.current);
                            setRetryCountdown(null);
                            setPendingRetryText(null);
                          }}
                          className="ml-auto text-amber-500 hover:text-amber-700 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <RenderMarkdown text={msg.text} />
                    )}
                  </div>
                </div>
              );
            }

            // Bot message
            return (
              <div key={msg.id} className="flex items-end gap-1.5">
                <div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-0.5">
                  <Sparkles size={10} className="text-white" />
                </div>
                <div className="max-w-[86%]">
                  <div className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                    <RenderMarkdown text={msg.text} />
                  </div>
                  {msg.type === 'action_preview' && msg.action && pendingAction?.messageId === msg.id && (
                    <ActionConfirmCard
                      action={msg.action}
                      onConfirm={handleConfirmAction}
                      onCancel={handleCancelAction}
                      isExecuting={isExecuting}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing dots */}
          {isLoading && (
            <div className="flex items-end gap-1.5">
              <div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
              </div>
              <div className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '140ms' }} />
                  <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '280ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips — only on first open */}
        {messages.length <= 2 && !isLoading && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleSend(chip.prompt)}
                className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 transition-all shadow-sm"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="px-3 pb-3 pt-2 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-sm">
            <input
              ref={inputRef}
              id="ai-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me about the calendar..."
              disabled={isLoading || isExecuting}
              className="flex-1 bg-transparent text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || retryCountdown !== null}
              className="h-6 w-6 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all active:scale-95 shrink-0"
            >
              {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-400 mt-1.5">
            Gemini may make mistakes · Always verify calendar actions
          </p>
        </div>
      </div>

      {/* Slide-down keyframe */}
      <style>{`
        @keyframes aiChatSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
