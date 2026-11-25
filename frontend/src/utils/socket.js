import { io } from 'socket.io-client';

class SocketEvents {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onBusLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('bus-location-update', callback);
    }
  }

  onDriverStatusChange(callback) {
    if (this.socket) {
      this.socket.on('driver-status-change', callback);
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new-notification', callback);
    }
  }

  emitDriverLocationUpdate(data) {
    if (this.socket) {
      this.socket.emit('driver-location-update', data);
    }
  }

  emitDriverOnline(data) {
    if (this.socket) {
      this.socket.emit('driver-online', data);
    }
  }

  emitDriverOffline(data) {
    if (this.socket) {
      this.socket.emit('driver-offline', data);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketEvents = new SocketEvents();