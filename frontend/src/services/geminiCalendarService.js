import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// Function declarations — tells Gemini what calendar actions are available
// ─────────────────────────────────────────────────────────────────────────────
const calendarTools = [
  {
    functionDeclarations: [
      {
        name: 'create_event',
        description:
          'Creates a calendar event or schedules a meeting on the academic calendar. Use this for meetings, seminars, public events and academic events.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Title or name of the event' },
            description: { type: 'STRING', description: 'Optional description or agenda' },
            startDate: {
              type: 'STRING',
              description: 'Start date-time in ISO format: YYYY-MM-DDTHH:mm (e.g. 2026-06-20T10:00)',
            },
            endDate: {
              type: 'STRING',
              description: 'End date-time in ISO format: YYYY-MM-DDTHH:mm (e.g. 2026-06-20T11:00)',
            },
            type: {
              type: 'STRING',
              enum: ['EVENT', 'ACADEMIC'],
              description: 'EVENT for general public events, ACADEMIC for academic-related events',
            },
            isPublic: {
              type: 'BOOLEAN',
              description: 'Whether this event is visible to all users (true) or only the creator (false)',
            },
          },
          required: ['title', 'startDate', 'endDate', 'type'],
        },
      },
      {
        name: 'create_task',
        description:
          'Creates a personal task or reminder for the logged-in user. Use for assignments, reminders, to-do items.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Title of the task or reminder' },
            description: { type: 'STRING', description: 'Optional notes for the task' },
            dueDate: {
              type: 'STRING',
              description: 'Due date in ISO format: YYYY-MM-DDTHH:mm (e.g. 2026-07-01T23:59)',
            },
          },
          required: ['title', 'dueDate'],
        },
      },
      {
        name: 'add_holiday',
        description:
          'Registers a holiday on the institutional academic calendar. Only ADMIN and STAFF can do this.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Name of the holiday' },
            description: { type: 'STRING', description: 'Optional description about the holiday' },
            date: { type: 'STRING', description: 'Date of the holiday in YYYY-MM-DD format' },
            type: {
              type: 'STRING',
              enum: ['NATIONAL', 'REGIONAL', 'ACADEMIC'],
              description:
                'NATIONAL for public holidays, REGIONAL for state/local holidays, ACADEMIC for institutional academic breaks',
            },
          },
          required: ['title', 'date', 'type'],
        },
      },
      {
        name: 'list_holidays',
        description: 'Lists all holidays registered on the academic calendar',
      },
      {
        name: 'list_events',
        description: 'Lists upcoming calendar events and tasks for the current user',
      },
      {
        name: 'get_events_on_date',
        description: 'Returns all events and holidays on a specific date',
        parameters: {
          type: 'OBJECT',
          properties: {
            date: {
              type: 'STRING',
              description: 'The date to check in YYYY-MM-DD format',
            },
          },
          required: ['date'],
        },
      },
      {
        name: 'delete_event',
        description: 'Searches for a calendar event by title and deletes it',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: {
              type: 'STRING',
              description: 'The title (or part of the title) of the event to delete',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'delete_holiday',
        description: 'Searches for a holiday by title and deletes it. Only ADMIN and STAFF can do this.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: {
              type: 'STRING',
              description: 'The title (or part of the title) of the holiday to delete',
            },
          },
          required: ['title'],
        },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Build system instruction with current date + user context + data snapshot
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemInstruction(userRole, events, holidays) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const roleLabel = {
    ROLE_ADMIN: 'Admin',
    ROLE_STAFF: 'Staff',
    ROLE_FACULTY: 'Faculty',
    ROLE_STUDENT: 'Student',
    ROLE_LIBRARIAN: 'Librarian',
    ROLE_FINANCE: 'Finance Officer',
  }[userRole] || userRole;

  const canManageHolidays =
    userRole === 'ROLE_ADMIN' || userRole === 'ROLE_STAFF';

  const upcomingEvents = events
    .slice(0, 10)
    .map((e) => `  • [${e.type}] "${e.title}" — ${e.startDate?.split('T')[0]}`)
    .join('\n') || '  (none)';

  const allHolidays = holidays
    .slice(0, 10)
    .map((h) => `  • [${h.type}] "${h.title}" — ${h.holidayDate}`)
    .join('\n') || '  (none)';

  return `You are an intelligent Academic Calendar Assistant for an institutional admin management system.

Today's date: ${today}
Current user role: ${roleLabel}
Can manage holidays (add/delete): ${canManageHolidays ? 'Yes' : 'No — only ADMIN and STAFF can manage holidays'}

Current Calendar Snapshot:
Upcoming Events:
${upcomingEvents}

Registered Holidays:
${allHolidays}

Your capabilities:
- Create events (meetings, seminars, academic events)
- Create personal tasks and reminders
- Add holidays (ADMIN/STAFF only)
- List events and holidays
- Check what's scheduled on a specific date
- Delete events and holidays

Rules:
- Always be helpful, concise and friendly.
- If the user asks to add a holiday but their role is NOT Admin or Staff, politely explain they don't have permission.
- When creating events/tasks, if no time is specified, default to 09:00 - 10:00.
- When creating tasks, the endDate should be set to the same day as dueDate at 23:59.
- Always confirm with the user what you understood before taking destructive actions (deletions).
- Dates should use the current year (${new Date().getFullYear()}) unless the user specifies otherwise.
- For "next Monday", "this Friday" etc., resolve to an actual YYYY-MM-DD date.
- Keep responses short and actionable.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main chat function — sends message to Gemini and returns its response
// ─────────────────────────────────────────────────────────────────────────────
export async function sendChatMessage(history, userMessage, userRole, events, holidays) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemInstruction(userRole, events, holidays),
    tools: calendarTools,
  });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;

  // Check if Gemini responded with a function call
  const functionCall = response.candidates?.[0]?.content?.parts?.find(
    (p) => p.functionCall
  )?.functionCall;

  if (functionCall) {
    return {
      type: 'function_call',
      name: functionCall.name,
      args: functionCall.args,
    };
  }

  // Otherwise it's a plain text response
  return {
    type: 'text',
    text: response.text(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Action dispatcher — executes the Gemini-identified function on the backend
// ─────────────────────────────────────────────────────────────────────────────
export async function executeCalendarAction(functionName, args, api, events, holidays) {
  switch (functionName) {
    case 'create_event': {
      const payload = {
        title: args.title,
        description: args.description || '',
        startDate: args.startDate,
        endDate: args.endDate,
        type: args.type || 'EVENT',
        isPublic: args.isPublic ?? true,
      };
      await api.post('/api/events', payload);
      return `✅ Event **"${args.title}"** has been scheduled successfully!`;
    }

    case 'create_task': {
      // Tasks are personal private events with type=TASK
      const taskDate = args.dueDate.split('T')[0];
      const payload = {
        title: args.title,
        description: args.description || '',
        startDate: `${taskDate}T09:00`,
        endDate: `${taskDate}T23:59`,
        type: 'TASK',
        isPublic: false,
      };
      await api.post('/api/events', payload);
      return `✅ Task **"${args.title}"** has been added to your calendar!`;
    }

    case 'add_holiday': {
      const payload = {
        title: args.title,
        description: args.description || '',
        holidayDate: args.date,
        type: args.type || 'NATIONAL',
      };
      await api.post('/api/holidays', payload);
      return `✅ Holiday **"${args.title}"** on ${args.date} has been registered!`;
    }

    case 'list_holidays': {
      if (!holidays || holidays.length === 0) {
        return 'No holidays are currently registered on the calendar.';
      }
      const lines = holidays
        .sort((a, b) => a.holidayDate.localeCompare(b.holidayDate))
        .map(
          (h) =>
            `• **${h.title}** — ${new Date(h.holidayDate + 'T00:00:00').toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })} *(${h.type})*`
        );
      return `📅 **Registered Holidays (${holidays.length} total):**\n\n${lines.join('\n')}`;
    }

    case 'list_events': {
      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = events
        .filter((e) => e.startDate >= todayStr)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, 8);

      if (upcoming.length === 0) {
        return 'No upcoming events found on the calendar.';
      }
      const lines = upcoming.map((e) => {
        const dateStr = new Date(e.startDate).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short',
        });
        return `• **${e.title}** — ${dateStr} *(${e.type})*`;
      });
      return `📋 **Upcoming Events (next ${upcoming.length}):**\n\n${lines.join('\n')}`;
    }

    case 'get_events_on_date': {
      const targetDate = args.date;
      const dayEvents = events.filter(
        (e) => e.startDate?.split('T')[0] === targetDate
      );
      const dayHolidays = holidays.filter((h) => h.holidayDate === targetDate);
      const allItems = [
        ...dayHolidays.map((h) => `🎌 **${h.title}** *(${h.type} Holiday)*`),
        ...dayEvents.map((e) => {
          const time = e.startDate?.split('T')[1]?.substring(0, 5) || '';
          return `📅 **${e.title}** ${time ? `at ${time}` : ''} *(${e.type})*`;
        }),
      ];
      if (allItems.length === 0) {
        return `Nothing is scheduled on **${targetDate}**.`;
      }
      const label = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long',
      });
      return `**${label}:**\n\n${allItems.join('\n')}`;
    }

    case 'delete_event': {
      const searchTitle = args.title.toLowerCase();
      const match = events.find((e) =>
        e.title.toLowerCase().includes(searchTitle)
      );
      if (!match) {
        return `❌ No event found with title matching **"${args.title}"**. Please check the name and try again.`;
      }
      await api.delete(`/api/events/${match.id}`);
      return `🗑️ Event **"${match.title}"** has been deleted successfully.`;
    }

    case 'delete_holiday': {
      const searchTitle = args.title.toLowerCase();
      const match = holidays.find((h) =>
        h.title.toLowerCase().includes(searchTitle)
      );
      if (!match) {
        return `❌ No holiday found with title matching **"${args.title}"**. Please check the name and try again.`;
      }
      await api.delete(`/api/holidays/${match.id}`);
      return `🗑️ Holiday **"${match.title}"** has been deleted successfully.`;
    }

    default:
      return `I'm not sure how to handle the action: ${functionName}.`;
  }
}
