import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [actionFilter, setActionFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [error, setError] = useState('');

  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'USER_LOGIN', label: 'User Login' },
    { value: 'REGISTER_USER', label: 'User Registration' },
    { value: 'UPDATE_PROFILE', label: 'Profile Update' },
    { value: 'DELETE_USER', label: 'User Deletion' },
    { value: 'CHANGE_PASSWORD', label: 'Password Change' },
    { value: 'CREATE_NOTICE', label: 'Notice Created' },
    { value: 'SUBMIT_COMPLAINT', label: 'Complaint Filed' },
    { value: 'UPDATE_STUDENT', label: 'Student Update' },
    { value: 'DELETE_STUDENT', label: 'Student Deletion' },
    { value: 'UPDATE_FACULTY', label: 'Faculty Update' },
    { value: 'DELETE_FACULTY', label: 'Faculty Deletion' }
  ];

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/logs', {
        params: {
          action: actionFilter,
          username: userSearch,
          page: page,
          size: size
        }
      });
      setLogs(res.data.content);
      setTotalLogs(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError('Failed to fetch activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, userSearch]);

  const getActionBadgeColor = (action) => {
    if (action.includes('DELETE')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (action.includes('REGISTER') || action.includes('CREATE') || action.includes('SUBMIT')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('LOGIN')) {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    if (action.includes('UPDATE')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Error Header */}
      {error && (
        <div className="p-4 rounded-xl flex items-start gap-3 border bg-rose-50 border-rose-200 text-rose-800 animate-fade-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
        {/* Filters */}
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by username..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[200px]"
          >
            {actionTypes.map(act => (
              <option key={act.value} value={act.value}>{act.label}</option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchLogs}
          className="shrink-0 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors border border-slate-200 flex items-center gap-2 active:scale-95"
          title="Refresh Logs"
        >
          <RefreshCw size={16} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4 w-48">Timestamp</th>
                <th className="px-6 py-4 w-44">User</th>
                <th className="px-6 py-4 w-48">Action Type</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 w-36">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {log.username === 'SYSTEM' ? (
                        <span className="text-slate-400 italic font-normal">SYSTEM</span>
                      ) : (
                        log.username
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{log.details}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{log.ipAddress}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No activity logs found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50">
            <span>Showing {logs.length} of {totalLogs} log entries</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
