import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Paper,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack,
  PlayCircle,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Assignment,
  Lock,
  VideoLibrary,
  Home,
  School,
  MenuBook,
  Timer,
  Group,
  BugReport
} from '@mui/icons-material';
import { courseAPI, moduleAPI, lessonAPI, enrollmentAPI, quizAPI, assignmentAPI } from '../services/api';
import QuizView from './QuizView';
import AssignmentView from './AssignmentView';
import toast from 'react-hot-toast';

const LessonView = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);

  useEffect(() => {
    fetchData();
    if (lessonId) {
      fetchTabCounts();
    }
  }, [courseId, lessonId]);

  const fetchTabCounts = async () => {
    try {
      // Get quiz count
      const quizResponse = await quizAPI.getLessonQuizzes(lessonId);
      if (quizResponse.data.success) {
        setQuizCount(quizResponse.data.data.length);
      }
      
      // Get assignment count  
      const assignmentResponse = await assignmentAPI.getLessonAssignments(lessonId);
      if (assignmentResponse.data.success) {
        setAssignmentCount(assignmentResponse.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching tab counts:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setCheckingEnrollment(true);

      // Check enrollment first
      try {
        const enrollmentResponse = await enrollmentAPI.checkEnrollmentStatus(courseId);
        setIsEnrolled(enrollmentResponse.data.data.isEnrolled);
        setEnrollmentData(enrollmentResponse.data.data.enrollment);
        
        if (!enrollmentResponse.data.data.isEnrolled) {
          setCheckingEnrollment(false);
          setLoading(false);
          return; // Don't fetch course data if not enrolled
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        setLoading(false);
        return;
      } finally {
        setCheckingEnrollment(false);
      }

      // Fetch course
      const courseRes = await courseAPI.getCourseById(courseId);
      setCourse(courseRes.data.data);

      // Fetch modules with lessons
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
              lessons: lessonsData
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

      // Find current lesson and module
      const allLessons = modulesWithLessons.flatMap(m => m.lessons);
      const lesson = allLessons.find(l => l.id === parseInt(lessonId));
      setCurrentLesson(lesson);

      // Find the module containing this lesson
      const moduleContainingLesson = modulesWithLessons.find(m => 
        m.lessons.some(l => l.id === parseInt(lessonId))
      );
      setCurrentModule(moduleContainingLesson);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const findAdjacentLessons = () => {
    const allLessons = modules.flatMap(m => 
      m.lessons.map(l => ({ ...l, moduleTitle: m.title }))
    );
    const currentIndex = allLessons.findIndex(l => l.id === parseInt(lessonId));
    
    return {
      previous: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
    };
  };

  const extractVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;

    // YouTube patterns
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/
    ];

    for (const pattern of youtubePatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return { type: 'youtube', id: match[1] };
      }
    }

    // Vimeo patterns
    const vimeoPattern = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch && vimeoMatch[1]) {
      return { type: 'vimeo', id: vimeoMatch[1] };
    }

    // Direct video file
    if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      return { type: 'direct', url: url };
    }

    return null;
  };

  const renderVideoPlayer = (videoUrl) => {
    if (!videoUrl) return null;

    const videoInfo = extractVideoId(videoUrl);
    
    if (!videoInfo) {
      return (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 3 }}
          icon={<BugReport />}
        >
          <Typography variant="body2" fontWeight="600" mb={1}>
            Video Format Not Supported
          </Typography>
          <Typography variant="body2" mb={2}>
            We couldn't load this video format. You can try opening it directly.
          </Typography>
          <Button 
            variant="outlined"
            size="small"
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Video Link
          </Button>
        </Alert>
      );
    }

    // YouTube player
    if (videoInfo.type === 'youtube') {
      const embedUrl = `https://www.youtube.com/embed/${videoInfo.id}?rel=0&modestbranding=1`;
      
      return (
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 4, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid #e8f5e8'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              backgroundColor: '#000'
            }}
          >
            <iframe
              src={embedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allowFullScreen
              title="Lesson Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </Box>
          <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <VideoLibrary sx={{ color: '#ff0000', fontSize: 20 }} />
                <Typography variant="body2" fontWeight="600">
                  YouTube Video
                </Typography>
              </Box>
              <Chip 
                size="small" 
                label="HD Quality" 
                color="success" 
                variant="outlined"
              />
            </Box>
          </Box>
        </Card>
      );
    }

    // Vimeo player
    if (videoInfo.type === 'vimeo') {
      const embedUrl = `https://player.vimeo.com/video/${videoInfo.id}`;
      
      return (
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 4, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              backgroundColor: '#000'
            }}
          >
            <iframe
              src={embedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allowFullScreen
              title="Lesson Video"
            />
          </Box>
          <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <VideoLibrary sx={{ color: '#1ab7ea', fontSize: 20 }} />
              <Typography variant="body2" fontWeight="600">
                Vimeo Video
              </Typography>
            </Box>
          </Box>
        </Card>
      );
    }

    // Direct video file
    if (videoInfo.type === 'direct') {
      return (
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 4, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <video
            controls
            style={{
              width: '100%',
              height: 'auto',
              backgroundColor: '#000',
              display: 'block'
            }}
          >
            <source src={videoInfo.url} type="video/mp4" />
            <source src={videoInfo.url} type="video/webm" />
            <source src={videoInfo.url} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <VideoLibrary sx={{ color: '#9c27b0', fontSize: 20 }} />
              <Typography variant="body2" fontWeight="600">
                Video File
              </Typography>
            </Box>
          </Box>
        </Card>
      );
    }

    return null;
  };

  const { previous, next } = findAdjacentLessons();
  const currentLessonIndex = modules.flatMap(m => m.lessons).findIndex(l => l.id === parseInt(lessonId));
  const totalLessons = modules.reduce((total, m) => total + m.lessons.length, 0);
  const progressPercentage = totalLessons > 0 ? ((currentLessonIndex + 1) / totalLessons) * 100 : 0;

  if (loading || checkingEnrollment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            {checkingEnrollment ? 'Checking enrollment...' : 'Loading lesson...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we prepare your content
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!isEnrolled) {
    return (
      <Box textAlign="center" py={10}>
        <Lock sx={{ fontSize: 80, color: '#ccc', mb: 3 }} />
        <Typography variant="h4" fontWeight="bold" mb={2}>Enrollment Required</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          You need to enroll in this course to access the lessons.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(`/student/course/${courseId}`)}
          sx={{ 
            background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
            borderRadius: 3,
            px: 4,
            py: 1.5
          }}
        >
          Go to Course Page
        </Button>
      </Box>
    );
  }

  if (!currentLesson) {
    return (
      <Box textAlign="center" py={10}>
        <Assignment sx={{ fontSize: 80, color: '#ccc', mb: 3 }} />
        <Typography variant="h4" fontWeight="bold" color="error" mb={2}>Lesson Not Found</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          The lesson you're looking for doesn't exist or has been removed.
        </Typography>
        <Button 
          variant="contained"
          size="large"
          onClick={() => navigate(`/student/course/${courseId}`)} 
          sx={{ 
            background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
            borderRadius: 3,
            px: 4,
            py: 1.5
          }}
        >
          Back to Course
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="/student/dashboard"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={(e) => {
            e.preventDefault();
            navigate('/student/dashboard');
          }}
        >
          <Home sx={{ mr: 0.5, fontSize: 18 }} />
          Dashboard
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          href="/student/courses"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={(e) => {
            e.preventDefault();
            navigate('/student/courses');
          }}
        >
          <School sx={{ mr: 0.5, fontSize: 18 }} />
          Courses
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate(`/student/course/${courseId}`)}
        >
          {course?.title}
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <MenuBook sx={{ mr: 0.5, fontSize: 18 }} />
          {currentLesson.title}
        </Typography>
      </Breadcrumbs>

      {/* Progress Bar */}
      <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid #e8f5e8' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Course Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lesson {currentLessonIndex + 1} of {totalLessons}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#f0f0f0',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                borderRadius: 4
              }
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {Math.round(progressPercentage)}% Complete
            {enrollmentData?.progress && (
              <span style={{ marginLeft: 8 }}>
                • Overall Course Progress: {enrollmentData.progress}%
              </span>
            )}
          </Typography>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Lesson Content */}
        <Grid item xs={12} lg={8}>
          {/* Lesson Header */}
          <Card sx={{ mb: 4, borderRadius: 4, border: '2px solid #e8f5e8' }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box flex={1}>
                  <Typography variant="h3" fontWeight="bold" color="text.primary" mb={2}>
                    {currentLesson.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Chip 
                      icon={<MenuBook />}
                      label={currentModule?.title || 'Module'} 
                      color="primary" 
                      variant="outlined"
                    />
                    {currentLesson.duration && (
                      <Chip 
                        icon={<Timer />}
                        label={currentLesson.duration} 
                        color="info" 
                        variant="outlined"
                      />
                    )}
                    <Chip 
                      icon={<Group />}
                      label={`${Math.floor(Math.random() * 50) + 20} students`} 
                      color="success" 
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/student/course/${courseId}`)}
                  sx={{ color: '#1865f2' }}
                >
                  Back to Course
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Video Section */}
          {currentLesson.video_url ? (
            renderVideoPlayer(currentLesson.video_url)
          ) : (
            <Card 
              sx={{ 
                mb: 4, 
                borderRadius: 4, 
                border: '2px dashed #e0e0e0',
                backgroundColor: '#fafafa'
              }}
            >
              <CardContent sx={{ p: 6, textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 64, color: '#ccc', mb: 3 }} />
                <Typography variant="h5" fontWeight="600" color="text.secondary" mb={2}>
                  Text-Based Lesson
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  This lesson contains written content and materials to study.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Lesson Content Tabs */}
          <Card sx={{ mb: 4, borderRadius: 4, border: '1px solid #e8f5e8' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab 
                  label="📖 Content" 
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
                <Tab 
                  label={`📝 Quiz ${quizCount > 0 ? `(${quizCount})` : ''}`}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
                <Tab 
                  label={`📋 Assignments ${assignmentCount > 0 ? `(${assignmentCount})` : ''}`}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
              </Tabs>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              {/* Content Tab */}
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
                    📖 Lesson Materials
                  </Typography>
                  
                  {currentLesson.content ? (
                    <Paper 
                      sx={{ 
                        p: 4,
                        backgroundColor: '#fafafa',
                        borderRadius: 3,
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.8, 
                          whiteSpace: 'pre-wrap',
                          fontSize: '1.1rem',
                          color: 'text.primary'
                        }}
                      >
                        {currentLesson.content}
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper
                      sx={{
                        p: 6,
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa',
                        borderRadius: 3,
                        border: '2px dashed #e0e0e0'
                      }}
                    >
                      <MenuBook sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        Content Coming Soon
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Written materials and resources for this lesson will be available soon.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
              
              {/* Quiz Tab */}
              {tabValue === 1 && (
                <QuizView lessonId={lessonId} />
              )}
              
              {/* Assignment Tab */}
              {tabValue === 2 && (
                <AssignmentView lessonId={lessonId} />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            {previous ? (
              <Button
                variant="outlined"
                size="large"
                startIcon={<NavigateBefore />}
                onClick={() => navigate(`/student/course/${courseId}/lesson/${previous.id}`)}
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  borderColor: '#e8f5e8',
                  '&:hover': {
                    borderColor: '#1865f2',
                    backgroundColor: '#f8fff8'
                  }
                }}
              >
                Previous: {previous.title.length > 25 ? previous.title.substring(0, 25) + '...' : previous.title}
              </Button>
            ) : (
              <Box />
            )}

            {next && (
              <Button
                variant="contained"
                size="large"
                endIcon={<NavigateNext />}
                onClick={() => navigate(`/student/course/${courseId}/lesson/${next.id}`)}
                sx={{
                  background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold'
                }}
              >
                Next: {next.title.length > 25 ? next.title.substring(0, 25) + '...' : next.title}
              </Button>
            )}
          </Box>
        </Grid>

        {/* Sidebar - Course Navigation */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 4, position: 'sticky', top: 20, border: '1px solid #e8f5e8' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={3} color="text.primary">
                📚 Course Content
              </Typography>
              
              {modules.map((module, moduleIndex) => (
                <Box key={module.id} mb={3}>
                  <Typography variant="subtitle1" fontWeight="600" mb={2} color="text.primary">
                    {moduleIndex + 1}. {module.title}
                  </Typography>
                  <List dense>
                    {module.lessons?.map((lesson, lessonIndex) => (
                      <ListItem key={lesson.id} disablePadding>
                        <ListItemButton
                          selected={lesson.id === parseInt(lessonId)}
                          onClick={() => navigate(`/student/course/${courseId}/lesson/${lesson.id}`)}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            backgroundColor: lesson.id === parseInt(lessonId) ? '#e3f2fd' : 'transparent',
                            '&:hover': {
                              backgroundColor: lesson.id === parseInt(lessonId) ? '#e3f2fd' : '#f8f9fa'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {lesson.id === parseInt(lessonId) ? (
                              <PlayCircle sx={{ color: '#1865f2', fontSize: 20 }} />
                            ) : (
                              <CheckCircle sx={{ color: '#00a60e', fontSize: 20 }} />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={`${lessonIndex + 1}. ${lesson.title}`}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: lesson.id === parseInt(lessonId) ? 600 : 400
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                  {moduleIndex < modules.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LessonView;