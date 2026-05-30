import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors duration-150 focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm">
                <User size={16} />
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{user?.username}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 transform origin-top-right transition-all duration-200 scale-100 opacity-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
                <p className="text-xs text-slate-500 font-medium">{getRoleName(user?.role)}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium text-left"
                >
                  <User size={16} className="text-slate-400" />
                  My Profile
                </button>
              </div>

              <div className="border-t border-slate-100 my-1"></div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors font-semibold text-left"
                >
                  <LogOut size={16} className="text-rose-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
