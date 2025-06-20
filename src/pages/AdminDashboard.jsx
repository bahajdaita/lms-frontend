import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Menu,
  MenuItem as MenuItemComponent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ButtonGroup
} from '@mui/material';
import {
  Dashboard,
  People,
  School,
  Analytics,
  Edit,
  Delete,
  MoreVert,
  Refresh,
  Search,
  TrendingUp,
  TrendingDown,
  Group,
  PersonAdd,
  Visibility,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

// API service matching your backend endpoints
const adminAPI = {
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await fetch('/api/users/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },
  
  // User management
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/users?${queryString}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },
  
  updateUserRole: async (userId, role) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ role })
    });
    return response.json();
  },
  
  deleteUser: async (userId) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },
  
  // Course management
  getCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/courses?${queryString}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },
  
  // Analytics
  getAuthStats: async () => {
    const response = await fetch('/api/auth/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },
  
  getEnrollmentStats: async () => {
    const response = await fetch('/api/enrollments/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
    newUsersThisWeek: 0,
    activeUsersThisWeek: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    registrationTrends: []
  });
  
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all admin data
      const [dashboardStats, authStats, enrollmentStats, usersData, coursesData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAuthStats(),
        adminAPI.getEnrollmentStats(),
        adminAPI.getUsers({ limit: 10 }),
        adminAPI.getCourses({ limit: 10 })
      ]);

      setStats({
        ...dashboardStats.data.overview,
        ...authStats.data,
        ...enrollmentStats.data,
        registrationTrends: dashboardStats.data.registrationTrends || []
      });
      
      setUsers(usersData.data.users || []);
      setCourses(coursesData.data.courses || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUserAction = (action, user) => {
    setSelectedUser(user);
    setAnchorEl(null);
    
    switch (action) {
      case 'edit':
        setEditFormData({
          name: user.name,
          email: user.email,
          role: user.role
        });
        setEditDialogOpen(true);
        break;
      case 'promote':
        handlePromoteUser(user);
        break;
      case 'demote':
        handleDemoteUser(user);
        break;
      case 'delete':
        handleDeleteUser(user);
        break;
      default:
        break;
    }
  };

  const handlePromoteUser = async (user) => {
    try {
      const newRole = user.role === 'student' ? 'instructor' : 'admin';
      await adminAPI.updateUserRole(user.id, newRole);
      toast.success(`User promoted to ${newRole}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error promoting user:', err);
      toast.error('Failed to promote user');
    }
  };

  const handleDemoteUser = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'instructor' : 'student';
      await adminAPI.updateUserRole(user.id, newRole);
      toast.success(`User demoted to ${newRole}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error demoting user:', err);
      toast.error('Failed to demote user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await adminAPI.deleteUser(user.id);
        toast.success('User deleted successfully');
        fetchDashboardData();
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEditUser = async () => {
    try {
      await adminAPI.updateUserRole(selectedUser.id, editFormData.role);
      toast.success('User updated successfully');
      setEditDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'instructor': return 'warning';
      case 'student': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          🎛️ Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          sx={{ borderRadius: 3 }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Dashboard />} label="Overview" />
        <Tab icon={<People />} label="Users" />
        <Tab icon={<School />} label="Courses" />
        <Tab icon={<Analytics />} label="Analytics" />
      </Tabs>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="white" fontWeight="bold">
                        {stats.totalUsers || 0}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Total Users
                      </Typography>
                    </Box>
                  </Box>
                  <Box mt={2} display="flex" gap={1}>
                    <Chip 
                      size="small" 
                      label={`${stats.totalStudents || 0} Students`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                    <Chip 
                      size="small" 
                      label={`${stats.totalInstructors || 0} Instructors`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <School />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="white" fontWeight="bold">
                        {stats.totalCourses || 0}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Total Courses
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <Group />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="white" fontWeight="bold">
                        {stats.totalEnrollments || 0}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Total Enrollments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="white" fontWeight="bold">
                        {stats.newUsersThisWeek || 0}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        New This Week
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" mb={3}>
                    📈 User Registration Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.registrationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="registrations" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="studentRegistrations" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="instructorRegistrations" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" mb={3}>
                    👥 User Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Students', value: stats.totalStudents || 0, fill: '#8884d8' },
                          { name: 'Instructors', value: stats.totalInstructors || 0, fill: '#82ca9d' },
                          { name: 'Admins', value: stats.totalAdmins || 0, fill: '#ffc658' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* User Management */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="instructor">Instructors</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<PersonAdd />}>
              Add User
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={user.avatar} alt={user.name}>
                          {user.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={getRoleColor(user.role)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.email_verified ? "Verified" : "Unverified"}
                        color={user.email_verified ? "success" : "warning"}
                        size="small"
                        icon={user.email_verified ? <CheckCircle /> : <Warning />}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedUser(user);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* User Actions Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItemComponent onClick={() => handleUserAction('edit', selectedUser)}>
              <Edit sx={{ mr: 1 }} /> Edit User
            </MenuItemComponent>
            <MenuItemComponent onClick={() => handleUserAction('promote', selectedUser)}>
              <TrendingUp sx={{ mr: 1 }} /> Promote Role
            </MenuItemComponent>
            <MenuItemComponent onClick={() => handleUserAction('demote', selectedUser)}>
              <TrendingDown sx={{ mr: 1 }} /> Demote Role
            </MenuItemComponent>
            <Divider />
            <MenuItemComponent 
              onClick={() => handleUserAction('delete', selectedUser)}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 1 }} /> Delete User
            </MenuItemComponent>
          </Menu>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {/* Course Management */}
          <Typography variant="h5" gutterBottom>
            📚 Course Management
          </Typography>
          
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course.id}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {course.description?.substring(0, 100)}...
                    </Typography>
                    
                    <Box display="flex" gap={1} mb={2}>
                      <Chip 
                        label={course.level} 
                        size="small" 
                        color="primary"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Chip 
                        label={course.is_published ? "Published" : "Draft"}
                        size="small"
                        color={course.is_published ? "success" : "warning"}
                      />
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {course.enrolled_students} students
                      </Typography>
                      <ButtonGroup size="small">
                        <Button startIcon={<Visibility />}>View</Button>
                        <Button startIcon={<Edit />}>Edit</Button>
                      </ButtonGroup>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          {/* Analytics */}
          <Typography variant="h5" gutterBottom>
            📊 Platform Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" mb={3}>
                    📅 Weekly Activity
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.registrationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="registrations" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" mb={3}>
                    🎯 Key Metrics
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <People />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Active Users This Week"
                        secondary={`${stats.activeUsersThisWeek} users`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <TrendingUp />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Growth Rate"
                        secondary="15% increase from last month"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <School />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Course Completion Rate"
                        secondary="78% average completion"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Edit User Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={editFormData.role}
                label="Role"
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="instructor">Instructor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditUser}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;