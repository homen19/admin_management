import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CalendarAIChat from '../components/CalendarAIChat';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  CalendarRange,
  Filter,
  Eye,
  Search,
  Download,
  Sparkles
} from 'lucide-react';

const CalendarPage = () => {
  const { user, hasRole } = useAuth();
  
  // View Modes: 'month' | 'week' | 'day'
  const [viewMode, setViewMode] = useState('month');
  
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Data States
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters State
  const [filters, setFilters] = useState({
    holidays: true,
    publicEvents: true,
    academicEvents: true,
    tasks: true
  });
  
  // Show Filters Drawer on Mobile/Desktop Sidebar
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  // AI Chat Panel open state (controlled from header button)
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { type: 'event'|'holiday', data: object }
  
  // Form States
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'TASK',
    isPublic: false
  });
  
  const [holidayForm, setHolidayForm] = useState({
    title: '',
    description: '',
    holidayDate: '',
    type: 'NATIONAL'
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load calendar events & holidays
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch calendar data for range
      const startRange = new Date(year - 1, 0, 1).toISOString();
      const endRange = new Date(year + 1, 11, 31).toISOString();
      
      const [eventsRes, holidaysRes] = await Promise.all([
        api.get('/api/events', { params: { start: startRange, end: endRange } }),
        api.get('/api/holidays')
      ]);
      
      setEvents(eventsRes.data);
      setHolidays(holidaysRes.data);
    } catch (err) {
      showAlert('error', 'Failed to retrieve calendar schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert({ type: '', text: '' }), 5000);
  };

  // iCal Export Helper
  const handleExportICS = () => {
    try {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//IIT Office//Academic Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];

      const formatToiCalDate = (dateString, isAllDay = false) => {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        const pad = (num) => String(num).padStart(2, '0');
        const year = d.getUTCFullYear();
        const month = pad(d.getUTCMonth() + 1);
        const day = pad(d.getUTCDate());
        if (isAllDay) {
          return `${year}${month}${day}`;
        }
        const hours = pad(d.getUTCHours());
        const minutes = pad(d.getUTCMinutes());
        const seconds = pad(d.getUTCSeconds());
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
      };

      events.forEach(e => {
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:event_${e.id || Math.random()}@iit.portal`);
        icsContent.push(`DTSTAMP:${formatToiCalDate(new Date())}`);
        icsContent.push(`DTSTART:${formatToiCalDate(e.startDate)}`);
        icsContent.push(`DTEND:${formatToiCalDate(e.endDate)}`);
        icsContent.push(`SUMMARY:${e.title || 'Academic Event'}`);
        icsContent.push(`DESCRIPTION:${e.description || ''}`);
        icsContent.push('END:VEVENT');
      });

      holidays.forEach(h => {
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:holiday_${h.id || Math.random()}@iit.portal`);
        icsContent.push(`DTSTAMP:${formatToiCalDate(new Date())}`);
        const dayStr = h.holidayDate;
        const nextDay = new Date(dayStr + 'T00:00:00');
        nextDay.setDate(nextDay.getDate() + 1);
        const dtstart = dayStr.replace(/-/g, '');
        const dtend = nextDay.toISOString().split('T')[0].replace(/-/g, '');
        icsContent.push(`DTSTART;VALUE=DATE:${dtstart}`);
        icsContent.push(`DTEND;VALUE=DATE:${dtend}`);
        icsContent.push(`SUMMARY:Holiday: ${h.title || 'Public Holiday'}`);
        icsContent.push(`DESCRIPTION:${h.description || ''}`);
        icsContent.push('END:VEVENT');
      });

      icsContent.push('END:VCALENDAR');
      const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'iit_academic_calendar.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showAlert('success', 'Calendar exported as iCal successfully!');
    } catch (err) {
      showAlert('error', 'Failed to export calendar.');
    }
  };

  // Upcoming items calculations
  const getUpcomingItemsList = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const combined = [
      ...holidays.map(h => ({
        ...h,
        isHoliday: true,
        date: new Date(h.holidayDate + 'T00:00:00')
      })),
      ...events.map(e => ({
        ...e,
        isHoliday: false,
        date: new Date(e.startDate)
      }))
    ];

    return combined
      .filter(item => {
        const itemDateStr = item.isHoliday 
          ? item.holidayDate 
          : item.startDate.split('T')[0];
        return itemDateStr >= todayStr;
      })
      .sort((a, b) => a.date - b.date)
      .slice(0, 5);
  };

  const upcomingItems = getUpcomingItemsList();
  const nextMilestone = upcomingItems[0] || null;

  const getDaysRemainingStr = (targetDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  // Search Results
  const searchResults = searchQuery.trim()
    ? [
        ...holidays.map(h => ({ ...h, isHoliday: true, dateStr: h.holidayDate })),
        ...events.map(e => ({ ...e, isHoliday: false, dateStr: e.startDate.split('T')[0] }))
      ].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSearchResultClick = (item) => {
    const itemDate = new Date(item.isHoliday ? item.holidayDate + 'T00:00:00' : item.startDate);
    setCurrentDate(itemDate);
    setSelectedDate(itemDate);
    setSearchQuery('');
    if (item.isHoliday) {
      handleOpenHolidayModal(item);
    } else {
      handleOpenEventModal(item);
    }
  };

  // Navigations based on view mode
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() - 7);
      setSelectedDate(nextDate);
      setCurrentDate(nextDate);
    } else {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() - 1);
      setSelectedDate(nextDate);
      setCurrentDate(nextDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() + 7);
      setSelectedDate(nextDate);
      setCurrentDate(nextDate);
    } else {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() + 1);
      setSelectedDate(nextDate);
      setCurrentDate(nextDate);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Formatting helper
  const formatDateStr = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Day filter utility
  const getItemsForDate = (dateStr) => {
    const dayHolidays = holidays.filter(h => h.holidayDate === dateStr);
    const dayEvents = events.filter(e => {
      const eventStart = e.startDate.split('T')[0];
      const eventEnd = e.endDate.split('T')[0];
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
    return { holidays: dayHolidays, events: dayEvents };
  };

  const getFilteredItemsForDate = (dateStr) => {
    const { holidays: dayHolidays, events: dayEvents } = getItemsForDate(dateStr);
    const filteredHols = filters.holidays ? dayHolidays : [];
    const filteredEvs = dayEvents.filter(e => {
      if (e.type === 'TASK' && !filters.tasks) return false;
      if (e.type === 'EVENT' && !filters.publicEvents) return false;
      if (e.type === 'ACADEMIC' && !filters.academicEvents) return false;
      return true;
    });
    return [
      ...filteredHols.map(h => ({ ...h, isHoliday: true })),
      ...filteredEvs
    ];
  };

  // Month View helper lists
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(month, year);
  const firstDayIndex = getFirstDayOfMonth(month, year);

  const prevMonthDays = [];
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const totalDaysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: totalDaysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false
    });
  }

  const currentMonthDays = [];
  for (let i = 1; i <= totalDays; i++) {
    currentMonthDays.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true
    });
  }

  const nextMonthDays = [];
  const totalCells = 42;
  const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthVal = month === 11 ? 0 : month + 1;
  const nextYearVal = month === 11 ? year + 1 : year;
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push({
      day: i,
      month: nextMonthVal,
      year: nextYearVal,
      isCurrentMonth: false
    });
  }

  const allCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Week View calculation
  const getDaysOfWeek = (focalDate) => {
    const currentDay = focalDate.getDay();
    const sunday = new Date(focalDate);
    sunday.setDate(focalDate.getDate() - currentDay);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDaysList = getDaysOfWeek(selectedDate);

  // Form Handlers
  const handleOpenEventModal = (editItem = null, startHourStr = null) => {
    const selectedDateStr = formatDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    if (editItem) {
      setEditingItem({ type: 'event', data: editItem });
      setEventForm({
        title: editItem.title,
        description: editItem.description || '',
        startDate: editItem.startDate.substring(0, 16),
        endDate: editItem.endDate.substring(0, 16),
        type: editItem.type,
        isPublic: editItem.isPublic
      });
    } else {
      setEditingItem(null);
      const hour = startHourStr ? startHourStr : '09:00';
      const [h, m] = hour.split(':');
      const endHour = `${String(parseInt(h) + 1).padStart(2, '0')}:${m}`;
      setEventForm({
        title: '',
        description: '',
        startDate: `${selectedDateStr}T${hour}`,
        endDate: `${selectedDateStr}T${endHour}`,
        type: user?.role === 'ROLE_STUDENT' ? 'TASK' : 'EVENT',
        isPublic: false
      });
    }
    setIsEventModalOpen(true);
  };

  const handleOpenHolidayModal = (editItem = null) => {
    const selectedDateStr = formatDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    if (editItem) {
      setEditingItem({ type: 'holiday', data: editItem });
      setHolidayForm({
        title: editItem.title,
        description: editItem.description || '',
        holidayDate: editItem.holidayDate,
        type: editItem.type
      });
    } else {
      setEditingItem(null);
      setHolidayForm({
        title: '',
        description: '',
        holidayDate: selectedDateStr,
        type: 'NATIONAL'
      });
    }
    setIsHolidayModalOpen(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/api/events/${editingItem.data.id}`, eventForm);
        showAlert('success', 'Event updated successfully.');
      } else {
        await api.post('/api/events', eventForm);
        showAlert('success', 'Event scheduled successfully.');
      }
      setIsEventModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to save calendar event.');
    }
  };

  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/api/holidays/${editingItem.data.id}`, holidayForm);
        showAlert('success', 'Holiday updated successfully.');
      } else {
        await api.post('/api/holidays', holidayForm);
        showAlert('success', 'Holiday registered successfully.');
      }
      setIsHolidayModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to save holiday details.');
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'holiday') {
        await api.delete(`/api/holidays/${id}`);
      } else {
        await api.delete(`/api/events/${id}`);
      }
      showAlert('success', `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
      fetchData();
    } catch (err) {
      showAlert('error', `Failed to delete ${type}.`);
    }
  };

  const getPillColor = (item) => {
    if (item.isHoliday) return 'bg-amber-100 text-amber-900 border-l-[3px] border-amber-500 hover:bg-amber-200';
    switch (item.type) {
      case 'ACADEMIC': return 'bg-emerald-100 text-emerald-950 border-l-[3px] border-emerald-600 hover:bg-emerald-200';
      case 'EVENT': return 'bg-rose-100 text-primary-950 border-l-[3px] border-primary-700 hover:bg-rose-200';
      case 'TASK': return 'bg-blue-100 text-blue-900 border-l-[3px] border-blue-500 hover:bg-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-l-[3px] border-slate-400 hover:bg-slate-200';
    }
  };

  const formatTime = (dateTimeStr) => {
    const timePart = dateTimeStr.split('T')[1];
    if (!timePart) return '';
    const [h, m] = timePart.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const canManageHolidays = hasRole(['ROLE_ADMIN', 'ROLE_STAFF']);
  const isStudent = user?.role === 'ROLE_STUDENT';

  // Hours list for daily view (8:00 to 20:00)
  const dayHours = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in relative">
      
      {/* Calendar Control Header */}
      <header className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Title & Nav Controls */}
        <div className="flex items-center gap-4">
          <div className="bg-primary-950/10 text-primary-900 p-2 rounded-xl border border-primary-950/5 flex items-center justify-center">
            <CalendarRange size={20} className="text-primary-700" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-academic text-slate-800 tracking-wide flex items-center gap-2">
              {viewMode === 'month' && `${months[month]} ${year}`}
              {viewMode === 'week' && `Week of ${weekDaysList[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              {viewMode === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
          </div>
        </div>

        {/* Action button triggers & view switches */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* AI Assistant Button & Dropdown Panel */}
          <div className="relative shrink-0 z-50">
            <button
              id="ai-assistant-toggle-btn"
              onClick={() => setAiChatOpen((prev) => !prev)}
              title="AI Calendar Assistant"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                aiChatOpen
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-500 text-white shadow-indigo-900/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                {aiChatOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
                )}
                <Sparkles size={14} className="relative" />
              </span>
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {/* ── Gemini AI Calendar Assistant ─────────────────────────────────── */}
            <CalendarAIChat
              events={events}
              holidays={holidays}
              fetchData={fetchData}
              user={user}
              hasRole={hasRole}
              isOpen={aiChatOpen}
              setIsOpen={setAiChatOpen}
            />
          </div>

          {/* Search Input bar */}
          <div className="relative w-full sm:w-48 md:w-56 shrink-0 z-35">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-outfit shadow-sm"
            />
            {/* Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchResultClick(item)}
                    type="button"
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 transition-colors flex flex-col gap-0.5 border-b last:border-0 border-slate-100"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-800 truncate">{item.title}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0 ${
                        item.isHoliday ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.isHoliday ? 'HOLIDAY' : item.type}
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-400">
                      {new Date(item.dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </button>
                ))}
                {searchResults.length === 0 && (
                  <div className="px-3.5 py-3 text-center text-xs text-slate-400 font-medium">
                    No matching schedules
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export iCal Button */}
          <button
            onClick={handleExportICS}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-sm transition-colors flex items-center justify-center active:scale-[0.98] text-xs font-semibold gap-1.5"
            title="Export Calendar to iCal (.ics)"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`p-2 rounded-xl border text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              showFiltersPanel ? 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-50' : 'bg-white border-slate-200'
            }`}
            title="Toggle Filters Panel"
          >
            <Filter size={14} />
            <span>Filters</span>
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-slate-50 text-slate-600 border-r border-slate-150 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleToday}
              className="px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors border-r border-slate-150 uppercase"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View Selection Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase transition-all ${
                  viewMode === mode 
                    ? 'bg-white text-primary-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Add buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEventModal()}
              className="p-2 bg-primary-800 hover:bg-primary-700 text-white rounded-xl shadow transition-colors flex items-center justify-center border border-amber-500/10 active:scale-[0.98]"
              title="Add Task / Event"
            >
              <Plus size={16} />
            </button>
            {canManageHolidays && (
              <button
                onClick={() => handleOpenHolidayModal()}
                className="p-2 bg-[#0B1320] hover:bg-[#152033] text-amber-400 rounded-xl shadow transition-colors flex items-center justify-center border border-amber-500/20 active:scale-[0.98]"
                title="Add Holiday"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

        </div>

      </header>

      {/* Main Body Layout */}
      <div className="flex-1 h-0 flex overflow-hidden">
        
        {/* Left Side Filters Bar */}
        {showFiltersPanel && (
          <aside className="w-56 border-r border-slate-100 p-5 bg-slate-50/20 space-y-5 shrink-0 hidden md:flex flex-col h-full overflow-y-auto animate-fade-in scrollbar-thin">
            
            {/* Countdown Widget */}
            {nextMilestone && (
              <div className="bg-gradient-to-br from-primary-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-amber-400 leading-none">
                    Next Up
                  </span>
                  <span className="text-[9px] font-semibold text-slate-300">
                    {getDaysRemainingStr(nextMilestone.isHoliday ? nextMilestone.holidayDate + 'T00:00:00' : nextMilestone.startDate)}
                  </span>
                </div>
                <h4 className="text-xs font-bold font-outfit text-slate-100 mt-1 line-clamp-1 leading-snug" title={nextMilestone.title}>
                  {nextMilestone.title}
                </h4>
                <p className="text-[10px] text-slate-450 font-medium leading-none">
                  {new Date(nextMilestone.isHoliday ? nextMilestone.holidayDate + 'T00:00:00' : nextMilestone.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Calendar Filters</h3>
              <div className="space-y-3.5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.holidays}
                    onChange={(e) => setFilters(prev => ({ ...prev, holidays: e.target.checked }))}
                    className="h-4.5 w-4.5 text-amber-500 focus:ring-amber-500 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Holidays
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.publicEvents}
                    onChange={(e) => setFilters(prev => ({ ...prev, publicEvents: e.target.checked }))}
                    className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary-700"></span>
                    Public Events
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.academicEvents}
                    onChange={(e) => setFilters(prev => ({ ...prev, academicEvents: e.target.checked }))}
                    className="h-4.5 w-4.5 text-emerald-600 focus:ring-emerald-500 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                    Academic Schedule
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.tasks}
                    onChange={(e) => setFilters(prev => ({ ...prev, tasks: e.target.checked }))}
                    className="h-4.5 w-4.5 text-blue-500 focus:ring-blue-500 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Personal Tasks
                  </span>
                </label>
              </div>
            </div>

            {/* Upcoming Events Panel */}
            <div className="pt-4 border-t border-slate-100 flex-1 flex flex-col min-h-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 shrink-0">
                <CalendarDays size={12} className="text-slate-400" />
                <span>Upcoming Milestones</span>
              </h3>
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 min-h-0 scrollbar-thin">
                {upcomingItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const itemDate = new Date(item.isHoliday ? item.holidayDate + 'T00:00:00' : item.startDate);
                      setCurrentDate(itemDate);
                      setSelectedDate(itemDate);
                      if (item.isHoliday) {
                        handleOpenHolidayModal(item);
                      } else {
                        handleOpenEventModal(item);
                      }
                    }}
                    type="button"
                    className="w-full text-left bg-white hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col gap-1 shadow-sm select-none"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold text-slate-800 truncate block max-w-[80%]" title={item.title}>
                        {item.title}
                      </span>
                      <span className={`text-[7px] font-bold px-1 py-0.5 rounded leading-none shrink-0 ${
                        item.isHoliday ? 'bg-amber-50 text-amber-700 border border-amber-200/50' : 'bg-blue-50 text-blue-700 border border-blue-200/50'
                      }`}>
                        {item.isHoliday ? 'HOLIDAY' : item.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-slate-400 font-medium">
                      <span>
                        {new Date(item.isHoliday ? item.holidayDate + 'T00:00:00' : item.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="font-semibold text-primary-700">
                        {getDaysRemainingStr(item.isHoliday ? item.holidayDate + 'T00:00:00' : item.startDate)}
                      </span>
                    </div>
                  </button>
                ))}
                {upcomingItems.length === 0 && (
                  <p className="text-[10px] text-slate-400 font-medium py-2 text-center">No upcoming schedules</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-2 shrink-0">
              <div className="flex items-center gap-1.5 font-medium">
                <Info size={12} className="text-slate-400" />
                <span>Quick View Guide</span>
              </div>
              <p className="leading-relaxed text-[10px]">Click any cell or hour slot to view, add, or edit scheduled events.</p>
            </div>
          </aside>
        )}

        {/* Content Area */}
        <div className="flex-1 h-full overflow-hidden relative">
          
          {/* Loader Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/60 z-30 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW MODE: MONTH */}
          {/* ============================================================== */}
          {viewMode === 'month' && (
            <div className="flex flex-col h-full overflow-hidden p-4 bg-slate-50/20">
              {/* Weekday Titles */}
              <div className="grid grid-cols-7 border-t border-l border-r border-slate-200 bg-slate-100/70 rounded-t-2xl overflow-hidden divide-x divide-slate-205">
                {weekdays.map(d => (
                  <div key={d} className="text-xs font-bold text-slate-500 uppercase py-2 text-center select-none">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0 border-t border-l border-slate-200 bg-white rounded-b-2xl overflow-hidden shadow-sm">
                {allCells.map((cell, index) => {
                  const cellDateStr = formatDateStr(cell.year, cell.month, cell.day);
                  const isSelected = selectedDate.getDate() === cell.day && 
                                     selectedDate.getMonth() === cell.month && 
                                     selectedDate.getFullYear() === cell.year;
                  const isToday = new Date().getDate() === cell.day && 
                                  new Date().getMonth() === cell.month && 
                                  new Date().getFullYear() === cell.year;
                  
                  const cellItems = getFilteredItemsForDate(cellDateStr);

                  const getDayLabel = (c) => {
                    if (c.day === 1) {
                      return `${months[c.month].substring(0, 3)} ${c.day}`;
                    }
                    return c.day;
                  };

                  return (
                    <div
                      key={`${cellDateStr}-${index}`}
                      onClick={() => {
                        setSelectedDate(new Date(cell.year, cell.month, cell.day));
                      }}
                      className={`flex flex-col p-1.5 h-full min-h-0 overflow-hidden transition-all group relative cursor-pointer border-r border-b border-slate-200 ${
                        cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/40 text-slate-400'
                      } ${
                        isSelected ? 'bg-primary-50/10' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      {/* Cell Day Label */}
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center ${
                          isToday 
                            ? 'bg-primary-800 text-white shadow-sm font-bold font-outfit'
                            : isSelected ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-300' : 'text-slate-500 font-outfit'
                        }`}>
                          {getDayLabel(cell)}
                        </span>
                        
                        {/* Inline details toggle for mobile/view */}
                        {cellItems.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(new Date(cell.year, cell.month, cell.day));
                              setIsDetailsModalOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-all"
                            title="Expand List"
                          >
                            <Eye size={11} />
                          </button>
                        )}
                      </div>

                      {/* Display items inline */}
                      <div className="flex-1 space-y-1 overflow-y-auto pr-0.5 mt-0.5 scrollbar-thin">
                        {cellItems.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(new Date(cell.year, cell.month, cell.day));
                              if (item.isHoliday) {
                                handleOpenHolidayModal(item);
                              } else {
                                handleOpenEventModal(item);
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate leading-normal transition-all shadow-sm border border-transparent select-none cursor-pointer ${getPillColor(item)}`}
                            title={`${item.title} ${!item.isHoliday ? `(${formatTime(item.startDate)})` : ''}`}
                          >
                            {!item.isHoliday && <span className="font-mono opacity-80 mr-0.5 font-medium">{formatTime(item.startDate).split(' ')[0]}</span>}
                            <span>{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW MODE: WEEK */}
          {/* ============================================================== */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-7 h-full divide-x divide-slate-150">
              {weekDaysList.map((day, idx) => {
                const dayDateStr = formatDateStr(day.getFullYear(), day.getMonth(), day.getDate());
                const dayItems = getFilteredItemsForDate(dayDateStr);
                const isToday = new Date().toDateString() === day.toDateString();
                const isSelected = selectedDate.toDateString() === day.toDateString();

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(new Date(day))}
                    className={`flex flex-col h-full overflow-hidden transition-all ${
                      isSelected ? 'bg-primary-50/10' : isToday ? 'bg-amber-50/5' : 'bg-white'
                    }`}
                  >
                    
                    {/* Week Column Header */}
                    <div className="px-3 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center select-none text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{weekdays[day.getDay()]}</span>
                      <span className={`text-base font-bold h-7 w-7 mt-1.5 flex items-center justify-center rounded-full ${
                        isToday 
                          ? 'bg-amber-500 text-white shadow-sm'
                          : isSelected ? 'bg-primary-800 text-white' : 'text-slate-800'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>

                    {/* Column Items Stack */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-white/40">
                      
                      {/* Column hover trigger to schedule */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(new Date(day));
                          handleOpenEventModal();
                        }}
                        className="w-full py-2 hover:bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all opacity-0 hover:opacity-100"
                      >
                        <Plus size={10} />
                        <span>Schedule Item</span>
                      </button>

                      {dayItems.map((item, index) => (
                        <div
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(new Date(day));
                            if (item.isHoliday) {
                              handleOpenHolidayModal(item);
                            } else {
                              handleOpenEventModal(item);
                            }
                          }}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all shadow-sm group hover:scale-[1.01] ${getPillColor(item)}`}
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-current rounded bg-white/50">
                            {item.isHoliday ? `${item.type} Holiday` : item.type}
                          </span>
                          <h4 className="font-bold text-xs mt-2 text-slate-900 leading-tight font-outfit truncate">{item.title}</h4>
                          
                          {!item.isHoliday && (
                            <div className="flex items-center gap-1 mt-2 text-[9px] font-semibold opacity-75">
                              <Clock size={10} />
                              <span>{formatTime(item.startDate)} - {formatTime(item.endDate)}</span>
                            </div>
                          )}

                          {/* Quick Admin Actions */}
                          <div className="mt-2.5 pt-2 border-t border-black/5 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(new Date(day));
                                if (item.isHoliday) {
                                  handleDeleteItem('holiday', item.id);
                                } else {
                                  handleDeleteItem('event', item.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-100/60 rounded text-rose-700"
                              title="Delete Item"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {dayItems.length === 0 && (
                        <div className="py-8 text-center text-slate-350 text-[10px] font-medium border border-transparent">
                          No Events scheduled
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW MODE: DAY */}
          {/* ============================================================== */}
          {viewMode === 'day' && (
            <div className="flex flex-col h-full bg-white overflow-hidden">
              
              {/* Day Head details */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between select-none">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Timeline schedule for this day
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {getFilteredItemsForDate(formatDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())).length} Active schedules
                </span>
              </div>

              {/* Day Timeline Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {dayHours.map((hour) => {
                  const dayDateStr = formatDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                  const dayItems = getFilteredItemsForDate(dayDateStr);
                  
                  // Filter events active during this hour
                  const hourItems = dayItems.filter(item => {
                    if (item.isHoliday) return true; // Holidays span all hours
                    const itemStartHour = parseInt(item.startDate.split('T')[1].split(':')[0]);
                    const itemEndHour = parseInt(item.endDate.split('T')[1].split(':')[0]);
                    const filterHour = parseInt(hour.split(':')[0]);
                    return filterHour >= itemStartHour && filterHour < itemEndHour;
                  });

                  return (
                    <div key={hour} className="flex gap-4 border-b border-slate-100/80 py-3 group min-h-[4.5rem]">
                      
                      {/* Hour column marker */}
                      <div className="w-16 text-right text-xs font-bold text-slate-400 select-none pt-0.5">
                        {parseInt(hour.split(':')[0]) % 12 || 12}:00 {parseInt(hour.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                      </div>

                      {/* Hour content cells */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        
                        {/* Direct creation trigger block inside hour */}
                        {hourItems.length === 0 && (
                          <button
                            onClick={() => handleOpenEventModal(null, hour)}
                            className="h-full py-2 hover:bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100 text-left px-4"
                          >
                            <Plus size={12} />
                            <span>Schedule Event at {parseInt(hour.split(':')[0]) % 12 || 12}:00 {parseInt(hour.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                          </button>
                        )}

                        {hourItems.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.isHoliday) {
                                handleOpenHolidayModal(item);
                              } else {
                                handleOpenEventModal(item);
                              }
                            }}
                            className={`p-3 rounded-2xl border text-left cursor-pointer transition-all shadow-sm flex flex-col justify-between hover:scale-[1.005] ${getPillColor(item)}`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-current rounded bg-white/50">
                                  {item.isHoliday ? 'HOLIDAY' : item.type}
                                </span>
                                {!item.isHoliday && !item.isPublic && (
                                  <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-350">
                                    PRIVATE
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-xs mt-2 text-slate-900 leading-snug font-outfit">{item.title}</h4>
                              <p className="text-[10px] opacity-80 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                            </div>
                            
                            {!item.isHoliday && (
                              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-black/5 text-[9px] font-semibold opacity-75 justify-between">
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>{formatTime(item.startDate)} - {formatTime(item.endDate)}</span>
                                </span>
                                <span>Owner: <b>{item.createdByUsername}</b></span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ============================================================== */}
      {/* EXPANDED DETAILS POPUP LIST MODAL (Especially for Month View Mobile/Toggle) */}
      {/* ============================================================== */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-academic text-base md:text-lg">
                Schedule List: {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {getFilteredItemsForDate(formatDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    if (item.isHoliday) {
                      handleOpenHolidayModal(item);
                    } else {
                      handleOpenEventModal(item);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${getPillColor(item)}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-current uppercase bg-white/40">
                      {item.isHoliday ? 'Holiday' : item.type}
                    </span>
                    {!item.isHoliday && !item.isPublic && (
                      <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded">PRIVATE</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 font-outfit mt-1 leading-snug">{item.title}</h4>
                  <p className="text-xs opacity-90 leading-relaxed mt-1">{item.description}</p>
                  
                  {!item.isHoliday && (
                    <div className="flex items-center justify-between text-[9px] font-semibold opacity-75 mt-3 pt-2 border-t border-black/5">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>{formatTime(item.startDate)} - {formatTime(item.endDate)}</span>
                      </span>
                      <span>Owner: <b>{item.createdByUsername}</b></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EVENT & TASK SCHEDULER MODAL */}
      {/* ============================================================== */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-academic text-lg">
                {editingItem ? 'Edit Event / Task' : 'Schedule Event / Task'}
              </h3>
              <button 
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-outfit"
                  placeholder="e.g. Research Project Presentation"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-outfit"
                  placeholder="Details about locations, preparation details, etc."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-outfit"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-outfit"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Type</label>
                  {isStudent ? (
                    <select
                      value="TASK"
                      disabled
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-550"
                    >
                      <option value="TASK">Personal Task</option>
                    </select>
                  ) : (
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="EVENT">Public Campus Event</option>
                      <option value="ACADEMIC">Academic Milestone</option>
                      <option value="TASK">Personal Task</option>
                    </select>
                  )}
                </div>

                {!isStudent && (
                  <div className="flex items-center pt-6 pl-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.isPublic}
                        onChange={(e) => setEventForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-650 uppercase">Make visible to everyone</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEventModalOpen(false);
                        handleDeleteItem('event', editingItem.data.id);
                      }}
                      className="px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-350 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-800 hover:bg-primary-750 text-white rounded-xl text-sm font-semibold transition-colors shadow-md border border-amber-500/10 font-academic"
                  >
                    {editingItem ? 'Save Changes' : 'Schedule Event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* HOLIDAY CONFIGURATION MODAL (Admin/Staff only) */}
      {/* ============================================================== */}
      {isHolidayModalOpen && canManageHolidays && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-academic text-lg">
                {editingItem ? 'Edit Holiday Details' : 'Register Public Holiday'}
              </h3>
              <button 
                onClick={() => setIsHolidayModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleHolidaySubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Holiday Name</label>
                <input
                  type="text"
                  value={holidayForm.title}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-outfit"
                  placeholder="e.g. Winter Break"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description / Remarks</label>
                <textarea
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-outfit"
                  placeholder="Detailed notes regarding closures or schedules."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={holidayForm.holidayDate}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, holidayDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-outfit"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Holiday Class</label>
                  <select
                    value={holidayForm.type}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="NATIONAL">National Public Holiday</option>
                    <option value="REGIONAL">Restricted/Regional Holiday</option>
                    <option value="ACADEMIC">Academic Institutional Recess</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsHolidayModalOpen(false);
                        handleDeleteItem('holiday', editingItem.data.id);
                      }}
                      className="px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-350 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsHolidayModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-800 hover:bg-primary-750 text-white rounded-xl text-sm font-semibold transition-colors shadow-md border border-amber-500/10 font-academic"
                  >
                    {editingItem ? 'Save Changes' : 'Register Holiday'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CalendarPage;
