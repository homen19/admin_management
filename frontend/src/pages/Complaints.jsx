import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  MessageSquareWarning, 
  UserCheck, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  Check,
  AlertTriangle
} from 'lucide-react';

const Complaints = () => {
  const { user, hasRole } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  
  // Alerts
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Staff Selection list (Hardcoded demo options matching seeds, or dynamically queryable)
  const staffMembers = [
    { id: 2, username: 'staff_rahul', name: 'Rahul Sharma (IT Support)' },
    { id: 3, username: 'staff_priya', name: 'Priya Iyer (Finance / Admin)' }
  ];

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    category: 'HOSTEL',
    description: ''
  });

  const categories = ['ACADEMIC', 'HOSTEL', 'INFRASTRUCTURE', 'FINANCE', 'OTHER'];

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/complaints', {
        params: {
          status: statusFilter,
          category: categoryFilter,
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          sortDir: 'desc'
        }
      });
      setComplaints(res.data.content);
    } catch (err) {
      showAlert('error', 'Failed to retrieve complaint tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/complaints', formData);
      setIsAddModalOpen(false);
      showAlert('success', 'Complaint raised successfully. Admin/Staff will review shortly.');
      setFormData({ title: '', category: 'HOSTEL', description: '' });
      fetchComplaints();
    } catch (err) {
      showAlert('error', 'Failed to raise complaint.');
    }
  };

  const handleAssignSubmit = async (staffUserId) => {
    try {
      await api.put(`/api/complaints/${activeTicket.id}/assign`, null, {
        params: { staffUserId }
      });
      setIsAssignModalOpen(false);
      showAlert('success', 'Complaint successfully assigned.');
      fetchComplaints();
    } catch (err) {
      showAlert('error', 'Failed to assign complaint.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/api/complaints/${id}/status`, null, {
        params: { status }
      });
      showAlert('success', `Complaint status updated to ${status}.`);
      fetchComplaints();
    } catch (err) {
      showAlert('error', 'Failed to update complaint status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const isManager = hasRole(['ROLE_ADMIN', 'ROLE_STAFF']);
  const isStudent = hasRole('ROLE_STUDENT');

  return (
    <div className="space-y-6">
      {/* Alert Header */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Control panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-500">Filter By:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Raise complaint (Student only) */}
        {isStudent && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-md active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Raise Complaint</span>
          </button>
        )}
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-6 animate-fade-in">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
          </div>
        ) : complaints.length > 0 ? (
          complaints.map((ticket) => (
            <div key={ticket.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    {ticket.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className="text-xs text-slate-400">Raised: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 font-outfit">{ticket.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{ticket.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span>Student: <b>{ticket.studentName}</b> ({ticket.rollNumber})</span>
                  <span>Dept: {ticket.department}</span>
                  {ticket.assignedToUsername && (
                    <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      Assigned to: <b>{ticket.assignedToUsername}</b>
                    </span>
                  )}
                </div>
              </div>

              {/* Administrative Actions */}
              {isManager && (
                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto items-end pt-4 md:pt-0 md:border-l md:border-slate-100 md:pl-6">
                  {ticket.status === 'OPEN' && (
                    <button
                      onClick={() => { setActiveTicket(ticket); setIsAssignModalOpen(true); }}
                      className="w-full px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold rounded-xl border border-primary-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserCheck size={14} />
                      <span>Assign Ticket</span>
                    </button>
                  )}
                  
                  {ticket.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusChange(ticket.id, 'RESOLVED')}
                      className="w-full px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  {ticket.status === 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusChange(ticket.id, 'CLOSED')}
                      className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X size={14} />
                      <span>Close Ticket</span>
                    </button>
                  )}
                  
                  {ticket.status === 'CLOSED' && (
                    <span className="text-xs text-slate-400 italic">Ticket Closed</span>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 shadow-sm">
            No complaints logged.
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* RAISE COMPLAINT MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Raise a Complaint / Ticket</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Complaint Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Lab PC compiled output error"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detailed Description</label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Explain the issue in detail, including locations or specifications..."
                  required
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ASSIGN TICKET MODAL */}
      {/* ============================================================== */}
      {isAssignModalOpen && activeTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg font-semibold">Assign Complaint Ticket</h3>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Select an administrative staff member to handle this complaint: <b>"{activeTicket.title}"</b></p>
              
              <div className="space-y-2">
                {staffMembers.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleAssignSubmit(staff.id)}
                    className="w-full p-4 border border-slate-200 hover:border-primary-500 rounded-xl bg-white hover:bg-primary-50/20 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{staff.name}</p>
                      <p className="text-xs text-slate-400">Username: {staff.username}</p>
                    </div>
                    <UserCheck size={16} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
