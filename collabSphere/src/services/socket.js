import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentDocument = null;
  }

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('token');
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a document room
  joinDocument(documentId, user) {
    if (!this.socket) return;
    
    this.currentDocument = documentId;
    this.socket.emit('join-document', {
      documentId,
      userId: user._id,
      userName: user.name,
    });
  }

  // Leave document room
  leaveDocument(documentId) {
    if (!this.socket) return;
    
    this.socket.emit('leave-document', { documentId });
    this.currentDocument = null;
  }

  // Emit content change
  emitContentChange(documentId, content, userId) {
    if (!this.socket) return;
    
    this.socket.emit('content-change', {
      documentId,
      content,
      userId,
    });
  }

  // Emit typing event
  emitTyping(documentId, user) {
    if (!this.socket) return;
    
    this.socket.emit('typing', {
      documentId,
      userId: user._id,
      userName: user.name,
    });
  }

  // Emit cursor position
  emitCursorPosition(documentId, position, user) {
    if (!this.socket) return;
    
    this.socket.emit('cursor-move', {
      documentId,
      userId: user._id,
      userName: user.name,
      position,
    });
  }

  // Save document
  saveDocument(documentId, content) {
    if (!this.socket) return;
    
    this.socket.emit('save-document', {
      documentId,
      content,
    });
  }

  // Event listeners
  onUserJoined(callback) {
    if (!this.socket) return;
    this.socket.on('user-joined', callback);
  }

  onUserLeft(callback) {
    if (!this.socket) return;
    this.socket.on('user-left', callback);
  }

  onContentChange(callback) {
    if (!this.socket) return;
    this.socket.on('content-change', callback);
  }

  onUserTyping(callback) {
    if (!this.socket) return;
    this.socket.on('user-typing', callback);
  }

  onCursorMove(callback) {
    if (!this.socket) return;
    this.socket.on('cursor-move', callback);
  }

  onDocumentSaved(callback) {
    if (!this.socket) return;
    this.socket.on('document-saved', callback);
  }

  // Remove listeners
  removeAllListeners() {
    if (!this.socket) return;
    
    this.socket.off('user-joined');
    this.socket.off('user-left');
    this.socket.off('content-change');
    this.socket.off('user-typing');
    this.socket.off('cursor-move');
    this.socket.off('document-saved');
  }
}

export const socketService = new SocketService();
