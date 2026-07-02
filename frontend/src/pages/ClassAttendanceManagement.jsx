import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  BookOpen, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ListTodo, 
  ChevronRight,
  TrendingUp,
  User,
  Search,
  Filter
} from 'lucide-react';

const ClassAttendanceManagement = () => {
  const { hasRole } = useAuth();
  
  const isFaculty = hasRole(['ROLE_FACULTY']);
  const isStudent = hasRole(['ROLE_STUDENT']);
  const isAdminOrStaff = hasRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Common Academic States (for Filters)
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // --- FACULTY STATES ---
  const [facultySessions, setFacultySessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    courseId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    topicCovered: ''
  });

  // --- STUDENT STATES ---
  const [studentSummary, setStudentSummary] = useState([]);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [studentSemester, setStudentSemester] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);

  // Fetch initial hierarchy for filters
  const fetchHierarchy = async () => {
    try {
      const [schoolsRes, deptsRes, coursesRes] = await Promise.all([
        api.get('/api/schools'),
        api.get('/api/departments'),
        api.get('/api/courses')
      ]);
      setSchools(schoolsRes.data);
      setDepartments(deptsRes.data);
      setCourses(coursesRes.data);

      if (isFaculty) {
        // Fetch sessions conducted by the logged-in faculty and assigned courses
        const [sessionsRes, assignedRes] = await Promise.all([
          api.get('/api/class-attendance/sessions/faculty'),
          api.get('/api/courses/assigned')
        ]);
        setFacultySessions(sessionsRes.data);
        setFacultyCourses(assignedRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Student Summary
  const fetchStudentSummary = async (sem) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/class-attendance/student/summary?semester=${sem}`);
      setStudentSummary(res.data);
    } catch (err) {
      showAlert('error', 'Failed to retrieve attendance summary.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Student Profile
  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/students/profile');
      setStudentSemester(res.data.semester || 1);
      setSelectedSemester(res.data.semester || 1);
      await fetchStudentSummary(res.data.semester || 1);
    } catch (err) {
      showAlert('error', 'Failed to load student profile.');
      await fetchStudentSummary(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
    if (isStudent) {
      fetchStudentProfile();
    }
  }, []);

  useEffect(() => {
    if (isStudent && selectedSemester) {
      fetchStudentSummary(selectedSemester);
    }
  }, [selectedSemester]);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // --- FACULTY FUNCTIONS ---
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/api/class-attendance/sessions', sessionForm);
      showAlert('success', 'Class session scheduled successfully.');
      setIsScheduleOpen(false);
      setSessionForm(prev => ({ ...prev, topicCovered: '' }));
      // Reload sessions list
      const sessionsRes = await api.get('/api/class-attendance/sessions/faculty');
      setFacultySessions(sessionsRes.data);
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to schedule class session.');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSheet = async (session) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/class-attendance/sheet/${session.id}`);
      setAttendanceSheet(res.data);
      setActiveSession(session);
    } catch (err) {
      showAlert('error', 'Failed to load student attendance sheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (studentId, status) => {
    setAttendanceSheet(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return { ...s, status };
      }
      return s;
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceSheet(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return { ...s, remarks };
      }
      return s;
    }));
  };

  const markAllPresent = () => {
    setAttendanceSheet(prev => prev.map(s => ({ ...s, status: 'PRESENT' })));
  };

  const submitAttendanceSheet = async () => {
    try {
      setLoading(true);
      const payload = {
        classSessionId: activeSession.id,
        attendanceList: attendanceSheet.map(s => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks
        }))
      };
      await api.post('/api/class-attendance/submit', payload);
      showAlert('success', 'Class attendance updated successfully.');
      setActiveSession(null);
    } catch (err) {
      showAlert('error', 'Failed to submit attendance.');
    } finally {
      setLoading(false);
    }
  };

  // --- STUDENT FUNCTIONS ---
  const viewStudentCourseLogs = async (courseSummary) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/class-attendance/student/course/${courseSummary.courseId}/logs`);
      setStudentLogs(res.data);
      setSelectedCourseDetail(courseSummary);
    } catch (err) {
      showAlert('error', 'Failed to load detailed logs.');
    } finally {
      setLoading(false);
    }
  };

  // --- ADMIN FUNCTIONS ---
  const [adminSessions, setAdminSessions] = useState([]);
  const fetchAdminSessions = async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/class-attendance/sessions/course/${selectedCourseId}`);
      setAdminSessions(res.data);
    } catch (err) {
      showAlert('error', 'Failed to load course sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrStaff) {
      fetchAdminSessions();
    }
  }, [selectedCourseId]);

  return (
    <div className="space-y-6">
      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-fade-in ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. FACULTY BOARDROOM */}
      {/* ============================================================== */}
      {isFaculty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main workspace (Sessions conducted) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800 font-outfit">Lectures & Session Registry</h2>
                <p className="text-sm text-slate-500 mt-1">Conduct and mark class attendance for your courses.</p>
              </div>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-all duration-150 flex items-center gap-2 shadow-md shadow-primary-950/10 active:scale-[0.98]"
              >
                <Calendar size={16} />
                <span>Schedule Class Session</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 text-sm">Your Conducted Class Sessions</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {facultySessions.length > 0 ? (
                  facultySessions.map(session => (
                    <div key={session.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-500 font-mono bg-slate-900 px-2 py-0.5 rounded">
                            {session.courseCode}
                          </span>
                          <span className="text-slate-800 font-bold text-sm">
                            {session.courseTitle}
                          </span>
                          <span className="text-xs text-slate-400">
                            (Sem {session.semester})
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{session.topicCovered || 'General Class Lecture'}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {session.sessionDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => loadAttendanceSheet(session)}
                        className="shrink-0 px-4 py-2 border border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100 font-bold text-xs rounded-xl transition-all duration-150 flex items-center gap-1.5 active:scale-[0.98]"
                      >
                        <ListTodo size={14} />
                        <span>Attendance Sheet</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    No class sessions conducted yet. Click "Schedule Class Session" to register your first lecture.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel: Marking Attendance Sheet */}
          <div className="lg:col-span-1">
            {activeSession ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden sticky top-6 animate-slide-up">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider uppercase">{activeSession.courseCode}</span>
                    <h3 className="font-bold text-sm mt-0.5 line-clamp-1">Mark Student Attendance</h3>
                  </div>
                  <button onClick={() => setActiveSession(null)} className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg">
                    <X size={14} />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">{attendanceSheet.length} students enrolled</span>
                  <button
                    onClick={markAllPresent}
                    className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-555 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Check size={12} />
                    <span>Mark All Present</span>
                  </button>
                </div>

                {/* Students list */}
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {attendanceSheet.map((student) => (
                    <div key={student.studentId} className="p-3 bg-white border border-slate-150 rounded-xl space-y-2.5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800 text-xs leading-none">{student.studentName}</p>
                          <span className="text-[10px] font-mono text-slate-400 uppercase leading-none mt-1 inline-block">{student.studentRollNumber}</span>
                        </div>
                      </div>
                      
                      {/* Attendance Toggles (P, A, L) */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.studentId, 'PRESENT')}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all duration-150 ${
                            student.status === 'PRESENT' 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'text-slate-500 hover:bg-slate-200/50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.studentId, 'ABSENT')}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all duration-150 ${
                            student.status === 'ABSENT' 
                              ? 'bg-rose-600 text-white shadow-sm' 
                              : 'text-slate-500 hover:bg-slate-200/50'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.studentId, 'LATE')}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all duration-150 ${
                            student.status === 'LATE' 
                              ? 'bg-amber-500 text-slate-900 shadow-sm' 
                              : 'text-slate-500 hover:bg-slate-200/50'
                          }`}
                        >
                          Late
                        </button>
                      </div>

                      {/* Remarks */}
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. sick leave)..."
                        value={student.remarks || ''}
                        onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                      />
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={submitAttendanceSheet}
                    className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-primary-950/10 active:scale-[0.98]"
                  >
                    <CheckCircle2 size={16} />
                    <span>Save Attendance</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 sticky top-6">
                <ClipboardList className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-sm font-medium">Attendance Sheet Viewer</p>
                <p className="text-xs text-slate-400 mt-1">Select "Attendance Sheet" on any conducted session to record student statuses.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STUDENT ATTENDANCE PORTAL */}
      {/* ============================================================== */}
      {isStudent && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-outfit">Your Course Attendance</h2>
              <p className="text-sm text-slate-500 mt-1">Keep track of your lectures and attendance compliance stats.</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Semester:</span>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                  className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white font-bold text-primary-700 focus:ring-1 focus:ring-primary-500 shadow-sm"
                >
                  {Array.from({ length: studentSemester }, (_, i) => i + 1).map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg font-mono">
                Req: 75% Min
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentSummary.map((summary) => {
              const isBelowThreshold = summary.percentage < 75.0;
              return (
                <div 
                  key={summary.courseId} 
                  onClick={() => viewStudentCourseLogs(summary)}
                  className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isBelowThreshold ? 'border-rose-100' : 'border-slate-200'
                  }`}
                >
                  {/* Decorative status bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isBelowThreshold ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} />

                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                        {summary.courseCode}
                      </span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mt-3 leading-snug line-clamp-1">{summary.courseTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">Credits: {summary.credits}</p>
                  </div>

                  <div className="mt-6 flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 leading-none">Lectures Held</p>
                      <p className="text-2xl font-black text-slate-850 leading-none">{summary.totalSessions}</p>
                    </div>
                    
                    {/* Ring/Progress highlight */}
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-400">Your Attendance</p>
                      <p className={`text-2xl font-black font-mono leading-none mt-1 ${
                        isBelowThreshold ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {summary.percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ADMIN / STAFF VIEW */}
      {/* ============================================================== */}
      {isAdminOrStaff && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 font-outfit">Institutional Class Attendance Registry</h2>
            <p className="text-sm text-slate-500 mt-1">Monitor course-level class attendance logs across the campus.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School</label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => {
                    setSelectedSchoolId(e.target.value);
                    setSelectedDeptId('');
                    setSelectedCourseId('');
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose School...</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                <select
                  value={selectedDeptId}
                  disabled={!selectedSchoolId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    setSelectedCourseId('');
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Choose Dept...</option>
                  {departments
                    .filter(d => d.schoolId == selectedSchoolId)
                    .map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course</label>
                <select
                  value={selectedCourseId}
                  disabled={!selectedDeptId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Choose Course...</option>
                  {courses
                    .filter(c => c.departmentId == selectedDeptId)
                    .map(c => (
                      <option key={c.id} value={c.id}>[{c.courseCode}] {c.title}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {selectedCourseId ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 text-sm">Conducted Class Sessions</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {adminSessions.length > 0 ? (
                  adminSessions.map(session => (
                    <div key={session.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-500 font-mono bg-slate-900 px-2 py-0.5 rounded">
                            {session.courseCode}
                          </span>
                          <span className="text-slate-800 font-bold text-sm">
                            {session.courseTitle}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{session.topicCovered || 'General Class Lecture'}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            Faculty: {session.facultyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Date: {session.sessionDate}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => loadAttendanceSheet(session)}
                        className="shrink-0 px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs rounded-xl transition-all duration-150 flex items-center gap-1.5"
                      >
                        <Search size={14} />
                        <span>Inspect Sheet</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    No class sessions conducted yet for this course.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              Please select School, Department, and Course to load class attendance registers.
            </div>
          )}

          {/* Admin inspected sheet modal */}
          {activeSession && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh]">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                  <div>
                    <span className="text-xs font-bold text-amber-500 font-mono bg-slate-900 px-2 py-0.5 rounded">
                      {activeSession.courseCode}
                    </span>
                    <h3 className="font-bold text-slate-850 text-base mt-1">Conducted Class Session Registry</h3>
                  </div>
                  <button onClick={() => setActiveSession(null)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs space-y-2">
                    <p><strong>Faculty:</strong> {activeSession.facultyName}</p>
                    <p><strong>Date/Time:</strong> {activeSession.sessionDate} at {activeSession.startTime} - {activeSession.endTime}</p>
                    <p><strong>Topic Covered:</strong> {activeSession.topicCovered || 'N/A'}</p>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="px-4 py-3">Roll No</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceSheet.map((student) => (
                        <tr key={student.studentId} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold font-mono text-slate-800">{student.studentRollNumber}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{student.studentName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                              student.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              student.status === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-450 italic">{student.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button onClick={() => setActiveSession(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shadow">
                    Close Sheet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FACULTY: SCHEDULE SESSION MODAL */}
      {/* ============================================================== */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-base">Schedule New Lecture Session</h3>
              <button onClick={() => setIsScheduleOpen(false)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Course</label>
                <select
                  value={sessionForm.courseId}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, courseId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Choose Course...</option>
                  {(isFaculty ? facultyCourses : courses).map(c => (
                    <option key={c.id} value={c.id}>[{c.courseCode}] {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lecture Date</label>
                <input
                  type="date"
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, sessionDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic Covered</label>
                <input
                  type="text"
                  value={sessionForm.topicCovered}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, topicCovered: e.target.value }))}
                  placeholder="e.g. Intro to Agile Principles..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md disabled:opacity-50"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. STUDENT: COURSE LOGS DETAIL MODAL */}
      {/* ============================================================== */}
      {selectedCourseDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh] animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <span className="text-xs font-bold text-amber-500 font-mono bg-slate-900 px-2 py-0.5 rounded">
                  {selectedCourseDetail.courseCode}
                </span>
                <h3 className="font-bold text-slate-850 text-base mt-1">{selectedCourseDetail.courseTitle} Logs</h3>
              </div>
              <button 
                onClick={() => setSelectedCourseDetail(null)} 
                className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Aggregates row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Present</p>
                  <p className="text-lg font-black text-emerald-800 mt-1">{selectedCourseDetail.presentCount}</p>
                </div>
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <p className="text-[10px] font-bold text-rose-600 uppercase">Absent</p>
                  <p className="text-lg font-black text-rose-800 mt-1">{selectedCourseDetail.absentCount}</p>
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Late</p>
                  <p className="text-lg font-black text-amber-800 mt-1">{selectedCourseDetail.lateCount}</p>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Date-wise Lecture Log</h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {studentLogs.length > 0 ? (
                    studentLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-white flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">
                            {log.sessionDate}
                          </p>
                          <p className="text-xs text-slate-500">
                            Topic: {log.topicCovered || 'General Class Lecture'}
                          </p>
                          {/* Remarks */}
                          {log.remarks && (
                            <p className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 mt-1.5 italic">
                              Remarks: {log.remarks}
                            </p>
                          )}
                        </div>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          log.status === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No lecture attendance recorded for you in this course yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedCourseDetail(null)} 
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shadow"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassAttendanceManagement;
