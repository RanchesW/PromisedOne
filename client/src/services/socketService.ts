import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token?: string) {
    if (this.socket && this.isConnected) return;

    const SERVER_URL = process.env.NODE_ENV === 'production' 
      ? 'https://promisedone.onrender.com'
      : 'http://localhost:5000';

    console.log('🔌 Connecting to Socket.IO server:', SERVER_URL);

    this.socket = io(SERVER_URL, {
      auth: {
        token: token || localStorage.getItem('authToken')
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket.IO connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a conversation room
  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
      console.log('🏠 Joined room:', roomId);
    }
  }

  // Leave a conversation room
  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId);
      console.log('🚪 Left room:', roomId);
    }
  }

  // Send a message
  sendMessage(data: {
    roomId: string;
    message: string;
    userId: string;
    username: string;
    messageId?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) {
    if (this.socket) {
      this.socket.emit('send-message', data);
    }
  }

  // Listen for incoming messages
  onMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  // Listen for typing indicators
  onTyping(callback: (data: { userId: string; username: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Send typing indicator
  sendTyping(roomId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { roomId, isTyping });
    }
  }

  // Listen for user online status
  onUserStatusChange(callback: (data: { userId: string; isOnline: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user-status-changed', callback);
    }
  }

  // Clean up event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  get connected() {
    return this.isConnected;
  }

  get socketId() {
    return this.socket?.id;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;