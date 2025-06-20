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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  PlayCircle,
  CheckCircle,
  Lock,
  ExpandMore,
  School,
  Schedule,
  People,
  Star,
  Language,
  Assignment,
  VideoLibrary
} from '@mui/icons-material';
import { courseAPI, moduleAPI, lessonAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false); // ✅ REAL STATE
  const [enrolling, setEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [expandedModule, setExpandedModule] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      checkEnrollmentStatus();
    }
  }, [courseId]);

  // ✅ NEW: Check real enrollment status
  const checkEnrollmentStatus = async () => {
    if (!user) {
      setCheckingEnrollment(false);
      return;
    }

    try {
      setCheckingEnrollment(true);
      const response = await enrollmentAPI.checkEnrollmentStatus(courseId);
      
      if (response.data.success) {
        setIsEnrolled(response.data.data.isEnrolled);
        setEnrollmentData(response.data.data.enrollment);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await courseAPI.getCourseById(courseId);
      setCourse(courseRes.data.data);

      // Fetch course modules with lessons
      try {
        const modulesRes = await moduleAPI.getCourseModules(courseId);
        let modulesData = [];
        
        if (modulesRes.data?.data?.modules) {
          modulesData = modulesRes.data.data.modules;
        } else if (modulesRes.data?.data && Array.isArray(modulesRes.data.data)) {
          modulesData = modulesRes.data.data;
        } else if (modulesRes.data?.modules) {
          modulesData = modulesRes.data.modules;
        } else if (Array.isArray(modulesRes.data)) {
          modulesData = modulesRes.data;
        }

        if (!Array.isArray(modulesData)) {
          console.error('❌ Modules data is not an array:', modulesData);
          setModules([]);
          return;
        }

        // Fetch lessons for each module
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (module) => {
            try {
              const lessonsRes = await lessonAPI.getModuleLessons(module.id);
              let lessonsData = [];
              
              if (lessonsRes.data?.data?.lessons) {
                lessonsData = lessonsRes.data.data.lessons;
              } else if (lessonsRes.data?.data && Array.isArray(lessonsRes.data.data)) {
                lessonsData = lessonsRes.data.data;
              } else if (lessonsRes.data?.lessons) {
                lessonsData = lessonsRes.data.lessons;
              } else if (Array.isArray(lessonsRes.data)) {
                lessonsData = lessonsRes.data;
              }

              return {
                ...module,
                lessons: lessonsData || []
              };
            } catch {
              return {
                ...module,
                lessons: []
              };
            }
          })
        );

        setModules(modulesWithLessons);

      } catch (moduleError) {
        console.error('❌ Error fetching modules:', moduleError);
        setModules([]);
      }

    } catch (error) {
      console.error('❌ Error fetching course data:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Real enrollment function
  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in courses');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      const response = await enrollmentAPI.enrollInCourse(courseId);
      
      if (response.data.success) {
        toast.success('🎉 Successfully enrolled in the course!');
        setIsEnrolled(true);
        setEnrollmentData(response.data.data);
        // Refresh enrollment status
        checkEnrollmentStatus();
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to enroll in course');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedModule(isExpanded ? panel : false);
  };

  // Calculate total lessons
  const totalLessons = modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);

  if (loading || checkingEnrollment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading course...</Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="error">Course not found</Typography>
        <Button onClick={() => navigate('/student/courses')} sx={{ mt: 2 }}>
          Back to Courses
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
          onClick={() => navigate('/student/courses')}
          sx={{ mb: 2, color: '#1865f2' }}
        >
          Back to Courses
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Course Info */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 4,
              border: '2px solid #e8f5e8',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)',
              mb: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h3" fontWeight="bold" color="text.primary" mb={2}>
                {course.title} 📚
              </Typography>
              
              <Typography variant="h6" color="text.secondary" mb={3}>
                {course.description}
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                <Chip 
                  icon={<School />}
                  label={course.level?.charAt(0).toUpperCase() + course.level?.slice(1)} 
                  color="primary" 
                />
                <Chip 
                  icon={<Schedule />}
                  label={course.duration_weeks ? `${course.duration_weeks} weeks` : 'Self-paced'} 
                  color="info" 
                />
                <Chip 
                  icon={<People />}
                  label={`${Math.floor(Math.random() * 150) + 50} students`} 
                  color="success" 
                />
                <Chip 
                  icon={<Star />}
                  label="4.8 ⭐" 
                  color="warning" 
                />
              </Box>

              {course.prerequisites && (
                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    Prerequisites 📋
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.prerequisites}
                  </Typography>
                </Box>
              )}

              {course.learning_objectives && (
                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    What You'll Learn 🎯
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.learning_objectives}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card
            sx={{
              borderRadius: 4,
              border: '2px solid #e8f5e8'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Course Content 📖
              </Typography>

              {modules.length > 0 ? (
                modules.map((module, moduleIndex) => (
                  <Accordion
                    key={module.id}
                    expanded={expandedModule === `module${module.id}`}
                    onChange={handleAccordionChange(`module${module.id}`)}
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      border: '1px solid #e0e0e0',
                      '&:before': { display: 'none' }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px 12px 0 0',
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center'
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" width="100%">
                        <Avatar
                          sx={{
                            bgcolor: '#1865f2',
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem',
                            mr: 2
                          }}
                        >
                          {moduleIndex + 1}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="600">
                            {module.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                              {module.lessons?.length || 0} lessons
                            </Typography>
                            {module.lessons?.length > 0 && (
                              <Chip 
                                size="small" 
                                label={`${module.lessons.length} lessons`} 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                        {!isEnrolled && (
                          <Lock sx={{ color: '#ccc', ml: 2 }} />
                        )}
                      </Box>
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ pt: 0 }}>
                      {module.description && (
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {module.description}
                        </Typography>
                      )}
                      
                      {module.lessons && module.lessons.length > 0 ? (
                        <List>
                          {module.lessons.map((lesson, lessonIndex) => (
                            <ListItem
                              key={lesson.id}
                              sx={{
                                border: '1px solid #f0f0f0',
                                borderRadius: 2,
                                mb: 1,
                                backgroundColor: 'white',
                                cursor: isEnrolled ? 'pointer' : 'default',
                                '&:hover': isEnrolled ? {
                                  backgroundColor: '#f8f9fa',
                                  borderColor: '#1865f2'
                                } : {}
                              }}
                              onClick={() => {
                                if (isEnrolled) {
                                  navigate(`/student/course/${courseId}/lesson/${lesson.id}`);
                                } else {
                                  toast.error('Please enroll in the course to access lessons');
                                }
                              }}
                            >
                              <ListItemIcon>
                                {isEnrolled ? (
                                  lesson.video_url ? (
                                    <VideoLibrary sx={{ color: '#ff0000' }} />
                                  ) : (
                                    <PlayCircle sx={{ color: '#00a60e' }} />
                                  )
                                ) : (
                                  <Lock sx={{ color: '#ccc' }} />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="body1" fontWeight="500">
                                    {lessonIndex + 1}. {lesson.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="caption" color="text.secondary">
                                      {lesson.duration ? `Duration: ${lesson.duration}` : 'Lesson'}
                                    </Typography>
                                    {lesson.video_url && (
                                      <Chip 
                                        size="small" 
                                        label="Video" 
                                        color="error" 
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Paper
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            backgroundColor: '#f8f9fa',
                            borderRadius: 3,
                            border: '2px dashed #e0e0e0'
                          }}
                        >
                          <Assignment sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No lessons in this module yet
                          </Typography>
                        </Paper>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Box textAlign="center" py={4}>
                  <Assignment sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Course content is being prepared...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              border: '2px solid #e8f5e8',
              position: 'sticky',
              top: 20
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {/* Price */}
              <Typography variant="h3" fontWeight="bold" color="primary" mb={1}>
                {course.price > 0 ? `$${course.price}` : 'Free'}
              </Typography>
              
              {course.price > 0 && (
                <Typography variant="body2" color="text.secondary" mb={3}>
                  One-time payment • Lifetime access
                </Typography>
              )}

              {/* ✅ REAL ENROLLMENT BUTTON */}
              {!isEnrolled ? (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleEnroll}
                  disabled={enrolling}
                  startIcon={enrolling ? <CircularProgress size={20} /> : <School />}
                  sx={{
                    background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                    borderRadius: 3,
                    py: 2,
                    mb: 3,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {enrolling ? 'Enrolling...' : course.price > 0 ? 'Enroll Now' : 'Enroll for Free'}
                </Button>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: '#e8f5e8',
                    borderRadius: 3,
                    mb: 3
                  }}
                >
                  <CheckCircle sx={{ color: '#00a60e', fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="#00a60e">
                    You're Enrolled! 🎉
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {enrollmentData?.enrolled_at && (
                      `Enrolled on ${new Date(enrollmentData.enrolled_at).toLocaleDateString()}`
                    )}
                  </Typography>
                  {enrollmentData?.progress > 0 && (
                    <Typography variant="body2" color="primary" fontWeight="600">
                      Progress: {enrollmentData.progress}%
                    </Typography>
                  )}
                </Paper>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Course Stats */}
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {modules.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Modules
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {totalLessons}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lessons
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Course Features */}
              <Box textAlign="left">
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  This course includes:
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PlayCircle sx={{ color: '#00a60e', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Video lessons" 
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Assignment sx={{ color: '#ff8c00', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Assignments & projects" 
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Language sx={{ color: '#9c27b0', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Lifetime access" 
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentCourseView;