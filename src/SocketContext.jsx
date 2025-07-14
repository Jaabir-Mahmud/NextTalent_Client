import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    if (!user || !mounted) return;

    try {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
        auth: {
          userId: user.uid,
          userEmail: user.email
        },
        transports: ['websocket', 'polling']
      });

      if (!mounted) {
        newSocket.close();
        return;
      }

      // Connection event handlers
      newSocket.on('connect', () => {
        if (mounted) {
          console.log('Connected to socket server');
          setIsConnected(true);
          newSocket.emit('join-user-room', user.uid);
        }
      });

      newSocket.on('disconnect', () => {
        if (mounted) {
          console.log('Disconnected from socket server');
          setIsConnected(false);
        }
      });

      newSocket.on('users-online', (users) => {
        if (mounted) {
          setOnlineUsers(users);
        }
      });

      newSocket.on('connect_error', (error) => {
        if (mounted) {
          console.warn('Socket connection error (this is normal if server is not running):', error.message);
          setIsConnected(false);
        }
      });

      if (mounted) {
        setSocket(newSocket);
      }

      return () => {
        mounted = false;
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } catch (error) {
      console.warn('Socket.IO not available, real-time features will be disabled:', error.message);
    }
  }, [user]);

  // Cleanup when user logs out
  useEffect(() => {
    if (!user && socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, [user, socket]);

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave-room', roomId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send-message', messageData);
    } else {
      console.warn('Socket not connected, message not sent:', messageData);
    }
  };

  const sendNotification = (notificationData) => {
    if (socket && isConnected) {
      socket.emit('send-notification', notificationData);
    } else {
      console.warn('Socket not connected, notification not sent:', notificationData);
    }
  };

  const markMessageAsRead = (messageId, recipientId) => {
    if (socket && isConnected) {
      socket.emit('mark-message-read', { messageId, recipientId });
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendNotification,
    markMessageAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
