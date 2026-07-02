import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarClock,
  Megaphone,
  MessageSquareWarning,
  BarChart3,
  UserCog,
  ClipboardList,
  User,
  Hotel,
  CalendarDays,
  Fingerprint,
  BookOpen,
  Layers,
  ListTodo,
  BookMarked,
  Landmark,
  MessageCircle,
  Bus,
  Package,
  KanbanSquare
} from 'lucide-react';

const Sidebar = () => {
  const { hasRole, user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      if (!user) return;
      const res = await api.get('/api/leaves/pending-count');
      console.log("[DEBUG] Sidebar fetched pending count:", res.data);
      setPendingCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch pending leave count:", err);
    }
  };

  useEffect(() => {
    fetchPendingCount();

    // Poll every 10 seconds to catch new requests coming from others
    const interval = setInterval(fetchPendingCount, 10000);

    // Listen for custom event when leave requests are applied/approved locally
    const handleStatusChange = () => {
      fetchPendingCount();
    };
    document.addEventListener('leaveStatusChanged', handleStatusChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('leaveStatusChanged', handleStatusChange);
    };
  }, [user]);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/students', label: 'Student Admission', icon: Users, roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    { to: '/academics', label: 'Academics Structure', icon: Layers, roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    { to: '/faculty', label: 'Faculty', icon: GraduationCap, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY'] },
    { to: '/my-subjects', label: 'My Subjects', icon: BookMarked, roles: ['ROLE_FACULTY'] },
    { to: '/leaves', label: 'Leave Requests', icon: CalendarClock, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/notices', label: 'Notice Board', icon: Megaphone, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/complaints', label: 'Complaints / Tickets', icon: MessageSquareWarning, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT'] },
    { to: '/hostels', label: 'Hostel Management', icon: Hotel, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT'] },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/attendance', label: 'Attendance', icon: Fingerprint, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY'] },
    { to: '/class-attendance', label: 'Class Attendance', icon: ListTodo, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/library', label: 'Library Management', icon: BookOpen, roles: ['ROLE_ADMIN', 'ROLE_LIBRARIAN', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/users', label: 'User Management', icon: UserCog, roles: ['ROLE_ADMIN'] },
    { to: '/tasks', label: 'Task Board', icon: KanbanSquare, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_LIBRARIAN', 'ROLE_FINANCE', 'ROLE_INVENTORY_ADMIN', 'ROLE_DRIVER'] },
    { to: '/logs', label: 'Activity Logs', icon: ClipboardList, roles: ['ROLE_ADMIN'] },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    { to: '/finance', label: 'Finance', icon: Landmark, roles: ['ROLE_ADMIN', 'ROLE_FINANCE'] },
    { to: '/inventory', label: 'Inventory', icon: Package, roles: ['ROLE_ADMIN', 'ROLE_INVENTORY_ADMIN'] },

    { to: '/transport', label: 'Transport & Fleet', icon: Bus, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT'] },
  ];

  return (
    <aside className="w-64 bg-[#0B1320] text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-xl border-r border-slate-800/40">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-800/40 flex items-center gap-3">
        <div className="bg-primary-900 text-amber-400 p-2 rounded-lg shadow-md font-bold text-lg font-academic border border-amber-500/20">
          IIT
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-tight text-white font-academic tracking-wide">IIT Portal</h1>
          <span className="text-xs text-slate-400">Office Management</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto pr-2">
        {links.map((link) => {
          if (!hasRole(link.roles)) return null;
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 pr-4 rounded-r-xl transition-all duration-150 text-sm font-medium ${isActive
                  ? 'bg-primary-900/60 text-amber-400 border-l-4 border-amber-500 pl-3 font-semibold shadow-inner shadow-black/20'
                  : 'text-slate-400 hover:bg-[#152033]/60 hover:text-slate-100 border-l-4 border-transparent pl-3'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{link.label}</span>
              {link.to === '/leaves' && pendingCount > 0 && (
                <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border border-rose-500 shadow-sm animate-pulse mr-1">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
