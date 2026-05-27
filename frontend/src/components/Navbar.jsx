import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Calendar } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ROLE_STAFF':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ROLE_FACULTY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ROLE_STUDENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleName = (role) => {
    return role ? role.replace('ROLE_', '') : 'USER';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed right-0 top-0 z-10 w-[calc(100%-16rem)] shadow-sm">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-outfit">{title}</h2>
      </div>

      {/* Right side options */}
      <div className="flex items-center gap-6">
        {/* Date */}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={16} />
          <span>{formattedDate}</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>

        {/* User profile metadata */}
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadge(user?.role)}`}>
            {getRoleName(user?.role)}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <User size={16} />
            </div>
            <span className="text-sm font-semibold text-slate-700">{user?.username}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
