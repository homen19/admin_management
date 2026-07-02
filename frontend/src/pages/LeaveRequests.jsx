import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  FileText,
  Check,
  X,
  Calendar,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

const LeaveRequests = () => {
  const { user, hasRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  // Alerts
  const [message, setMessage] = useState({ type: '', text: '' });

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [remarks, setRemarks] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/leaves', {
        params: {
          status: statusFilter,
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          sortDir: 'desc'
        }
      });
      setLeaves(res.data.content);
    } catch (err) {
      showAlert('error', 'Failed to retrieve leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/api/leaves/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAttachment(res.data.url);
      setAttachmentName(res.data.fileName);
      showAlert('success', 'Document uploaded successfully.');
    } catch (err) {
      showAlert('error', 'File upload failed. Ensure size is less than 5MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/leaves', {
        ...formData,
        attachmentPath: attachment
      });
      setIsApplyModalOpen(false);
      showAlert('success', 'Leave application submitted successfully.');
      // Reset form
      setFormData({ startDate: '', endDate: '', reason: '' });
      setAttachment('');
      setAttachmentName('');
      fetchLeaves();
      // Dispatch custom event to notify sidebar badge of updates
      document.dispatchEvent(new CustomEvent('leaveStatusChanged'));
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to submit leave application.');
    }
  };

  const handleReviewSubmit = async (status) => {
    try {
      await api.put(`/api/leaves/${activeRequest.id}/status`, null, {
        params: { status, remarks }
      });
      setIsReviewModalOpen(false);
      setRemarks('');
      showAlert('success', `Leave request successfully ${status.toLowerCase()}.`);
      fetchLeaves();
      // Dispatch custom event to notify sidebar badge of updates
      document.dispatchEvent(new CustomEvent('leaveStatusChanged'));
    } catch (err) {
      showAlert('error', 'Failed to submit review decision.');
    }
  };

  const openReviewModal = (request) => {
    setActiveRequest(request);
    setRemarks('');
    setIsReviewModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const isApprover = hasRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-fade-in ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Action panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Applications</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Apply button (Student/Faculty only) */}
        {!isApprover && (
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-md active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Leave Duration</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-center">Attachment</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                  </td>
                </tr>
              ) : leaves.length > 0 ? (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{leave.name} <span className="text-xs font-normal text-slate-400">({leave.username})</span></td>
                    <td className="px-6 py-4">
                      <span className="text-xs uppercase font-medium text-slate-500">{leave.role.replace('ROLE_', '')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-900 font-medium">
                        <span>{leave.startDate}</span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span>{leave.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="px-6 py-4 text-center">
                      {leave.attachmentPath ? (
                        <a
                          href={`http://localhost:8082${leave.attachmentPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200"
                          title="View PDF"
                        >
                          <FileText size={16} />
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isApprover && leave.status === 'PENDING' ? (
                        <button
                          onClick={() => openReviewModal(leave)}
                          className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold rounded-lg border border-primary-200 transition-colors"
                        >
                          Review
                        </button>
                      ) : leave.remarks ? (
                        <button
                          onClick={() => openReviewModal(leave)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
                        >
                          View Details
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* APPLY LEAVE MODAL */}
      {/* ============================================================== */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Apply for Leave</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason for Leave</label>
                <textarea
                  name="reason"
                  rows="4"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Provide details about why you require this leave..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supporting Document (PDF only)</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Choose PDF File
                  </label>
                  {uploading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>}
                  {attachmentName && <span className="text-xs text-slate-500 truncate">{attachmentName}</span>}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md disabled:opacity-50"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REVIEW LEAVE MODAL */}
      {/* ============================================================== */}
      {isReviewModalOpen && activeRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Leave Request Details</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              {/* Applicant Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Applicant</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{activeRequest.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Role</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{activeRequest.role.replace('ROLE_', '')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{activeRequest.startDate} to {activeRequest.endDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Current Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border mt-1 ${getStatusBadge(activeRequest.status)}`}>
                    {activeRequest.status}
                  </span>
                </div>
              </div>

              {/* Leave Reason */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reason for Leave</p>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100">{activeRequest.reason}</p>
              </div>

              {/* Attachment */}
              {activeRequest.attachmentPath && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Supporting Document</p>
                  <a
                    href={`http://localhost:8082${activeRequest.attachmentPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                  >
                    <FileText size={16} />
                    <span>View Supporting PDF</span>
                  </a>
                </div>
              )}

              {/* Review Input */}
              {activeRequest.status === 'PENDING' && isApprover ? (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Remarks / Feedback</label>
                    <textarea
                      rows="3"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add any remarks or conditions..."
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleReviewSubmit('REJECTED')}
                      className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <X size={16} />
                      <span>Reject Application</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewSubmit('APPROVED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md flex items-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>Approve Leave</span>
                    </button>
                  </div>
                </div>
              ) : activeRequest.remarks ? (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Approver Remarks</p>
                  <p className="text-sm text-slate-600 mt-1 italic whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{activeRequest.remarks}"
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">Processed by: <b>{activeRequest.actionedByUsername}</b></p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
