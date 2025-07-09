import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from "../AuthContext";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Tabs, Tab, Button, Card, CardContent, Grid } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BarChartIcon from '@mui/icons-material/BarChart';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc, addDoc } from "firebase/firestore";
import { EmailAuthProvider } from "firebase/auth";
import { startOfDay, isSameDay } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,ArcElement, Title, Tooltip, Legend);
import { Pie } from 'react-chartjs-2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 220;
const db = getFirestore();

const userColumns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'firstName', headerName: 'First name', width: 150 },
  { field: 'lastName', headerName: 'Last name', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'role', headerName: 'Role', width: 130 },
  { field: 'status', headerName: 'Status', width: 120 },
];

const jobColumns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'title', headerName: 'Title', width: 180 },
  { field: 'companyName', headerName: 'Company', width: 160 },
  { field: 'location', headerName: 'Location', width: 120 },
  { field: 'salary', headerName: 'Salary', width: 120 },
  { field: 'status', headerName: 'Status', width: 120 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 180,
    renderCell: (params) => params.row.renderActions(params.row)
  }
];

const AdminDashboard = ({ isDark, toggleDark }) => {
  const { user, role } = useAuth();
  const [tab, setTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, pendingJobs: 0, dailySignups: 0 });
  const [signupTrend, setSignupTrend] = useState({ labels: [], data: [] });
  const [jobTrend, setJobTrend] = useState({ labels: [], data: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], data: [] });
  const [feedback, setFeedback] = useState([]);
  const [settings, setSettings] = useState({ displayName: '', emailNotifications: 'Enabled', theme: 'system' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState({});
  const [profilePic, setProfilePic] = useState("");
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false); // mock
  const navigate = useNavigate();

  // Fetch replies for all feedback
  const fetchReplies = async (feedbackList) => {
    const allReplies = {};
    for (const fb of feedbackList) {
      const repliesSnap = await getDocs(collection(db, 'feedback', fb.id, 'replies'));
      allReplies[fb.id] = repliesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    setReplies(allReplies);
  };

  // Fetch feedback from Firestore
  const fetchFeedback = async () => {
    const snap = await getDocs(collection(db, 'feedback'));
    const fbList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFeedback(fbList);
    await fetchReplies(fbList);
  };

  // Fetch admin settings from Firestore
  const fetchSettings = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, 'adminSettings'));
    // If settings exist for this user, use them
    const userSettings = snap.docs.find(d => d.id === user.uid)?.data();
    setSettings({
      displayName: userSettings?.displayName || 'Admin',
      emailNotifications: userSettings?.emailNotifications || 'Enabled',
      theme: userSettings?.theme || 'system',
    });
    setProfilePic(userSettings?.profilePic || "");
    setTwoFAEnabled(userSettings?.twoFAEnabled || false);
  };

  useEffect(() => {
    if (tab === 1) fetchUsers();
    if (tab === 2) fetchJobs();
    if (tab === 0) {
      fetchStats();
      fetchSignupTrend();
      fetchJobTrend();
      fetchCategoryData();
    }
    if (tab === 4) fetchFeedback();
    if (tab === 5) fetchSettings();
    // eslint-disable-next-line
  }, [tab]);

  if (!user || role !== "Admin") {
    return <div className="p-8 text-center text-lg">You do not have admin access.</div>;
  }

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: "Active" // Placeholder, add real status if you have it
    }));
    setUsers(usersData);
    setLoadingUsers(false);
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    const querySnapshot = await getDocs(collection(db, "jobs"));
    const jobsData = querySnapshot.docs.map(doc => {
      const job = doc.data();
      return {
        id: doc.id,
        ...job,
        renderActions: (row) => (
          <>
            <Button size="small" color="primary" startIcon={<EditIcon />} onClick={() => handleEditJob(row)}>Edit</Button>
            <Button size="small" color="success" startIcon={<CheckIcon />} onClick={() => handleApproveJob(row.id)} disabled={row.status === 'approved'}>Approve</Button>
            <Button size="small" color="error" startIcon={<CloseIcon />} onClick={() => handleRejectJob(row.id)} disabled={row.status === 'rejected'}>Reject</Button>
          </>
        )
      };
    });
    setJobs(jobsData);
    setLoadingJobs(false);
  };

  const handleApproveJob = async (jobId) => {
    await updateDoc(doc(db, "jobs", jobId), { status: "approved" });
    Swal.fire({ icon: 'success', title: 'Job approved!', confirmButtonColor: '#a78bfa' });
    fetchJobs();
  };

  const handleRejectJob = async (jobId) => {
    await updateDoc(doc(db, "jobs", jobId), { status: "rejected" });
    Swal.fire({ icon: 'success', title: 'Job rejected!', confirmButtonColor: '#a78bfa' });
    fetchJobs();
  };

  const handleEditJob = (row) => {
    Swal.fire({
      title: 'Edit Job (Not implemented)',
      text: `Job: ${row.title}`,
      icon: 'info',
      confirmButtonColor: '#a78bfa',
    });
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const fetchStats = async () => {
    // Total users
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(doc => doc.data());
    // Total jobs
    const jobsSnap = await getDocs(collection(db, "jobs"));
    const jobs = jobsSnap.docs.map(doc => doc.data());
    // Pending jobs
    const pendingJobs = jobs.filter(j => j.status === 'pending').length;
    // Daily signups (today)
    const today = startOfDay(new Date());
    const dailySignups = users.filter(u => u.createdAt && isSameDay(u.createdAt.toDate ? u.createdAt.toDate() : u.createdAt, today)).length;
    setStats({
      totalUsers: users.length,
      totalJobs: jobs.length,
      pendingJobs,
      dailySignups
    });
  };

  const fetchSignupTrend = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(doc => doc.data());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const labels = days.map(d => d.toLocaleDateString());
    const data = days.map(day =>
      users.filter(u => u.createdAt && isSameDay(u.createdAt.toDate ? u.createdAt.toDate() : u.createdAt, day)).length
    );
    setSignupTrend({ labels, data });
  };

  const fetchJobTrend = async () => {
    const jobsSnap = await getDocs(collection(db, "jobs"));
    const jobs = jobsSnap.docs.map(doc => doc.data());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const labels = days.map(d => d.toLocaleDateString());
    const data = days.map(day =>
      jobs.filter(j => j.createdAt && isSameDay(j.createdAt.toDate ? j.createdAt.toDate() : j.createdAt, day)).length
    );
    setJobTrend({ labels, data });
  };

  const fetchCategoryData = async () => {
    const jobsSnap = await getDocs(collection(db, "jobs"));
    const jobs = jobsSnap.docs.map(doc => doc.data());
    // Use job title or first requirement as category
    const categoryCounts = {};
    jobs.forEach(job => {
      let cat = (job.title || '').split(' ')[0];
      if (job.requirements && job.requirements.length > 0) {
        cat = job.requirements[0];
      }
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });
    const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    setCategoryData({
      labels: sorted.map(([cat]) => cat),
      data: sorted.map(([, count]) => count)
    });
  };

  // Download helpers
  const downloadCSV = (data, filename) => {
    const csvRows = [];
    const headers = Object.keys(data[0] || {});
    csvRows.push(headers.join(','));
    for (const row of data) {
      csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle profile picture upload (mock: just preview, real: upload to Firebase Storage)
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);
    // TODO: Upload to Firebase Storage and get URL, then save to Firestore
    // For now, just preview
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.paper' },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button selected={tab === 0} onClick={() => setTab(0)}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button selected={tab === 1} onClick={() => setTab(1)}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem button selected={tab === 2} onClick={() => setTab(2)}>
            <ListItemIcon><WorkIcon /></ListItemIcon>
            <ListItemText primary="Jobs" />
          </ListItem>
          <ListItem button selected={tab === 3} onClick={() => setTab(3)}>
            <ListItemIcon><BarChartIcon /></ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>
          <ListItem button selected={tab === 4} onClick={() => setTab(4)}>
            <ListItemIcon><FeedbackIcon /></ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItem>
          <ListItem button selected={tab === 5} onClick={() => setTab(5)}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: isDark ? '#18181b' : 'white', color: isDark ? '#f3f4f6' : '#18181b' }} elevation={1} color="transparent">
          <Toolbar>
            <IconButton color="inherit" edge="start" sx={{ mr: 2, display: { sm: 'none' } }} onClick={() => setMobileOpen(!mobileOpen)}>
              <MenuIcon />
            </IconButton>
            <IconButton color="inherit" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: isDark ? '#f3f4f6' : '#18181b' }}>
              Admin Panel
            </Typography>
            <IconButton sx={{ ml: 1 }} onClick={toggleDark} color="inherit">
              {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            {/* TODO: Add notifications, avatar */}
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ mb: 3, color: isDark ? '#f3f4f6' : '#18181b' }}
          textColor={isDark ? 'secondary' : 'primary'}
          indicatorColor={isDark ? 'secondary' : 'primary'}
        >
          <Tab label="Dashboard" />
          <Tab label="Users" />
          <Tab label="Jobs" />
          <Tab label="Reports" />
          <Tab label="Feedback" />
          <Tab label="Settings" />
        </Tabs>
        {tab === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}>Dashboard Overview</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.main', color: isDark ? '#f3f4f6' : '#18181b' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>Total Users</Typography>
                    <Typography variant="h4" sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>{stats.totalUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'secondary.main', color: isDark ? '#f3f4f6' : '#18181b' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>Total Jobs</Typography>
                    <Typography variant="h4" sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>{stats.totalJobs}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.main', color: isDark ? '#f3f4f6' : '#18181b' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>Pending Jobs</Typography>
                    <Typography variant="h4" sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>{stats.pendingJobs}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.main', color: isDark ? '#f3f4f6' : '#18181b' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>Daily Signups</Typography>
                    <Typography variant="h4" sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>{stats.dailySignups}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}>Daily User Signups (Last 7 Days)</Typography>
              <Line
                key={signupTrend.labels.join('-') + signupTrend.data.join('-')}
                data={{
                  labels: signupTrend.labels,
                  datasets: [
                    {
                      label: 'Signups',
                      data: signupTrend.data,
                      borderColor: '#6366f1',
                      backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false, labels: { color: isDark ? '#f3f4f6' : '#18181b' } },
                    title: { display: false, color: isDark ? '#f3f4f6' : '#18181b' },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: isDark ? '#f3f4f6' : '#18181b' } },
                    y: { beginAtZero: true, grid: { color: isDark ? '#333' : '#eee' }, ticks: { color: isDark ? '#f3f4f6' : '#18181b' } },
                  },
                }}
                height={80}
              />
            </Box>
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}>Daily Job Posts (Last 7 Days)</Typography>
              <Line
                key={jobTrend.labels.join('-') + jobTrend.data.join('-')}
                data={{
                  labels: jobTrend.labels,
                  datasets: [
                    {
                      label: 'Job Posts',
                      data: jobTrend.data,
                      borderColor: '#10b981',
                      backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false, labels: { color: isDark ? '#f3f4f6' : '#18181b' } },
                    title: { display: false, color: isDark ? '#f3f4f6' : '#18181b' },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: isDark ? '#f3f4f6' : '#18181b' } },
                    y: { beginAtZero: true, grid: { color: isDark ? '#333' : '#eee' }, ticks: { color: isDark ? '#f3f4f6' : '#18181b' } },
                  },
                }}
                height={80}
              />
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 3,
                mb: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}
              >
                Top 5 Job Categories
              </Typography>
              <Pie
                key={categoryData.labels.join('-') + categoryData.data.join('-')}
                data={{
                  labels: categoryData.labels,
                  datasets: [
                    {
                      label: 'Jobs',
                      data: categoryData.data,
                      backgroundColor: [
                        '#6366f1', '#10b981', '#f59e42', '#f43f5e', '#3b82f6'
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: false, // <-- Fix: disable responsiveness
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: isDark ? '#f3f4f6' : '#18181b', font: { size: 14 } },
                    },
                  },
                }}
                width={350}
                height={250}
              />
            </Box>
            {/* TODO: Add more charts for trends */}
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}>User Management</Typography>
            <div style={{ height: 500, width: '100%', background: isDark ? '#23232a' : 'white', borderRadius: 8 }}>
              <DataGrid 
                rows={users} 
                columns={userColumns} 
                pageSize={10} 
                rowsPerPageOptions={[10]} 
                checkboxSelection 
                loading={loadingUsers}
                sx={{
                  bgcolor: isDark ? '#23232a' : 'white',
                  color: isDark ? '#f3f4f6' : '#18181b',
                  borderColor: isDark ? '#333' : '#e0e0e0',
                  '& .MuiDataGrid-cell': { color: isDark ? '#f3f4f6' : '#18181b' },
                  '& .MuiDataGrid-columnHeaders': { bgcolor: isDark ? '#18181b' : '#f3f4f6', color: isDark ? '#f3f4f6' : '#18181b' },
                }}
              />
            </div>
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}>Job Moderation</Typography>
            <div style={{ height: 500, width: '100%', background: isDark ? '#23232a' : 'white', borderRadius: 8 }}>
              <DataGrid 
                rows={jobs} 
                columns={jobColumns} 
                pageSize={10} 
                rowsPerPageOptions={[10]} 
                loading={loadingJobs}
                sx={{
                  bgcolor: isDark ? '#23232a' : 'white',
                  color: isDark ? '#f3f4f6' : '#18181b',
                  borderColor: isDark ? '#333' : '#e0e0e0',
                  '& .MuiDataGrid-cell': { color: isDark ? '#f3f4f6' : '#18181b' },
                  '& .MuiDataGrid-columnHeaders': { bgcolor: isDark ? '#18181b' : '#f3f4f6', color: isDark ? '#f3f4f6' : '#18181b' },
                }}
              />
            </div>
          </Box>
        )}
        {tab === 3 && (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}>Reports</Typography>
            <Typography sx={{ mb: 2, color: isDark ? '#d1d5db' : '#374151' }}>
              Download user, job, and feedback data for analysis. More analytics coming soon!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 2, mr: 2 }}
              onClick={async () => {
                const snap = await getDocs(collection(db, 'users'));
                downloadCSV(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })), 'users.csv');
              }}
            >
              Download Users CSV
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 2, mr: 2 }}
              onClick={async () => {
                const snap = await getDocs(collection(db, 'jobs'));
                downloadCSV(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })), 'jobs.csv');
              }}
            >
              Download Jobs CSV
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 2 }}
              onClick={async () => {
                const snap = await getDocs(collection(db, 'feedback'));
                downloadCSV(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })), 'feedback.csv');
              }}
            >
              Download Feedback CSV
            </Button>
          </Box>
        )}
        {tab === 4 && (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}>Feedback</Typography>
            <Typography sx={{ mb: 2, color: isDark ? '#d1d5db' : '#374151' }}>
              See user feedback and respond to improve the platform.
            </Typography>
            {feedback.length === 0 && <Typography sx={{ color: isDark ? '#a1a1aa' : '#6b7280' }}>No feedback yet.</Typography>}
            {feedback.map(fb => (
              <Box key={fb.id} sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: isDark ? '#23232a' : '#f3f4f6' }}>
                <Typography sx={{ color: isDark ? '#a5b4fc' : '#6366f1', fontWeight: 600 }}>{fb.user || fb.email || 'Anonymous'}</Typography>
                <Typography sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>{fb.message}</Typography>
                <Typography sx={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: 12 }}>
                  {fb.date && fb.date.seconds
                    ? new Date(fb.date.seconds * 1000).toLocaleString()
                    : (typeof fb.date === 'string' ? fb.date : '')}
                </Typography>
                {/* Replies */}
                {replies[fb.id] && replies[fb.id].length > 0 && (
                  <Box sx={{ mt: 2, ml: 2, pl: 2, borderLeft: `2px solid ${isDark ? '#6366f1' : '#6366f1'}` }}>
                    <Typography sx={{ color: isDark ? '#a5b4fc' : '#6366f1', fontWeight: 500, mb: 1 }}>Admin Replies:</Typography>
                    {replies[fb.id].map(r => (
                      <Box key={r.id} sx={{ mb: 1 }}>
                        <Typography sx={{ color: isDark ? '#f3f4f6' : '#18181b' }}>{r.text}</Typography>
                        <Typography sx={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: 11 }}>
                          {r.date && r.date.seconds
                            ? new Date(r.date.seconds * 1000).toLocaleString()
                            : (typeof r.date === 'string' ? r.date : '')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                {/* Reply form */}
                {replyingTo === fb.id ? (
                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      if (!replyText.trim()) return;
                      await addDoc(collection(db, 'feedback', fb.id, 'replies'), {
                        text: replyText,
                        date: new Date().toLocaleString(),
                        admin: user?.email || 'Admin',
                      });
                      setReplyText("");
                      setReplyingTo(null);
                      fetchFeedback();
                    }}
                    style={{ marginTop: 8 }}
                  >
                    <input
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      style={{ width: '70%', padding: 8, borderRadius: 4, border: '1px solid #ccc', background: isDark ? '#23232a' : '#fff', color: isDark ? '#f3f4f6' : '#18181b', marginRight: 8 }}
                    />
                    <Button type="submit" variant="contained" color="primary" size="small">Send</Button>
                    <Button onClick={() => { setReplyingTo(null); setReplyText(""); }} size="small" sx={{ ml: 1 }}>Cancel</Button>
                  </form>
                ) : (
                  <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setReplyingTo(fb.id)}>Reply</Button>
                )}
              </Box>
            ))}
          </Box>
        )}
        {tab === 5 && (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 3, mb: 4, maxWidth: 400 }}>
            <Typography variant="h5" sx={{ mb: 2, color: isDark ? '#f3f4f6' : '#18181b' }}>Settings</Typography>
            <Typography sx={{ mb: 2, color: isDark ? '#d1d5db' : '#374151' }}>
              Manage your admin preferences.
            </Typography>
            {/* Profile Picture */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: isDark ? '#f3f4f6' : '#18181b', mb: 1 }}>Profile Picture</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={profilePicPreview || profilePic || 'https://ui-avatars.com/api/?name=Admin'}
                  alt="Profile Preview"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginRight: 16, border: `2px solid ${isDark ? '#6366f1' : '#6366f1'}` }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ color: isDark ? '#f3f4f6' : '#18181b' }}
                />
              </Box>
              <Typography sx={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: 12, mt: 1 }}>
                (Preview only. To enable real upload, connect Firebase Storage.)
              </Typography>
            </Box>
            <form onSubmit={async e => {
              e.preventDefault();
              if (!user) return;
              const form = e.target;
              const newSettings = {
                displayName: form.displayName.value,
                emailNotifications: form.emailNotifications.value,
                theme: form.theme.value,
                profilePic: profilePicPreview || profilePic || '',
                twoFAEnabled: twoFAEnabled,
              };
              await setDoc(doc(db, 'adminSettings', user.uid), newSettings, { merge: true });
              setSettings(newSettings);
              setProfilePic(profilePicPreview || profilePic || '');
              alert('Settings saved!');
            }}>
              <Box sx={{ mb: 2 }}>
                <label style={{ color: isDark ? '#f3f4f6' : '#18181b', display: 'block', marginBottom: 4 }}>Display Name</label>
                <input name="displayName" type="text" defaultValue={settings.displayName} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', background: isDark ? '#23232a' : '#fff', color: isDark ? '#f3f4f6' : '#18181b' }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <label style={{ color: isDark ? '#f3f4f6' : '#18181b', display: 'block', marginBottom: 4 }}>Email Notifications</label>
                <select name="emailNotifications" defaultValue={settings.emailNotifications} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', background: isDark ? '#23232a' : '#fff', color: isDark ? '#f3f4f6' : '#18181b' }}>
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </Box>
              <Box sx={{ mb: 2 }}>
                <label style={{ color: isDark ? '#f3f4f6' : '#18181b', display: 'block', marginBottom: 4 }}>Theme</label>
                <select name="theme" defaultValue={settings.theme} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', background: isDark ? '#23232a' : '#fff', color: isDark ? '#f3f4f6' : '#18181b' }}>
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </Box>
              {/* 2FA Toggle (mock) */}
              <Box sx={{ mb: 2 }}>
                <label style={{ color: isDark ? '#f3f4f6' : '#18181b', display: 'block', marginBottom: 4 }}>Two-Factor Authentication (2FA)</label>
                <Button
                  variant={twoFAEnabled ? 'contained' : 'outlined'}
                  color="secondary"
                  onClick={e => { e.preventDefault(); setTwoFAEnabled(v => !v); }}
                  sx={{ ml: 1 }}
                >
                  {twoFAEnabled ? 'Enabled' : 'Enable'}
                </Button>
                <Typography sx={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: 12, mt: 1 }}>
                  (Mock toggle. For real 2FA, integrate with Firebase Auth multi-factor.)
                </Typography>
              </Box>
              <Button type="submit" variant="contained" color="primary">Save Settings</Button>
            </form>
            {/* Account Deletion */}
            <Box sx={{ mt: 4, borderTop: `1px solid ${isDark ? '#333' : '#e0e0e0'}`, pt: 3 }}>
              <Typography variant="h6" sx={{ color: isDark ? '#f87171' : '#b91c1c', mb: 1 }}>Danger Zone</Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                    alert('Account deletion feature coming soon!');
                  }
                }}
              >
                Delete Account
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard; 