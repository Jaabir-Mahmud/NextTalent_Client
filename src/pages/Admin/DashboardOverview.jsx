import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Grid, Typography, useTheme, useMediaQuery } from '@mui/material';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { startOfDay, isSameDay } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const db = getFirestore();

const DashboardOverview = ({ isDark }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, pendingJobs: 0, dailySignups: 0 });
  const [signupTrend, setSignupTrend] = useState({ labels: [], data: [] });
  const [jobTrend, setJobTrend] = useState({ labels: [], data: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], data: [] });

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  useEffect(() => {
    fetchStats();
    fetchSignupTrend();
    fetchJobTrend();
    fetchCategoryData();
  }, []);

  const fetchStats = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map(doc => doc.data());
      const jobsSnap = await getDocs(collection(db, "jobs"));
      const jobs = jobsSnap.docs.map(doc => doc.data());
      const pendingJobs = jobs.filter(j => j.status === 'pending').length;
      const today = startOfDay(new Date());
      const dailySignups = users.filter(u => {
        if (!u.createdAt) return false;
        const userDate = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return isSameDay(userDate, today);
      }).length;
      
      setStats({
        totalUsers: users.length,
        totalJobs: jobs.length,
        pendingJobs,
        dailySignups
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ totalUsers: 0, totalJobs: 0, pendingJobs: 0, dailySignups: 0 });
    }
  };

  const fetchSignupTrend = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map(doc => doc.data());
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });
      const labels = days.map(d => d.toLocaleDateString('en-US', { 
        month: isMobile ? 'numeric' : 'short', 
        day: 'numeric' 
      }));
      const data = days.map(day =>
        users.filter(u => {
          if (!u.createdAt) return false;
          const userDate = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
          return isSameDay(userDate, day);
        }).length
      );
      setSignupTrend({ labels, data });
    } catch (error) {
      console.error('Error fetching signup trend:', error);
      setSignupTrend({ labels: [], data: [] });
    }
  };

  const fetchJobTrend = async () => {
    try {
      const jobsSnap = await getDocs(collection(db, "jobs"));
      const jobs = jobsSnap.docs.map(doc => doc.data());
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });
      const labels = days.map(d => d.toLocaleDateString('en-US', { 
        month: isMobile ? 'numeric' : 'short', 
        day: 'numeric' 
      }));
      const data = days.map(day =>
        jobs.filter(j => {
          if (!j.createdAt) return false;
          const jobDate = j.createdAt.toDate ? j.createdAt.toDate() : new Date(j.createdAt);
          return isSameDay(jobDate, day);
        }).length
      );
      setJobTrend({ labels, data });
    } catch (error) {
      console.error('Error fetching job trend:', error);
      setJobTrend({ labels: [], data: [] });
    }
  };

  const fetchCategoryData = async () => {
    try {
      const jobsSnap = await getDocs(collection(db, "jobs"));
      const jobs = jobsSnap.docs.map(doc => doc.data());
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
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategoryData({ labels: [], data: [] });
    }
  };

  // Responsive configurations
  const getCardPadding = () => {
    if (isXs) return 1.5;
    if (isSm) return 2;
    if (isMd) return 2.5;
    return 3;
  };

  const getChartHeight = () => {
    if (isXs) return 200;
    if (isSm) return 250;
    if (isMd) return 280;
    return 320;
  };

  const getPieChartHeight = () => {
    if (isXs) return 180;
    if (isSm) return 220;
    if (isMd) return 240;
    return 280;
  };

  const getFontSizes = () => ({
    title: {
      xs: '1.5rem',
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem'
    },
    cardTitle: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem'
    },
    cardNumber: {
      xs: '1.25rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem'
    },
    chartTitle: {
      xs: '0.875rem',
      sm: '1rem',
      md: '1.125rem',
      lg: '1.25rem'
    }
  });

  const getChartOptions = (type = 'line') => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'pie',
        position: type === 'pie' ? 'bottom' : 'top',
        labels: {
          font: { 
            size: isXs ? 8 : isSm ? 10 : isMd ? 11 : 12 
          },
          color: isDark ? '#ccc' : '#666',
          padding: isXs ? 10 : isSm ? 12 : 15,
          usePointStyle: type === 'pie',
          boxWidth: isXs ? 8 : 12,
          boxHeight: isXs ? 8 : 12,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#333' : '#fff',
        titleColor: isDark ? '#fff' : '#333',
        bodyColor: isDark ? '#fff' : '#333',
        borderColor: isDark ? '#555' : '#ddd',
        borderWidth: 1,
        titleFont: { size: isXs ? 11 : 12 },
        bodyFont: { size: isXs ? 10 : 11 },
        padding: isXs ? 8 : 10,
      }
    },
    ...(type === 'line' && {
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: isDark ? '#ccc' : '#666',
            font: { size: isXs ? 8 : isSm ? 9 : isMd ? 10 : 11 },
            maxRotation: isXs ? 45 : 0,
            minRotation: isXs ? 45 : 0,
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: isDark ? '#333' : '#eee' },
          ticks: {
            color: isDark ? '#ccc' : '#666',
            font: { size: isXs ? 8 : isSm ? 9 : isMd ? 10 : 11 },
            maxTicksLimit: isXs ? 4 : isSm ? 5 : 6,
          }
        },
      }
    }),
  });

  const fontSizes = getFontSizes();

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Typography 
        variant={isXs ? "h5" : isSm ? "h4" : "h3"} 
        sx={{ 
          mb: { xs: 2, sm: 3, md: 4 },
          fontWeight: 600,
          fontSize: fontSizes.title,
          textAlign: { xs: 'center', sm: 'left' },
          color: isDark ? 'white' : 'text.primary'
        }}
      >
        Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        {[
          { title: 'Total Users', value: stats.totalUsers, color: 'primary.main' },
          { title: 'Total Jobs', value: stats.totalJobs, color: 'secondary.main' },
          { title: 'Pending Jobs', value: stats.pendingJobs, color: 'warning.main' },
          { title: 'Daily Signups', value: stats.dailySignups, color: 'success.main' }
        ].map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <Card sx={{ 
              bgcolor: stat.color, 
              color: 'white',
              height: '100%',
              minHeight: { xs: 80, sm: 100, md: 120 },
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[8]
              }
            }}>
              <CardContent sx={{ 
                p: getCardPadding(),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: fontSizes.cardTitle,
                    fontWeight: 500,
                    lineHeight: 1.2
                  }}
                >
                  {stat.title}
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: fontSizes.cardNumber,
                    lineHeight: 1
                  }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Signup Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            p: getCardPadding(),
            height: '100%',
            minHeight: { xs: 280, sm: 320, md: 360, lg: 400 },
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontSize: fontSizes.chartTitle,
                fontWeight: 600,
                textAlign: { xs: 'center', sm: 'left' },
                color: isDark ? 'white' : 'text.primary'
              }}
            >
              Daily User Signups (Last 7 Days)
            </Typography>
            <Box sx={{ 
              height: getChartHeight(),
              width: '100%',
              position: 'relative'
            }}>
              <Line
                data={{
                  labels: signupTrend.labels,
                  datasets: [{
                    label: 'Signups',
                    data: signupTrend.data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: isXs ? 1.5 : 2,
                    pointRadius: isXs ? 2 : 3,
                    pointHoverRadius: isXs ? 4 : 5,
                  }],
                }}
                options={getChartOptions('line')}
              />
            </Box>
          </Card>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            p: getCardPadding(),
            height: '100%',
            minHeight: { xs: 280, sm: 320, md: 360, lg: 400 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontSize: fontSizes.chartTitle,
                fontWeight: 600,
                textAlign: 'center',
                color: isDark ? 'white' : 'text.primary'
              }}
            >
              Top Job Categories
            </Typography>
            <Box sx={{ 
              height: getPieChartHeight(),
              width: '100%',
              maxWidth: { xs: '100%', sm: 320, md: 280, lg: 300 },
              mx: 'auto',
              position: 'relative'
            }}>
              <Pie
                data={{
                  labels: categoryData.labels,
                  datasets: [{
                    data: categoryData.data,
                    backgroundColor: [
                      '#6366f1', '#10b981', '#f59e42', 
                      '#f43f5e', '#3b82f6', '#8b5cf6'
                    ],
                    borderWidth: isXs ? 1 : 2,
                    borderColor: isDark ? '#333' : '#fff',
                    hoverBorderWidth: isXs ? 2 : 3,
                  }],
                }}
                options={getChartOptions('pie')}
              />
            </Box>
          </Card>
        </Grid>

        {/* Job Trend Chart */}
        <Grid item xs={12}>
          <Card sx={{ 
            p: getCardPadding(),
            minHeight: { xs: 280, sm: 320, md: 360, lg: 400 },
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontSize: fontSizes.chartTitle,
                fontWeight: 600,
                textAlign: { xs: 'center', sm: 'left' },
                color: isDark ? 'white' : 'text.primary'
              }}
            >
              Daily Job Posts (Last 7 Days)
            </Typography>
            <Box sx={{ 
              height: getChartHeight(),
              width: '100%',
              position: 'relative'
            }}>
              <Line
                data={{
                  labels: jobTrend.labels,
                  datasets: [{
                    label: 'Job Posts',
                    data: jobTrend.data,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: isXs ? 1.5 : 2,
                    pointRadius: isXs ? 2 : 3,
                    pointHoverRadius: isXs ? 4 : 5,
                  }],
                }}
                options={getChartOptions('line')}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;