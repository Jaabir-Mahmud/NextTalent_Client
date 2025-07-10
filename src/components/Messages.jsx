import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Badge, IconButton, Drawer, Divider, TextField, Button } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const db = getFirestore();

const Messages = ({ isDark }) => {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      // Fetch messages where user is sender or receiver
      const messagesQuery = query(
        collection(db, 'messages'),
        where('fromUserId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const sentMessages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const receivedQuery = query(
        collection(db, 'messages'),
        where('toUserId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const receivedSnapshot = await getDocs(receivedQuery);
      const receivedMessages = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Combine and sort messages
      const allMessages = [...sentMessages, ...receivedMessages].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });

      setMessages(allMessages);
      setUnreadCount(receivedMessages.filter(m => !m.read).length);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        read: true
      });
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, read: true } : m
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      const replyMessage = {
        fromUserId: user.uid,
        toUserId: selectedMessage.fromUserId === user.uid ? selectedMessage.toUserId : selectedMessage.fromUserId,
        fromRole: role,
        toRole: selectedMessage.fromUserId === user.uid ? selectedMessage.toRole : selectedMessage.fromRole,
        subject: `Re: ${selectedMessage.subject}`,
        message: replyText,
        jobId: selectedMessage.jobId,
        jobTitle: selectedMessage.jobTitle,
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'messages'), replyMessage);

      // Mark original message as read
      if (!selectedMessage.read) {
        await markAsRead(selectedMessage.id);
      }

      setReplyText("");
      setSelectedMessage(null);
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending reply:', error);
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

  const getMessageIcon = (fromRole) => {
    switch (fromRole) {
      case 'Admin':
        return <AdminPanelSettingsIcon color="error" />;
      case 'Employer':
        return <WorkIcon color="primary" />;
      default:
        return <MessageIcon color="action" />;
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Message Icon */}
      <IconButton
        color="inherit"
        onClick={() => setDrawerOpen(true)}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <MessageIcon />
        </Badge>
      </IconButton>

      {/* Messages Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 500,
            bgcolor: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#111827'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Messages
            </Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {unreadCount > 0 && (
            <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                Loading messages...
              </Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <MessageIcon sx={{ fontSize: 48, color: isDark ? '#6b7280' : '#9ca3af', mb: 2 }} />
              <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                No messages yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <ListItem
                    sx={{
                      bgcolor: message.read 
                        ? 'transparent' 
                        : (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'),
                      borderLeft: message.read ? 'none' : '3px solid #3b82f6',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (message.toUserId === user.uid && !message.read) {
                        markAsRead(message.id);
                      }
                      setSelectedMessage(message);
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getMessageIcon(message.fromRole)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: message.read ? 400 : 600,
                              color: isDark ? '#f3f4f6' : '#111827',
                              mb: 0.5
                            }}
                          >
                            {message.subject}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isDark ? '#6b7280' : '#9ca3af',
                              fontSize: '0.75rem'
                            }}
                          >
                            {formatDate(message.createdAt)}
                          </Typography>
                        </Box>
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
                            {message.message.length > 100 
                              ? `${message.message.substring(0, 100)}...` 
                              : message.message
                            }
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isDark ? '#6b7280' : '#9ca3af',
                              fontSize: '0.75rem'
                            }}
                          >
                            {message.fromUserId === user.uid ? 'Sent' : `From: ${message.fromRole}`}
                            {message.jobTitle && ` • ${message.jobTitle}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < messages.length - 1 && (
                    <Divider sx={{ bgcolor: isDark ? '#374151' : '#e5e7eb' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Message Detail View */}
        {selectedMessage && (
          <Box sx={{ p: 2, borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedMessage.subject}
              </Typography>
              <IconButton size="small" onClick={() => setSelectedMessage(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280', mb: 1 }}>
                From: {selectedMessage.fromRole} • {formatDate(selectedMessage.createdAt)}
              </Typography>
              {selectedMessage.jobTitle && (
                <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280', mb: 2 }}>
                  Job: {selectedMessage.jobTitle}
                </Typography>
              )}
              <Typography
                variant="body1"
                sx={{
                  color: isDark ? '#f3f4f6' : '#111827',
                  lineHeight: 1.6,
                  bgcolor: isDark ? '#374151' : '#f9fafb',
                  p: 2,
                  borderRadius: 1
                }}
              >
                {selectedMessage.message}
              </Typography>
            </Box>

            {/* Reply Section */}
            {selectedMessage.fromUserId !== user.uid && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: isDark ? '#f3f4f6' : '#111827' }}>
                  Reply:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  variant="outlined"
                  size="small"
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f3f4f6' : '#111827'
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedMessage(null);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                  >
                    Send Reply
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default Messages; 