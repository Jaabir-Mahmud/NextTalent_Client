import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  Grid, 
  CircularProgress,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  Container,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Download,
  People,
  Work,
  Feedback,
  Assessment,
  GetApp,
  CloudDownload
} from '@mui/icons-material';
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();

const Reports = ({ isDark }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [loading, setLoading] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const downloadCSV = (data, filename) => {
    try {
      if (!data || data.length === 0) {
        setError('No data available to download');
        return;
      }

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
      
      setSuccess(`${filename} downloaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to download file');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownload = async (collectionName, filename, type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError('');
    
    try {
      const snap = await getDocs(collection(db, collectionName));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      downloadCSV(data, filename);
    } catch (err) {
      setError(`Failed to fetch ${type} data`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const reportItems = [
    {
      title: 'Users Report',
      description: 'Download complete user data including profiles, registration info, and activity metrics.',
      icon: <People sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
      color: '#2196F3',
      collection: 'users',
      filename: 'users.csv',
      type: 'users',
      stats: 'User profiles & activity'
    },
    {
      title: 'Jobs Report',
      description: 'Export job listings, applications, and employment data for comprehensive analysis.',
      icon: <Work sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
      color: '#4CAF50',
      collection: 'jobs',
      filename: 'jobs.csv',
      type: 'jobs',
      stats: 'Job listings & applications'
    },
    {
      title: 'Feedback Report',
      description: 'Access user feedback, ratings, and comments to improve service quality.',
      icon: <Feedback sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />,
      color: '#FF9800',
      collection: 'feedback',
      filename: 'feedback.csv',
      type: 'feedback',
      stats: 'User feedback & ratings'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Assessment sx={{ 
            fontSize: { xs: 32, sm: 36, md: 40 }, 
            color: theme.palette.primary.main 
          }} />
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
              color: isDark ? '#fff' : '#1a1a1a',
              letterSpacing: '-0.02em'
            }}
          >
            Data Reports
          </Typography>
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            maxWidth: 600,
            lineHeight: 1.6
          }}
        >
          Export and analyze your platform data. Download comprehensive reports for users, jobs, and feedback.
        </Typography>
      </Box>

      {success && (
        <Fade in={!!success}>
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        </Fade>
      )}

      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Fade>
      )}

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {reportItems.map((item, index) => (
          <Grid item xs={12} sm={6} lg={4} key={item.type}>
            <Card 
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
                borderRadius: 3,
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`,
                  borderColor: item.color,
                }
              }}
            >
              <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  gap: 2
                }}>
                  <Paper 
                    sx={{ 
                      p: { xs: 1, sm: 1.5 },
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </Paper>
                  <Typography 
                    variant="h6" 
                    component="h2"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      color: isDark ? '#fff' : '#1a1a1a'
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 2,
                    lineHeight: 1.6,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                  }}
                >
                  {item.description}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: item.color,
                      fontWeight: 500,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                    }}
                  >
                    📊 {item.stats}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size={isMobile ? "medium" : "large"}
                  onClick={() => handleDownload(item.collection, item.filename, item.type)}
                  disabled={loading[item.type]}
                  startIcon={loading[item.type] ? 
                    <CircularProgress size={20} /> : 
                    <CloudDownload />
                  }
                  sx={{
                    backgroundColor: item.color,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: item.color,
                      filter: 'brightness(0.9)',
                    },
                    '&:disabled': {
                      backgroundColor: `${item.color}80`,
                      color: 'white',
                    }
                  }}
                >
                  {loading[item.type] ? 'Downloading...' : 'Download CSV'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: { xs: 4, sm: 5, md: 6 } }}>
        <Card sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
          border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
          borderRadius: 3
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <GetApp sx={{ 
              fontSize: { xs: 24, sm: 28 }, 
              color: theme.palette.primary.main 
            }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.125rem' }
              }}
            >
              Export Guidelines
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            • All data exports are in CSV format for easy analysis in spreadsheet applications
            <br />
            • Files include unique IDs and timestamps for data integrity
            <br />
            • Large datasets may take a few moments to process and download
            <br />
            • Ensure you have appropriate permissions before downloading sensitive data
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Reports;