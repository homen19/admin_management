import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  BookOpen, 
  KeyRound, 
  Save, 
  Building2,
  AlertCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Alert/Notification State
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Password Change Fields
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/profile');
      setProfile(res.data);
    } catch (err) {
      showAlert('error', 'Failed to retrieve profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/api/users/profile', profile);
      setProfile(res.data);
      showAlert('success', 'Profile updated successfully.');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showAlert('error', 'New passwords do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      showAlert('error', 'Password must be at least 6 characters.');
      return;
    }
    try {
      await api.put('/api/users/profile/password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showAlert('success', 'Password updated successfully.');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update password. Verify current password.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card - User Avatar Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-3xl text-primary-400 font-outfit shadow-inner">
            {profile?.name?.substring(0, 2).toUpperCase() || profile?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-xl font-outfit">{profile?.name || profile?.username}</h3>
            <p className="text-slate-400 text-xs mt-1">@{profile?.username}</p>
          </div>
          <span className="px-3 py-1 bg-primary-950/50 text-primary-300 border border-primary-900/60 rounded-full text-xs font-bold uppercase tracking-wider">
            {profile?.role?.replace('ROLE_', '')}
          </span>
          
          <div className="w-full pt-4 border-t border-slate-800 text-left space-y-3 text-sm text-slate-400">
            {profile?.rollNumber && (
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-slate-500 shrink-0" />
                <span>Roll Number: <strong className="text-slate-200">{profile.rollNumber}</strong></span>
              </div>
            )}
            {profile?.department && (
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-slate-500 shrink-0" />
                <span className="truncate">Dept: <strong className="text-slate-200" title={profile.department}>{profile.department}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-slate-500 shrink-0" />
              <span>Permission Profile: <strong className="text-slate-200">{profile?.role?.replace('ROLE_', '')} Level</strong></span>
            </div>
          </div>
        </div>

        {/* Right Columns - Details Form and Password Change Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form 1: Profile Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 font-outfit text-base flex items-center gap-2">
              <User size={18} className="text-slate-500" />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile?.name || ''}
                    onChange={handleInputChange}
                    disabled={user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF'} // Admin/Staff don't have separate profile record names
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-400"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile?.email || ''}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Phone */}
                {(user?.role === 'ROLE_STUDENT' || user?.role === 'ROLE_FACULTY') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={profile?.phone || ''}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {/* Department */}
                {(user?.role === 'ROLE_STUDENT' || user?.role === 'ROLE_FACULTY') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                    <select
                      name="department"
                      value={profile?.department || ''}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Semester (Student only) */}
                {user?.role === 'ROLE_STUDENT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
                    <input
                      type="number"
                      name="semester"
                      value={profile?.semester || 1}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                )}

                {/* Designation (Faculty only) */}
                {user?.role === 'ROLE_FACULTY' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation</label>
                    <select
                      name="designation"
                      value={profile?.designation || ''}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {designations.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-md active:scale-95"
                >
                  <Save size={16} />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Password Change */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 font-outfit text-base flex items-center gap-2">
              <KeyRound size={18} className="text-slate-500" />
              <span>Security & Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwords.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Min 6 chars"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-md active:scale-95"
                >
                  <KeyRound size={16} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
