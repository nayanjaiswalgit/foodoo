import { type Server as HttpServer } from 'http';
import { Server, type Namespace } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env';
import { User } from './models/user.model';

let ioInstance: Server | null = null;

export const getIO = (): Server => {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
};

const applyAuthMiddleware = (namespace: Namespace) => {
  namespace.use(async (socket, next) => {
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

      // Verify user is still active
      const user = await User.findById(decoded.userId).select('isActive').lean();
      if (!user || !user.isActive) {
        next(new Error('Account is deactivated'));
        return;
      }

      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });
};

export const initSocket = (httpServer: HttpServer) => {
  ioInstance = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  const io = ioInstance;
  const orderNs = io.of('/orders');
  applyAuthMiddleware(orderNs);
  orderNs.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on('join-order', (orderId: string) => {
      if (typeof orderId !== 'string' || orderId.length > 30) return;
      socket.join(`order:${orderId}`);
    });

    socket.on('leave-order', (orderId: string) => {
      if (typeof orderId !== 'string') return;
      socket.leave(`order:${orderId}`);
    });
  });

  const restaurantNs = io.of('/restaurant');
  applyAuthMiddleware(restaurantNs);
  restaurantNs.on('connection', (socket) => {
    socket.on('join-restaurant', (restaurantId: string) => {
      if (typeof restaurantId !== 'string' || restaurantId.length > 30) return;
      socket.join(`restaurant:${restaurantId}`);
    });
  });

  const deliveryNs = io.of('/delivery');
  applyAuthMiddleware(deliveryNs);
  deliveryNs.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`partner:${userId}`);

    socket.on('location-update', (data: { orderId: string; coordinates: [number, number] }) => {
      if (!data || typeof data.orderId !== 'string') return;
      if (!Array.isArray(data.coordinates) || data.coordinates.length !== 2) return;
      if (typeof data.coordinates[0] !== 'number' || typeof data.coordinates[1] !== 'number')
        return;
      orderNs.to(`order:${data.orderId}`).emit('delivery-location', {
        coordinates: data.coordinates,
      });
    });
  });

  return io;
};
