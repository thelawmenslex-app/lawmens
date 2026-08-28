const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    transports: ['websocket', 'polling']
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) {
      // Allow unauthenticated public connection for general content updates
      socket.isAnonymous = true;
      return next();
    }

    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'lawmens_secret_key_jwt_2024_secure_law_app');
      socket.userId = decoded.token?.id || decoded.id;
      socket.deviceId = decoded.token?.deviceId || decoded.deviceId;
      socket.isAnonymous = false;
      return next();
    } catch (err) {
      socket.isAnonymous = true;
      return next();
    }
  });

  io.on('connection', (socket) => {
    // Join public legal content broadcast channel
    socket.join('legal_content_channel');

    if (!socket.isAnonymous && socket.userId) {
      const userRoom = `user_${socket.userId}`;
      socket.join(userRoom);
      console.log(`[Socket.IO] Authenticated user ${socket.userId} joined room ${userRoom}`);
    }

    socket.on('disconnect', () => {
      // cleanup handled automatically by Socket.IO
    });
  });

  console.log('[Socket.IO] Live Sync Engine Initialized successfully.');
  return io;
};

// 1. Broadcast Public Legal Content Changes (Books, Sections, Schedules, Minor Acts, Categories)
const broadcastContentChange = (entityType, entityId, action, versionData = {}) => {
  if (!io) return;
  const payload = {
    entity: entityType, // 'book' | 'section' | 'minorAct' | 'schedule' | 'category' | 'comparison'
    id: entityId,
    action: action, // 'created' | 'updated' | 'deleted' | 'published' | 'unpublished'
    version: versionData.version || Date.now(),
    updatedAt: new Date().toISOString(),
    ...versionData
  };

  io.to('legal_content_channel').emit(`${entityType}.${action}`, payload);
  io.to('legal_content_channel').emit('content.changed', payload);
  console.log(`[Socket.IO Broadcast] Emitted ${entityType}.${action}:`, entityId);
};

// 2. Broadcast Private User State Updates (Profile, Subscription, Bookmarks, Session)
const broadcastUserUpdate = (userId, eventType, data = {}) => {
  if (!io || !userId) return;
  const payload = {
    userId: userId.toString(),
    type: eventType, // 'user.updated' | 'subscription.updated' | 'session.invalidated' | 'notification.created'
    timestamp: new Date().toISOString(),
    data
  };

  io.to(`user_${userId}`).emit(eventType, payload);
  console.log(`[Socket.IO User Update] Emitted ${eventType} to user_${userId}`);
};

module.exports = {
  initSocketServer,
  broadcastContentChange,
  broadcastUserUpdate,
  getIO: () => io
};
