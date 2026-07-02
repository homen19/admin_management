import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Fingerprint, 
  ClipboardList, 
  QrCode, 
  History,
  Search,
  Filter,
  User,
  Navigation,
  TrendingUp,
  BarChart3,
  Users,
  Edit2,
  X
} from 'lucide-react';
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
  Cell 
} from 'recharts';

const Attendance = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('my_history');
  
  // Data lists
  const [myHistory, setMyHistory] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [usersList, setUsersList] = useState([]); // For simulator and registry select dropdowns
  
  // Loading & Alert States
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', text: '' });
  
  // Filters for Admin Logs
  const [roleFilter, setRoleFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Simulators & Registry Forms
  const [selectedSimUser, setSelectedSimUser] = useState('');
  const [simCardUid, setSimCardUid] = useState('');
  
  const [selectedRegUser, setSelectedRegUser] = useState('');
  const [regCardUid, setRegCardUid] = useState('');

  // GPS States
  const [gpsCoords, setGpsCoords] = useState({ latitude: '25.4299', longitude: '81.7712' }); // Mocks IIIT Allahabad center by default
  const [useActualGPS, setUseActualGPS] = useState(false);

  // Edit Log States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);
  const [editFormData, setEditFormData] = useState({
    attendanceDate: '',
    punchIn: '',
    punchOut: '',
    status: 'PRESENT',
    source: 'BIOMETRIC',
    latitude: '',
    longitude: '',
    cardUid: ''
  });

  // Constants
  const campusCenter = { latitude: 25.4299, longitude: 81.7712 };

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert({ type: '', text: '' }), 5000);
  };

  const fetchMyHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/attendance/my-history');
      setMyHistory(res.data);
    } catch (err) {
      showAlert('error', 'Failed to retrieve attendance history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/attendance/all', {
        params: {
          role: roleFilter || null,
          start: startDate || null,
          end: endDate || null
        }
      });
      setAllLogs(res.data);
    } catch (err) {
      showAlert('error', 'Failed to retrieve administrative attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch users to populate RFID mapping dropdowns
      const res = await api.get('/api/users', { params: { page: 0, size: 100 } });
      // Filter out students since attendance is only for Admin, Staff, and Faculty
      const staffAndFaculty = res.data.content.filter(u => 
        u.roleName === 'ROLE_ADMIN' || u.roleName === 'ROLE_STAFF' || u.roleName === 'ROLE_FACULTY'
      );
      setUsersList(staffAndFaculty);
    } catch (err) {
      showAlert('error', 'Failed to retrieve staff and faculty user directory.');
    }
  };

  useEffect(() => {
    if (activeTab === 'my_history') {
      fetchMyHistory();
    } else if (activeTab === 'admin_logs' || activeTab === 'analytics') {
      fetchAllLogs();
    } else if (activeTab === 'biometric_sim' || activeTab === 'gps_sim' || activeTab === 'card_registry') {
      fetchUsers();
    }
  }, [activeTab, roleFilter, startDate, endDate]);

  // Actions
  const handleBiometricPunch = async (e) => {
    e.preventDefault();
    if (!simCardUid.trim()) {
      showAlert('error', 'Please enter or select a valid Card UID.');
      return;
    }
    try {
      const res = await api.post('/api/attendance/biometric', { cardUid: simCardUid });
      showAlert('success', `Biometric scan success! clocked in/out for user: ${res.data.name} (Status: ${res.data.status})`);
      setSimCardUid('');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Biometric scan failed.');
    }
  };

  const handleMobileGpsPunch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/attendance/mobile', {
        latitude: parseFloat(gpsCoords.latitude),
        longitude: parseFloat(gpsCoords.longitude)
      });
      showAlert('success', `Mobile GPS punch success! clocked in/out (Status: ${res.data.status})`);
      if (activeTab === 'my_history') fetchMyHistory();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'GPS check-in failed.');
    }
  };

  const handleRegisterCard = async (e) => {
    e.preventDefault();
    if (!selectedRegUser || !regCardUid.trim()) {
      showAlert('error', 'Please select a user and enter a Card UID.');
      return;
    }
    try {
      await api.put('/api/attendance/register-card', null, {
        params: {
          userId: selectedRegUser,
          cardUid: regCardUid
        }
      });
      showAlert('success', 'RFID/NFC Card UID registered successfully.');
      setRegCardUid('');
      setSelectedRegUser('');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to register card.');
    }
  };

  const formatDateTimeForInput = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return dateTimeStr.substring(0, 16);
  };

  const handleOpenEditModal = (log) => {
    setCurrentLog(log);
    setEditFormData({
      attendanceDate: log.attendanceDate,
      punchIn: formatDateTimeForInput(log.punchIn),
      punchOut: formatDateTimeForInput(log.punchOut),
      status: log.status,
      source: log.source,
      latitude: log.latitude !== null ? log.latitude : '',
      longitude: log.longitude !== null ? log.longitude : '',
      cardUid: log.cardUid || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editFormData,
        id: currentLog.id,
        userId: currentLog.userId,
        username: currentLog.username,
        // Convert empty string lat/lon to null before sending to backend
        latitude: editFormData.latitude !== '' ? parseFloat(editFormData.latitude) : null,
        longitude: editFormData.longitude !== '' ? parseFloat(editFormData.longitude) : null,
        // If punchIn/punchOut is empty, set to null
        punchIn: editFormData.punchIn || null,
        punchOut: editFormData.punchOut || null
      };

      await api.put(`/api/attendance/${currentLog.id}`, payload);
      showAlert('success', 'Attendance record updated successfully.');
      setIsEditModalOpen(false);
      fetchAllLogs();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update attendance record.');
    }
  };

  const handleRequestActualGPS = () => {
    if (!navigator.geolocation) {
      showAlert('error', 'Geolocation is not supported by your browser.');
      return;
    }
    setUseActualGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        });
        showAlert('success', 'Successfully fetched real coordinates.');
      },
      (error) => {
        showAlert('error', 'Failed to retrieve GPS location: ' + error.message);
        setUseActualGPS(false);
      }
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-50 text-emerald-800 border-emerald-250';
      case 'LATE':
        return 'bg-amber-50 text-amber-800 border-amber-250';
      case 'ABSENT':
        return 'bg-rose-50 text-rose-800 border-rose-250';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-205';
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'BIOMETRIC':
        return 'bg-purple-50 text-purple-700 border border-purple-200/50';
      case 'MOBILE':
        return 'bg-blue-50 text-blue-700 border border-blue-200/50';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200/50';
    }
  };

  const isAdminOrStaff = hasRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  // Calculate distance of mock values to campus center for user guidance
  const calculateMockDistance = () => {
    const lat1 = parseFloat(gpsCoords.latitude);
    const lon1 = parseFloat(gpsCoords.longitude);
    if (isNaN(lat1) || isNaN(lon1)) return 'Invalid';
    
    // Haversine distance
    const R = 6371000;
    const dLat = (campusCenter.latitude - lat1) * Math.PI / 180;
    const dLon = (campusCenter.longitude - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(campusCenter.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  const simulatedDistance = calculateMockDistance();

  // Analytics aggregates
  const getAnalyticsData = () => {
    const totalPunches = allLogs.length;
    const presentLogs = allLogs.filter(l => l.status === 'PRESENT');
    const lateLogs = allLogs.filter(l => l.status === 'LATE');
    const absentLogs = allLogs.filter(l => l.status === 'ABSENT');

    const presentCount = presentLogs.length;
    const lateCount = lateLogs.length;
    const absentCount = absentLogs.length;

    const attendanceRate = totalPunches > 0 ? Math.round(((presentCount + lateCount) / totalPunches) * 100) : 0;
    const lateRate = totalPunches > 0 ? Math.round((lateCount / totalPunches) * 100) : 0;

    const biometricCount = allLogs.filter(l => l.source === 'BIOMETRIC').length;
    const mobileCount = allLogs.filter(l => l.source === 'MOBILE').length;

    // Daily Trend Formatting
    const dailyGroups = {};
    allLogs.forEach(log => {
      const dateLabel = new Date(log.attendanceDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      if (!dailyGroups[dateLabel]) {
        dailyGroups[dateLabel] = { date: dateLabel, Present: 0, Late: 0, Absent: 0 };
      }
      if (log.status === 'PRESENT') dailyGroups[dateLabel].Present += 1;
      else if (log.status === 'LATE') dailyGroups[dateLabel].Late += 1;
      else if (log.status === 'ABSENT') dailyGroups[dateLabel].Absent += 1;
    });

    const dailyTrends = Object.values(dailyGroups).reverse().slice(-10); // Last 10 days

    // Status distribution for PieChart
    const statusData = [
      { name: 'Present On-Time', value: presentCount },
      { name: 'Late Arrival', value: lateCount },
      { name: 'Absent', value: absentCount }
    ].filter(item => item.value > 0);

    // Source Distribution for PieChart
    const sourceData = [
      { name: 'RFID Card Tap', value: biometricCount },
      { name: 'Mobile GPS App', value: mobileCount }
    ].filter(item => item.value > 0);

    return {
      totalPunches,
      presentCount,
      lateCount,
      absentCount,
      attendanceRate,
      lateRate,
      biometricCount,
      mobileCount,
      statusData,
      sourceData,
      dailyTrends
    };
  };

  const stats = getAnalyticsData();

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {alert.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-fade-in ${
          alert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl shadow-sm gap-2">
        <button
          onClick={() => setActiveTab('my_history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'my_history' ? 'bg-primary-900 text-amber-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <History size={16} />
          <span>My Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('gps_sim')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'gps_sim' ? 'bg-primary-900 text-amber-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <MapPin size={16} />
          <span>Mobile GPS Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('biometric_sim')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'biometric_sim' ? 'bg-primary-900 text-amber-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Fingerprint size={16} />
          <span>RFID Biometric Simulator</span>
        </button>

        {isAdminOrStaff && (
          <>
            <button
              onClick={() => setActiveTab('admin_logs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'admin_logs' ? 'bg-primary-900 text-amber-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <ClipboardList size={16} />
              <span>Admin Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'analytics' ? 'bg-primary-900 text-amber-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={16} />
              <span>Attendance Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('card_registry')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'card_registry' ? 'bg-primary-900 text-amber-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <QrCode size={16} />
              <span>Card Registry</span>
            </button>
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB: MY HISTORY */}
      {/* ============================================================== */}
      {activeTab === 'my_history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-base font-academic tracking-wide">My Personal Attendance History</h3>
            <span className="text-xs text-slate-400 font-medium">Logged as: {user?.username}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Clock In</th>
                  <th className="px-6 py-4">Clock Out</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Source</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                    </td>
                  </tr>
                ) : myHistory.length > 0 ? (
                  myHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {new Date(log.attendanceDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-700">
                        {log.punchIn ? new Date(log.punchIn).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-rose-700">
                        {log.punchOut ? new Date(log.punchOut).toLocaleTimeString() : 'Active Session'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSourceBadge(log.source)}`}>
                          {log.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400">
                        {log.source === 'MOBILE' ? `GPS (Lat: ${log.latitude?.toFixed(4)}, Lon: ${log.longitude?.toFixed(4)})` : `RFID Card: ${log.cardUid}`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No attendance logs recorded for your account yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: MOBILE GPS SIMULATOR */}
      {/* ============================================================== */}
      {activeTab === 'gps_sim' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-academic">Mock Mobile GPS Clock-in/out</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Simulates clicking 'Clock In' inside the upcoming android mobile app. The backend will calculate your distance to campus and reject clock-ins further than 300 meters.
              </p>
            </div>

            {/* Campus Info Widget */}
            <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
              <div className="border-r border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Campus Center</span>
                <span className="text-xs font-semibold text-slate-700 block mt-1">25.4299, 81.7712</span>
              </div>
              <div className="border-r border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Radius Fence</span>
                <span className="text-xs font-semibold text-slate-700 block mt-1">300 meters</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Computed Distance</span>
                <span className={`text-xs font-bold block mt-1 ${
                  simulatedDistance <= 300 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {simulatedDistance}m {simulatedDistance <= 300 ? '(Within Fence)' : '(Out of Fence)'}
                </span>
              </div>
            </div>

            <form onSubmit={handleMobileGpsPunch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mock Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={gpsCoords.latitude}
                    onChange={(e) => setGpsCoords(prev => ({ ...prev, latitude: e.target.value }))}
                    disabled={useActualGPS}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="e.g. 25.4299"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mock Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={gpsCoords.longitude}
                    onChange={(e) => setGpsCoords(prev => ({ ...prev, longitude: e.target.value }))}
                    disabled={useActualGPS}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="e.g. 81.7712"
                    required
                  />
                </div>
              </div>

              {/* Coordinates presets */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseActualGPS(false);
                    setGpsCoords({ latitude: '25.4299', longitude: '81.7712' });
                  }}
                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 text-[10px] font-semibold text-slate-600 rounded-lg bg-white"
                >
                  Preset 1: CSE Block (Inside Campus)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseActualGPS(false);
                    setGpsCoords({ latitude: '25.4291', longitude: '81.7725' });
                  }}
                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 text-[10px] font-semibold text-slate-600 rounded-lg bg-white"
                >
                  Preset 2: Hostel Gate (Inside Campus)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseActualGPS(false);
                    setGpsCoords({ latitude: '25.4600', longitude: '81.8000' });
                  }}
                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 text-[10px] font-semibold text-rose-600 rounded-lg bg-white"
                >
                  Preset 3: Civil Lines City Center (Outside Campus)
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-4">
                <button
                  type="button"
                  onClick={handleRequestActualGPS}
                  className="flex-1 px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation size={16} />
                  <span>Use My Real Location</span>
                </button>

                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] ${
                    simulatedDistance <= 300 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200' 
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-200'
                  }`}
                >
                  {simulatedDistance <= 300 ? 'Punch Mobile Attendance' : 'Punch (Will Be Rejected)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: RFID BIOMETRIC SIMULATOR */}
      {/* ============================================================== */}
      {activeTab === 'biometric_sim' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in p-6">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                <Fingerprint size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-academic">Biometric Machine I-Card Scanner Simulator</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Simulates tapping your identity card on the RFID Biometric scan device installed at the office entrance doors.
              </p>
            </div>

            <form onSubmit={handleBiometricPunch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select staff/faculty profile to mock</label>
                <select
                  onChange={(e) => {
                    const sel = usersList.find(u => u.id === parseInt(e.target.value));
                    setSimCardUid(sel?.cardUid || '');
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Choose User Profile --</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.username} ({u.roleName.replace('ROLE_', '')}) {u.cardUid ? `[Card: ${u.cardUid}]` : '[No Card Linked]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Simulated Card UID (RFID scan code)</label>
                <input
                  type="text"
                  value={simCardUid}
                  onChange={(e) => setSimCardUid(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  placeholder="e.g. CARD_RAHUL"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Fingerprint size={16} />
                  <span>Tap Card on Simulator</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: ADMIN LOGS */}
      {/* ============================================================== */}
      {activeTab === 'admin_logs' && isAdminOrStaff && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters Control Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold"
                >
                  <option value="">All Roles</option>
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_STAFF">Staff</option>
                  <option value="ROLE_FACULTY">Faculty</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <button
              onClick={() => {
                setRoleFilter('');
                setStartDate('');
                setEndDate('');
              }}
              className="px-3.5 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Clock In</th>
                    <th className="px-6 py-4">Clock Out</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Source</th>
                    {user?.role === 'ROLE_ADMIN' && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={user?.role === 'ROLE_ADMIN' ? "8" : "7"} className="px-6 py-12 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                      </td>
                    </tr>
                  ) : allLogs.length > 0 ? (
                    allLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {log.name} <span className="text-xs font-normal text-slate-400">({log.username})</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-500">
                          {log.roleName}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {new Date(log.attendanceDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 font-medium text-emerald-700">
                          {log.punchIn ? new Date(log.punchIn).toLocaleTimeString() : '-'}
                        </td>
                        <td className="px-6 py-4 font-medium text-rose-700">
                          {log.punchOut ? new Date(log.punchOut).toLocaleTimeString() : 'Active Session'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSourceBadge(log.source)}`}>
                            {log.source}
                          </span>
                        </td>
                        {user?.role === 'ROLE_ADMIN' && (
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenEditModal(log)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary-600 transition-colors"
                              title="Edit attendance"
                            >
                              <Edit2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={user?.role === 'ROLE_ADMIN' ? "8" : "7"} className="px-6 py-12 text-center text-slate-400">
                        No logs match the current search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: CARD REGISTRY */}
      {/* ============================================================== */}
      {activeTab === 'card_registry' && isAdminOrStaff && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in p-6">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <QrCode size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-academic">Register RFID / NFC Card UID</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Maps a physical card code (UID) to a staff or faculty user's profile. Tap simulations will then identify this user.
              </p>
            </div>

            <form onSubmit={handleRegisterCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select target User Profile</label>
                <select
                  value={selectedRegUser}
                  onChange={(e) => setSelectedRegUser(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  required
                >
                  <option value="">-- Choose User --</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.username} ({u.roleName.replace('ROLE_', '')}) {u.cardUid ? `[Current RFID: ${u.cardUid}]` : '[No RFID Linked]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New RFID Card UID</label>
                <input
                  type="text"
                  value={regCardUid}
                  onChange={(e) => setRegCardUid(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  placeholder="e.g. CARD_RAHUL"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  Register RFID Card to User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* TAB: ATTENDANCE ANALYTICS */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && isAdminOrStaff && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters Control Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold"
                >
                  <option value="">All Roles</option>
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_STAFF">Staff</option>
                  <option value="ROLE_FACULTY">Faculty</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <button
              onClick={() => {
                setRoleFilter('');
                setStartDate('');
                setEndDate('');
              }}
              className="px-3.5 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>

          {/* Stats KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance Rate</span>
                <h3 className="text-2xl font-bold text-slate-800 font-outfit mt-1">{stats.attendanceRate}%</h3>
                <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                  <span>Present & Late Punches</span>
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Late Punch Rate</span>
                <h3 className="text-2xl font-bold text-slate-800 font-outfit mt-1">{stats.lateRate}%</h3>
                <p className="text-[10px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
                  <span>Punched after 9:15 AM</span>
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <Clock size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Shifts Logged</span>
                <h3 className="text-2xl font-bold text-slate-800 font-outfit mt-1">{stats.totalPunches}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>Punches in selected range</span>
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred Punch Channel</span>
                <h3 className="text-base font-bold text-slate-800 font-outfit mt-1 truncate max-w-[150px]">
                  {stats.biometricCount >= stats.mobileCount ? 'RFID Card Scanner' : 'Mobile GPS'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  <span>RFID: {stats.biometricCount} | GPS: {stats.mobileCount}</span>
                </p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                <Fingerprint size={24} />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Status Split Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center">
              <h4 className="font-bold text-slate-800 text-sm font-outfit self-start mb-4">Status Distribution</h4>
              {stats.totalPunches > 0 ? (
                <div className="h-60 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {stats.statusData.map((entry, index) => {
                          let color = '#10b981';
                          if (entry.name === 'Late Arrival') color = '#f59e0b';
                          if (entry.name === 'Absent') color = '#ef4444';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Presence</span>
                    <span className="text-lg font-extrabold text-slate-800 font-outfit">{stats.attendanceRate}%</span>
                  </div>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center text-xs text-slate-400 font-medium">
                  No data to display
                </div>
              )}
              {stats.totalPunches > 0 && (
                <div className="flex gap-4 text-xs font-semibold text-slate-600 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span>On-Time ({stats.presentCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                    <span>Late ({stats.lateCount})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Source split Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center">
              <h4 className="font-bold text-slate-800 text-sm font-outfit self-start mb-4">Clock-In Source</h4>
              {stats.totalPunches > 0 ? (
                <div className="h-60 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {stats.sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'RFID Card Tap' ? '#8b5cf6' : '#3b82f6'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Source</span>
                    <span className="text-sm font-extrabold text-slate-800 font-outfit">RFID vs GPS</span>
                  </div>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center text-xs text-slate-400 font-medium">
                  No data to display
                </div>
              )}
              {stats.totalPunches > 0 && (
                <div className="flex gap-4 text-xs font-semibold text-slate-600 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-550">
                    </span>
                    <span>RFID ({stats.biometricCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-550">
                    </span>
                    <span>Mobile GPS ({stats.mobileCount})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Trends Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
              <h4 className="font-bold text-slate-800 text-sm font-outfit mb-4">Daily Attendance Trends</h4>
              {stats.totalPunches > 0 ? (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10, pt: 10 }} />
                      <Bar dataKey="Present" stackId="a" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Late" stackId="a" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center text-xs text-slate-400 font-medium">
                  No data to display
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT ATTENDANCE MODAL */}
      {/* ============================================================== */}
      {isEditModalOpen && currentLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h3 className="font-bold text-slate-800 font-outfit text-lg">Edit Attendance Log</h3>
                <p className="text-xs text-slate-400">User: {currentLog.name} ({currentLog.username})</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Attendance Date</label>
                  <input
                    type="date"
                    value={editFormData.attendanceDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, attendanceDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="LATE">LATE</option>
                    <option value="ABSENT">ABSENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Punch In */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Punch In Time</label>
                  <input
                    type="datetime-local"
                    value={editFormData.punchIn}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, punchIn: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {/* Punch Out */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Punch Out Time</label>
                  <input
                    type="datetime-local"
                    value={editFormData.punchOut}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, punchOut: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Source */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source</label>
                  <select
                    value={editFormData.source}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="BIOMETRIC">BIOMETRIC</option>
                    <option value="MOBILE">MOBILE</option>
                    <option value="MANUAL">MANUAL</option>
                  </select>
                </div>
                {/* Card UID */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card UID</label>
                  <input
                    type="text"
                    value={editFormData.cardUid}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, cardUid: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="e.g. CARD_XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Latitude */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editFormData.latitude}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 25.4299"
                  />
                </div>
                {/* Longitude */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editFormData.longitude}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 81.7712"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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

export default Attendance;
