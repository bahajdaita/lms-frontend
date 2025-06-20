import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar
} from '@mui/material';
import {
  School,
  TrendingUp,
  Assignment,
  Timer,
  BookmarkBorder,
  Star
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box>
      {/* Welcome Header */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Ready to continue your learning journey?
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
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enrolled Courses
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
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
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
                <Assignment sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main" mb={1}>
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
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
                <Timer sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="secondary.main" mb={1}>
                0h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learning Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Continue Learning */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8', mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                  Start Learning 📚
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/student/courses')}
                  sx={{ borderRadius: 3 }}
                >
                  Browse Courses
                </Button>
              </Box>

              <Box textAlign="center" py={6}>
                <BookmarkBorder sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" mb={1}>
                  No courses yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Start your learning journey by enrolling in a course!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/student/courses')}
                  sx={{
                    background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                    borderRadius: 3,
                    px: 4
                  }}
                >
                  Browse Courses
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Quick Actions 🚀
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<School />}
                  onClick={() => navigate('/student/courses')}
                  sx={{
                    background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                    borderRadius: 3,
                    py: 2
                  }}
                >
                  Browse Courses
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<Star />}
                  onClick={() => navigate('/student/courses')}
                  sx={{ borderRadius: 3, py: 2 }}
                >
                  Featured Courses
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/student/courses')}
                  sx={{ borderRadius: 3, py: 2 }}
                >
                  My Progress
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;