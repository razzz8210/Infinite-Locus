const jwt = require('jsonwebtoken');
const { Document, DocumentVersion } = require('../models');

// Store active users per document
const documentRooms = new Map();

// Color palette for user cursors
const cursorColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const setupSocketHandlers = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join document room
    socket.on('join-document', async (data) => {
      const { documentId, userId, userName } = data;
      
      socket.join(documentId);
      socket.documentId = documentId;
      socket.userName = userName;

      // Initialize room if not exists
      if (!documentRooms.has(documentId)) {
        documentRooms.set(documentId, new Map());
      }

      const room = documentRooms.get(documentId);
      const userColor = cursorColors[room.size % cursorColors.length];

      // Add user to room
      room.set(socket.id, {
        oduserId: userId,
        userName,
        socketId: socket.id,
        color: userColor,
        cursorPosition: null,
      });

      // Notify all users in room
      const activeUsers = Array.from(room.values());
      io.to(documentId).emit('user-joined', activeUsers);

      console.log(`User ${userName} joined document ${documentId}`);
    });

    // Leave document room
    socket.on('leave-document', (data) => {
      const { documentId } = data;
      handleLeaveDocument(socket, io, documentId);
    });

    // Handle content changes
    socket.on('content-change', (data) => {
      const { documentId, content, userId } = data;
      
      // Broadcast to other users in the room
      socket.to(documentId).emit('content-change', {
        content,
        userId,
      });
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { documentId, userId, userName } = data;
      
      socket.to(documentId).emit('user-typing', {
        userId,
        userName,
      });
    });

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      const { documentId, userId, userName, position } = data;
      
      const room = documentRooms.get(documentId);
      if (room && room.has(socket.id)) {
        const user = room.get(socket.id);
        user.cursorPosition = position;
        
        socket.to(documentId).emit('cursor-move', {
          oduserId: userId,
          userName,
          position,
          color: user.color,
        });
      }
    });

    // Handle document save
    socket.on('save-document', async (data) => {
      const { documentId, content } = data;
      
      try {
        // Update document
        await Document.findByIdAndUpdate(documentId, {
          content,
          lastEditedBy: socket.userId,
        });

        // Create version snapshot (every save)
        await DocumentVersion.createVersion(documentId, content, socket.userId, 'auto');

        // Cleanup old versions (keep last 50)
        await DocumentVersion.cleanupOldVersions(documentId, 50);

        // Notify all users
        io.to(documentId).emit('document-saved', {
          savedBy: socket.userName,
          savedAt: new Date(),
        });
      } catch (error) {
        console.error('Save document error:', error);
        socket.emit('save-error', { message: 'Failed to save document' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (socket.documentId) {
        handleLeaveDocument(socket, io, socket.documentId);
      }
    });
  });
};

// Helper function to handle leaving document
function handleLeaveDocument(socket, io, documentId) {
  socket.leave(documentId);

  const room = documentRooms.get(documentId);
  if (room) {
    room.delete(socket.id);

    if (room.size === 0) {
      documentRooms.delete(documentId);
    } else {
      const activeUsers = Array.from(room.values());
      io.to(documentId).emit('user-left', activeUsers);
    }
  }

  console.log(`User ${socket.userName} left document ${documentId}`);
}

module.exports = setupSocketHandlers;
