import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  School, 
  Layers, 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Save, 
  ArrowRight,
  BookMarked
} from 'lucide-react';

const AcademicsManagement = () => {
  const [activeTab, setActiveTab] = useState('schools');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Data States
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [faculties, setFaculties] = useState([]);

  // Modals & Forms
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ id: null, name: '', code: '' });

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ id: null, name: '', code: '', schoolId: '' });

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({ id: null, courseCode: '', title: '', semester: 1, credits: 3, departmentId: '', facultyId: '' });

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/api/faculty/list');
      setFaculties(res.data);
    } catch (err) {
      console.error("Failed to fetch faculties:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchFaculties();
    }
  }, [activeTab]);

  // Syllabus Drawer State
  const [activeSyllabusCourse, setActiveSyllabusCourse] = useState(null);
  const [syllabusForm, setSyllabusForm] = useState({ id: null, description: '', objectives: '', units: [], textbooks: '' });

  // Load Initial Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [schoolsRes, deptsRes] = await Promise.all([
        api.get('/api/schools'),
        api.get('/api/departments')
      ]);
      setSchools(schoolsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      showAlert('error', 'Failed to retrieve academic structures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Courses when filters change
  const fetchCourses = async () => {
    if (!selectedDeptId) {
      setCourses([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/api/courses/department/${selectedDeptId}/semester/${selectedSemester}`);
      setCourses(res.data);
    } catch (err) {
      showAlert('error', 'Failed to retrieve courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedDeptId, selectedSemester]);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // --- SCHOOLS ACTIONS ---
  const openSchoolModal = (school = null) => {
    if (school) {
      setSchoolForm({ id: school.id, name: school.name, code: school.code });
    } else {
      setSchoolForm({ id: null, name: '', code: '' });
    }
    setIsSchoolModalOpen(true);
  };

  const handleSchoolSubmit = async (e) => {
    e.preventDefault();
    try {
      if (schoolForm.id) {
        await api.put(`/api/schools/${schoolForm.id}`, schoolForm);
        showAlert('success', 'School updated successfully.');
      } else {
        await api.post('/api/schools', schoolForm);
        showAlert('success', 'New School registered.');
      }
      setIsSchoolModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save school.');
    }
  };

  const handleDeleteSchool = async (id) => {
    if (!window.confirm('Are you sure you want to delete this school? This will delete all associated departments and courses.')) return;
    try {
      await api.delete(`/api/schools/${id}`);
      showAlert('success', 'School deleted.');
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to delete school.');
    }
  };

  // --- DEPARTMENTS ACTIONS ---
  const openDeptModal = (dept = null) => {
    if (dept) {
      setDeptForm({ id: dept.id, name: dept.name, code: dept.code, schoolId: dept.schoolId });
    } else {
      setDeptForm({ id: null, name: '', code: '', schoolId: schools[0]?.id || '' });
    }
    setIsDeptModalOpen(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      if (deptForm.id) {
        await api.put(`/api/departments/${deptForm.id}`, deptForm);
        showAlert('success', 'Department updated successfully.');
      } else {
        await api.post('/api/departments', deptForm);
        showAlert('success', 'New Department created.');
      }
      setIsDeptModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save department.');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This will delete all associated courses.')) return;
    try {
      await api.delete(`/api/departments/${id}`);
      showAlert('success', 'Department deleted.');
      fetchData();
    } catch (err) {
      showAlert('error', 'Failed to delete department.');
    }
  };

  // --- COURSES ACTIONS ---
  const openCourseModal = (course = null) => {
    if (course) {
      setCourseForm({
        id: course.id,
        courseCode: course.courseCode,
        title: course.title,
        semester: course.semester,
        credits: course.credits,
        departmentId: course.departmentId,
        facultyId: course.facultyId || ''
      });
    } else {
      setCourseForm({
        id: null,
        courseCode: '',
        title: '',
        semester: selectedSemester,
        credits: 3,
        departmentId: selectedDeptId,
        facultyId: ''
      });
    }
    setIsCourseModalOpen(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (courseForm.id) {
        await api.put(`/api/courses/${courseForm.id}`, courseForm);
        showAlert('success', 'Course updated successfully.');
      } else {
        await api.post('/api/courses', courseForm);
        showAlert('success', 'New Course created.');
      }
      setIsCourseModalOpen(false);
      fetchCourses();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save course.');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/api/courses/${id}`);
      showAlert('success', 'Course deleted.');
      fetchCourses();
    } catch (err) {
      showAlert('error', 'Failed to delete course.');
    }
  };

  // --- SYLLABUS ACTIONS ---
  const openSyllabusDrawer = async (course) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/courses/${course.id}/syllabus`);
      const syllabusData = res.data;
      
      let parsedUnits = [];
      if (syllabusData.units) {
        try {
          parsedUnits = typeof syllabusData.units === 'string' 
            ? JSON.parse(syllabusData.units) 
            : syllabusData.units;
        } catch (e) {
          parsedUnits = [];
        }
      }

      setSyllabusForm({
        id: syllabusData.id,
        description: syllabusData.description || '',
        objectives: syllabusData.objectives || '',
        units: parsedUnits,
        textbooks: syllabusData.textbooks || ''
      });
      setActiveSyllabusCourse(course);
    } catch (err) {
      showAlert('error', 'Failed to load course syllabus.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyllabusSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...syllabusForm,
        units: JSON.stringify(syllabusForm.units)
      };
      await api.post(`/api/courses/${activeSyllabusCourse.id}/syllabus`, payload);
      showAlert('success', 'Syllabus updated successfully.');
      setActiveSyllabusCourse(null);
    } catch (err) {
      showAlert('error', 'Failed to save syllabus.');
    }
  };

  const addSyllabusUnit = () => {
    setSyllabusForm(prev => ({
      ...prev,
      units: [...prev.units, { unit: prev.units.length + 1, title: '', content: '' }]
    }));
  };

  const removeSyllabusUnit = (index) => {
    const newUnits = syllabusForm.units.filter((_, i) => i !== index)
      .map((u, idx) => ({ ...u, unit: idx + 1 }));
    setSyllabusForm(prev => ({ ...prev, units: newUnits }));
  };

  const handleUnitChange = (index, field, value) => {
    const updated = syllabusForm.units.map((u, i) => {
      if (i === index) {
        return { ...u, [field]: value };
      }
      return u;
    });
    setSyllabusForm(prev => ({ ...prev, units: updated }));
  };

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

      {/* Modern Premium Tabs bar */}
      <div className="bg-slate-900 p-2 rounded-2xl flex border border-slate-800 shadow-xl max-w-lg">
        <button
          onClick={() => setActiveTab('schools')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'schools' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <School size={16} />
          <span>Schools</span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'departments' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={16} />
          <span>Departments</span>
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'courses' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen size={16} />
          <span>Courses</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SCHOOLS TAB */}
      {/* ============================================================== */}
      {activeTab === 'schools' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-outfit">School Structures</h2>
              <p className="text-sm text-slate-500 mt-1">Manage broad academic schools and educational centers.</p>
            </div>
            <button
              onClick={() => openSchoolModal()}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary-950/10"
            >
              <Plus size={16} />
              <span>Add School</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map(school => (
              <div key={school.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div className="p-6">
                  <div className="inline-block bg-primary-50 border border-primary-100 text-primary-700 px-3 py-1 rounded-xl text-xs font-bold font-mono uppercase">
                    {school.code}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-4 leading-snug">{school.name}</h3>
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => openSchoolModal(school)}
                    className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-primary-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSchool(school.id)}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DEPARTMENTS TAB */}
      {/* ============================================================== */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-outfit">Departments Directory</h2>
              <p className="text-sm text-slate-500 mt-1">Manage departmental divisions operating inside schools.</p>
            </div>
            <button
              onClick={() => openDeptModal()}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-primary-950/10"
            >
              <Plus size={16} />
              <span>Add Department</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Dept Code</th>
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4">Associated School</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {departments.map(dept => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 font-mono">{dept.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{dept.name}</td>
                    <td className="px-6 py-4 text-slate-500">{dept.schoolName}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openDeptModal(dept)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(dept.id)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* COURSES TAB */}
      {/* ============================================================== */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          {/* Left panel: Filters & Course list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 font-outfit text-base">Select Program Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School</label>
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => {
                      setSelectedSchoolId(e.target.value);
                      setSelectedDeptId('');
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
                    onChange={(e) => setSelectedDeptId(e.target.value)}
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedDeptId ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-sm">Course List (Sem {selectedSemester})</h4>
                  <button
                    onClick={() => openCourseModal()}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Add Course</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-3">Code</th>
                        <th className="px-6 py-3">Course Title</th>
                        <th className="px-6 py-3">Teacher</th>
                        <th className="px-6 py-3 text-center">Credits</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {courses.length > 0 ? (
                        courses.map(course => (
                          <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-900 font-mono">{course.courseCode}</td>
                            <td className="px-6 py-4 font-medium text-slate-800">{course.title}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                              {course.facultyName ? course.facultyName : <span className="text-rose-500 italic font-normal">Unassigned</span>}
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-slate-600">{course.credits}</td>
                            <td className="px-6 py-4 text-right flex justify-end gap-1.5 items-center">
                              <button
                                onClick={() => openSyllabusDrawer(course)}
                                className="px-2.5 py-1 text-xs border border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100 font-bold rounded-lg transition-colors flex items-center gap-1"
                                title="Manage Syllabus"
                              >
                                <BookMarked size={12} />
                                <span>Syllabus</span>
                              </button>
                              <button
                                onClick={() => openCourseModal(course)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary-600"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="p-1 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                            No courses registered for this semester. Click "Add Course" to begin.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                Please select a School and Department to view and manage courses.
              </div>
            )}
          </div>

          {/* Right panel: Course syllabus editor */}
          <div className="lg:col-span-1">
            {activeSyllabusCourse ? (
              <form onSubmit={handleSyllabusSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col sticky top-6 animate-slide-up">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider uppercase">{activeSyllabusCourse.courseCode}</span>
                    <h3 className="font-bold text-sm leading-tight mt-0.5 line-clamp-1">{activeSyllabusCourse.title} Syllabus</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveSyllabusCourse(null)}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Description</label>
                    <textarea
                      value={syllabusForm.description}
                      onChange={(e) => setSyllabusForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                      placeholder="Brief overview of the course content..."
                    />
                  </div>

                  {/* Objectives */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Learning Objectives</label>
                    <textarea
                      value={syllabusForm.objectives}
                      onChange={(e) => setSyllabusForm(prev => ({ ...prev, objectives: e.target.value }))}
                      rows="3"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                      placeholder="Objectives students are expected to learn..."
                    />
                  </div>

                  {/* Textbooks */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Recommended Textbooks</label>
                    <textarea
                      value={syllabusForm.textbooks}
                      onChange={(e) => setSyllabusForm(prev => ({ ...prev, textbooks: e.target.value }))}
                      rows="2"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                      placeholder="Title, Author, Publisher details..."
                    />
                  </div>

                  {/* Units dynamic list */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <label className="text-xs font-bold text-slate-500 uppercase">Syllabus Units Breakdown</label>
                      <button
                        type="button"
                        onClick={addSyllabusUnit}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded flex items-center gap-0.5"
                      >
                        <Plus size={10} />
                        <span>Add Unit</span>
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                      {syllabusForm.units.map((unit, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => removeSyllabusUnit(idx)}
                            className="absolute right-2 top-2 p-1 text-slate-400 hover:text-rose-600 rounded bg-white border border-slate-200 hover:border-rose-200 shadow-sm"
                          >
                            <Trash2 size={10} />
                          </button>
                          <div className="font-bold text-xs text-slate-700">Unit {unit.unit}</div>
                          <input
                            type="text"
                            value={unit.title}
                            onChange={(e) => handleUnitChange(idx, 'title', e.target.value)}
                            placeholder="Unit Title..."
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-primary-500"
                            required
                          />
                          <textarea
                            value={unit.content}
                            onChange={(e) => handleUnitChange(idx, 'content', e.target.value)}
                            placeholder="Unit topics..."
                            rows="2"
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-primary-500"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-primary-950/10 active:scale-[0.98]"
                  >
                    <Save size={14} />
                    <span>Save Syllabus</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 sticky top-6">
                <FileText className="mx-auto text-slate-300 mb-3" size={32} />
                <p className="text-sm font-medium">Syllabus Viewer/Editor</p>
                <p className="text-xs text-slate-400 mt-1">Select "Syllabus" on any course to edit its units and content.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCHOOL MODAL */}
      {/* ============================================================== */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-base">
                {schoolForm.id ? 'Edit School Details' : 'Register New School'}
              </h3>
              <button onClick={() => setIsSchoolModalOpen(false)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSchoolSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School Code</label>
                <input
                  type="text"
                  value={schoolForm.code}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SOET"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School Name</label>
                <input
                  type="text"
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. School of Engineering & Technology"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSchoolModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DEPARTMENT MODAL */}
      {/* ============================================================== */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-base">
                {deptForm.id ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent School</label>
                <select
                  value={deptForm.schoolId}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, schoolId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department Code</label>
                <input
                  type="text"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. CSE"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department Name</label>
                <input
                  type="text"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* COURSE MODAL */}
      {/* ============================================================== */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-800 font-outfit text-base">
                {courseForm.id ? 'Edit Course Details' : 'Create New Course'}
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Code</label>
                <input
                  type="text"
                  value={courseForm.courseCode}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. CS-301"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Title</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Software Engineering"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
                  <select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Credits</label>
                  <input
                    type="number"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                    min="1"
                    max="6"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Teacher</label>
                <select
                  value={courseForm.facultyId || ''}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, facultyId: e.target.value ? parseInt(e.target.value) : '' }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Faculty...</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicsManagement;
