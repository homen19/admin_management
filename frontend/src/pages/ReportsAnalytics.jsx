import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  FileSpreadsheet,
  FileText,
  AlertCircle,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  Package,
  BookOpen,
  Coins
} from 'lucide-react';

const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stats states
  const [studentDepts, setStudentDepts] = useState([]);
  const [leaveStats, setLeaveStats] = useState([]);
  const [complaintStats, setComplaintStats] = useState([]);
  const [inventoryStats, setInventoryStats] = useState([]);
  const [libraryStats, setLibraryStats] = useState({ total: 0, available: 0, issued: 0 });
  const [financeStats, setFinanceStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const [deptRes, leavesRes, complaintsRes, inventoryRes, libraryRes, financeRes] = await Promise.all([
          api.get('/api/reports/department-students'),
          api.get('/api/reports/monthly-leaves'),
          api.get('/api/reports/complaint-categories'),
          api.get('/api/reports/inventory-status'),
          api.get('/api/reports/library-status'),
          api.get('/api/reports/finance-status')
        ]);

        // Format Student Dept Stats
        setStudentDepts(deptRes.data.map(item => ({
          name: item.department.split(' ').map(w => w[0]).join(''),
          fullName: item.department,
          count: item.student_count || item.count
        })));

        // Format Leave Stats
        setLeaveStats(leavesRes.data.map(item => ({
          month: item.month,
          Approved: item.approved_count || item.approved,
          Rejected: item.rejected_count || item.rejected,
          Pending: item.pending_count || item.pending,
          Total: item.total_requests || item.total
        })).reverse()); // Oldest to newest

        // Format Complaint Stats
        setComplaintStats(complaintsRes.data.map(item => ({
          category: item.category,
          Total: item.total_complaints || item.total,
          Resolved: item.resolved_complaints || item.resolved,
          rate: item.resolution_rate || item.resolutionRate
        })));

        // Format Inventory Stats
        setInventoryStats(inventoryRes.data.map(item => ({
          category: item.category ? item.category.replace('_', ' ') : 'UNKNOWN',
          Total: item.totalQty || 0,
          Available: item.availableQty || 0,
          Allocated: (item.totalQty || 0) - (item.availableQty || 0)
        })));

        // Format Library Stats
        if (libraryRes.data && libraryRes.data.length > 0) {
          setLibraryStats({
            total: libraryRes.data[0].total || 0,
            available: libraryRes.data[0].available || 0,
            issued: libraryRes.data[0].issued || 0
          });
        }

        // Format Finance Stats
        setFinanceStats(financeRes.data.map(item => ({
          month: item.month,
          Income: item.income || 0,
          Expense: item.expense || 0
        })).reverse()); // Oldest to newest

      } catch (err) {
        setError('Failed to fetch analytics statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportCSV = () => {
    // Open CSV download URL directly in a new tab/window
    window.open('http://localhost:8082/api/reports/export/students/csv', '_blank');
  };

  const handleExportPDF = () => {
    // Open PDF download URL
    window.open('http://localhost:8082/api/reports/export/students/pdf', '_blank');
  };

  const COLORS = ['#0ea5e9', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

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
          <h3 className="font-bold text-lg">Failed to Load Reports</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Export Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h3 className="font-bold text-slate-800 font-outfit text-base">Export Student Reports</h3>
          <p className="text-slate-400 text-xs mt-0.5">Download full normalized student directory datasets.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet size={16} />
            <span>Export Directory (CSV)</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileText size={16} />
            <span>Export Directory (PDF)</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Department-wise Student Count Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 font-outfit text-base">Departmental Student Count</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentDepts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave approval statistics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 font-outfit text-base">Monthly Leave Trends</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leaveStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Approved" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="Rejected" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                <Area type="monotone" dataKey="Pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 font-outfit text-base">Complaint Category Distribution</h3>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintStats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="Total"
                >
                  {complaintStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Resolution Rates Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 font-outfit text-base">Resolution Metrics Table</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Total Tickets</th>
                  <th className="px-4 py-3 text-center">Resolved / Closed</th>
                  <th className="px-4 py-3 text-right">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {complaintStats.map((item, idx) => (
                  <tr key={item.category} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.category}</td>
                    <td className="px-4 py-3 text-center">{item.Total}</td>
                    <td className="px-4 py-3 text-center">{item.Resolved}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${item.rate >= 75 ? 'bg-emerald-50 text-emerald-800' : item.rate >= 40 ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                        {item.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Finance Overview (Income vs Expense) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Coins size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 font-outfit text-base">Monthly Income vs Expenses</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Stock Levels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 font-outfit text-base">Inventory Stock Levels</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Available" fill="#0ea5e9" stackId="a" />
                <Bar dataKey="Allocated" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Library Book Circulation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 font-outfit text-base">Library Book Circulation</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 h-full">
            <div className="h-56 w-full md:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Available', value: libraryStats.available },
                      { name: 'Issued', value: libraryStats.issued }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs font-semibold block">Total Holdings</span>
                <span className="text-slate-800 text-2xl font-bold font-outfit">{libraryStats.total}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <span className="text-emerald-700 text-xs font-semibold block">Available</span>
                  <span className="text-emerald-800 text-lg font-bold font-outfit">{libraryStats.available}</span>
                </div>
                <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                  <span className="text-purple-700 text-xs font-semibold block">Issued</span>
                  <span className="text-purple-800 text-lg font-bold font-outfit">{libraryStats.issued}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsAnalytics;
