import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Tabs, 
  Tab, 
  useTheme, 
  useMediaQuery,
  Divider,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton,
  Tooltip,
  Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BarChartIcon from '@mui/icons-material/BarChart';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

// Import admin page components
import DashboardOverview from './DashboardOverview';
import UserManagement from './UserManagement';
import JobModeration from './JobModeration';
import Reports from './Reports';
import Feedback from './Feedback';
import Settings from './Settings';
import AdminFooter from './AdminFooter';

const db = getFirestore();

const AdminDashboard = ({ isDark, toggleDark }) => {
  const { user, role, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setAdminData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAdminData();
  }, [user]);

  // Responsive drawer width
  const getDrawerWidth = () => {
    if (isXs) return 280;
    if (isSm) return 300;
    if (isMd) return 240;
    return 260;
  };

  const drawerWidth = getDrawerWidth();

  const drawerItems = [
    { icon: <DashboardIcon />, text: "Dashboard", tab: 0, badge: null },
    { icon: <PeopleIcon />, text: "Users", tab: 1, badge: null },
    { icon: <WorkIcon />, text: "Jobs", tab: 2, badge: 3 },
    { icon: <BarChartIcon />, text: "Reports", tab: 3, badge: null },
    { icon: <FeedbackIcon />, text: "Feedback", tab: 4, badge: 5 },
    { icon: <SettingsIcon />, text: "Settings", tab: 5, badge: null },
  ];

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuAnchor(null);
  };

  if (!user || role !== "Admin") {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <Typography 
          variant={isXs ? "h6" : "h5"} 
          color="error" 
          sx={{ mb: 2 }}
        >
          You do not have admin access.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please contact your administrator for access.
        </Typography>
      </Box>
    );
  }

  const renderTabContent = () => {
    const components = [
      <DashboardOverview isDark={isDark} />,
      <UserManagement isDark={isDark} />,
      <JobModeration isDark={isDark} />,
      <Reports isDark={isDark} />,
      <Feedback isDark={isDark} />,
      <Settings isDark={isDark} toggleDark={toggleDark} />
    ];
    
    return components[tab] || components[0];
  };

  const DrawerContent = ({ onItemClick = null }) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 }, 
        borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
        textAlign: 'center'
      }}>
        <Typography 
          variant={isXs ? "h6" : "h5"} 
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            mb: 0.5
          }}
        >
          Admin Panel
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Management Dashboard
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {drawerItems.map((item) => (
          <ListItem 
            key={item.tab}
            sx={{ 
              px: { xs: 1, sm: 1.5, md: 2 },
              py: 0.5
            }}
          >
            <ListItemButton
              selected={tab === item.tab}
              onClick={() => {
                setTab(item.tab);
                if (onItemClick) onItemClick();
              }}
              sx={{
                borderRadius: 2,
                minHeight: { xs: 44, sm: 48, md: 52 },
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  bgcolor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                  }
                },
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateX(4px)',
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: tab === item.tab ? 'primary.main' : 'inherit',
                minWidth: { xs: 36, sm: 40, md: 44 }
              }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error" variant="dot">
                    {item.icon}
                  </Badge>
                ) : item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: tab === item.tab ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Profile Section */}
      <Box sx={{ 
        p: { xs: 1.5, sm: 2, md: 2.5 }, 
        borderTop: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
        bgcolor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 1.5 }
        }}>
          <Tooltip title="User Menu">
            <IconButton
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{ 
                p: 0,
                position: 'relative'
              }}
            >
              <Avatar 
                src={adminData?.photoURL || user?.photoURL}
                sx={{ 
                  width: { xs: 32, sm: 36, md: 40 }, 
                  height: { xs: 32, sm: 36, md: 40 },
                  bgcolor: 'primary.main',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                {(!adminData?.photoURL && !user?.photoURL) && 
                  (loading ? '...' : (adminData?.firstName?.charAt(0) || adminData?.name?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A').toUpperCase())
                }
              </Avatar>
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? 'Loading...' : (adminData?.firstName || adminData?.name || user?.displayName || 'Admin')}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.625rem', sm: '0.75rem' }
              }}
            >
              {role}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            bgcolor: 'background.paper',
            borderRight: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
            boxShadow: isDark ? '2px 0 8px rgba(0,0,0,0.3)' : '2px 0 8px rgba(0,0,0,0.1)'
          },
        }}
      >
        <Toolbar />
        <DrawerContent />
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            bgcolor: 'background.paper',
            borderRight: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
          },
        }}
      >
        <Toolbar>
          <IconButton 
            onClick={() => setMobileOpen(false)}
            sx={{ ml: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <DrawerContent onItemClick={() => setMobileOpen(false)} />
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1, 
            bgcolor: isDark ? '#18181b' : 'white', 
            color: isDark ? '#f3f4f6' : '#18181b',
            borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
            boxShadow: isDark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.1)'
          }} 
          elevation={0}
        >
          <Toolbar sx={{ 
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1, sm: 2, md: 3 }
          }}>
            <IconButton 
              color="inherit" 
              edge="start" 
              sx={{ 
                mr: { xs: 1, sm: 2 }, 
                display: { md: 'none' }
              }} 
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
            </IconButton>
            
            <Tooltip title="Go Back">
              <IconButton 
                color="inherit" 
                sx={{ mr: { xs: 1, sm: 2 } }} 
                onClick={() => navigate(-1)}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 600
              }}
            >
              {drawerItems.find(item => item.tab === tab)?.text || 'Admin Panel'}
            </Typography>

            {/* Header Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Toggle Theme">
                <IconButton 
                  onClick={toggleDark} 
                  color="inherit"
                  size={isXs ? 'small' : 'medium'}
                >
                  {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        <Toolbar />

        {/* Mobile Tabs */}
        {isMobile && (
          <Box sx={{ 
            borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
            bgcolor: 'background.paper',
            px: { xs: 1, sm: 2 }
          }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': {
                  minHeight: { xs: 40, sm: 48 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  px: { xs: 1, sm: 2 }
                }
              }}
            >
              {drawerItems.map((item) => (
                <Tab 
                  key={item.tab} 
                  label={item.text}
                  icon={item.badge ? (
                    <Badge badgeContent={item.badge} color="error" variant="dot">
                      {item.icon}
                    </Badge>
                  ) : item.icon}
                  iconPosition="start"
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      mb: 0,
                      mr: 1
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Content Area */}
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 3 },
          overflow: 'auto',
          bgcolor: isDark ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.01)'
        }}>
          {renderTabContent()}
        </Box>
        
        {/* Admin Footer */}
        <AdminFooter isDark={isDark} />
      </Box>

      {/* User Menu - positioned at root level */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            minWidth: 140,
            bgcolor: 'background.paper',
            border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            mt: -1
          }
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminDashboard;