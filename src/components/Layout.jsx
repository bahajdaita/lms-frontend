import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  Card
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  Quiz,
  Assignment,
  People,
  Category,
  Logout,
  Notifications,
  Settings,
  Star,
  EmojiEvents,
  TrendingUp,
  Book,
  PlayCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleClose();
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: `/${user?.role}/dashboard`,
        color: '#00a60e'
      }
    ];

    if (user?.role === 'student') {
      return [
        ...baseItems,
        {
          text: 'Browse Courses',
          icon: <School />,
          path: '/student/courses',
          color: '#1865f2',
          badge: 'Hot!'
        },
        {
          text: 'My Learning',
          icon: <Book />,
          path: '/student/learning',
          color: '#ff8c00'
        },
        {
          text: 'Quizzes',
          icon: <Quiz />,
          path: '/student/quizzes',
          color: '#9c27b0'
        },
        {
          text: 'Assignments',
          icon: <Assignment />,
          path: '/student/assignments',
          color: '#f44336'
        }
      ];
    }

    if (user?.role === 'instructor') {
      return [
        ...baseItems,
        {
          text: 'My Courses',
          icon: <PlayCircle />,
          path: '/instructor/courses',
          color: '#1865f2'
        },
        {
          text: 'Create Course',
          icon: <School />,
          path: '/instructor/create-course',
          color: '#00a60e',
          badge: 'New'
        },
        {
          text: 'Students',
          icon: <People />,
          path: '/instructor/students',
          color: '#ff8c00'
        },
        {
          text: 'Analytics',
          icon: <TrendingUp />,
          path: '/instructor/analytics',
          color: '#9c27b0'
        }
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          text: 'Users',
          icon: <People />,
          path: '/admin/users',
          color: '#1865f2'
        },
        {
          text: 'Courses',
          icon: <School />,
          path: '/admin/courses',
          color: '#00a60e'
        },
        {
          text: 'Categories',
          icon: <Category />,
          path: '/admin/categories',
          color: '#ff8c00'
        },
        {
          text: 'Analytics',
          icon: <TrendingUp />,
          path: '/admin/analytics',
          color: '#9c27b0'
        }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #f8fff8 0%, #f0f9ff 100%)' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #00a60e, #1865f2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 8px 24px rgba(0, 166, 14, 0.3)'
          }}
        >
          <Typography variant="h4" sx={{ color: 'white' }}>
            🎓
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight="bold" color="#00a60e">
          LearnHub
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Knowledge is power! 💪
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, backgroundColor: '#e8f5e8' }} />

      {/* User Info Card */}
      <Box sx={{ p: 2 }}>
        <Card
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)',
            border: '2px solid #e8f5e8',
            borderRadius: 3
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                background: 'linear-gradient(45deg, #00a60e, #4caf50)',
                width: 40,
                height: 40
              }}
            >
              {user?.first_name?.[0]?.toUpperCase()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body2" fontWeight="bold" color="text.primary">
                {user?.first_name} {user?.last_name}
              </Typography>
              <Chip
                label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                size="small"
                sx={{
                  background: user?.role === 'student' ? '#e8f5e8' : 
                            user?.role === 'instructor' ? '#f0f9ff' : '#fff3e0',
                  color: user?.role === 'student' ? '#00a60e' :
                         user?.role === 'instructor' ? '#1865f2' : '#ff8c00',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 2 }}>
        {navigationItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 3,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                  '&:hover': {
                    backgroundColor: `${item.color}25`,
                  },
                },
                '&:hover': {
                  backgroundColor: `${item.color}10`,
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  fontSize: '0.9rem'
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    backgroundColor: item.color,
                    color: 'white',
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Progress Section for Students */}
      {user?.role === 'student' && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Card
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%)',
              borderRadius: 3,
              textAlign: 'center'
            }}
          >
            <EmojiEvents sx={{ color: '#00a60e', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" fontWeight="bold" color="#00a60e">
              Keep Learning! 🚀
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You're doing great!
            </Typography>
          </Card>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e8f5e8'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box display="flex" alignItems="center" gap={2} flex={1}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#00a60e">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}! 👋
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ready to learn something amazing today?
              </Typography>
            </Box>
          </Box>

          {/* Right side icons */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton color="inherit" onClick={handleMenu}>
              <Avatar
                sx={{
                  background: 'linear-gradient(45deg, #00a60e, #4caf50)',
                  width: 32,
                  height: 32
                }}
              >
                {user?.first_name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  mt: 1,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          background: '#f7f8fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;