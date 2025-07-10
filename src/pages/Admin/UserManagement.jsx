import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  useTheme, 
  useMediaQuery,
  Grid,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Fade,
  Skeleton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  PersonOff,
  PersonAdd,
  Edit,
  Delete,
  Refresh,
  Download,
  MoreVert,
  CheckCircle,
  Cancel,
  Warning,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  AdminPanelSettings,
  Group
} from '@mui/icons-material';
import { getFirestore, collection, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import Swal from 'sweetalert2';



const db = getFirestore();

const UserManagement = ({ isDark = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || "Active",
        createdAt: doc.data().createdAt ? 
          (doc.data().createdAt.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)) : 
          new Date()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Failed to fetch users. Please try again.',
        confirmButtonColor: '#a78bfa' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Paginated users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleStatusChange = async (user) => {
    const newStatus = user.status === 'Active' ? 'deactivated' : 'Active';
    const action = newStatus === 'Active' ? 'reactivate' : 'deactivate';
    
    const { isConfirmed } = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      text: `Are you sure you want to ${action} ${user.firstName || 'this user'}?`,
      icon: newStatus === 'Active' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelButtonText: 'Cancel',
      confirmButtonColor: newStatus === 'Active' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (!isConfirmed) return;

    try {
      await updateDoc(doc(db, "users", user.id), { 
        status: newStatus,
        [newStatus === 'Active' ? 'reactivatedAt' : 'deactivatedAt']: serverTimestamp(),
        [newStatus === 'Active' ? 'reactivatedBy' : 'deactivatedBy']: 'admin'
      });

      // Update local state
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      );
      setUsers(updatedUsers);

      Swal.fire({ 
        icon: 'success', 
        title: `User ${action}d!`, 
        text: `The user has been ${action}d successfully.`,
        confirmButtonColor: '#a78bfa' 
      });
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: `Failed to ${action} user. Please try again.`,
        confirmButtonColor: '#a78bfa' 
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'deactivated': return 'error';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <CheckCircle />;
      case 'deactivated': return <Cancel />;
      default: return <Warning />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <AdminPanelSettings />;
      case 'Moderator': return <Group />;
      default: return <Person />;
    }
  };

  // Mobile Card View
  const MobileUserCard = ({ user }) => (
    <Fade in timeout={300}>
      <Card 
        sx={{ 
          mb: 2, 
          p: 2,
          background: isDark 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
          boxShadow: isDark 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isDark 
              ? '0 8px 25px -5px rgba(0, 0, 0, 0.4)' 
              : '0 8px 25px -5px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            src={user.avatar} 
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            {user.firstName[0]}{user.lastName[0]}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon(user.status)}
            label={user.status}
            color={getStatusColor(user.status)}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <Chip
            icon={getRoleIcon(user.role)}
            label={user.role}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            Joined {user.createdAt.toLocaleDateString()}
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            onClick={() => handleViewDetails(user)}
            sx={{ flex: 1 }}
          >
            Details
          </Button>
          <Button
            variant="outlined"
            size="small"
            color={user.status === 'Active' ? 'error' : 'success'}
            startIcon={user.status === 'Active' ? <PersonOff /> : <PersonAdd />}
            onClick={() => handleStatusChange(user)}
            sx={{ flex: 1 }}
          >
            {user.status === 'Active' ? 'Deactivate' : 'Reactivate'}
          </Button>
        </Box>
      </Card>
    </Fade>
  );

  // Desktop Table View
  const DesktopTable = () => (
    <TableContainer component={Paper} sx={{ 
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderRadius: 2
    }}>
      <Table>
        <TableHead>
          <TableRow sx={{ 
            bgcolor: isDark ? '#1e293b' : '#f8fafc',
            '& th': { fontWeight: 600 }
          }}>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow 
              key={user.id}
              sx={{ 
                '&:hover': { 
                  bgcolor: isDark ? '#334155' : '#f1f5f9',
                  transition: 'background-color 0.2s ease'
                }
              }}
            >
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar 
                    src={user.avatar} 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user.firstName[0]}{user.lastName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={500}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {user.id}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{user.email}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  icon={getRoleIcon(user.role)}
                  label={user.role}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  icon={getStatusIcon(user.status)}
                  label={user.status}
                  color={getStatusColor(user.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {user.createdAt.toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={1} justifyContent="center">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(user)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.status === 'Active' ? 'Deactivate' : 'Reactivate'}>
                    <IconButton
                      size="small"
                      onClick={() => handleStatusChange(user)}
                      sx={{ color: user.status === 'Active' ? 'error.main' : 'success.main' }}
                    >
                      {user.status === 'Active' ? <PersonOff /> : <PersonAdd />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </TableContainer>
  );

  // Stats Cards
  const StatsCard = ({ title, value, icon, color }) => (
    <Card sx={{ 
      p: 2,
      background: isDark 
        ? `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`
        : `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
      border: `1px solid ${color}30`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px -5px ${color}30`
      }
    }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={700} color={color}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Box sx={{ color: color, opacity: 0.7 }}>
          {icon}
        </Box>
      </Box>
    </Card>
  );

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const deactivatedUsers = users.filter(u => u.status === 'deactivated').length;
  const adminUsers = users.filter(u => u.role === 'Admin').length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box mb={4}>
        <Typography 
          variant={isSmall ? "h5" : "h4"} 
          fontWeight={700}
          mb={1}
          sx={{
            background: isDark 
              ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          User Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and monitor user accounts across your platform
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={users.length}
            icon={<Group sx={{ fontSize: 40 }} />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Users"
            value={activeUsers}
            icon={<CheckCircle sx={{ fontSize: 40 }} />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Deactivated"
            value={deactivatedUsers}
            icon={<Cancel sx={{ fontSize: 40 }} />}
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Admins"
            value={adminUsers}
            icon={<AdminPanelSettings sx={{ fontSize: 40 }} />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
          alignItems={{ md: 'center' }}
        >
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant={statusFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('all')}
              size="small"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('active')}
              size="small"
              color="success"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'deactivated' ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter('deactivated')}
              size="small"
              color="error"
            >
              Deactivated
            </Button>
            <Button
              variant="outlined"
              startIcon={loading ? <Skeleton variant="circular" width={16} height={16} /> : <Refresh />}
              onClick={fetchUsers}
              size="small"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Content */}
      {loading ? (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2 }} />
          ))}
        </Box>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" mb={2}>
                {users.length === 0 ? 'No users found' : 'No users match your search criteria'}
              </Typography>
              {users.length === 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  Try Again
                </Button>
              )}
            </Card>
          ) : (
            <>
              {isMobile ? (
                <Box>
                  {paginatedUsers.map((user) => (
                    <MobileUserCard key={user.id} user={user} />
                  ))}
                  {filteredUsers.length > rowsPerPage && (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredUsers.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <DesktopTable />
              )}
            </>
          )}
        </>
      )}

      {/* User Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          bgcolor: isDark ? '#1e293b' : '#f8fafc',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`
        }}>
          <Box display="flex" alignItems="center">
            <Avatar 
              src={selectedUser?.avatar} 
              sx={{ width: 50, height: 50, mr: 2 }}
            >
              {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedUser?.firstName} {selectedUser?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User Details
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip
                      icon={getRoleIcon(selectedUser.role)}
                      label={selectedUser.role}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircle sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      icon={getStatusIcon(selectedUser.status)}
                      label={selectedUser.status}
                      color={getStatusColor(selectedUser.status)}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Joined
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.createdAt.toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {selectedUser.deactivatedAt && (
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Cancel sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Deactivated
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.deactivatedAt.toDate ? 
                          selectedUser.deactivatedAt.toDate().toLocaleDateString() : 
                          new Date(selectedUser.deactivatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {selectedUser.reactivatedAt && (
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CheckCircle sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Reactivated
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.reactivatedAt.toDate ? 
                          selectedUser.reactivatedAt.toDate().toLocaleDateString() : 
                          new Date(selectedUser.reactivatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {selectedUser.phone && (
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {selectedUser.address && (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.address}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            color={selectedUser?.status === 'Active' ? 'error' : 'success'}
            onClick={() => {
              if (selectedUser) {
                handleStatusChange(selectedUser);
                setDetailsOpen(false);
              }
            }}
          >
            {selectedUser?.status === 'Active' ? 'Deactivate' : 'Reactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;