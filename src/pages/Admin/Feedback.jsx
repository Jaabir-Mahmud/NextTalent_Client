import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  TextField, 
  Chip, 
  Avatar, 
  Divider,
  IconButton,
  Fade,
  Skeleton,
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { 
  Reply as ReplyIcon, 
  Person as PersonIcon, 
  Send as SendIcon, 
  Cancel as CancelIcon,
  Feedback as FeedbackIcon,
  AccessTime as TimeIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import Swal from 'sweetalert2';

const db = getFirestore();

const Feedback = ({ isDark = false }) => {
  const [feedback, setFeedback] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const feedbackSnapshot = await getDocs(collection(db, "feedback"));
      const feedbackData = feedbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeedback(feedbackData);

      // Fetch replies for each feedback
      const repliesData = {};
      for (const fb of feedbackData) {
        const repliesSnapshot = await getDocs(collection(db, "feedback", fb.id, "replies"));
        repliesData[fb.id] = repliesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      setReplies(repliesData);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedback([]);
      setReplies({});
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e, feedbackId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    try {
      const newReply = {
        text: replyText,
        admin: 'Admin',
        createdAt: serverTimestamp()
      };
      
      const replyRef = await addDoc(collection(db, "feedback", feedbackId, "replies"), newReply);
      
      // Update local state
      setReplies(prev => ({
        ...prev,
        [feedbackId]: [...(prev[feedbackId] || []), { id: replyRef.id, ...newReply }]
      }));
      
      setReplyText("");
      setReplyingTo(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Reply sent!',
        text: 'Your reply has been sent successfully.',
        confirmButtonColor: '#6366f1'
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send reply. Please try again.',
        confirmButtonColor: '#6366f1'
      });
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const result = await Swal.fire({
      title: 'Delete Feedback',
      text: 'Are you sure you want to delete this feedback? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Delete all replies first
        if (replies[feedbackId]) {
          for (const reply of replies[feedbackId]) {
            await deleteDoc(doc(db, "feedback", feedbackId, "replies", reply.id));
          }
        }
        
        // Delete the feedback
        await deleteDoc(doc(db, "feedback", feedbackId));
        
        // Update local state
        setFeedback(prev => prev.filter(fb => fb.id !== feedbackId));
        setReplies(prev => {
          const newReplies = { ...prev };
          delete newReplies[feedbackId];
          return newReplies;
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Feedback has been deleted successfully.',
          confirmButtonColor: '#6366f1'
        });
      } catch (error) {
        console.error('Error deleting feedback:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete feedback. Please try again.',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  };

  const handleDeleteReply = async (feedbackId, replyId) => {
    const result = await Swal.fire({
      title: 'Delete Reply',
      text: 'Are you sure you want to delete this reply?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "feedback", feedbackId, "replies", replyId));
        
        // Update local state
        setReplies(prev => ({
          ...prev,
          [feedbackId]: prev[feedbackId].filter(reply => reply.id !== replyId)
        }));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Reply has been deleted successfully.',
          confirmButtonColor: '#6366f1'
        });
      } catch (error) {
        console.error('Error deleting reply:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete reply. Please try again.',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case 'positive': return '#4CAF50';
      case 'issue': return '#FF9800';
      case 'suggestion': return '#2196F3';
      default: return '#757575';
    }
  };

  const getFeedbackTypeLabel = (type) => {
    switch (type) {
      case 'positive': return 'Positive';
      case 'issue': return 'Issue';
      case 'suggestion': return 'Suggestion';
      default: return 'General';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    let timestamp;
    if (date.seconds) {
      timestamp = date.seconds * 1000;
    } else if (date.toDate) {
      timestamp = date.toDate().getTime();
    } else {
      timestamp = new Date(date).getTime();
    }
    return new Date(timestamp).toLocaleString();
  };

  const getResponsiveSpacing = () => {
    if (isMobile) return { p: 2, gap: 2 };
    if (isTablet) return { p: 3, gap: 2.5 };
    return { p: 4, gap: 3 };
  };

  const getResponsiveCardSpacing = () => {
    if (isMobile) return { p: 2 };
    if (isTablet) return { p: 2.5 };
    return { p: 3 };
  };

  if (loading) {
    return (
      <Box sx={{ ...getResponsiveSpacing() }}>
        <Skeleton variant="text" width="200px" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="300px" height={24} sx={{ mb: 3 }} />
        {[1, 2, 3].map((i) => (
          <Card key={i} sx={{ ...getResponsiveCardSpacing(), mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} />
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ ...getResponsiveSpacing() }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
          p: 1.5,
          borderRadius: 2,
          border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'}`
        }}>
          <FeedbackIcon sx={{ color: '#6366f1', fontSize: isMobile ? 24 : 28 }} />
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            User Feedback
          </Typography>
        </Box>
        <Chip 
          label={`${feedback.length} feedback${feedback.length !== 1 ? 's' : ''}`}
          sx={{ 
            background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
            color: '#22c55e',
            fontWeight: 600,
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'}`
          }}
        />
      </Box>

      <Typography 
        sx={{ 
          mb: 4, 
          color: isDark ? '#9ca3af' : '#6b7280',
          fontSize: isMobile ? 14 : 16,
          textAlign: isMobile ? 'center' : 'left'
        }}
      >
        Monitor user feedback and engage with your community to improve the platform experience.
      </Typography>

      {feedback.length === 0 ? (
        <Card sx={{ 
          ...getResponsiveCardSpacing(),
          textAlign: 'center',
          background: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.8)',
          border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'}`
        }}>
          <FeedbackIcon sx={{ 
            fontSize: 48, 
            color: isDark ? '#6b7280' : '#9ca3af',
            mb: 2
          }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No feedback yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When users provide feedback, it will appear here for you to review and respond.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={3}>
          {feedback.map((fb, index) => (
            <Fade in={true} timeout={300 + index * 100} key={fb.id}>
              <Card sx={{ 
                ...getResponsiveCardSpacing(),
                background: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'}`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark ? '0 12px 24px rgba(0, 0, 0, 0.3)' : '0 12px 24px rgba(0, 0, 0, 0.1)',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)'
                }
              }}>
                {/* Header */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 2,
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40,
                      background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                      fontSize: 16,
                      fontWeight: 600
                    }}>
                      {fb.user ? fb.user.charAt(0).toUpperCase() : <PersonIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 600,
                        color: isDark ? '#f3f4f6' : '#111827'
                      }}>
                        {fb.user || 'Anonymous User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fb.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    ml: isMobile ? 0 : 'auto',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center'
                  }}>
                    {fb.type && (
                      <Chip 
                        label={getFeedbackTypeLabel(fb.type)}
                        size="small"
                        sx={{
                          background: `${getFeedbackTypeColor(fb.type)}20`,
                          color: getFeedbackTypeColor(fb.type),
                          fontWeight: 600,
                          fontSize: 11
                        }}
                      />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(fb.date)}
                      </Typography>
                    </Box>
                    <Tooltip title="Delete Feedback">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteFeedback(fb.id)}
                        sx={{
                          color: '#ef4444',
                          '&:hover': {
                            background: 'rgba(239, 68, 68, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Message */}
                <Box sx={{ 
                  mb: 3,
                  p: 2,
                  background: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.5)',
                  borderRadius: 2,
                  border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'}`
                }}>
                  <Typography sx={{ 
                    lineHeight: 1.6,
                    color: isDark ? '#e5e7eb' : '#374151',
                    fontSize: isMobile ? 14 : 16
                  }}>
                    {fb.message}
                  </Typography>
                </Box>

                {/* Replies */}
                {replies[fb.id] && replies[fb.id].length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" sx={{ 
                      mb: 2, 
                      color: '#6366f1',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <ReplyIcon sx={{ fontSize: 16 }} />
                      Admin Replies ({replies[fb.id].length})
                    </Typography>
                    <Stack spacing={2}>
                      {replies[fb.id].map((reply) => (
                        <Box key={reply.id} sx={{ 
                          ml: isMobile ? 0 : 2,
                          p: 2,
                          background: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)',
                          borderRadius: 2,
                          borderLeft: `3px solid #6366f1`,
                          position: 'relative'
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            mb: 1
                          }}>
                            <Typography sx={{ 
                              fontSize: isMobile ? 14 : 15,
                              color: isDark ? '#e5e7eb' : '#374151',
                              flex: 1,
                              pr: 2
                            }}>
                              {reply.text}
                            </Typography>
                            <Tooltip title="Delete Reply">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteReply(fb.id, reply.id)}
                                sx={{
                                  color: '#ef4444',
                                  p: 0.5,
                                  minWidth: 'auto',
                                  '&:hover': {
                                    background: 'rgba(239, 68, 68, 0.1)'
                                  }
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {reply.admin} • {formatDate(reply.createdAt || reply.date)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Reply Form */}
                {replyingTo === fb.id ? (
                  <Box component="form" onSubmit={(e) => handleReplySubmit(e, fb.id)}>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            background: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                            '&:hover fieldset': {
                              borderColor: '#6366f1'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1'
                            }
                          }
                        }}
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        justifyContent: 'flex-end',
                        flexDirection: isMobile ? 'column' : 'row'
                      }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SendIcon />}
                          disabled={!replyText.trim()}
                          fullWidth={isMobile}
                          sx={{
                            background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5855eb, #7c3aed)'
                            }
                          }}
                        >
                          Send Reply
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          fullWidth={isMobile}
                          sx={{
                            borderColor: isDark ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.5)',
                            color: isDark ? '#9ca3af' : '#6b7280'
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ pt: 1 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Button
                      variant="outlined"
                      startIcon={<ReplyIcon />}
                      onClick={() => setReplyingTo(fb.id)}
                      fullWidth={isMobile}
                      sx={{
                        borderColor: '#6366f1',
                        color: '#6366f1',
                        '&:hover': {
                          borderColor: '#5855eb',
                          background: 'rgba(99, 102, 241, 0.05)'
                        }
                      }}
                    >
                      Reply to Feedback
                    </Button>
                  </Box>
                )}
              </Card>
            </Fade>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Feedback;