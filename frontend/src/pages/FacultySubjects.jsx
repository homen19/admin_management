import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BookMarked,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  Target,
  ListChecks,
  BookCopy,
  GraduationCap,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Skeleton loader for individual cards
───────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="h-6 w-24 bg-slate-200 rounded-lg" />
      <div className="h-5 w-16 bg-slate-100 rounded-full" />
    </div>
    <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
    <div className="h-4 w-1/2 bg-slate-100 rounded mb-6" />
    <div className="flex gap-3">
      <div className="h-7 w-24 bg-slate-100 rounded-full" />
      <div className="h-7 w-20 bg-slate-100 rounded-full" />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Syllabus section row
───────────────────────────────────────── */
const SyllabusRow = ({ icon: Icon, label, content }) => {
  if (!content || content === '[]' || content.trim() === '') return null;

  let displayContent = content;
  // Try to pretty-print JSON arrays (units field)
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      displayContent = parsed;
    }
  } catch {
    // Not JSON, render as plain text
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-primary-500 shrink-0" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      {Array.isArray(displayContent) ? (
        <ol className="list-decimal list-inside space-y-1">
          {displayContent.map((unit, idx) => (
            <li key={idx} className="text-sm text-slate-700">
              {typeof unit === 'object' ? (unit.title || JSON.stringify(unit)) : unit}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{displayContent}</p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Individual course card
───────────────────────────────────────── */
const CourseCard = ({ course }) => {
  const [expanded, setExpanded] = useState(false);
  const [syllabus, setSyllabus] = useState(null);
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusError, setSyllabusError] = useState('');

  const semesterColors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-cyan-100 text-cyan-700',
    'bg-teal-100 text-teal-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
  ];
  const semColor = semesterColors[(course.semester - 1) % semesterColors.length] || 'bg-slate-100 text-slate-700';

  const toggleSyllabus = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (syllabus) return; // already fetched
    setSyllabusLoading(true);
    setSyllabusError('');
    try {
      const res = await api.get(`/api/courses/${course.id}/syllabus`);
      setSyllabus(res.data);
    } catch {
      setSyllabusError('Could not load syllabus. Please try again.');
    } finally {
      setSyllabusLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Card header */}
      <div className="p-6">
        {/* Top row: code badge + semester pill */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold px-3 py-1 rounded-lg tracking-wider uppercase">
            <BookMarked size={12} />
            {course.courseCode}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${semColor}`}>
            Sem {course.semester}
          </span>
        </div>

        {/* Course title */}
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">
          {course.title}
        </h3>

        {/* Department */}
        <p className="text-xs text-slate-500 mb-4">
          {course.departmentName} {course.departmentCode ? `(${course.departmentCode})` : ''}
        </p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Award size={11} />
            {course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Layers size={11} />
            {course.departmentCode || course.departmentName}
          </span>
        </div>
      </div>

      {/* Syllabus toggle button */}
      <div className="border-t border-slate-100">
        <button
          onClick={toggleSyllabus}
          className="w-full flex items-center justify-between px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={14} className="text-primary-500" />
            View Syllabus
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Syllabus accordion body */}
        {expanded && (
          <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/60">
            {syllabusLoading ? (
              <div className="flex items-center gap-2 pt-4 text-sm text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                Loading syllabus…
              </div>
            ) : syllabusError ? (
              <div className="flex items-center gap-2 pt-4 text-sm text-rose-500">
                <AlertCircle size={14} />
                {syllabusError}
              </div>
            ) : syllabus ? (
              <div className="divide-y divide-slate-100">
                <SyllabusRow icon={BookOpen}   label="Description" content={syllabus.description} />
                <SyllabusRow icon={Target}     label="Objectives"  content={syllabus.objectives} />
                <SyllabusRow icon={ListChecks} label="Units / Topics" content={syllabus.units} />
                <SyllabusRow icon={BookCopy}   label="Textbooks"   content={syllabus.textbooks} />
                {!syllabus.description && !syllabus.objectives && !syllabus.units && !syllabus.textbooks && (
                  <p className="pt-4 text-sm text-slate-400 italic">No syllabus content has been added yet.</p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Main page component
───────────────────────────────────────── */
const FacultySubjects = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignedCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/courses/assigned');
        setCourses(res.data);
      } catch {
        setError('Failed to load your assigned subjects. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedCourses();
  }, []);

  /* ── Derived stats ── */
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const semesters = [...new Set(courses.map((c) => c.semester))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary-50 border border-primary-200 rounded-xl text-primary-600">
          <GraduationCap size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Assigned Subjects</h2>
          <p className="text-sm text-slate-500">Courses assigned to you by the administration</p>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="p-2.5 bg-primary-50 rounded-xl border border-primary-100 text-primary-600">
              <BookMarked size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
              <p className="text-xs text-slate-500 font-medium">
                {courses.length === 1 ? 'Subject' : 'Subjects'} Assigned
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
              <Award size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalCredits}</p>
              <p className="text-xs text-slate-500 font-medium">Total Credits</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{semesters.length}</p>
              <p className="text-xs text-slate-500 font-medium">
                {semesters.length === 1 ? 'Semester' : 'Semesters'} Covered
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-4 bg-slate-100 rounded-full mb-4">
            <BookMarked size={32} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700 text-lg mb-1">No Subjects Assigned Yet</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            You haven't been assigned any subjects yet. Please contact the administrator to get subjects assigned to your profile.
          </p>
        </div>
      )}

      {/* ── Course cards grid ── */}
      {!loading && !error && courses.length > 0 && (
        <>
          {semesters.map((sem) => {
            const semCourses = courses.filter((c) => c.semester === sem);
            return (
              <div key={sem}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Semester {sem}
                  </h3>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">
                    {semCourses.length} {semCourses.length === 1 ? 'course' : 'courses'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {semCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default FacultySubjects;
