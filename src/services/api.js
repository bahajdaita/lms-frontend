import axios from 'axios';

// Updated to correct port
const API_BASE_URL = 'http://localhost:3004/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Axios response interceptor error:', error.response?.status);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Course API
export const courseAPI = {
  getAllCourses: () => api.get('/courses'),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  getInstructorCourses: (instructorId) => api.get(`/courses/instructor/${instructorId}`),
  searchCourses: (query) => api.get(`/courses/search?q=${query}`),
};

// Category API
export const categoryAPI = {
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Module API
export const moduleAPI = {
  getCourseModules: (courseId) => api.get(`/modules/course/${courseId}`),
  getModuleById: (id) => api.get(`/modules/${id}`),
  createModule: (moduleData) => {
    console.log('API: Creating module with data:', moduleData);
    return api.post('/modules', moduleData);
  },
  updateModule: (id, moduleData) => api.put(`/modules/${id}`, moduleData),
  deleteModule: (id) => api.delete(`/modules/${id}`),
};

// Lesson API
export const lessonAPI = {
  getModuleLessons: (moduleId) => api.get(`/lessons/module/${moduleId}`),
  getLessonById: (id) => api.get(`/lessons/${id}`),
  createLesson: (lessonData) => {
    console.log('API: Creating lesson with data:', lessonData);
    return api.post('/lessons', lessonData);
  },
  updateLesson: (id, lessonData) => api.put(`/lessons/${id}`, lessonData),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
};

// ✅ COMPLETE ENROLLMENT API
export const enrollmentAPI = {
  // Core enrollment functions
  enrollInCourse: (courseId) => api.post('/enrollments', { course_id: courseId }),
  checkEnrollmentStatus: (courseId) => api.get(`/enrollments/course/${courseId}/status`),
  getMyEnrollments: (params = {}) => api.get('/enrollments/my', { params }),
  unenrollFromCourse: (courseId) => api.delete(`/enrollments/course/${courseId}`),
  
  // Progress tracking
  updateProgress: (courseId, progress) => api.put(`/enrollments/course/${courseId}/progress`, { progress }),
  getCourseProgress: (courseId) => api.get(`/enrollments/course/${courseId}/progress`),
  
  // Instructor features
  getCourseEnrollments: (courseId, params = {}) => api.get(`/enrollments/course/${courseId}/students`, { params }),
  getInstructorEnrollments: (instructorId, params = {}) => api.get(`/enrollments/instructor/${instructorId}`, { params }),
  getTopStudents: (courseId, limit = 10) => api.get(`/enrollments/course/${courseId}/top-students?limit=${limit}`),
  
  // Analytics
  getEnrollmentAnalytics: (courseId, days = 30) => api.get(`/enrollments/course/${courseId}/analytics?days=${days}`),
  getRecommendedCourses: (limit = 5) => api.get(`/enrollments/recommended?limit=${limit}`),
  
  // Admin features
  getEnrollmentStats: () => api.get('/enrollments/stats'),
  getRecentEnrollments: (limit = 10) => api.get(`/enrollments/recent?limit=${limit}`),
  bulkEnrollUsers: (userIds, courseId) => api.post('/enrollments/bulk', { userIds, courseId }),
};

// ✅ COMPLETE QUIZ API - matches your backend routes
export const quizAPI = {
  // Get quizzes for a lesson
  getLessonQuizzes: (lessonId) => api.get(`/quizzes/lesson/${lessonId}`),
  
  // Submit quiz answers (students)
  submitQuizAnswers: (lessonId, answers) => api.post(`/quizzes/lesson/${lessonId}/submit`, { answers }),
  
  // Get quiz by ID
  getQuizById: (quizId) => api.get(`/quizzes/${quizId}`),
  
  // Get quiz stats (instructor)
  getQuizStats: (lessonId) => api.get(`/quizzes/lesson/${lessonId}/stats`),
  
  // ✅ INSTRUCTOR QUIZ MANAGEMENT
  createQuiz: (quizData) => api.post('/quizzes', quizData),
  updateQuiz: (quizId, quizData) => api.put(`/quizzes/${quizId}`, quizData),
  deleteQuiz: (quizId) => api.delete(`/quizzes/${quizId}`),
  bulkCreateQuizzes: (lessonId, quizzes) => api.post(`/quizzes/lesson/${lessonId}/bulk`, { quizzes }),
  duplicateQuiz: (quizId, targetLessonId) => api.post(`/quizzes/${quizId}/duplicate`, { targetLessonId }),
};

// ✅ COMPLETE ASSIGNMENT API - matches your backend routes  
export const assignmentAPI = {
  // Get assignments for a lesson
  getLessonAssignments: (lessonId) => api.get(`/assignments/lesson/${lessonId}`),
  
  // Get assignments by course
  getAssignmentsByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  
  // Get assignment by ID
  getAssignmentById: (assignmentId) => api.get(`/assignments/${assignmentId}`),
  
  // Get assignment stats
  getAssignmentStats: (assignmentId) => api.get(`/assignments/${assignmentId}/stats`),
  
  // ✅ INSTRUCTOR ASSIGNMENT MANAGEMENT
  createAssignment: (assignmentData) => api.post('/assignments', assignmentData),
  updateAssignment: (assignmentId, assignmentData) => api.put(`/assignments/${assignmentId}`, assignmentData),
  deleteAssignment: (assignmentId) => api.delete(`/assignments/${assignmentId}`),
};

// ✅ COMPLETE SUBMISSION API - matches your backend routes
export const submissionAPI = {
  // Submit assignment (students with file support)
  submitAssignment: (assignmentId, formData) => api.post(`/submissions/assignment/${assignmentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get my submissions (students)
  getMySubmissions: (params = {}) => api.get('/submissions/my', { params }),
  
  // Get submission by ID
  getSubmissionById: (submissionId) => api.get(`/submissions/${submissionId}`),
  
  // Get submissions for assignment (instructors)
  getAssignmentSubmissions: (assignmentId, params = {}) => api.get(`/submissions/assignment/${assignmentId}`, { params }),
  
  // Update submission (students)
  updateSubmission: (submissionId, data) => api.put(`/submissions/${submissionId}`, data),
  
  // Delete submission (students)
  deleteSubmission: (submissionId) => api.delete(`/submissions/${submissionId}`),
  
  // ✅ INSTRUCTOR GRADING
  gradeSubmission: (submissionId, gradeData) => api.put(`/submissions/${submissionId}/grade`, gradeData),
  bulkGradeSubmissions: (assignmentId, grades) => api.post(`/submissions/assignment/${assignmentId}/bulk-grade`, { grades }),
  getSubmissionStats: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}/stats`),
};

export default api;