import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  InputAdornment,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  School,
  Description,
  Category,
  AttachMoney,
  Schedule,
  Save,
  ArrowBack,
  Delete
} from '@mui/icons-material';
import { courseAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const CourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'beginner',
    price: 0,
    duration: '',
    max_students: '',
    prerequisites: '',
    learning_objectives: '',
    status: 'draft'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchCategories();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await courseAPI.getCourseById(courseId);
      const course = response.data.data;
      
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category_id: course.category_id || '',
        level: course.level || 'beginner',
        price: course.price || 0,
        duration: course.duration || '',
        max_students: course.max_students || '',
        prerequisites: course.prerequisites || '',
        learning_objectives: course.learning_objectives || '',
        status: course.status || 'draft'
      });
      
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.max_students && formData.max_students < 1) {
      newErrors.max_students = 'Max students must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setSaving(true);

    try {
      // Prepare data for backend
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: parseInt(formData.category_id),
        level: formData.level,
        price: parseFloat(formData.price) || 0,
        duration: formData.duration.trim() || null,
        max_students: formData.max_students ? parseInt(formData.max_students) : null,
        prerequisites: formData.prerequisites.trim() || null,
        learning_objectives: formData.learning_objectives.trim() || null,
        status: formData.status
      };

      console.log('Updating course with data:', courseData);

      await courseAPI.updateCourse(courseId, courseData);
      toast.success('Course updated successfully! 🎉');
      
    } catch (error) {
      console.error('Error updating course:', error);
      const message = error.response?.data?.message || 'Failed to update course';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone and will delete all modules and lessons.')) {
      try {
        await courseAPI.deleteCourse(courseId);
        toast.success('Course deleted successfully');
        navigate('/instructor/dashboard');
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  const togglePublishStatus = () => {
    const newStatus = formData.status === 'published' ? 'draft' : 'published';
    setFormData({
      ...formData,
      status: newStatus
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading course data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/instructor/course/${courseId}/manage`)}
          sx={{ mb: 2, color: '#1865f2' }}
        >
          Back to Course Management
        </Button>
        
        <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
          Edit Course ✏️
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Update your course information and settings
        </Typography>
      </Box>

      {/* Form Card */}
      <Card
        sx={{
          borderRadius: 4,
          border: '2px solid #e8f5e8',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Course Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School sx={{ color: '#1865f2' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </Grid>

              {/* Course Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Course Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description sx={{ color: '#00a60e', mt: -2 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </Grid>

              {/* Category and Level */}
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={!!errors.category_id}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    label="Category"
                    startAdornment={
                      <InputAdornment position="start">
                        <Category sx={{ color: '#ff8c00' }} />
                      </InputAdornment>
                    }
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category_id && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {errors.category_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                >
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    label="Difficulty Level"
                  >
                    <MenuItem value="beginner">🟢 Beginner</MenuItem>
                    <MenuItem value="intermediate">🟡 Intermediate</MenuItem>
                    <MenuItem value="advanced">🔴 Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Price and Duration */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price (USD)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                  helperText={errors.price || "Set to 0 for free course"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: '#9c27b0' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 8 weeks, 40 hours"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Schedule sx={{ color: '#ff8c00' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </Grid>

              {/* Max Students */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Students (Optional)"
                  name="max_students"
                  type="number"
                  value={formData.max_students}
                  onChange={handleChange}
                  error={!!errors.max_students}
                  helperText={errors.max_students || "Leave empty for unlimited"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </Grid>

              {/* Publish Toggle */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 2,
                    border: '2px solid #e8f5e8',
                    borderRadius: 3,
                    backgroundColor: formData.status === 'published' ? '#f8fff8' : '#fafafa'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status === 'published'}
                        onChange={togglePublishStatus}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {formData.status === 'published' ? 'Published' : 'Draft'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formData.status === 'published' 
                            ? 'Course is visible to students' 
                            : 'Course is saved as draft'}
                        </Typography>
                      </Box>
                    }
                  />
                </Card>
              </Grid>

              {/* Prerequisites */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Prerequisites (Optional)"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  placeholder="What should students know before taking this course?"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </Grid>

              {/* Learning Objectives */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Learning Objectives (Optional)"
                  name="learning_objectives"
                  value={formData.learning_objectives}
                  onChange={handleChange}
                  placeholder="What will students be able to do after completing this course?"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="space-between">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDelete}
                    sx={{
                      borderRadius: 3,
                      px: 3
                    }}
                  >
                    Delete Course
                  </Button>

                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate(`/instructor/course/${courseId}/manage`)}
                      sx={{
                        borderColor: '#e0e0e0',
                        color: '#666',
                        borderRadius: 3,
                        px: 4
                      }}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                      sx={{
                        background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseEdit;