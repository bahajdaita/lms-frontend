import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  Google,
  Facebook
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FIXED: Handle form submission with proper data format
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ SEND AS PLAIN OBJECT - DO NOT stringify here
      const credentials = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };
      
      console.log('🔍 Sending credentials:', credentials);
      
      const result = await login(credentials);
      
      if (result.success) {
        // Navigate based on user role
        if (result.user.role === 'instructor') {
          navigate('/instructor/dashboard');
        } else if (result.user.role === 'student') {
          navigate('/student/dashboard');
        } else if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login submit error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      {/* ✅ FIXED: Removed Grid components, using Flexbox instead */}
      <Box
        sx={{
          maxWidth: 1200,
          width: '100%',
          display: 'flex',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {/* Left Side - Branding */}
        <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }}>
          <Paper
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #1865f2 0%, #4facfe 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              p: 4,
              minHeight: '600px'
            }}
          >
            <School sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
            <Typography variant="h3" fontWeight="bold" mb={2} textAlign="center">
              Welcome Back! 🎓
            </Typography>
            <Typography variant="h6" mb={4} textAlign="center" opacity={0.9}>
              Continue your learning journey with us
            </Typography>
            <Box textAlign="center">
              <Typography variant="body1" mb={1} opacity={0.8}>
                ✨ Access your courses
              </Typography>
              <Typography variant="body1" mb={1} opacity={0.8}>
                📚 Track your progress
              </Typography>
              <Typography variant="body1" opacity={0.8}>
                🏆 Achieve your goals
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Right Side - Login Form */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <Card sx={{ width: '100%', boxShadow: 'none', borderRadius: 0 }}>
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Box mb={4} textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="text.primary" mb={1}>
                    Sign In
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Enter your credentials to access your account
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#1865f2' }} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter your email"
                  />

                  {/* Password Field */}
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#1865f2' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter your password"
                  />

                  {/* Login Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(45deg, #1865f2, #4facfe)',
                      borderRadius: 3,
                      py: 1.5,
                      mb: 3,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1556d6, #3d8bfe)',
                      }
                    }}
                  >
                    {loading ? (
                      <Box display="flex" alignItems="center">
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Signing In...
                      </Box>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* Divider */}
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      or continue with
                    </Typography>
                  </Divider>

                  {/* ✅ FIXED: Social Login Buttons without Grid */}
                  <Box display="flex" gap={2} mb={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Google />}
                      sx={{
                        borderColor: '#db4437',
                        color: '#db4437',
                        '&:hover': {
                          borderColor: '#db4437',
                          backgroundColor: 'rgba(219, 68, 55, 0.04)'
                        }
                      }}
                    >
                      Google
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Facebook />}
                      sx={{
                        borderColor: '#4267B2',
                        color: '#4267B2',
                        '&:hover': {
                          borderColor: '#4267B2',
                          backgroundColor: 'rgba(66, 103, 178, 0.04)'
                        }
                      }}
                    >
                      Facebook
                    </Button>
                  </Box>

                  {/* Register Link */}
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link 
                        to="/register" 
                        style={{ 
                          color: '#1865f2', 
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        Create Account
                      </Link>
                    </Typography>
                  </Box>

                  {/* Forgot Password */}
                  <Box textAlign="center" mt={2}>
                    <Link 
                      to="/forgot-password" 
                      style={{ 
                        color: '#666', 
                        textDecoration: 'none',
                        fontSize: '0.875rem'
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                </form>

                {/* Demo Credentials */}
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 4, 
                    borderRadius: 3,
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #1976d2'
                  }}
                >
                  <Typography variant="body2" fontWeight="600" mb={1}>
                    🔧 Need Test Credentials?
                  </Typography>
                  <Typography variant="body2">
                    Create an account first, or check your database for existing users.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;