import { type Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env';

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
        role: string;
      };
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  const orderNs = io.of('/orders');
  orderNs.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on('join-order', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('leave-order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });
  });

  const restaurantNs = io.of('/restaurant');
  restaurantNs.on('connection', (socket) => {
    socket.on('join-restaurant', (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
    });
  });

  const deliveryNs = io.of('/delivery');
  deliveryNs.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`partner:${userId}`);

    socket.on('location-update', (data: { orderId: string; coordinates: [number, number] }) => {
      orderNs.to(`order:${data.orderId}`).emit('delivery-location', {
        coordinates: data.coordinates,
      });
    });
  });

  return io;
};
