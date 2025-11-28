import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  Lotto80RedisSubscriber,
  Lotto80EventHandler,
  Lotto80EventType,
  Lotto80EventData,
} from './events/lotto80-redis.subscriber';

interface SubscriptionInfo {
  roundNumber?: string;
  subscribedAt: Date;
}

/**
 * WebSocket Gateway for broadcasting Lotto80 game events to connected clients.
 *
 * Events broadcasted:
 * - lotto80:round:opened - Round opens for betting
 * - lotto80:countdown - Countdown tick every second
 * - lotto80:drawing:started - Drawing phase begins
 * - lotto80:drawing:ball - Each ball drawn
 * - lotto80:drawing:delay - Delay between balls
 * - lotto80:round:finished - Drawing complete with results
 * - lotto80:round:settled - Round settled with payouts
 *
 * Client subscription:
 * - emit('lotto80:subscribe') - Subscribe to all Lotto80 events
 * - emit('lotto80:subscribe', { roundNumber: '123' }) - Subscribe to specific round
 * - emit('lotto80:unsubscribe') - Unsubscribe from events
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure based on your frontend domain in production
    credentials: true,
  },
  namespace: '/lotto80',
})
export class Lotto80Gateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    Lotto80EventHandler
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(Lotto80Gateway.name);
  private readonly subscriptions = new Map<string, SubscriptionInfo>();

  constructor(private readonly redisSubscriber: Lotto80RedisSubscriber) {}

  afterInit() {
    this.logger.log('Lotto80 WebSocket Gateway initialized');
    // Register this gateway as a handler for Redis events
    this.redisSubscriber.registerHandler(this);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Send welcome message
    client.emit('connected', {
      message: 'Connected to Lotto80 Gateway',
      clientId: client.id,
      timestamp: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.subscriptions.delete(client.id);
  }

  /**
   * Handle subscription requests from clients
   */
  @SubscribeMessage('lotto80:subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data?: { roundNumber?: string }
  ) {
    const roundNumber = data?.roundNumber;

    this.subscriptions.set(client.id, {
      roundNumber,
      subscribedAt: new Date(),
    });

    const message = roundNumber
      ? `Subscribed to Lotto80 round ${roundNumber}`
      : 'Subscribed to all Lotto80 events';

    this.logger.log(`${message} - Client: ${client.id}`);

    client.emit('lotto80:subscribed', {
      success: true,
      message,
      roundNumber,
      timestamp: new Date(),
    });
  }

  /**
   * Handle unsubscription requests from clients
   */
  @SubscribeMessage('lotto80:unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket) {
    this.subscriptions.delete(client.id);

    this.logger.log(`Client unsubscribed: ${client.id}`);

    client.emit('lotto80:unsubscribed', {
      success: true,
      message: 'Unsubscribed from Lotto80 events',
      timestamp: new Date(),
    });
  }

  /**
   * Implementation of Lotto80EventHandler interface
   * Called by RedisSubscriber when events are received from Redis
   */
  handleEvent(eventType: Lotto80EventType, data: Lotto80EventData): void {
    this.logger.debug(`Broadcasting event: ${eventType}`);

    let broadcastCount = 0;

    // Broadcast to all subscribed clients
    this.subscriptions.forEach((subscription, clientId) => {
      // Get the namespace's socket by ID
      const socket = this.server.to(clientId);

      // If client subscribed to specific round, filter events
      if (subscription.roundNumber && 'roundNumber' in data) {
        if (data.roundNumber !== subscription.roundNumber) {
          return; // Skip, not the round client is interested in
        }
      }

      // Emit event to specific client
      socket.emit(eventType, {
        ...data,
        receivedAt: new Date(),
      });

      broadcastCount++;
    });

    this.logger.debug(
      `Event ${eventType} broadcasted to ${broadcastCount} subscribed clients`
    );
  }

  /**
   * Get statistics about connected clients and subscriptions
   */
  @SubscribeMessage('lotto80:stats')
  async handleStats(@ConnectedSocket() client: Socket) {
    // Get all connected sockets in this namespace
    const sockets = await this.server.fetchSockets();
    const totalClients = sockets.length;
    const subscribedClients = this.subscriptions.size;

    const stats = {
      totalConnected: totalClients,
      totalSubscribed: subscribedClients,
      timestamp: new Date(),
    };

    client.emit('lotto80:stats', stats);
    return stats;
  }
}
