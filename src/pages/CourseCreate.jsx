import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  School,
  Description,
  Category,
  AttachMoney,
  Schedule,
  Save,
  ArrowBack
} from '@mui/icons-material';
import { courseAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const CourseCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    level: 'beginner',
    price: 0,
    duration: '',
    is_published: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Temporary mock data while backend is starting
      const mockCategories = [
        { id: 1, name: 'Programming' },
        { id: 2, name: 'Web Development' },
        { id: 3, name: 'Data Science' },
        { id: 4, name: 'Design' },
        { id: 5, name: 'Business' },
        { id: 6, name: 'Marketing' }
      ];
      setCategories(mockCategories);
      
      toast.error('Failed to load categories - using mock data');
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      // Parse duration to weeks (convert "8 weeks" to 8)
      const parseDurationToWeeks = (durationStr) => {
        if (!durationStr) return 1;
        const match = durationStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : 1;
      };

      // ✅ FIXED - Prepare data matching backend expectations
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: parseInt(formData.category_id),
        level: formData.level,
        price: parseFloat(formData.price) || 0,
        duration_weeks: parseDurationToWeeks(formData.duration),
        is_published: formData.is_published
      };

      console.log('Creating course with data:', courseData);

      const response = await courseAPI.createCourse(courseData);
      const createdCourse = response.data.data;

      toast.success('Course created successfully! 🎉');
      navigate(`/instructor/course/${createdCourse.id}/manage`);
      
    } catch (error) {
      console.error('Error creating course:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      const message = error.response?.data?.message || 'Failed to create course';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
        
        <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
          Create New Course 🎓
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Share your knowledge with the world. Let's build something amazing!
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
                  placeholder="e.g., Complete React Development Masterclass"
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
                  placeholder="Describe what students will learn in this course..."
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

              {/* Publish Toggle */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    p: 2,
                    border: '2px solid #e8f5e8',
                    borderRadius: 3,
                    backgroundColor: formData.is_published ? '#f8fff8' : '#fafafa'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {formData.is_published ? 'Publish Course' : 'Save as Draft'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formData.is_published 
                            ? 'Course will be visible to students' 
                            : 'Course will be saved as draft'}
                        </Typography>
                      </Box>
                    }
                  />
                </Card>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/instructor/dashboard')}
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
                    disabled={loading}
                    startIcon={<Save />}
                    sx={{
                      background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                      borderRadius: 3,
                      px: 4,
                      py: 1.5
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Course'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseCreate;