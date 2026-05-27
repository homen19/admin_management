import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarClock, 
  Megaphone, 
  MessageSquareWarning, 
  BarChart3, 
  LogOut,
  UserCog,
  ClipboardList,
  User,
  Hotel,
  CalendarDays
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/students', label: 'Students', icon: Users, roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
    { to: '/faculty', label: 'Faculty', icon: GraduationCap, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY'] },
    { to: '/leaves', label: 'Leave Requests', icon: CalendarClock, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/notices', label: 'Notice Board', icon: Megaphone, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/complaints', label: 'Complaints / Tickets', icon: MessageSquareWarning, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT'] },
    {to: '/hostels', label: 'Hostel Management', icon: Hotel, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT']},
    {to: '/calendar', label: 'Academic Calendar', icon: CalendarDays, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT']},
    {to: '/users', label: 'User Management', icon: UserCog, roles: ['ROLE_ADMIN']},
    { to: '/logs', label: 'Activity Logs', icon: ClipboardList, roles: ['ROLE_ADMIN'] },
    { to: '/profile', label: 'My Profile', icon: User, roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT'] },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['ROLE_ADMIN', 'ROLE_STAFF'] },
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
                `flex items-center gap-3 py-3 pr-4 rounded-r-xl transition-all duration-150 text-sm font-medium ${
                  isActive 
                    ? 'bg-primary-900/60 text-amber-400 border-l-4 border-amber-500 pl-3 font-semibold shadow-inner shadow-black/20' 
                    : 'text-slate-400 hover:bg-[#152033]/60 hover:text-slate-100 border-l-4 border-transparent pl-3'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Info */}
      <div className="p-4 border-t border-slate-800/40 bg-slate-950/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-slate-700/60 flex items-center justify-center font-bold text-slate-200 border border-slate-600/30">
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role?.replace('ROLE_', '')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/30 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
