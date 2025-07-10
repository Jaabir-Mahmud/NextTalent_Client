import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  useTheme, 
  useMediaQuery, 
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  CardHeader,
  Divider,
  Stack,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Badge,
  Container
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Visibility, 
  Business, 
  LocationOn, 
  AttachMoney, 
  Person, 
  CalendarToday,
  Search,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import Swal from 'sweetalert2';

const db = getFirestore();

const JobModeration = ({ isDark }) => {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState([]);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  // Filter jobs based on search and status
  useEffect(() => {
    let filtered = jobs;
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  // Status chip component
  const StatusChip = ({ status }) => {
    const getStatusProps = (status) => {
      switch (status) {
        case 'approved':
          return { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> };
        case 'rejected':
          return { color: 'error', icon: <Cancel sx={{ fontSize: 16 }} /> };
        default:
          return { color: 'warning', icon: <FilterList sx={{ fontSize: 16 }} /> };
      }
    };

    const statusProps = getStatusProps(status);
    return (
      <Chip
        label={status || 'pending'}
        color={statusProps.color}
        variant="outlined"
        size="small"
        icon={statusProps.icon}
        sx={{ fontWeight: 500, textTransform: 'capitalize' }}
      />
    );
  };

  // Responsive job columns
  const getJobColumns = () => {
    if (isSmall) {
      // Mobile view - minimal columns
      return [
        { 
          field: 'title', 
          headerName: 'Job', 
          flex: 1,
          minWidth: 120,
          renderCell: (params) => (
            <Box>
              <Typography variant="body2" fontWeight={600} noWrap>
                {params.row.title || 'Untitled Job'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row.companyName || 'Unknown Company'}
              </Typography>
            </Box>
          )
        },
        { 
          field: 'status', 
          headerName: 'Status', 
          width: 100,
          renderCell: (params) => <StatusChip status={params.value} />
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 100,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box display="flex" gap={0.5}>
              <Tooltip title="View Details">
                <IconButton 
                  size="small" 
                  onClick={() => handleViewJobDetails(params.row)}
                  sx={{ color: 'primary.main' }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Approve">
                <IconButton 
                  size="small" 
                  onClick={() => handleApproveJob(params.row.id, params.row.postedBy, params.row.title, params.row.companyName)}
                  disabled={params.row.status === 'approved'}
                  sx={{ color: 'success.main' }}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton 
                  size="small" 
                  onClick={() => handleRejectJob(params.row.id, params.row.postedBy, params.row.title, params.row.companyName)}
                  disabled={params.row.status === 'rejected'}
                  sx={{ color: 'error.main' }}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )
        }
      ];
    } else if (isMedium) {
      // Medium view - balanced columns
      return [
        { 
          field: 'title', 
          headerName: 'Job Title', 
          flex: 1,
          minWidth: 150,
          renderCell: (params) => (
            <Box>
              <Typography variant="body2" fontWeight={600} noWrap>
                {params.row.title || 'Untitled Job'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                <Business sx={{ fontSize: 12, mr: 0.5 }} />
                {params.row.companyName || 'Unknown Company'}
              </Typography>
            </Box>
          )
        },
        { 
          field: 'location', 
          headerName: 'Location', 
          width: 120,
          renderCell: (params) => (
            <Box display="flex" alignItems="center">
              <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" noWrap>
                {params.row.location || 'Remote'}
              </Typography>
            </Box>
          )
        },
        { 
          field: 'status', 
          headerName: 'Status', 
          width: 120,
          renderCell: (params) => <StatusChip status={params.value} />
        },
        { 
          field: 'createdAt', 
          headerName: 'Posted', 
          width: 100,
          renderCell: (params) => {
            if (!params.row.createdAt) return <Typography variant="body2">N/A</Typography>;
            try {
              const date = params.row.createdAt.toDate ? params.row.createdAt.toDate() : new Date(params.row.createdAt);
              return (
                <Box display="flex" alignItems="center">
                  <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Typography>
                </Box>
              );
            } catch {
              return <Typography variant="body2">N/A</Typography>;
            }
          }
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 120,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box display="flex" gap={0.5}>
              <Tooltip title="View Details">
                <IconButton 
                  size="small" 
                  onClick={() => handleViewJobDetails(params.row)}
                  sx={{ color: 'primary.main' }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Approve">
                <IconButton 
                  size="small" 
                  onClick={() => handleApproveJob(params.row.id, params.row.postedBy, params.row.title, params.row.companyName)}
                  disabled={params.row.status === 'approved'}
                  sx={{ color: 'success.main' }}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton 
                  size="small" 
                  onClick={() => handleRejectJob(params.row.id, params.row.postedBy, params.row.title, params.row.companyName)}
                  disabled={params.row.status === 'rejected'}
                  sx={{ color: 'error.main' }}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )
        }
      ];
    } else {
      // Large view - full columns
      return [
        { 
          field: 'title', 
          headerName: 'Job Title', 
          flex: 1,
          minWidth: 200,
          renderCell: (params) => (
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {params.row.title || 'Untitled Job'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {params.row.id.slice(0, 8)}...
              </Typography>
            </Box>
          )
        },
        { 
          field: 'companyName', 
          headerName: 'Company', 
          width: 160,
          renderCell: (params) => (
            <Box display="flex" alignItems="center">
              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                <Business fontSize="small" />
              </Avatar>
              <Typography variant="body2" noWrap>
                {params.row.companyName || 'Unknown Company'}
              </Typography>
            </Box>
          )
        },
        { 
          field: 'location', 
          headerName: 'Location', 
          width: 140,
          renderCell: (params) => (
            <Box display="flex" alignItems="center">
              <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" noWrap>
                {params.row.location || 'Remote'}
              </Typography>
            </Box>
          )
        },
        { 
          field: 'salary', 
          headerName: 'Salary', 
          width: 120,
          renderCell: (params) => (
            <Box display="flex" alignItems="center">
              <AttachMoney sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
              <Typography variant="body2" noWrap>
                {params.row.salary || 'Not specified'}
              </Typography>
            </Box>
          )
        },
        { 
          field: 'status', 
          headerName: 'Status', 
          width: 130,
          renderCell: (params) => <StatusChip status={params.value} />
        },
        { 
          field: 'postedBy', 
          headerName: 'Posted By', 
          width: 140,
          renderCell: (params) => (
            <Box display="flex" alignItems="center">
              <Person sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" noWrap>
                {params.row.postedBy || 'Unknown'}
              </Typography>
            </Box>
          )
        },
        { 
          field: 'createdAt', 
          headerName: 'Posted Date', 
          width: 140,
          renderCell: (params) => {
            if (!params.row.createdAt) return <Typography variant="body2">N/A</Typography>;
            try {
              const date = params.row.createdAt.toDate ? params.row.createdAt.toDate() : new Date(params.row.createdAt);
              return (
                <Box display="flex" alignItems="center">
                  <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {date.toLocaleDateString()}
                  </Typography>
                </Box>
              );
            } catch {
              return <Typography variant="body2">N/A</Typography>;
            }
          }
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 120,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box display="flex" gap={0.5}>
              <Tooltip title="View Details">
                <IconButton 
                  size="small" 
                  onClick={() => handleViewJobDetails(params.row)}
                  sx={{ color: 'primary.main' }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Approve">
                <IconButton 
                  size="small" 
                  onClick={() => handleApproveJob(params.row.id, params.row.postedBy, params.row.title, params.row.companyName)}
                  disabled={params.row.status === 'approved'}
                  sx={{ color: 'success.main' }}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton 
                  size="small" 
                  onClick={() => handleRejectJob(params.row.id, params.row.postedBy, params.row.title, params.row.companyName)}
                  disabled={params.row.status === 'rejected'}
                  sx={{ color: 'error.main' }}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )
        }
      ];
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleApproveJob = async (jobId, employerId, jobTitle, companyName) => {
    const { value: message } = await Swal.fire({
      title: 'Approve Job',
      text: `Are you sure you want to approve "${jobTitle}"?`,
      input: 'textarea',
      inputLabel: 'Optional message to employer:',
      inputPlaceholder: 'Add a note about the approval (optional)...',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      inputValidator: () => null
    });

    if (message === undefined) return;

    try {
      await updateDoc(doc(db, "jobs", jobId), { 
        status: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: 'admin'
      });

      await addDoc(collection(db, "notifications"), {
        userId: employerId,
        type: "job_approved",
        title: "Job Approved",
        message: `Your job posting "${jobTitle}" at ${companyName} has been approved and is now live.`,
        jobId: jobId,
        read: false,
        createdAt: serverTimestamp()
      });

      if (message && message.trim()) {
        await addDoc(collection(db, "messages"), {
          fromUserId: 'admin',
          toUserId: employerId,
          fromRole: "Admin",
          toRole: "Employer",
          subject: `Job Approved: ${jobTitle}`,
          message: message.trim(),
          jobId: jobId,
          jobTitle: jobTitle,
          read: false,
          createdAt: serverTimestamp()
        });
      }

      Swal.fire({ 
        icon: 'success', 
        title: 'Job approved!', 
        text: message ? 'Job approved and message sent to employer.' : 'The employer has been notified.',
        confirmButtonColor: '#a78bfa' 
      });
      fetchJobs();
    } catch (error) {
      console.error('Error approving job:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Failed to approve job. Please try again.',
        confirmButtonColor: '#a78bfa' 
      });
    }
  };

  const handleRejectJob = async (jobId, employerId, jobTitle, companyName) => {
    const { value: message } = await Swal.fire({
      title: 'Reject Job',
      text: `Are you sure you want to reject "${jobTitle}"?`,
      input: 'textarea',
      inputLabel: 'Reason for rejection (required):',
      inputPlaceholder: 'Please provide a reason for rejecting this job posting...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'You need to provide a reason for rejection!';
        }
        return null;
      }
    });

    if (message === undefined) return;

    try {
      await updateDoc(doc(db, "jobs", jobId), { 
        status: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: 'admin',
        rejectionReason: message.trim()
      });

      await addDoc(collection(db, "notifications"), {
        userId: employerId,
        type: "job_rejected",
        title: "Job Rejected",
        message: `Your job posting "${jobTitle}" at ${companyName} has been rejected. Please review and resubmit.`,
        jobId: jobId,
        read: false,
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "messages"), {
        fromUserId: 'admin',
        toUserId: employerId,
        fromRole: "Admin",
        toRole: "Employer",
        subject: `Job Rejected: ${jobTitle}`,
        message: `Your job posting "${jobTitle}" has been rejected.\n\nReason: ${message.trim()}\n\nPlease review the feedback and resubmit with the necessary changes.`,
        jobId: jobId,
        jobTitle: jobTitle,
        read: false,
        createdAt: serverTimestamp()
      });

      Swal.fire({ 
        icon: 'success', 
        title: 'Job rejected!', 
        text: 'Job rejected and feedback sent to employer.',
        confirmButtonColor: '#a78bfa' 
      });
      fetchJobs();
    } catch (error) {
      console.error('Error rejecting job:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Failed to reject job. Please try again.',
        confirmButtonColor: '#a78bfa' 
      });
    }
  };

  const handleViewJobDetails = (job) => {
    Swal.fire({
      title: job.title || 'Job Details',
      html: `
        <div style="text-align: left; max-width: 600px; font-family: 'Roboto', sans-serif;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <strong style="color: #1976d2;">Company:</strong><br>
              <span style="font-size: 14px;">${job.companyName || 'Not specified'}</span>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <strong style="color: #1976d2;">Location:</strong><br>
              <span style="font-size: 14px;">${job.location || 'Not specified'}</span>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <strong style="color: #1976d2;">Salary:</strong><br>
              <span style="font-size: 14px;">${job.salary || 'Not specified'}</span>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <strong style="color: #1976d2;">Status:</strong><br>
              <span style="color: ${job.status === 'approved' ? '#4caf50' : job.status === 'rejected' ? '#f44336' : '#ff9800'}; font-weight: bold; text-transform: capitalize;">${job.status || 'pending'}</span>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <strong style="color: #1976d2;">Posted By:</strong><br>
              <span style="font-size: 14px;">${job.postedBy || 'Unknown'}</span>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <strong style="color: #1976d2;">Posted Date:</strong><br>
              <span style="font-size: 14px;">${job.createdAt ? (job.createdAt.toDate ? job.createdAt.toDate().toLocaleDateString() : new Date(job.createdAt).toLocaleDateString()) : 'N/A'}</span>
            </div>
          </div>
          ${job.description ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #1976d2;">Description:</strong><br>
            <div style="max-height: 120px; overflow-y: auto; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-top: 10px; border-left: 4px solid #1976d2;">
              ${job.description}
            </div>
          </div>
          ` : ''}
          ${job.requirements && job.requirements.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #1976d2;">Requirements:</strong><br>
            <ul style="margin: 10px 0; padding-left: 20px; background: #f8f9fa; border-radius: 8px; padding: 15px;">
              ${job.requirements.map(req => `<li style="margin-bottom: 5px;">${req}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          ${job.rejectionReason ? `
          <div style="margin-bottom: 20px;">
            <strong style="color: #f44336;">Rejection Reason:</strong><br>
            <div style="padding: 15px; background: #ffebee; border-radius: 8px; margin-top: 10px; color: #c62828; border-left: 4px solid #f44336;">
              ${job.rejectionReason}
            </div>
          </div>
          ` : ''}
        </div>
      `,
      width: isSmall ? '95%' : '700px',
      confirmButtonText: 'Close',
      confirmButtonColor: '#a78bfa',
      showCloseButton: true,
      customClass: {
        popup: 'job-details-popup'
      }
    });
  };

  // Stats calculation
  const stats = {
    total: jobs.length,
    approved: jobs.filter(job => job.status === 'approved').length,
    rejected: jobs.filter(job => job.status === 'rejected').length,
    pending: jobs.filter(job => job.status === 'pending' || !job.status).length
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isSmall ? "h5" : "h4"} 
          sx={{ 
            mb: 1, 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Job Moderation Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and manage job postings efficiently
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
            <Typography variant="body2">Total Jobs</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">{stats.approved}</Typography>
            <Typography variant="body2">Approved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.main', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">{stats.rejected}</Typography>
            <Typography variant="body2">Rejected</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">{stats.pending}</Typography>
            <Typography variant="body2">Pending</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Filters & Search"
          action={
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchJobs} disabled={loadingJobs}>
                <Refresh />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <Box sx={{ p: 2 }}>
          <Stack direction={isSmall ? "column" : "row"} spacing={2} alignItems="center">
            <TextField
              placeholder="Search jobs, companies, locations..."
              variant="outlined"
              size="small"
              fullWidth={isSmall}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Stack direction="row" spacing={1}>
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setStatusFilter(status)}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {status === 'all' ? 'All' : status}
                  {status !== 'all' && (
                    <Badge 
                      badgeContent={stats[status]} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Card>

      {/* Data Grid */}
      <Card sx={{ 
        height: isSmall ? 400 : isMedium ? 500 : 600,
        '& .MuiDataGrid-root': {
          border: 'none',
        },
        '& .MuiDataGrid-cell': { 
          borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
          '&:focus': {
            outline: 'none',
          }
        },
        '& .MuiDataGrid-columnHeaders': { 
          bgcolor: isDark ? '#1e1e1e' : '#f8f9fa',
          borderBottom: `2px solid ${isDark ? '#333' : '#e0e0e0'}`,
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          }
        },
        '& .MuiDataGrid-row': {
          '&:hover': {
            bgcolor: isDark ? '#2a2a2a' : '#f5f5f5',
          }
        }
      }}>
        <DataGrid
          rows={filteredJobs}
          columns={getJobColumns()}
          pageSize={isSmall ? 5 : isMedium ? 10 : 15}
          rowsPerPageOptions={isSmall ? [5] : isMedium ? [10] : [15]}
          loading={loadingJobs}
          disableSelectionOnClick
          autoHeight={false}
          density={isSmall ? 'compact' : 'standard'}
        />
      </Card>
    </Container>
  );
};

export default JobModeration;