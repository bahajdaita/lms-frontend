import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import theme from './utils/theme';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import CourseCatalog from './pages/CourseCatalog';
import StudentCourseView from './pages/StudentCourseView';
import LessonView from './pages/LessonView';

// Instructor Pages
import InstructorDashboard from './pages/InstructorDashboard';
import CourseCreate from './pages/CourseCreate';
import CourseEdit from './pages/CourseEdit';
import CourseManage from './pages/CourseManage';

// Admin Pages (placeholder for now)
const AdminDashboard = () => (
  <Layout>
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Admin Dashboard - Coming Soon! ⚙️</h2>
      <p>This will include user management, system settings, and reports.</p>
    </div>
  </Layout>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with Layout */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="courses" element={<CourseCatalog />} />
                      <Route path="course/:courseId" element={<StudentCourseView />} />
                      <Route path="course/:courseId/lesson/:lessonId" element={<LessonView />} />
                      <Route path="*" element={<Navigate to="/student/dashboard" />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/instructor/*"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<InstructorDashboard />} />
                      <Route path="courses" element={<InstructorDashboard />} />
                      <Route path="students" element={<InstructorDashboard />} />
                      <Route path="analytics" element={<InstructorDashboard />} />
                      <Route path="course/create" element={<CourseCreate />} />
                      <Route path="course/:courseId/edit" element={<CourseEdit />} />
                      <Route path="course/:courseId/manage" element={<CourseManage />} />
                      <Route path="*" element={<Navigate to="/instructor/dashboard" />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Default Redirects */}
            <Route path="/" element={<Navigate to="/student/dashboard" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#333',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e8f5e8',
            },
            success: {
              iconTheme: {
                primary: '#00a60e',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f44336',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;