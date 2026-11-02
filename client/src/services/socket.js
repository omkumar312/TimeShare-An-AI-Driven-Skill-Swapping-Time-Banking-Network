import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      // console.log('[Socket] Connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      // console.log('[Socket] Disconnected');
    });
  }
  return socketInstance;
}
