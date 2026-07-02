import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Megaphone,
  Pin,
  Trash2,
  Plus,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Search
} from 'lucide-react';

const Notices = () => {
  const { user, hasRole } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
    expiryDate: ''
  });

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notices', {
        params: {
          query: search,
          page: 0,
          size: 50,
          sortBy: 'isPinned',
          sortDir: 'desc'
        }
      });
      setNotices(res.data.content);
    } catch (err) {
      showAlert('error', 'Failed to retrieve notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [search]);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploading(true);
    try {
      // Re-use file upload endpoint from /api/leaves/upload since it's identical
      const res = await api.post('/api/leaves/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAttachment(res.data.url);
      setAttachmentName(res.data.fileName);
      showAlert('success', 'Notice PDF uploaded successfully.');
    } catch (err) {
      showAlert('error', 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/notices', {
        ...formData,
        attachmentPath: attachment,
        expiryDate: formData.expiryDate || null
      });
      setIsAddModalOpen(false);
      showAlert('success', 'Notice posted successfully.');
      // Reset
      setFormData({ title: '', content: '', isPinned: false, expiryDate: '' });
      setAttachment('');
      setAttachmentName('');
      fetchNotices();
    } catch (err) {
      showAlert('error', 'Failed to create notice.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/api/notices/${id}`);
      showAlert('success', 'Notice deleted.');
      fetchNotices();
    } catch (err) {
      showAlert('error', 'Failed to delete notice.');
    }
  };

  const canManage = hasRole(['ROLE_ADMIN', 'ROLE_FACULTY', 'ROLE_STAFF']);
  const canDelete = hasRole(['ROLE_ADMIN', 'ROLE_FACULTY']);

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-fade-in ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search notices by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Add notice button (Admin/Faculty/Staff only) */}
        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-md active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Create Notice</span>
          </button>
        )}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 gap-6 animate-fade-in">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
          </div>
        ) : notices.length > 0 ? (
          notices.map((notice) => (
            <div
              key={notice.id}
              className={`p-6 bg-white rounded-2xl border transition-all ${notice.isPinned
                  ? 'border-amber-200 bg-amber-50/20 shadow-sm'
                  : 'border-slate-200 hover:shadow-md'
                }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 font-outfit">{notice.title}</h3>
                    {notice.isPinned && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                        <Pin size={10} className="fill-amber-800" />
                        <span>PINNED</span>
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">{notice.content}</p>

                  <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 font-medium">
                    <span>Posted by: <b>{notice.createdByName}</b></span>
                    <span>Date: {new Date(notice.createdAt).toLocaleDateString()}</span>
                    {notice.expiryDate && (
                      <span className="text-rose-500 flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Expires: {new Date(notice.expiryDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notice.attachmentPath && (
                    <a
                      href={`http://localhost:8082${notice.attachmentPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <FileText size={14} />
                      <span>PDF Document</span>
                    </a>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                      title="Delete notice"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 shadow-sm">
            No notices posted on the board.
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* CREATE NOTICE MODAL */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Create Official Notice</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notice Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. End Semester Schedule Release"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notice Content</label>
                <textarea
                  name="content"
                  rows="5"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Write the notice body text..."
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center pt-6 pl-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPinned"
                      checked={formData.isPinned}
                      onChange={handleInputChange}
                      className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-600 uppercase">Pin Notice to Top</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Attachment (PDF only)</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="notice-upload"
                  />
                  <label
                    htmlFor="notice-upload"
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Upload Document PDF
                  </label>
                  {uploading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>}
                  {attachmentName && <span className="text-xs text-slate-500 truncate">{attachmentName}</span>}
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
                  disabled={uploading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md disabled:opacity-50"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
