# Socket.IO Server Setup

This file contains the setup instructions for the Socket.IO server that should run alongside your Firebase project.

## Server Setup (Node.js/Express)

Create a new folder `socket-server` in your project root and set up:

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend URLs
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join-user-room', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    
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
    // Send to recipient's room
    socket.to(messageData.toUserId).emit('new-message', messageData);
    
    // Send to any conversation room if exists
    if (messageData.conversationId) {
      socket.to(messageData.conversationId).emit('new-message', messageData);
    }
    
    console.log('Message sent:', messageData);
  });

  // Handle notifications
  socket.on('send-notification', (notificationData) => {
    socket.to(notificationData.userId).emit('new-notification', notificationData);
    console.log('Notification sent:', notificationData);
  });

  // Handle message read receipts
  socket.on('mark-message-read', (data) => {
    socket.to(data.recipientId).emit('message-read', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    
    // Broadcast updated online users list
    io.emit('users-online', Array.from(onlineUsers.keys()));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
```

## Package.json for Socket Server

```json
{
  "name": "nexttalent-socket-server",
  "version": "1.0.0",
  "description": "Socket.IO server for NextTalent real-time features",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## Installation Commands

```bash
# In socket-server directory
npm init -y
npm install express socket.io cors
npm install -D nodemon

# Start the server
npm run dev
```

## Environment Variables

Add to your Vite .env file:
```
VITE_SOCKET_URL=http://localhost:3001
```

For production, update the URL accordingly.
