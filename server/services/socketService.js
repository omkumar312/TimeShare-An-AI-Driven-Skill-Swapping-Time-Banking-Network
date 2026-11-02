import { generatePermanentAvatarSvg } from '../config/avatarUtils.js';

let ioInstance = null;

export function initSocketService(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`[Socket] Client connected: ${socket.id}`);

    // Join user-specific room for private notifications
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        // console.log(`[Socket] User ${userId} joined room user:${userId}`);
      }
    });

    // Join video room for live peer chat and learning presence
    socket.on('join:video', ({ videoId, userName, userAvatar }) => {
      if (videoId) {
        socket.join(`video:${videoId}`);
        socket.to(`video:${videoId}`).emit('peer:joined', {
          socketId: socket.id,
          userName: userName || 'Fellow Learner',
          userAvatar,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('leave:video', (videoId) => {
      if (videoId) {
        socket.leave(`video:${videoId}`);
      }
    });

    // Send peer chat message in video room
    socket.on('chat:message', ({ videoId, senderId, senderName, senderAvatar, text }) => {
      if (!videoId || !text) return;
      const messageObj = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        videoId,
        senderId,
        senderName: senderName || 'Anonymous Learner',
        senderAvatar: senderAvatar || generatePermanentAvatarSvg(senderName || 'Anonymous Learner', 'user'),
        text: text.trim(),
        createdAt: new Date().toISOString()
      };
      io.to(`video:${videoId}`).emit('chat:new_message', messageObj);
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}

export function emitToUser(userId, event, payload) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
}

export function broadcastGlobal(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}

export function emitToVideoRoom(videoId, event, payload) {
  if (ioInstance && videoId) {
    ioInstance.to(`video:${videoId}`).emit(event, payload);
  }
}
