const Message = require('../models/Message');
const VideoCall = require('../models/VideoCall');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Store connected users
const connectedUsers = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.userType === 'patient') {
      user = await User.findById(decoded.id).select('-password');
    } else if (decoded.userType === 'doctor') {
      user = await Doctor.findById(decoded.id).select('-password');
    }

    if (!user || !user.isActive) {
      return next(new Error('Authentication error: User not found or inactive'));
    }

    socket.userId = user._id.toString();
    socket.userType = decoded.userType;
    socket.user = user;
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

const socketHandlers = (socket, io) => {
  console.log(`User connected: ${socket.userId} (${socket.userType})`);
  
  // Store connected user
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    userId: socket.userId,
    userType: socket.userType,
    user: socket.user,
    status: 'online',
    connectedAt: new Date()
  });

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  
  // Emit user online status
  socket.broadcast.emit('userStatusChange', {
    userId: socket.userId,
    status: 'online'
  });

  // Handle joining conversation rooms
  socket.on('joinConversation', ({ patientId, doctorId }) => {
    const roomId = `conversation_${patientId}_${doctorId}`;
    socket.join(roomId);
    console.log(`User ${socket.userId} joined conversation: ${roomId}`);
  });

  // Handle leaving conversation rooms
  socket.on('leaveConversation', ({ patientId, doctorId }) => {
    const roomId = `conversation_${patientId}_${doctorId}`;
    socket.leave(roomId);
    console.log(`User ${socket.userId} left conversation: ${roomId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const { patientId, doctorId, content, attachments, replyTo } = data;
      
      // Validate user permission
      if (socket.userType === 'patient' && socket.userId !== patientId) {
        return socket.emit('error', { message: 'Permission denied' });
      }
      if (socket.userType === 'doctor' && socket.userId !== doctorId) {
        return socket.emit('error', { message: 'Permission denied' });
      }

      // Create message
      const messageData = {
        conversation: {
          patient: patientId,
          doctor: doctorId
        },
        sender: {
          id: socket.userId,
          type: socket.userType,
          name: `${socket.user.firstName} ${socket.user.lastName}`
        },
        content,
        attachments: attachments || [],
        replyTo: replyTo || null
      };

      const message = await Message.create(messageData);
      await message.populate('replyTo', 'content.text sender.name');

      // Send to conversation room
      const roomId = `conversation_${patientId}_${doctorId}`;
      io.to(roomId).emit('newMessage', message);

      // Send to individual users if they're not in the conversation room
      const recipientId = socket.userType === 'patient' ? doctorId : patientId;
      io.to(`user_${recipientId}`).emit('messageNotification', {
        messageId: message._id,
        senderId: socket.userId,
        senderName: messageData.sender.name,
        content: content.text || 'Sent an attachment',
        conversationId: roomId
      });

      socket.emit('messageSent', { messageId: message._id, status: 'sent' });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('markAsRead', async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && message.status !== 'read') {
        await message.markAsRead();
        
        // Notify sender
        const senderId = message.sender.id.toString();
        io.to(`user_${senderId}`).emit('messageStatusUpdate', {
          messageId: message._id,
          status: 'read',
          readAt: message.readAt
        });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ patientId, doctorId, isTyping }) => {
    const roomId = `conversation_${patientId}_${doctorId}`;
    socket.to(roomId).emit('userTyping', {
      userId: socket.userId,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
      isTyping
    });
  });

  // Video call handlers
  socket.on('joinVideoCall', async ({ callId }) => {
    try {
      const call = await VideoCall.findById(callId)
        .populate('patient', 'firstName lastName')
        .populate('doctor', 'firstName lastName');

      if (!call) {
        return socket.emit('error', { message: 'Video call not found' });
      }

      // Check permission
      const isPatient = socket.userType === 'patient' && socket.userId === call.patient._id.toString();
      const isDoctor = socket.userType === 'doctor' && socket.userId === call.doctor._id.toString();
      
      if (!isPatient && !isDoctor) {
        return socket.emit('error', { message: 'Permission denied for this call' });
      }

      // Join call room
      socket.join(`call_${callId}`);
      
      // Update participant status
      await call.joinParticipant(socket.userType);
      
      // Notify other participant
      socket.to(`call_${callId}`).emit('participantJoined', {
        userId: socket.userId,
        userType: socket.userType,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        joinedAt: new Date()
      });

      socket.emit('joinedVideoCall', {
        callId: call._id,
        roomId: call.roomId,
        meetingLink: call.meetingLink,
        participants: call.participantStatus
      });
    } catch (error) {
      console.error('Join video call error:', error);
      socket.emit('error', { message: 'Failed to join video call' });
    }
  });

  socket.on('leaveVideoCall', async ({ callId }) => {
    try {
      const call = await VideoCall.findById(callId);
      if (call) {
        await call.leaveParticipant(socket.userType);
        
        socket.to(`call_${callId}`).emit('participantLeft', {
          userId: socket.userId,
          userType: socket.userType,
          leftAt: new Date()
        });
        
        socket.leave(`call_${callId}`);
      }
    } catch (error) {
      console.error('Leave video call error:', error);
    }
  });

  // WebRTC signaling
  socket.on('webrtc-offer', ({ callId, offer, targetUserId }) => {
    io.to(`user_${targetUserId}`).emit('webrtc-offer', {
      callId,
      offer,
      fromUserId: socket.userId
    });
  });

  socket.on('webrtc-answer', ({ callId, answer, targetUserId }) => {
    io.to(`user_${targetUserId}`).emit('webrtc-answer', {
      callId,
      answer,
      fromUserId: socket.userId
    });
  });

  socket.on('webrtc-ice-candidate', ({ callId, candidate, targetUserId }) => {
    io.to(`user_${targetUserId}`).emit('webrtc-ice-candidate', {
      callId,
      candidate,
      fromUserId: socket.userId
    });
  });

  // Screen sharing
  socket.on('startScreenShare', ({ callId }) => {
    socket.to(`call_${callId}`).emit('screenShareStarted', {
      userId: socket.userId,
      userName: `${socket.user.firstName} ${socket.user.lastName}`
    });
  });

  socket.on('stopScreenShare', ({ callId }) => {
    socket.to(`call_${callId}`).emit('screenShareStopped', {
      userId: socket.userId
    });
  });

  // Call quality reporting
  socket.on('reportCallQuality', async ({ callId, qualityData }) => {
    try {
      const call = await VideoCall.findById(callId);
      if (call) {
        // Update quality metrics
        if (!call.quality) call.quality = {};
        call.quality[socket.userType] = qualityData;
        await call.save();
      }
    } catch (error) {
      console.error('Report call quality error:', error);
    }
  });

  // Appointment notifications
  socket.on('appointmentReminder', ({ appointmentId, type }) => {
    // This would typically be triggered by a background job
    socket.emit('notification', {
      type: 'appointment_reminder',
      appointmentId,
      message: `Your appointment is starting in ${type === 'soon' ? '15 minutes' : '5 minutes'}`
    });
  });

  // General notifications
  socket.on('sendNotification', ({ targetUserId, notification }) => {
    io.to(`user_${targetUserId}`).emit('notification', notification);
  });

  // Handle user status updates
  socket.on('updateStatus', ({ status }) => {
    const validStatuses = ['online', 'busy', 'away', 'offline'];
    if (validStatuses.includes(status)) {
      const user = connectedUsers.get(socket.userId);
      if (user) {
        user.status = status;
        socket.broadcast.emit('userStatusChange', {
          userId: socket.userId,
          status
        });
      }
    }
  });

  // Handle prescription notifications
  socket.on('prescriptionReady', ({ patientId, prescriptionId }) => {
    io.to(`user_${patientId}`).emit('notification', {
      type: 'prescription_ready',
      prescriptionId,
      message: 'Your prescription is ready for download'
    });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    socket.emit('error', { message: 'An error occurred' });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    // Remove from connected users
    connectedUsers.delete(socket.userId);
    
    // Notify others of offline status
    socket.broadcast.emit('userStatusChange', {
      userId: socket.userId,
      status: 'offline'
    });
    
    // Update doctor's online status if doctor
    if (socket.userType === 'doctor') {
      Doctor.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastActive: new Date()
      }).catch(console.error);
    }
  });
};

// Utility functions
const getConnectedUsers = () => {
  return Array.from(connectedUsers.values());
};

const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

const getUserSocket = (userId) => {
  return connectedUsers.get(userId);
};

// Background tasks (these would typically run in separate processes)
const sendScheduledNotifications = (io) => {
  // This function would be called periodically to send appointment reminders
  setInterval(async () => {
    try {
      // Logic to find upcoming appointments and send reminders
      // This is a simplified example
      console.log('Checking for appointment reminders...');
    } catch (error) {
      console.error('Scheduled notifications error:', error);
    }
  }, 60000); // Check every minute
};

module.exports = {
  socketHandlers,
  authenticateSocket,
  getConnectedUsers,
  isUserOnline,
  getUserSocket,
  sendScheduledNotifications
}; 