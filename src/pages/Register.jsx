import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Chip,
  Grid
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Google, 
  School, 
  MenuBook, 
  EmojiEvents,
  Star,
  Rocket
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload
    e.stopPropagation(); // Stop event bubbling
    
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...registerData } = formData;

      const result = await register(registerData);
      
      if (result.success) {
        // Navigate based on role
        const dashboardRoutes = {
          student: '/student/dashboard',
          instructor: '/instructor/dashboard',
          admin: '/admin/dashboard'
        };
        navigate(dashboardRoutes[formData.role] || '/student/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    window.location.href = 'http://localhost:3001/api/auth/google';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f7f8fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative'
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 30,
          left: 30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #00a60e, #4caf50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Rocket sx={{ color: 'white', fontSize: 40 }} />
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          top: 60,
          right: 60,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Star sx={{ color: 'white', fontSize: 25 }} />
      </Box>

      <Container maxWidth="md">
        <Card 
          sx={{ 
            borderRadius: 4, 
            boxShadow: '0 8px 32px rgba(0, 166, 14, 0.1)',
            border: '2px solid #e8f5e8',
            overflow: 'visible',
            position: 'relative'
          }}
        >
          {/* Floating Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: 20,
              zIndex: 1
            }}
          >
            <Chip 
              icon={<EmojiEvents />}
              label="Join the Community!"
              sx={{
                background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Box>

          <CardContent sx={{ p: 5 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1865f2 0%, #42a5f5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 8px 24px rgba(24, 101, 242, 0.3)'
                }}
              >
                <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  🎓
                </Typography>
              </Box>
              
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                sx={{ 
                  background: 'linear-gradient(45deg, #1865f2, #00a60e)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Start Your Journey!
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={500}>
                Join thousands of learners worldwide 🌍
              </Typography>
            </Box>

            {/* Role Selection Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    border: formData.role === 'student' ? '3px solid #00a60e' : '2px solid #e0e0e0',
                    backgroundColor: formData.role === 'student' ? '#f8fff8' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 166, 14, 0.2)'
                    }
                  }}
                  onClick={() => setFormData({...formData, role: 'student'})}
                >
                  <School sx={{ fontSize: 48, color: '#00a60e', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" color="#00a60e">
                    I want to Learn! 📚
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Access amazing courses and track your progress
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    border: formData.role === 'instructor' ? '3px solid #1865f2' : '2px solid #e0e0e0',
                    backgroundColor: formData.role === 'instructor' ? '#f0f9ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(24, 101, 242, 0.2)'
                    }
                  }}
                  onClick={() => setFormData({...formData, role: 'instructor'})}
                >
                  <MenuBook sx={{ fontSize: 48, color: '#1865f2', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" color="#1865f2">
                    I want to Teach! 🎯
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Share your knowledge and inspire students
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  backgroundColor: '#ffeaea',
                  border: '1px solid #ffcdd2'
                }}
              >
                {error}
              </Alert>
            )}

            {/* Register Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="👤 First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: '#fafafa'
                      }
                    }}
                    autoComplete="given-name"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="👤 Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: '#fafafa'
                      }
                    }}
                    autoComplete="family-name"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="📧 Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#fafafa'
                  }
                }}
                autoComplete="email"
              />

              <TextField
                fullWidth
                label="🔒 Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#fafafa'
                  }
                }}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="🔒 Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#fafafa'
                  }
                }}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mb: 3, 
                  py: 2,
                  borderRadius: 3,
                  background: formData.role === 'student' 
                    ? 'linear-gradient(45deg, #00a60e 0%, #4caf50 100%)'
                    : 'linear-gradient(45deg, #1865f2 0%, #42a5f5 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: `0 6px 20px ${formData.role === 'student' ? 'rgba(0, 166, 14, 0.3)' : 'rgba(24, 101, 242, 0.3)'}`,
                  '&:hover': {
                    boxShadow: `0 8px 25px ${formData.role === 'student' ? 'rgba(0, 166, 14, 0.4)' : 'rgba(24, 101, 242, 0.4)'}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {loading ? '🔄 Creating Account...' : '🚀 Start Learning Journey!'}
              </Button>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                OR
              </Typography>
            </Divider>

            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              sx={{ 
                mb: 4, 
                py: 2,
                borderRadius: 3,
                borderColor: '#e0e0e0',
                color: '#5f6368',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#00a60e',
                  backgroundColor: '#f8fff8'
                }
              }}
            >
              Quick signup with Google
            </Button>

            {/* Login Link */}
            <Box 
              textAlign="center"
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%)',
                borderRadius: 3
              }}
            >
              <Typography variant="body1" color="text.secondary" mb={1}>
                🎉 Already part of our community?
              </Typography>
              <Link
                to="/login"
                style={{
                  color: '#00a60e',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                Welcome back! Sign in →
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;