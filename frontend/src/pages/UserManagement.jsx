import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  UserPlus,
  KeyRound,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

const UserManagement = () => {
  const { registerUser } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Alert/Notification State
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form Fields for Adding User
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'ROLE_STUDENT',
    name: '',
    department: 'Computer Science & Engineering',
    phone: '',
    rollNumber: '',
    semester: 1,
    designation: 'Professor'
  });

  // Form Fields for Password Reset
  const [resetPassword, setResetPassword] = useState('');

  const roles = [
    { value: 'ROLE_ADMIN',    label: 'Administrator'     },
    { value: 'ROLE_STAFF',    label: 'Office Staff'      },
    { value: 'ROLE_FACULTY',  label: 'Faculty'           },
    { value: 'ROLE_STUDENT',  label: 'Student'           },
    { value: 'ROLE_FINANCE',  label: 'Finance Officer'   },
    { value: 'ROLE_INVENTORY_ADMIN', label: 'Inventory Admin' },
  ];

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users', {
        params: {
          query: search,
          page: page,
          size: size
        }
      });
      setUsersList(res.data.content);
      setTotalUsers(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      showAlert('error', 'Failed to retrieve user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

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
      role: 'ROLE_STUDENT',
      name: '',
      department: 'Computer Science & Engineering',
      phone: '',
      rollNumber: '',
      semester: 1,
      designation: 'Professor'
    });
    setIsAddModalOpen(true);
  };

  const openPasswordModal = (userRecord) => {
    setCurrentUser(userRecord);
    setResetPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      setIsAddModalOpen(false);
      showAlert('success', 'User account and profile created successfully.');
      fetchUsers();
    } catch (err) {
      showAlert('error', typeof err === 'string' ? err : 'Validation failed. Check inputs.');
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetPassword.trim()) {
      showAlert('error', 'Password cannot be empty.');
      return;
    }
    try {
      await api.put(`/api/users/${currentUser.id}/password`, { password: resetPassword });
      setIsPasswordModalOpen(false);
      showAlert('success', `Password reset successfully for user: ${currentUser.username}`);
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to reset password.');
    }
  };

  const handleDelete = async (userRecord) => {
    if (!window.confirm(`Are you sure you want to delete the user account "${userRecord.username}"? This will delete all linked student/faculty profiles and leave requests. This action is permanent.`)) {
      return;
    }
    try {
      await api.delete(`/api/users/${userRecord.id}`);
      showAlert('success', 'User account deleted successfully.');
      fetchUsers();
    } catch (err) {
      showAlert('error', 'Failed to delete user.');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ROLE_STAFF':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ROLE_FACULTY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ROLE_STUDENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ROLE_FINANCE':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-fade-in ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
        {/* Filters */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by username, email, or role..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={openAddModal}
          className="shrink-0 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
        >
          <UserPlus size={16} />
          <span>Add User Account</span>
        </button>
      </div>

      {/* Users Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                  </td>
                </tr>
              ) : usersList.length > 0 ? (
                usersList.map((userRecord) => (
                  <tr key={userRecord.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{userRecord.username}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{userRecord.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{userRecord.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeColor(userRecord.roleName)}`}>
                        {userRecord.roleName.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(userRecord.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => openPasswordModal(userRecord)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary-600 transition-colors"
                        title="Reset user password"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(userRecord)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                        title="Delete user account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No user accounts found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50">
            <span>Showing {usersList.length} of {totalUsers} users</span>
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
      {/* ADD USER ACCOUNT MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Add New User Account</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Role Selection */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  >
                    {roles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. jdoe"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
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

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. jdoe@iit.ac.in"
                    required
                  />
                </div>

                {/* Phone */}
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

                {/* Department (For Student and Faculty) */}
                {(formData.role === 'ROLE_STUDENT' || formData.role === 'ROLE_FACULTY') && (
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
                )}
              </div>

              {/* Student specific fields */}
              {formData.role === 'ROLE_STUDENT' && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. IIT2023055"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
                    <input
                      type="number"
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Faculty specific fields */}
              {formData.role === 'ROLE_FACULTY' && (
                <div className="pt-2 border-t border-slate-100">
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
              )}

              {/* Action Buttons */}
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
      {/* RESET PASSWORD MODAL */}
      {/* ============================================================== */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-base flex items-center gap-2">
                <KeyRound size={18} className="text-primary-600" />
                <span>Reset User Password</span>
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordResetSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-4">
                  Resetting password for username: <strong className="text-slate-800">{currentUser?.username}</strong>.
                </p>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter new password"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
