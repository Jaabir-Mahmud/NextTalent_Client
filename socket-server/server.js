const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store online users
const onlineUsers = new Map();
const userSockets = new Map(); // Map userId to socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, {
      socketId: socket.id,
      connectedAt: new Date()
    });
    userSockets.set(socket.id, userId);
    
    // Broadcast updated online users list
    io.emit('users-online', Array.from(onlineUsers.keys()));
    console.log(`User ${userId} joined their room`);
  });

  // Handle joining specific rooms (for conversations)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Handle leaving rooms
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  // Handle real-time messages
  socket.on('send-message', (messageData) => {
    console.log('Sending message:', messageData);
    
    // Send to recipient's personal room
    socket.to(messageData.toUserId).emit('new-message', messageData);
    
    // Send to any conversation room if exists
    if (messageData.conversationId) {
      socket.to(messageData.conversationId).emit('new-message', messageData);
    }
    
    console.log(`Message sent from ${messageData.fromUserId} to ${messageData.toUserId}`);
  });

  // Handle notifications
  socket.on('send-notification', (notificationData) => {
    console.log('Sending notification:', notificationData);
    socket.to(notificationData.userId).emit('new-notification', notificationData);
  });

  // Handle message read receipts
  socket.on('mark-message-read', (data) => {
    console.log('Message read receipt:', data);
    socket.to(data.recipientId).emit('message-read', data);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.recipientId).emit('user-typing', {
      userId: data.userId,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.recipientId).emit('user-typing', {
      userId: data.userId,
      isTyping: false
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    
    if (userId) {
      onlineUsers.delete(userId);
      userSockets.delete(socket.id);
      
      // Broadcast updated online users list
      io.emit('users-online', Array.from(onlineUsers.keys()));
      console.log(`User ${userId} disconnected`);
    }
    
    console.log('Socket disconnected:', socket.id);
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    onlineUsers: onlineUsers.size,
    uptime: process.uptime()
  });
});

// Get online users endpoint
app.get('/users/online', (req, res) => {
  res.json({
    count: onlineUsers.size,
    users: Array.from(onlineUsers.keys())
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`NextTalent Socket.IO server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
