import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  CalendarClock,
  MessageSquareWarning,
  Bell,
  Clock,
  FileText,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  FileCheck,
  Coins,
  BookOpen,
  Home,
  Package
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Department student data for Admin Chart
  const [deptData, setDeptData] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch Stats & Activity Logs
      if (hasRole('ROLE_ADMIN')) {
        const statsRes = await api.get('/api/dashboard/stats');
        setStats(statsRes.data);

        // Fetch departmental distribution for chart
        const reportRes = await api.get('/api/reports/department-students');
        const formatted = reportRes.data.map(item => ({
          name: item.department.split(' ').map(w => w[0]).join(''), // Abbreviate department
          fullName: item.department,
          students: item.student_count || item.count
        }));
        setDeptData(formatted);
      } else if (hasRole('ROLE_STAFF')) {
        // Staff view needs: pending leaves, open complaints
        const leavesRes = await api.get('/api/leaves?status=PENDING&size=5');
        const complaintsRes = await api.get('/api/complaints?status=OPEN&size=5');
        const statsRes = await api.get('/api/dashboard/stats');

        setStats({
          pendingLeaves: statsRes.data.pendingLeaves,
          openComplaints: statsRes.data.openComplaints,
          pendingLeavesList: leavesRes.data.content,
          openComplaintsList: complaintsRes.data.content
        });
      } else if (hasRole('ROLE_FACULTY')) {
        // Faculty Stats & leaves
        const leavesRes = await api.get('/api/leaves?size=5');
        const facultyProfileRes = await api.get('/api/faculty/profile');
        const deptStudentsRes = await api.get(`/api/students?department=${encodeURIComponent(facultyProfileRes.data.department)}`);

        setStats({
          deptStudents: deptStudentsRes.data.totalElements,
          pendingLeaves: leavesRes.data.content.filter(l => l.status === 'PENDING').length,
          myDept: facultyProfileRes.data.department,
          myLeavesList: leavesRes.data.content
        });
      } else if (hasRole('ROLE_STUDENT')) {
        // Student Stats, leaves & complaints
        const leavesRes = await api.get('/api/leaves?size=5');
        const complaintsRes = await api.get('/api/complaints?size=5');

        setStats({
          myLeaves: leavesRes.data.totalElements,
          myComplaints: complaintsRes.data.totalElements,
          myLeavesList: leavesRes.data.content,
          myComplaintsList: complaintsRes.data.content
        });
      }

      // 2. Fetch Active Notices
      const noticesRes = await api.get('/api/notices?size=5');
      setNotices(noticesRes.data.content);

    } catch (err) {
      setError('Error fetching dashboard statistics. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#991b1b', '#0B1320', '#d97706', '#059669', '#475569', '#701a75'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
      case 'OPEN':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'APPROVED':
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-800 border border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-4 max-w-2xl mx-auto mt-10">
        <AlertCircle className="shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-lg">Failed to Load Dashboard</h3>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B1320] via-[#3a1010] to-[#5f1a1a] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-primary-900/40">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent)] pointer-events-none"></div>
        <h2 className="text-3xl font-bold font-academic text-amber-400 tracking-wide">Welcome back, {user?.username}!</h2>
        <p className="text-slate-300 text-sm mt-1 font-outfit">Here is a quick overview of the IIT Administrative Office operations today.</p>
      </div>

      {/* ============================================================== */}
      {/* 1. ADMIN DASHBOARD VIEW */}
      {/* ============================================================== */}
      {hasRole('ROLE_ADMIN') && stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2 font-outfit">{stats.totalStudents}</h3>
              </div>
              <div className="h-12 w-12 bg-primary-50 text-primary-700 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Faculty</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2 font-outfit">{stats.totalFaculty}</h3>
              </div>
              <div className="h-12 w-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Leaves</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2 font-outfit">{stats.pendingLeaves}</h3>
              </div>
              <div className="h-12 w-12 bg-[#0B1320]/5 text-[#0B1320] rounded-xl flex items-center justify-center">
                <CalendarClock size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Tickets</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2 font-outfit">{stats.openComplaints}</h3>
              </div>
              <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <MessageSquareWarning size={24} />
              </div>
            </div>
          </div>

          {/* Operational Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {/* Financial Overview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Finance Dues</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-2 font-outfit">
                  ${((stats.totalIncome || 0) - (stats.totalExpenses || 0)).toLocaleString()}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Income: <span className="text-emerald-600 font-semibold">${(stats.totalIncome || 0).toLocaleString()}</span> | Expenses: <span className="text-rose-500 font-semibold">${(stats.totalExpenses || 0).toLocaleString()}</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
                <Coins size={24} />
              </div>
            </div>

            {/* Library Overview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Library Circulation</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-2 font-outfit">
                  {stats.issuedBooks || 0} / {stats.totalBooks || 0} <span className="text-xs font-normal text-slate-400">issued</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Overdue Books: <span className="text-rose-600 font-semibold">{stats.overdueBooks || 0}</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
            </div>

            {/* Hostel Occupancy */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hostel Occupancy</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-2 font-outfit">
                  {((stats.occupiedBeds / (stats.totalBeds || 1)) * 100).toFixed(0)}% <span className="text-xs font-normal text-slate-400">filled</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Beds Occupied: <span className="text-indigo-600 font-semibold">{stats.occupiedBeds || 0}</span> / {stats.totalBeds || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center">
                <Home size={24} />
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Alerts</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-2 font-outfit">
                  {stats.lowStockItems || 0} <span className="text-xs font-normal text-slate-400">low stock</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Items requiring reorder (<span className="text-amber-600 font-semibold">&lt; 10 units</span>)
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
                <Package size={24} />
              </div>
            </div>
          </div>

          {/* Charts & System Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col">
              <h3 className="font-bold text-slate-800 mb-4 font-outfit text-base">Student Distribution</h3>
              <div className="h-64 w-full flex-1">
                {deptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="students"
                      >
                        {deptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
                )}
              </div>
              {/* Custom Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                {deptData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 truncate">
                    <span className="h-3 w-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="truncate" title={entry.fullName}>{entry.name} ({entry.students})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                  <Clock size={18} className="text-slate-500" />
                  <span>System Activity Logs</span>
                </h3>
                <Link to="/logs" className="text-xs text-primary-600 hover:text-primary-500 font-semibold flex items-center gap-1">
                  <span>View All Logs</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto max-h-80 space-y-4 pr-1">
                {stats.recentLogs && stats.recentLogs.length > 0 ? (
                  stats.recentLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                      <div className="bg-slate-100 text-slate-600 p-2 rounded-lg text-xs font-bold uppercase shrink-0">
                        {log.action.split('_')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{log.details}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          <span>User: <b>{log.username}</b></span>
                          <span>IP: {log.ipAddress}</span>
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm py-10">No recent activity logs.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 2. STAFF DASHBOARD VIEW */}
      {/* ============================================================== */}
      {hasRole('ROLE_STAFF') && stats && (
        <>
          {/* Card Summary counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leaves Awaiting Action</p>
                <h3 className="text-3xl font-bold text-amber-600 mt-2 font-outfit">{stats.pendingLeaves}</h3>
              </div>
              <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                <CalendarClock size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit">Open Help Tickets</p>
                <h3 className="text-3xl font-bold text-rose-600 mt-2 font-outfit">{stats.openComplaints}</h3>
              </div>
              <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                <MessageSquareWarning size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit">Active Notices</p>
                <h3 className="text-3xl font-bold text-primary-600 mt-2 font-outfit">{notices.length}</h3>
              </div>
              <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center border border-primary-100">
                <Bell size={24} />
              </div>
            </div>
          </div>

          {/* Action Queues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Leaves Queue */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                  <CalendarClock size={18} className="text-amber-500" />
                  <span>Leaves Requiring Approval</span>
                </h3>
                <Link to="/leaves" className="text-xs text-primary-600 hover:text-primary-500 font-semibold flex items-center gap-1">
                  <span>Open Leaves Panel</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="overflow-x-auto flex-1">
                {stats.pendingLeavesList && stats.pendingLeavesList.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="px-3 py-2">Applicant</th>
                        <th className="px-3 py-2">Dates</th>
                        <th className="px-3 py-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {stats.pendingLeavesList.slice(0, 4).map((leave) => (
                        <tr key={leave.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 font-semibold">{leave.username}</td>
                          <td className="px-3 py-3 font-mono text-[10px] text-slate-500">
                            {leave.startDate} to {leave.endDate}
                          </td>
                          <td className="px-3 py-3 truncate max-w-[150px]" title={leave.reason}>{leave.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-slate-400 py-10">No pending leave applications.</div>
                )}
              </div>
            </div>

            {/* Open Complaints Queue */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                  <MessageSquareWarning size={18} className="text-rose-500" />
                  <span>Open Support Tickets</span>
                </h3>
                <Link to="/complaints" className="text-xs text-primary-600 hover:text-primary-500 font-semibold flex items-center gap-1">
                  <span>Open Complaints Panel</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="overflow-x-auto flex-1">
                {stats.openComplaintsList && stats.openComplaintsList.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="px-3 py-2">Student</th>
                        <th className="px-3 py-2">Ticket Title</th>
                        <th className="px-3 py-2">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {stats.openComplaintsList.slice(0, 4).map((comp) => (
                        <tr key={comp.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 font-semibold">{comp.studentName}</td>
                          <td className="px-3 py-3 truncate max-w-[150px] font-medium text-slate-800" title={comp.title}>{comp.title}</td>
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {comp.category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-slate-400 py-10">No open complaints found.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 3. FACULTY DASHBOARD VIEW */}
      {/* ============================================================== */}
      {hasRole('ROLE_FACULTY') && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dept Students ({stats.myDept?.split(' ').map(w => w[0]).join('')})</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2 font-outfit">{stats.deptStudents}</h3>
              </div>
              <div className="h-12 w-12 bg-[#0B1320]/5 text-[#0B1320] rounded-xl flex items-center justify-center border border-[#0B1320]/10">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Active Applications</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-2 font-outfit">{stats.pendingLeaves}</h3>
              </div>
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                <CalendarClock size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notices Posted</p>
                <h3 className="text-3xl font-bold text-primary-600 mt-2 font-outfit">{notices.length}</h3>
              </div>
              <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center border border-primary-100">
                <Bell size={24} />
              </div>
            </div>
          </div>

          {/* Quick Leaves list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                <CalendarClock size={18} className="text-slate-500" />
                <span>My Leave Applications Log</span>
              </h3>
              <Link to="/leaves" className="text-xs text-primary-600 hover:text-primary-500 font-semibold flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                <PlusCircle size={14} />
                <span>Apply for Leave</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              {stats.myLeavesList && stats.myLeavesList.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Remarks / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {stats.myLeavesList.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3.5 font-semibold text-slate-800 font-mono text-[11px] whitespace-nowrap">
                          {leave.startDate} to {leave.endDate}
                        </td>
                        <td className="px-4 py-3.5 max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 italic max-w-[200px] truncate" title={leave.remarks || 'None'}>
                          {leave.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-slate-400 py-10">You have not submitted any leave applications yet.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 4. STUDENT DASHBOARD VIEW */}
      {/* ============================================================== */}
      {hasRole('ROLE_STUDENT') && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applied Leaves</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2 font-outfit">{stats.myLeaves}</h3>
              </div>
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                <CalendarClock size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filed Complaints</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2 font-outfit">{stats.myComplaints}</h3>
              </div>
              <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                <MessageSquareWarning size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Notices</p>
                <h3 className="text-3xl font-bold text-primary-600 mt-2 font-outfit">{notices.length}</h3>
              </div>
              <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center border border-primary-100">
                <Bell size={24} />
              </div>
            </div>
          </div>

          {/* Student Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Leaves Tracker */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                  <FileCheck size={18} className="text-emerald-500" />
                  <span>My Leaves Status</span>
                </h3>
                <Link to="/leaves" className="text-xs text-primary-600 hover:text-primary-500 font-semibold flex items-center gap-1">
                  <span>Apply / History</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="overflow-x-auto flex-1">
                {stats.myLeavesList && stats.myLeavesList.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="px-3 py-2">Dates</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {stats.myLeavesList.slice(0, 4).map((leave) => (
                        <tr key={leave.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 font-semibold font-mono text-[10px] text-slate-600 whitespace-nowrap">
                            {leave.startDate} to {leave.endDate}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(leave.status)}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 truncate max-w-[120px] text-slate-500 italic" title={leave.remarks || 'None'}>
                            {leave.remarks || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-slate-400 py-10">No leaves submitted yet.</div>
                )}
              </div>
            </div>

            {/* My Complaints Tracker */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                  <HelpCircle size={18} className="text-rose-500" />
                  <span>My Support Tickets</span>
                </h3>
                <Link to="/complaints" className="text-xs text-primary-600 hover:text-primary-500 font-semibold flex items-center gap-1">
                  <span>File a Ticket</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="overflow-x-auto flex-1">
                {stats.myComplaintsList && stats.myComplaintsList.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="px-3 py-2">Complaint</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {stats.myComplaintsList.slice(0, 4).map((comp) => (
                        <tr key={comp.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 font-semibold text-slate-800 truncate max-w-[150px]" title={comp.title}>{comp.title}</td>
                          <td className="px-3 py-3 text-slate-500 font-medium">{comp.category}</td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(comp.status)}`}>
                              {comp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-slate-400 py-10">No support tickets created yet.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* NOTICE BOARD SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="font-bold text-slate-800 mb-4 font-outfit text-base flex items-center gap-2">
          <Bell size={18} className="text-slate-500" />
          <span>Recent Official Notices</span>
        </h3>
        <div className="space-y-4">
          {notices.length > 0 ? (
            notices.map((notice) => (
              <div
                key={notice.id}
                className={`p-4 rounded-xl border transition-all ${notice.isPinned
                    ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-800 text-sm md:text-base">{notice.title}</h4>
                      {notice.isPinned && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          PINNED
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs md:text-sm mt-1 whitespace-pre-line">{notice.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span>Posted by: <b>{notice.createdByName}</b></span>
                      <span>Date: {new Date(notice.createdAt).toLocaleDateString()}</span>
                      {notice.expiryDate && (
                        <span className="text-rose-500">Expires: {new Date(notice.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {notice.attachmentPath && (
                    <a
                      href={`http://localhost:8082${notice.attachmentPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                    >
                      <FileText size={14} />
                      <span>PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-400 text-sm py-10">No notices currently on the board.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
