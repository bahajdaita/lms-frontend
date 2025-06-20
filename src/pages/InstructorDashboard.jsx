import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Add,
  TrendingUp,
  School,
  People,
  AttachMoney,
  Edit,
  Visibility,
  Delete,
  MoreVert
} from '@mui/icons-material';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    publishedCourses: 0
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchInstructorData();
    }
  }, [user]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      
      // Fetch instructor's courses
      const coursesRes = await courseAPI.getInstructorCourses(user.id);
      const coursesData = coursesRes.data.data || [];
      setCourses(coursesData);

      // Calculate stats
      const totalCourses = coursesData.length;
      const publishedCourses = coursesData.filter(c => c.is_published === true).length;
      const totalRevenue = coursesData.reduce((sum, course) => sum + (course.price || 0), 0);
      const totalStudents = Math.floor(Math.random() * 500) + 100; // Mock data

      setStats({
        totalCourses,
        publishedCourses,
        totalRevenue,
        totalStudents
      });

    } catch (error) {
      console.error('Error fetching instructor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, course) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    if (window.confirm(`Are you sure you want to delete "${selectedCourse.title}"?`)) {
      try {
        await courseAPI.deleteCourse(selectedCourse.id);
        toast.success('Course deleted successfully');
        fetchInstructorData(); // Refresh data
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
          Instructor Dashboard 👨‍🏫
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your courses and track your teaching progress
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              border: '2px solid #e3f2fd',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: '#1865f2', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <School sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary" mb={1}>
                {stats.totalCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Courses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              border: '2px solid #e8f5e8',
              background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: '#00a60e', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <TrendingUp sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main" mb={1}>
                {stats.publishedCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Published
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              border: '2px solid #fff3e0',
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: '#ff8c00', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <People sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main" mb={1}>
                {stats.totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              border: '2px solid #f3e5f5',
              background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)'
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: '#9c27b0', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <AttachMoney sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="secondary.main" mb={1}>
                ${stats.totalRevenue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Quick Actions 🚀
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Add />}
                onClick={() => navigate('/instructor/course/create')}
                sx={{
                  background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                  borderRadius: 3,
                  py: 2
                }}
              >
                Create Course
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<School />}
                onClick={() => navigate('/instructor/courses')}
                sx={{ borderRadius: 3, py: 2 }}
              >
                My Courses
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<People />}
                onClick={() => navigate('/instructor/students')}
                sx={{ borderRadius: 3, py: 2 }}
              >
                Students
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/instructor/analytics')}
                sx={{ borderRadius: 3, py: 2 }}
              >
                Analytics
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Courses */}
      <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Your Courses 📚
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/instructor/course/create')}
              sx={{
                background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                borderRadius: 3
              }}
            >
              New Course
            </Button>
          </Box>

          {courses.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell><strong>Course</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Price</strong></TableCell>
                    <TableCell><strong>Students</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {course.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {course.category_name || 'No Category'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={course.is_published ? 'Published' : 'Draft'}
                          color={course.is_published ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {course.price > 0 ? `$${course.price}` : 'Free'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {course.enrolled_students || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/student/course/${course.id}`)}
                            sx={{ color: '#00a60e' }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/instructor/course/${course.id}/manage`)}
                            sx={{ color: '#1865f2' }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, course)}
                            sx={{ color: '#666' }}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={6}>
              <School sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                No courses yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first course to start teaching!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/instructor/course/create')}
                sx={{
                  background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                  borderRadius: 3
                }}
              >
                Create Your First Course
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Course Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/instructor/course/${selectedCourse?.id}/edit`);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} /> Edit Details
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/instructor/course/${selectedCourse?.id}/manage`);
          handleMenuClose();
        }}>
          <School sx={{ mr: 1 }} /> Manage Content
        </MenuItem>
        <MenuItem onClick={handleDeleteCourse} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete Course
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InstructorDashboard;