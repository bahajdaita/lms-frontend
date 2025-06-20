import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Add,
  Delete,
  DragIndicator,
  PlayCircle,
  Assignment,
  School,
  Visibility,
  Quiz,
  MoreVert,
  Grade,
  People
} from '@mui/icons-material';
import { courseAPI, moduleAPI, lessonAPI, quizAPI, assignmentAPI } from '../services/api';
import QuizCreator from './QuizCreator';
import AssignmentCreator from './AssignmentCreator';
import toast from 'react-hot-toast';

const CourseManage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonQuizCounts, setLessonQuizCounts] = useState({});
  const [lessonAssignmentCounts, setLessonAssignmentCounts] = useState({});
  
  // Dialog states
  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [openLessonDialog, setOpenLessonDialog] = useState(false);
  const [openQuizCreator, setOpenQuizCreator] = useState(false);
  const [openAssignmentCreator, setOpenAssignmentCreator] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  
  // Menu state
  const [lessonMenuAnchor, setLessonMenuAnchor] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Form states
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', video_url: '', duration: '' });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await courseAPI.getCourseById(courseId);
      setCourse(courseRes.data.data);

      // Fetch modules
      try {
        const modulesRes = await moduleAPI.getCourseModules(courseId);
        console.log('Raw modules response:', modulesRes.data);
        
        const responseData = modulesRes.data.data || modulesRes.data;
        
        let modulesData;
        if (responseData && responseData.modules) {
          modulesData = responseData.modules;
        } else if (Array.isArray(responseData)) {
          modulesData = responseData;
        } else {
          modulesData = [];
        }
        
        console.log('Final modules data:', modulesData);
        setModules(Array.isArray(modulesData) ? modulesData : []);
      } catch (moduleError) {
        console.error('Error fetching modules:', moduleError);
        setModules([]);
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleLessons = async (moduleId) => {
    try {
      const lessonsRes = await lessonAPI.getModuleLessons(moduleId);
      
      const responseData = lessonsRes.data.data || lessonsRes.data;
      let lessonsData;
      
      if (responseData && responseData.lessons) {
        lessonsData = responseData.lessons;
      } else if (Array.isArray(responseData)) {
        lessonsData = responseData;
      } else {
        lessonsData = [];
      }
      
      console.log('Fetched lessons for module', moduleId, ':', lessonsData);
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      setSelectedModule(moduleId);
      
      // Fetch quiz and assignment counts for these lessons
      await fetchLessonCounts(lessonsData);
      
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
      toast.error('Failed to load lessons');
    }
  };

  const fetchLessonCounts = async (lessonsData) => {
    try {
      const quizCounts = {};
      const assignmentCounts = {};
      
      // Fetch counts for each lesson
      for (const lesson of lessonsData) {
        try {
          // Get quiz count
          const quizRes = await quizAPI.getLessonQuizzes(lesson.id);
          const quizData = quizRes.data.data || [];
          quizCounts[lesson.id] = Array.isArray(quizData) ? quizData.length : 0;
          
          // Get assignment count
          const assignmentRes = await assignmentAPI.getLessonAssignments(lesson.id);
          const assignmentData = assignmentRes.data.data || [];
          assignmentCounts[lesson.id] = Array.isArray(assignmentData) ? assignmentData.length : 0;
        } catch (error) {
          console.log(`Failed to fetch counts for lesson ${lesson.id}:`, error);
          quizCounts[lesson.id] = 0;
          assignmentCounts[lesson.id] = 0;
        }
      }
      
      setLessonQuizCounts(quizCounts);
      setLessonAssignmentCounts(assignmentCounts);
    } catch (error) {
      console.error('Error fetching lesson counts:', error);
    }
  };

  const handleCreateModule = async () => {
    try {
      const moduleData = {
        title: moduleForm.title.trim(),
        description: moduleForm.description.trim() || null,
        course_id: parseInt(courseId),
        position: (modules && Array.isArray(modules)) ? modules.length + 1 : 1,
        is_published: true
      };

      console.log('Creating module with data:', moduleData);

      await moduleAPI.createModule(moduleData);
      toast.success('Module created successfully! 🎉');
      
      setOpenModuleDialog(false);
      setModuleForm({ title: '', description: '' });
      await fetchCourseData();
      
    } catch (error) {
      console.error('Error creating module:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to create module';
      toast.error(message);
    }
  };

  const handleCreateLesson = async () => {
    try {
      const lessonData = {
        title: lessonForm.title.trim(),
        content: lessonForm.content.trim() || null,
        video_url: lessonForm.video_url.trim() || null,
        duration: lessonForm.duration.trim() || null,
        module_id: selectedModule,
        position: (lessons && Array.isArray(lessons)) ? lessons.length + 1 : 1,
        is_published: true
      };

      console.log('Creating lesson with data:', lessonData);

      await lessonAPI.createLesson(lessonData);
      toast.success('Lesson created successfully! 🎉');
      
      setOpenLessonDialog(false);
      setLessonForm({ title: '', content: '', video_url: '', duration: '' });
      await fetchModuleLessons(selectedModule);
      
    } catch (error) {
      console.error('Error creating lesson:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to create lesson';
      toast.error(message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module? This will also delete all lessons in this module.')) {
      try {
        await moduleAPI.deleteModule(moduleId);
        toast.success('Module deleted successfully');
        
        if (selectedModule === moduleId) {
          setSelectedModule(null);
          setLessons([]);
        }
        
        await fetchCourseData();
      } catch (error) {
        console.error('Error deleting module:', error);
        toast.error('Failed to delete module');
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await lessonAPI.deleteLesson(lessonId);
        toast.success('Lesson deleted successfully');
        await fetchModuleLessons(selectedModule);
      } catch (error) {
        console.error('Error deleting lesson:', error);
        toast.error('Failed to delete lesson');
      }
    }
  };

  const handleLessonMenuOpen = (event, lesson) => {
    setLessonMenuAnchor(event.currentTarget);
    setSelectedLesson(lesson);
  };

  const handleLessonMenuClose = () => {
    setLessonMenuAnchor(null);
    setSelectedLesson(null);
  };

  const handleOpenQuizCreator = (lessonId) => {
    setSelectedLessonId(lessonId);
    setOpenQuizCreator(true);
    handleLessonMenuClose();
  };

  const handleOpenAssignmentCreator = (lessonId) => {
    setSelectedLessonId(lessonId);
    setOpenAssignmentCreator(true);
    handleLessonMenuClose();
  };

  const handleViewSubmissions = async (lessonId) => {
    try {
      // Get assignments for this lesson
      const assignmentRes = await assignmentAPI.getLessonAssignments(lessonId);
      const assignments = assignmentRes.data.data || [];
      
      if (assignments.length === 0) {
        toast.info('No assignments found for this lesson');
        return;
      }
      
      // Navigate to submission grader for the first assignment
      navigate(`/instructor/submissions/${assignments[0].id}`);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    }
    handleLessonMenuClose();
  };

  const handleQuizCreated = async () => {
    if (selectedModule) {
      await fetchModuleLessons(selectedModule);
    }
  };

  const handleAssignmentCreated = async () => {
    if (selectedModule) {
      await fetchModuleLessons(selectedModule);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading course content...</Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="error">Course not found</Typography>
        <Button onClick={() => navigate('/instructor/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/instructor/dashboard')}
          sx={{ mb: 2, color: '#1865f2' }}
        >
          Back to Dashboard
        </Button>
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
              {course.title} 📚
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your course content, quizzes, and assignments
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => navigate(`/student/course/${courseId}`)}
              sx={{ borderColor: '#00a60e', color: '#00a60e' }}
            >
              Preview
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/instructor/course/${courseId}/edit`)}
              sx={{ borderColor: '#1865f2', color: '#1865f2' }}
            >
              Edit Details
            </Button>
          </Box>
        </Box>

        {/* Course Info */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {course.description}
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip 
                    label={course.level?.charAt(0).toUpperCase() + course.level?.slice(1)} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={course.is_published ? 'Published' : 'Draft'} 
                    color={course.is_published ? 'success' : 'warning'}
                    size="small" 
                  />
                  <Chip 
                    label={course.price > 0 ? `$${course.price}` : 'Free'} 
                    color="info" 
                    size="small" 
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" gap={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="#1865f2">
                      {modules?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Modules
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="#00a60e">
                      {lessons?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Lessons
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="#ff8c00">
                      {course.enrolled_students || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Students
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={3}>
        {/* Modules Panel */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Course Modules 📖
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setOpenModuleDialog(true)}
                  sx={{
                    background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                    borderRadius: 3
                  }}
                >
                  Add Module
                </Button>
              </Box>

              <List>
                {modules && modules.length > 0 ? (
                  modules.map((module, index) => (
                    <ListItem
                      key={module.id}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: selectedModule === module.id ? '#f0f9ff' : 'white',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                      onClick={() => fetchModuleLessons(module.id)}
                    >
                      <DragIndicator sx={{ color: '#ccc', mr: 1 }} />
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="600">
                            {index + 1}. {module.title}
                          </Typography>
                        }
                        secondary={module.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.id);
                          }}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                ) : (
                  <Box textAlign="center" py={4}>
                    <School sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No modules yet. Create your first module!
                    </Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Lessons Panel */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  {selectedModule ? 'Module Lessons 📝' : 'Select a Module'}
                </Typography>
                {selectedModule && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setOpenLessonDialog(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #00a60e, #4caf50)',
                      borderRadius: 3
                    }}
                  >
                    Add Lesson
                  </Button>
                )}
              </Box>

              {selectedModule ? (
                <List>
                  {lessons && lessons.length > 0 ? (
                    lessons.map((lesson, index) => (
                      <ListItem
                        key={lesson.id}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: 'white'
                        }}
                      >
                        <PlayCircle sx={{ color: '#00a60e', mr: 2 }} />
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight="600">
                                {index + 1}. {lesson.title}
                              </Typography>
                              {lessonQuizCounts[lesson.id] > 0 && (
                                <Chip
                                  icon={<Quiz />}
                                  label={lessonQuizCounts[lesson.id]}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              {lessonAssignmentCounts[lesson.id] > 0 && (
                                <Chip
                                  icon={<Assignment />}
                                  label={lessonAssignmentCounts[lesson.id]}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={lesson.duration ? `Duration: ${lesson.duration}` : 'No duration set'}
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" gap={1}>
                            <IconButton
                              size="small"
                              onClick={(e) => handleLessonMenuOpen(e, lesson)}
                              sx={{ color: '#1865f2' }}
                            >
                              <MoreVert />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              sx={{ color: '#f44336' }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  ) : (
                    <Box textAlign="center" py={4}>
                      <PlayCircle sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No lessons in this module yet.
                      </Typography>
                    </Box>
                  )}
                </List>
              ) : (
                <Box textAlign="center" py={6}>
                  <Typography variant="body2" color="text.secondary">
                    👈 Select a module from the left to view and manage its lessons
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lesson Actions Menu */}
      <Menu
        anchorEl={lessonMenuAnchor}
        open={Boolean(lessonMenuAnchor)}
        onClose={handleLessonMenuClose}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => handleOpenQuizCreator(selectedLesson?.id)}>
          <Quiz sx={{ mr: 2, color: '#1865f2' }} />
          Add Quiz
        </MenuItem>
        <MenuItem onClick={() => handleOpenAssignmentCreator(selectedLesson?.id)}>
          <Assignment sx={{ mr: 2, color: '#9c27b0' }} />
          Add Assignment
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleViewSubmissions(selectedLesson?.id)}>
          <People sx={{ mr: 2, color: '#00a60e' }} />
          View Submissions
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/student/course/${courseId}/lesson/${selectedLesson?.id}`);
          handleLessonMenuClose();
        }}>
          <Visibility sx={{ mr: 2, color: '#ff8c00' }} />
          Preview Lesson
        </MenuItem>
      </Menu>

      {/* Create Module Dialog */}
      <Dialog 
        open={openModuleDialog} 
        onClose={() => setOpenModuleDialog(false)}
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>Create New Module</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Module Title"
            value={moduleForm.title}
            onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
            margin="normal"
            placeholder="e.g., Introduction to React"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Module Description (Optional)"
            value={moduleForm.description}
            onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
            margin="normal"
            placeholder="Brief description of what this module covers..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModuleDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateModule}
            variant="contained"
            disabled={!moduleForm.title.trim()}
            sx={{ background: 'linear-gradient(45deg, #1865f2, #42a5f5)' }}
          >
            Create Module
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog 
        open={openLessonDialog} 
        onClose={() => setOpenLessonDialog(false)}
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>Create New Lesson</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Lesson Title"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
            margin="normal"
            placeholder="e.g., Setting up your development environment"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lesson Content (Optional)"
            value={lessonForm.content}
            onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
            margin="normal"
            placeholder="Write your lesson content here..."
          />
          <TextField
            fullWidth
            label="Video URL (Optional)"
            value={lessonForm.video_url}
            onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})}
            margin="normal"
            placeholder="https://youtube.com/watch?v=..."
          />
          <TextField
            fullWidth
            label="Duration (Optional)"
            value={lessonForm.duration}
            onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
            margin="normal"
            placeholder="e.g., 15 minutes, 1 hour"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLessonDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateLesson}
            variant="contained"
            disabled={!lessonForm.title.trim()}
            sx={{ background: 'linear-gradient(45deg, #00a60e, #4caf50)' }}
          >
            Create Lesson
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Creator Dialog */}
      <QuizCreator
        open={openQuizCreator}
        onClose={() => setOpenQuizCreator(false)}
        lessonId={selectedLessonId}
        onQuizCreated={handleQuizCreated}
      />

      {/* Assignment Creator Dialog */}
      <AssignmentCreator
        open={openAssignmentCreator}
        onClose={() => setOpenAssignmentCreator(false)}
        lessonId={selectedLessonId}
        onAssignmentCreated={handleAssignmentCreated}
      />
    </Box>
  );
};

export default CourseManage;