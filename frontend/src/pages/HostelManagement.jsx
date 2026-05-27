import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Hotel,
  Plus,
  Trash,
  UserCheck,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Bed,
  DollarSign,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const HostelManagement = () => {
  const { user, hasRole } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState('hostels'); // hostels, requests, allotments
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [expandedHostelId, setExpandedHostelId] = useState(null);
  const [allotments, setAllotments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myAllotment, setMyAllotment] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [isHostelModalOpen, setIsHostelModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  
  // Alerts
  const [message, setMessage] = useState({ type: '', text: '' });

  // Forms
  const [hostelForm, setHostelForm] = useState({ name: '', type: 'BOYS', description: '' });
  const [roomForm, setRoomForm] = useState({ roomNumber: '', sharingType: 'SINGLE', rent: 5000 });
  const [studentRequestForm, setStudentRequestForm] = useState({ hostelId: '', sharingType: 'SINGLE' });
  const [processForm, setProcessForm] = useState({ roomId: '', remarks: '', status: 'APPROVED' });

  const fetchHostels = async () => {
    try {
      const res = await api.get('/api/hostels');
      setHostels(res.data);
      if (res.data.length > 0 && !studentRequestForm.hostelId) {
        setStudentRequestForm(prev => ({ ...prev, hostelId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async (hostelId) => {
    try {
      const res = await api.get(`/api/hostels/${hostelId}/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHostelExpand = async (hostelId) => {
    if (expandedHostelId === hostelId) {
      setExpandedHostelId(null);
      setRooms([]);
    } else {
      setExpandedHostelId(hostelId);
      await fetchRooms(hostelId);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/api/hostels/requests');
      setRequests(res.data.content || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllotments = async () => {
    try {
      const res = await api.get('/api/hostels/allotments');
      setAllotments(res.data.content || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyAllotment = async () => {
    try {
      const res = await api.get('/api/hostels/allotments/my');
      setMyAllotment(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (hasRole(['ROLE_ADMIN', 'ROLE_STAFF'])) {
        await fetchHostels();
        await fetchRequests();
        await fetchAllotments();
      } else if (hasRole('ROLE_STUDENT')) {
        await fetchHostels();
        await fetchMyAllotment();
        await fetchRequests();
      }
    } catch (err) {
      setError('Failed to retrieve hostel operations details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // --- Actions ---

  const openAddModal = () => {
    setHostelForm({ name: '', type: 'BOYS', description: '' });
    setIsHostelModalOpen(true);
  };

  const handleCreateHostel = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/hostels', hostelForm);
      setIsHostelModalOpen(false);
      setHostelForm({ name: '', type: 'BOYS', description: '' });
      showAlert('success', 'Hostel directory added successfully.');
      fetchHostels();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to create hostel.');
    }
  };

  const handleDeleteHostel = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete hostel "${name}"? This will delete all rooms inside it.`)) return;
    try {
      await api.delete(`/api/hostels/${id}`);
      showAlert('success', 'Hostel directory deleted.');
      fetchHostels();
    } catch (err) {
      showAlert('error', 'Failed to delete hostel.');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/hostels/${selectedHostel.id}/rooms`, roomForm);
      setIsRoomModalOpen(false);
      setRoomForm({ roomNumber: '', sharingType: 'SINGLE', rent: 5000 });
      showAlert('success', `Room ${roomForm.roomNumber} added to ${selectedHostel.name}.`);
      fetchRooms(selectedHostel.id);
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to add room.');
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Delete room ${roomNumber}?`)) return;
    try {
      await api.delete(`/api/hostels/rooms/${roomId}`);
      showAlert('success', 'Room deleted.');
      fetchRooms(expandedHostelId);
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const handleStudentApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/hostels/requests', studentRequestForm);
      showAlert('success', 'Hostel room application submitted.');
      loadDashboardData();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to submit application.');
    }
  };

  const handleVacateRoom = async (allotmentId) => {
    if (!window.confirm('Are you sure you want to vacate this student from their room?')) return;
    try {
      await api.put(`/api/hostels/allotments/${allotmentId}/vacate`);
      showAlert('success', 'Room vacated successfully.');
      fetchAllotments();
    } catch (err) {
      showAlert('error', 'Failed to vacate room.');
    }
  };

  const openProcessModal = async (req) => {
    setCurrentRequest(req);
    setProcessForm({ roomId: '', remarks: '', status: 'APPROVED' });
    setIsProcessModalOpen(true);
    // Fetch available rooms in the preferred hostel
    try {
      const res = await api.get(`/api/hostels/${req.hostelId}/rooms/available`);
      setAvailableRooms(res.data);
      if (res.data.length > 0) {
        setProcessForm(prev => ({ ...prev, roomId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessRequest = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/hostels/requests/${currentRequest.id}/status`, null, {
        params: {
          status: processForm.status,
          roomId: processForm.status === 'APPROVED' ? processForm.roomId : null,
          remarks: processForm.remarks
        }
      });
      setIsProcessModalOpen(false);
      showAlert('success', 'Allotment request actioned.');
      fetchRequests();
      fetchAllotments();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to process request.');
    }
  };

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

      {/* ADMIN & STAFF VIEW */}
      {hasRole(['ROLE_ADMIN', 'ROLE_STAFF']) && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="bg-white p-2 border border-slate-200 rounded-2xl flex gap-1 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('hostels')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'hostels' 
                  ? 'bg-primary-600 text-white shadow' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Hostels & Rooms Inventory
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'requests' 
                  ? 'bg-primary-600 text-white shadow' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Allotment Requests Queue
            </button>
            <button
              onClick={() => setActiveTab('allotments')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'allotments' 
                  ? 'bg-primary-600 text-white shadow' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Active Room Allotments
            </button>
          </div>

          {/* ========================================== */}
          {/* TAB 1: HOSTELS & ROOMS DIRECTORY */}
          {/* ========================================== */}
          {activeTab === 'hostels' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus size={14} />
                  <span>Create Hostel Hall</span>
                </button>
              </div>

              {/* Hostels List */}
              <div className="grid grid-cols-1 gap-6">
                {hostels.length > 0 ? (
                  hostels.map(h => (
                    <div key={h.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center border border-primary-100">
                            <Hotel size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm font-outfit">{h.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                                {h.type}
                              </span>
                              <span>{h.description || 'No description provided.'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedHostel(h); setIsRoomModalOpen(true); }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            <span>Add Room</span>
                          </button>
                          <button
                            onClick={() => handleDeleteHostel(h.id, h.name)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                            title="Delete hostel"
                          >
                            <Trash size={16} />
                          </button>
                          <button
                            onClick={() => toggleHostelExpand(h.id)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg"
                          >
                            {expandedHostelId === h.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Rooms Table (Expanded) */}
                      {expandedHostelId === h.id && (
                        <div className="border-t border-slate-100">
                          {rooms.length > 0 ? (
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                  <th className="px-6 py-3">Room Number</th>
                                  <th className="px-6 py-3">Sharing Type</th>
                                  <th className="px-6 py-3">Rent (Monthly)</th>
                                  <th className="px-6 py-3">Occupancy</th>
                                  <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {rooms.map(room => (
                                  <tr key={room.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-3.5 font-bold text-slate-900">{room.roomNumber}</td>
                                    <td className="px-6 py-3.5">
                                      <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                                        {room.sharingType}
                                      </span>
                                    </td>
                                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                                      ${room.rent.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-3.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold">
                                          {room.occupiedCount} / {room.capacity}
                                        </span>
                                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full ${room.occupiedCount >= room.capacity ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${(room.occupiedCount / room.capacity) * 100}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                      <button
                                        disabled={room.occupiedCount > 0}
                                        onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                        title={room.occupiedCount > 0 ? "Cannot delete occupied room" : "Delete room"}
                                      >
                                        <Trash size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="p-6 text-center text-slate-400">No rooms registered in this hostel yet.</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
                    No hostels currently registered in system inventory.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: REQUESTS QUEUE */}
          {/* ========================================== */}
          {activeTab === 'requests' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Roll Number</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Preferred Hostel</th>
                      <th className="px-6 py-4">Sharing</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {requests.length > 0 ? (
                      requests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-slate-900">{req.studentName}</td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-500">{req.rollNumber}</td>
                          <td className="px-6 py-4 text-slate-600">{req.department}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{req.hostelName}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                              {req.sharingType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openProcessModal(req)}
                              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow active:scale-95 inline-flex"
                            >
                              <UserCheck size={12} />
                              <span>Review & Allot</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                          No pending room allotment applications.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: ACTIVE ALLOTMENTS */}
          {/* ========================================== */}
          {activeTab === 'allotments' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="px-6 py-4">Roll Number</th>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Hostel / Hall</th>
                      <th className="px-6 py-4">Room No.</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Rent (Monthly)</th>
                      <th className="px-6 py-4">Allotment Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {allotments.length > 0 ? (
                      allotments.map(allot => (
                        <tr key={allot.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono font-bold text-slate-600">{allot.rollNumber}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{allot.studentName}</td>
                          <td className="px-6 py-4 text-slate-600">{allot.department}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{allot.hostelName}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{allot.roomNumber}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                              {allot.sharingType}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">${allot.rent.toFixed(2)}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(allot.allotmentDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleVacateRoom(allot.id)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-200 transition-colors inline-flex items-center gap-1 active:scale-95"
                            >
                              <span>Vacate Room</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                          No active room allotment records.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT VIEW */}
      {hasRole('ROLE_STUDENT') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Room Allotment Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent)] pointer-events-none"></div>
              
              <h3 className="font-bold font-outfit text-base border-b border-slate-800 pb-4 mb-4 flex items-center gap-2">
                <Hotel className="text-emerald-400" size={18} />
                <span>My Hostel Room</span>
              </h3>

              {myAllotment ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-bold">Hostel Hall</span>
                    <strong className="text-lg font-outfit text-white">{myAllotment.hostelName}</strong>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-bold">Room Number</span>
                      <strong className="text-2xl text-white font-mono">{myAllotment.roomNumber}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-bold">Sharing Class</span>
                      <span className="bg-slate-800 text-slate-200 font-bold px-2 py-0.5 rounded text-xs border border-slate-700">
                        {myAllotment.sharingType}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-sm">
                    <div className="flex items-center gap-1 text-slate-400">
                      <DollarSign size={14} className="text-slate-500" />
                      <span>${myAllotment.rent}/mo</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar size={14} className="text-slate-500" />
                      <span>{new Date(myAllotment.allotmentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-sm">
                  <p>You currently do not have any active hostel room allotment.</p>
                  <p className="text-xs text-slate-500 mt-2">Submit an application request on the right to apply for accommodation.</p>
                </div>
              )}
            </div>
          </div>

          {/* Allotment Applications Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Submission Form */}
            {!myAllotment && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 font-outfit text-base flex items-center gap-2">
                  <Hotel size={18} className="text-slate-500" />
                  <span>Apply for Hostel Accommodation</span>
                </h3>

                <form onSubmit={handleStudentApply} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Hostel</label>
                      <select
                        value={studentRequestForm.hostelId}
                        onChange={(e) => setStudentRequestForm(prev => ({ ...prev, hostelId: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        {hostels.map(h => (
                          <option key={h.id} value={h.id}>{h.name} ({h.type} Type)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room Sharing Type</label>
                      <select
                        value={studentRequestForm.sharingType}
                        onChange={(e) => setStudentRequestForm(prev => ({ ...prev, sharingType: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="SINGLE">Single Sharing</option>
                        <option value="DOUBLE">Double Sharing</option>
                        <option value="TRIPLE">Triple Sharing</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-md active:scale-95"
                    >
                      <UserCheck size={16} />
                      <span>Submit Room Application</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Application Request History */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 mb-4 font-outfit text-base flex items-center gap-2">
                <ClipboardList size={18} className="text-slate-500" />
                <span>My Hostel Application History</span>
              </h3>

              <div className="overflow-x-auto">
                {requests.length > 0 ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="px-4 py-3">Applied Hostel</th>
                        <th className="px-4 py-3">Sharing</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Review Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {requests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800">{req.hostelName}</td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]">
                              {req.sharingType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              req.status === 'APPROVED' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                : req.status === 'REJECTED' 
                                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 italic max-w-[150px] truncate" title={req.remarks}>
                            {req.remarks || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-slate-400 py-10">No applications created yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD HOSTEL MODAL */}
      {/* ============================================================== */}
      {isHostelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Create Hostel Hall</h3>
              <button onClick={() => setIsHostelModalOpen(false)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateHostel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hostel Hall Name</label>
                <input
                  type="text"
                  value={hostelForm.name}
                  onChange={(e) => setHostelForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Ramanujan Hall"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hostel Type</label>
                <select
                  value={hostelForm.type}
                  onChange={(e) => setHostelForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="BOYS">BOYS ONLY</option>
                  <option value="GIRLS">GIRLS ONLY</option>
                  <option value="COED">CO-ED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description / Location</label>
                <input
                  type="text"
                  value={hostelForm.description}
                  onChange={(e) => setHostelForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Near main campus library"
                />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsHostelModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md">Create Hostel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD ROOM MODAL */}
      {/* ============================================================== */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Add Room to {selectedHostel?.name}</h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room Number</label>
                <input
                  type="text"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. 101, 203A"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sharing Class</label>
                <select
                  value={roomForm.sharingType}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, sharingType: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="SINGLE">SINGLE SHARING (1 Student)</option>
                  <option value="DOUBLE">DOUBLE SHARING (2 Students)</option>
                  <option value="TRIPLE">TRIPLE SHARING (3 Students)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monthly Rent ($)</label>
                <input
                  type="number"
                  value={roomForm.rent}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, rent: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. 4500"
                  min="0"
                  required
                />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRoomModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md">Add Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PROCESS APPLICATION / ALLOT MODAL */}
      {/* ============================================================== */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-lg">Process Accommodation Request</h3>
              <button onClick={() => setIsProcessModalOpen(false)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleProcessRequest} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500">
                  Student: <strong className="text-slate-800">{currentRequest?.studentName}</strong> ({currentRequest?.rollNumber})
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Requested: <strong className="text-slate-800">{currentRequest?.hostelName}</strong> - {currentRequest?.sharingType} Sharing
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Decision</label>
                <select
                  value={processForm.status}
                  onChange={(e) => setProcessForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="APPROVED">APPROVE & ALLOT ROOM</option>
                  <option value="REJECTED">REJECT APPLICATION</option>
                </select>
              </div>

              {processForm.status === 'APPROVED' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Available Room</label>
                  {availableRooms.length > 0 ? (
                    <select
                      value={processForm.roomId}
                      onChange={(e) => setProcessForm(prev => ({ ...prev, roomId: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {availableRooms.map(r => (
                        <option key={r.id} value={r.id}>
                          Room {r.roomNumber} ({r.sharingType} class - Occupancy: {r.occupiedCount}/{r.capacity} - Rent: ${r.rent}/mo)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>No rooms with matching sharing class are currently available in {currentRequest?.hostelName}!</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Review Remarks / Reason</label>
                <input
                  type="text"
                  value={processForm.remarks}
                  onChange={(e) => setProcessForm(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Allotted room 101."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsProcessModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={processForm.status === 'APPROVED' && availableRooms.length === 0}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md disabled:opacity-50"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelManagement;
