import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Badge, IconButton, Drawer, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MessageIcon from '@mui/icons-material/Message';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';

const db = getFirestore();

const Notifications = ({ isDark }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notificationsData = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true
        });
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_approved':
        return <CheckCircleIcon color="success" />;
      case 'job_rejected':
        return <CancelIcon color="error" />;
      case 'admin_message':
        return <MessageIcon color="primary" />;
      default:
        return <WorkIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'job_approved':
        return '#10b981';
      case 'job_rejected':
        return '#ef4444';
      case 'admin_message':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Notification Bell */}
      <IconButton
        color="inherit"
        onClick={() => setDrawerOpen(true)}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            bgcolor: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#111827'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {unreadCount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': { color: '#2563eb' }
                }}
                onClick={markAllAsRead}
              >
                Mark all as read
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                Loading notifications...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: isDark ? '#6b7280' : '#9ca3af', mb: 2 }} />
              <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read 
                        ? 'transparent' 
                        : (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'),
                      borderLeft: notification.read ? 'none' : `3px solid ${getNotificationColor(notification.type)}`,
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                            color: isDark ? '#f3f4f6' : '#111827',
                            mb: 0.5
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDark ? '#9ca3af' : '#6b7280',
                              mb: 0.5,
                              lineHeight: 1.4
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isDark ? '#6b7280' : '#9ca3af',
                              fontSize: '0.75rem'
                            }}
                          >
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ bgcolor: isDark ? '#374151' : '#e5e7eb' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Notifications; 