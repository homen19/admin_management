import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import FacultyManagement from './pages/FacultyManagement';
import LeaveRequests from './pages/LeaveRequests';
import Notices from './pages/Notices';
import Complaints from './pages/Complaints';
import ReportsAnalytics from './pages/ReportsAnalytics';
import UserManagement from './pages/UserManagement';
import ActivityLog from './pages/ActivityLog';
import Profile from './pages/Profile';
import HostelManagement from './pages/HostelManagement';
import Calendar from './pages/Calendar';
import Attendance from './pages/Attendance';
import LibraryManagement from './pages/LibraryManagement';
import AcademicsManagement from './pages/AcademicsManagement';
import ClassAttendanceManagement from './pages/ClassAttendanceManagement';
import FacultySubjects from './pages/FacultySubjects';
import FinanceManagement from './pages/FinanceManagement';
import Chat from './pages/Chat';
import TransportManagement from './pages/TransportManagement';
import InventoryManagement from './pages/InventoryManagement';
import TaskManagement from './pages/TaskManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']}>
                <DashboardLayout title="Student Admission" />
              </ProtectedRoute>
            }
          >
            <Route path="/students" element={<StudentManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY']}>
                <DashboardLayout title="Faculty Directory" />
              </ProtectedRoute>
            }
          >
            <Route path="/faculty" element={<FacultyManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Leave Applications" />
              </ProtectedRoute>
            }
          >
            <Route path="/leaves" element={<LeaveRequests />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Notice Board" />
              </ProtectedRoute>
            }
          >
            <Route path="/notices" element={<Notices />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT']}>
                <DashboardLayout title="Complaints & Support Tickets" />
              </ProtectedRoute>
            }
          >
            <Route path="/complaints" element={<Complaints />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']}>
                <DashboardLayout title="Reports & Institutional Analytics" />
              </ProtectedRoute>
            }
          >
            <Route path="/reports" element={<ReportsAnalytics />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_LIBRARIAN', 'ROLE_FINANCE', 'ROLE_INVENTORY_ADMIN', 'ROLE_DRIVER']}>
                <DashboardLayout title="Staff Task Board" />
              </ProtectedRoute>
            }
          >
            <Route path="/tasks" element={<TaskManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <DashboardLayout title="User Management" />
              </ProtectedRoute>
            }
          >
            <Route path="/users" element={<UserManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <DashboardLayout title="Activity Logs" />
              </ProtectedRoute>
            }
          >
            <Route path="/logs" element={<ActivityLog />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout title="My Profile" />
              </ProtectedRoute>
            }
          >
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT']}>
                <DashboardLayout title="Hostel Accommodation Management" />
              </ProtectedRoute>
            }
          >
            <Route path="/hostels" element={<HostelManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_STUDENT']}>
                <DashboardLayout title="Transport & Fleet Management" />
              </ProtectedRoute>
            }
          >
            <Route path="/transport" element={<TransportManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Academic & Event Calendar" />
              </ProtectedRoute>
            }
          >
            <Route path="/calendar" element={<Calendar />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY']}>
                <DashboardLayout title="Staff & Faculty Attendance" />
              </ProtectedRoute>
            }
          >
            <Route path="/attendance" element={<Attendance />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_LIBRARIAN', 'ROLE_FACULTY', 'ROLE_STUDENT']}>
                <DashboardLayout title="Library Management System" />
              </ProtectedRoute>
            }
          >
            <Route path="/library" element={<LibraryManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']}>
                <DashboardLayout title="Academics Structure Management" />
              </ProtectedRoute>
            }
          >
            <Route path="/academics" element={<AcademicsManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_FACULTY']}>
                <DashboardLayout title="My Assigned Subjects" />
              </ProtectedRoute>
            }
          >
            <Route path="/my-subjects" element={<FacultySubjects />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_STUDENT']}>
                <DashboardLayout title="Class Attendance Tracking" />
              </ProtectedRoute>
            }
          >
            <Route path="/class-attendance" element={<ClassAttendanceManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_FINANCE']}>
                <DashboardLayout title="Finance Department" />
              </ProtectedRoute>
            }
          >
            <Route path="/finance" element={<FinanceManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_INVENTORY_ADMIN']}>
                <DashboardLayout title="Inventory & Asset Management" />
              </ProtectedRoute>
            }
          >
            <Route path="/inventory" element={<InventoryManagement />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_FACULTY', 'ROLE_LIBRARIAN']}>
                <DashboardLayout title="CliqChat" />
              </ProtectedRoute>
            }
          >
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:channelId" element={<Chat />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
