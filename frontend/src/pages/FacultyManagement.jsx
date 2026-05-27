import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const FacultyManagement = () => {
  const { user, registerUser, hasRole } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFaculty, setTotalFaculty] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Query Filters
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState(null);
  
  // Alert/Notification State
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form Fields
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    department: 'Computer Science & Engineering',
    phone: '',
    designation: 'Professor'
  });

  const departments = [
    'Computer Science & Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Mathematics',
    'Physics',
    'Finance & Accounts',
    'Attendance & Registry',
    'Inventory & Procurement'
  ];

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Visiting Faculty',
    'HOD'
  ];

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/faculty', {
        params: {
          department: deptFilter,
          query: search,
          page: page,
          size: size,
          sortBy: 'name',
          sortDir: 'asc'
        }
      });
      setFacultyList(res.data.content);
      setTotalFaculty(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      showAlert('error', 'Failed to retrieve faculty directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [page, deptFilter, search]);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      name: '',
      department: 'Computer Science & Engineering',
      phone: '',
      designation: 'Professor'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (fac) => {
    setCurrentFaculty(fac);
    setFormData({
      name: fac.name,
      department: fac.department,
      phone: fac.phone || '',
      designation: fac.designation,
      email: fac.email
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({
        ...formData,
        role: 'ROLE_FACULTY'
      });
      setIsAddModalOpen(false);
      showAlert('success', 'Faculty profile and account created successfully.');
      fetchFaculty();
    } catch (err) {
      showAlert('error', typeof err === 'string' ? err : 'Validation failed. Check inputs.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/faculty/${currentFaculty.id}`, formData);
      setIsEditModalOpen(false);
      showAlert('success', 'Faculty profile updated successfully.');
      fetchFaculty();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update faculty profile.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member and their login user account? This cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/api/faculty/${id}`);
      showAlert('success', 'Faculty profile deleted.');
      fetchFaculty();
    } catch (err) {
      showAlert('error', 'Failed to delete faculty.');
    }
  };

  const isEditable = hasRole('ROLE_ADMIN');

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

      {/* Control Panel: Search & Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
        {/* Filters */}
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(0); }}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[200px]"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Create Button (Admin only) */}
        {isEditable && (
          <button
            onClick={openAddModal}
            className="shrink-0 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
          >
            <UserPlus size={16} />
            <span>Add Faculty</span>
          </button>
        )}
      </div>

      {/* Faculty Data List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                {isEditable && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                  </td>
                </tr>
              ) : facultyList.length > 0 ? (
                facultyList.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{fac.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-xs font-semibold">
                        {fac.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{fac.department}</td>
                    <td className="px-6 py-4 text-slate-600">{fac.email}</td>
                    <td className="px-6 py-4 text-slate-500">{fac.phone || '-'}</td>
                    {isEditable && (
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(fac)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary-600 transition-colors"
                          title="Edit profile"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(fac.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                          title="Delete faculty"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No faculty members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50">
            <span>Showing {facultyList.length} of {totalFaculty} members</span>
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

      {/* ============================================================== */}
      {/* ADD FACULTY MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Add New Faculty Member</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Login Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. prof_sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Login Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Dr. Devendra Sharma"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. dsharma@cse.iit.ac.in"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. +91-9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation</label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {designations.map(desig => (
                      <option key={desig} value={desig}>{desig}</option>
                    ))}
                  </select>
                </div>
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT FACULTY MODAL */}
      {/* ============================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Edit Faculty Profile</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation</label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {designations.map(desig => (
                      <option key={desig} value={desig}>{desig}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
