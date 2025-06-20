import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  CircularProgress,
  Breadcrumbs,
  Link,
  Paper
} from '@mui/material';
import {
  Search,
  FilterList,
  School,
  People,
  Star,
  AttachMoney,
  Home,
  TrendingUp,
  LocalFireDepartment
} from '@mui/icons-material';
import { courseAPI, categoryAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && user) {
      fetchEnrollmentStatuses();
    }
  }, [courses, user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all courses
      const coursesRes = await courseAPI.getAllCourses();
      
      let allCourses = [];
      
      if (coursesRes.data?.data?.courses) {
        allCourses = coursesRes.data.data.courses;
      } else if (coursesRes.data?.data && Array.isArray(coursesRes.data.data)) {
        allCourses = coursesRes.data.data;
      } else if (coursesRes.data?.courses) {
        allCourses = coursesRes.data.courses;
      } else if (Array.isArray(coursesRes.data)) {
        allCourses = coursesRes.data;
      }
      
      setCourses(allCourses);

      // Fetch categories
      try {
        const categoriesRes = await categoryAPI.getAllCategories();
        const categoriesData = categoriesRes.data.data || [];
        setCategories(categoriesData);
      } catch (catError) {
        console.error('Error fetching categories:', catError);
        setCategories([]);
      }

    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      toast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentStatuses = async () => {
    if (!user || courses.length === 0) return;

    try {
      setLoadingEnrollments(true);
      const statuses = {};
      
      await Promise.all(
        courses.map(async (course) => {
          try {
            const response = await enrollmentAPI.checkEnrollmentStatus(course.id);
            statuses[course.id] = response.data.data.isEnrolled;
          } catch {
            statuses[course.id] = false;
          }
        })
      );
      
      setEnrollmentStatuses(statuses);
    } catch (error) {
      console.error('Error fetching enrollment statuses:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !filters.search || 
      course.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const courseCategory = parseInt(course.category_id);
    const filterCategory = filters.category ? parseInt(filters.category) : null;
    const matchesCategory = !filterCategory || courseCategory === filterCategory;

    const matchesLevel = !filters.level || course.level === filters.level;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnroll = async (courseId, event) => {
    event.stopPropagation();
    
    if (!user) {
      toast.error('Please login to enroll in courses');
      navigate('/login');
      return;
    }

    try {
      const response = await enrollmentAPI.enrollInCourse(courseId);
      
      if (response.data.success) {
        toast.success('🎉 Successfully enrolled! Redirecting to course...');
        
        setEnrollmentStatuses(prev => ({
          ...prev,
          [courseId]: true
        }));
        
        setTimeout(() => {
          navigate(`/student/course/${courseId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to enroll in course');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 3 }}>Loading amazing courses...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
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
          <Home sx={{ mr: 0.5, fontSize: 20 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <School sx={{ mr: 0.5, fontSize: 20 }} />
          Courses
        </Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
          Explore Courses 🚀
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={3}>
          Discover amazing courses and start your learning journey
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {courses.length}
              </Typography>
              <Typography variant="body2" opacity={0.9}>
                Total Courses
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            >
              <LocalFireDepartment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {categories.length}
              </Typography>
              <Typography variant="body2" opacity={0.9}>
                Categories
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}
            >
              <Star sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                4.8
              </Typography>
              <Typography variant="body2" opacity={0.9}>
                Avg Rating
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white'
              }}
            >
              <People sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {Object.values(enrollmentStatuses).filter(Boolean).length}
              </Typography>
              <Typography variant="body2" opacity={0.9}>
                My Enrolled
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filters */}
      <Card 
        sx={{ 
          borderRadius: 4, 
          border: '2px solid #e8f5e8', 
          mb: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" mb={3} color="primary">
            🔍 Find Your Perfect Course
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search for courses, skills, topics..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#1865f2' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    backgroundColor: '#fafafa',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  label="Category"
                  sx={{ 
                    borderRadius: 4, 
                    backgroundColor: '#fafafa',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={filters.level}
                  onChange={(e) => setFilters({...filters, level: e.target.value})}
                  label="Level"
                  sx={{ 
                    borderRadius: 4, 
                    backgroundColor: '#fafafa',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="beginner">🟢 Beginner</MenuItem>
                  <MenuItem value="intermediate">🟡 Intermediate</MenuItem>
                  <MenuItem value="advanced">🔴 Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterList />}
                onClick={() => setFilters({ search: '', category: '', level: '' })}
                sx={{ 
                  borderRadius: 4, 
                  py: 2,
                  borderColor: '#e8f5e8',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#1865f2',
                    backgroundColor: '#f8fff8'
                  }
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>

          {/* Active Filters */}
          {(filters.search || filters.category || filters.level) && (
            <Box mt={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Active filters:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {filters.search && (
                  <Chip
                    label={`Search: "${filters.search}"`}
                    onDelete={() => setFilters({...filters, search: ''})}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {filters.category && (
                  <Chip
                    label={`Category: ${categories.find(c => c.id == filters.category)?.name}`}
                    onDelete={() => setFilters({...filters, category: ''})}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {filters.level && (
                  <Chip
                    label={`Level: ${filters.level}`}
                    onDelete={() => setFilters({...filters, level: ''})}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box mb={3}>
        <Typography variant="h6" color="text.secondary">
          {filteredCourses.length === courses.length 
            ? `Showing all ${courses.length} courses`
            : `Found ${filteredCourses.length} of ${courses.length} courses`
          }
          {loadingEnrollments && (
            <CircularProgress size={16} sx={{ ml: 2 }} />
          )}
        </Typography>
      </Box>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <Grid container spacing={4}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} lg={4} key={course.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  border: enrollmentStatuses[course.id] ? '2px solid #00a60e' : '2px solid #e8f5e8',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    borderColor: enrollmentStatuses[course.id] ? '#00a60e' : '#1865f2'
                  }
                }}
                onClick={() => navigate(`/student/course/${course.id}`)}
              >
                {/* Course Image Placeholder */}
                <Box
                  sx={{
                    height: 200,
                    background: enrollmentStatuses[course.id] 
                      ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <School sx={{ fontSize: 60, color: 'white', opacity: 0.8 }} />
                  <Chip
                    label={course.category_name || 'General'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      fontWeight: 600
                    }}
                  />
                  {enrollmentStatuses[course.id] && (
                    <Chip
                      label="✅ ENROLLED"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        color: '#00a60e',
                        fontWeight: 700
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Course Header */}
                  <Box mb={2}>
                    <Typography variant="h6" fontWeight="bold" mb={1} sx={{ lineHeight: 1.3 }}>
                      {course.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4
                      }}
                    >
                      {course.description}
                    </Typography>
                  </Box>

                  {/* Course Tags */}
                  <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                    <Chip 
                      label={course.level || 'Beginner'} 
                      size="small" 
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                      label={course.is_published ? '✅ Published' : '⏳ Draft'} 
                      size="small" 
                      color={course.is_published ? 'success' : 'warning'}
                      variant="outlined"
                    />
                    {enrollmentStatuses[course.id] && (
                      <Chip 
                        label="✅ Enrolled" 
                        size="small" 
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  {/* Course Stats */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <People sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {course.enrolled_students || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Star sx={{ fontSize: 16, color: '#ff8c00' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          4.8
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {course.price > 0 ? `$${course.price}` : 'Free'}
                    </Typography>
                  </Box>

                  {/* Enroll Button */}
                  {enrollmentStatuses[course.id] ? (
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/student/course/${course.id}`)}
                      sx={{
                        borderColor: '#00a60e',
                        color: '#00a60e',
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        '&:hover': {
                          backgroundColor: '#e8f5e8',
                          borderColor: '#00a60e'
                        }
                      }}
                    >
                      ✅ Go to Course
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={(e) => handleEnroll(course.id, e)}
                      sx={{
                        background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      {course.price > 0 ? `Enroll Now - $${course.price}` : 'Enroll for Free'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            textAlign: 'center',
            py: 8,
            borderRadius: 4,
            border: '2px dashed #e0e0e0',
            backgroundColor: '#fafafa'
          }}
        >
          <School sx={{ fontSize: 80, color: '#ccc', mb: 3 }} />
          <Typography variant="h5" color="text.secondary" mb={2} fontWeight={600}>
            No courses found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {courses.length === 0 
              ? "No courses available yet. Check back soon!"
              : "Try adjusting your search filters to find more courses."
            }
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setFilters({ search: '', category: '', level: '' })}
            sx={{
              background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
              borderRadius: 3,
              px: 4,
              py: 1.5
            }}
          >
            Clear All Filters
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default CourseCatalog;