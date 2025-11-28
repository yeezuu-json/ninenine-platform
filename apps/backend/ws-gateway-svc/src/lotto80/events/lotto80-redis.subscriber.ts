import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import {
  Lotto80RoundOpenedEvent,
  Lotto80CountdownEvent,
  Lotto80DrawingStartedEvent,
  Lotto80DrawingBallEvent,
  Lotto80DrawingDelayEvent,
  Lotto80RoundFinishedEvent,
  Lotto80RoundSettledEvent,
} from '@ninenine/game-events';

export const LOTTO80_EVENTS = {
  ROUND_OPENED: 'lotto80:round:opened',
  COUNTDOWN: 'lotto80:countdown',
  DRAWING_STARTED: 'lotto80:drawing:started',
  DRAWING_BALL: 'lotto80:drawing:ball',
  DRAWING_DELAY: 'lotto80:drawing:delay',
  ROUND_FINISHED: 'lotto80:round:finished',
  ROUND_SETTLED: 'lotto80:round:settled',
} as const;

export type Lotto80EventType =
  (typeof LOTTO80_EVENTS)[keyof typeof LOTTO80_EVENTS];

export type Lotto80EventData =
  | Lotto80RoundOpenedEvent
  | Lotto80CountdownEvent
  | Lotto80DrawingStartedEvent
  | Lotto80DrawingBallEvent
  | Lotto80DrawingDelayEvent
  | Lotto80RoundFinishedEvent
  | Lotto80RoundSettledEvent;

export interface Lotto80EventHandler {
  handleEvent(eventType: Lotto80EventType, data: Lotto80EventData): void;
}

/**
 * Subscribes to Redis pub/sub channels for Lotto80 game events
 * and notifies registered handlers when events are received.
 */
@Injectable()
export class Lotto80RedisSubscriber implements OnModuleInit {
  private readonly logger = new Logger(Lotto80RedisSubscriber.name);
  private readonly handlers = new Set<Lotto80EventHandler>();
  private subscriber: Redis;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    // Create a separate Redis client for subscribing
    this.subscriber = this.redis.duplicate();
  }

  async onModuleInit() {
    await this.subscribeToChannels();
  }

  /**
   * Register a handler to be notified when events are received
   */
  registerHandler(handler: Lotto80EventHandler): void {
    this.handlers.add(handler);
    this.logger.log(
      `Handler registered. Total handlers: ${this.handlers.size}`
    );
  }

  /**
   * Unregister a handler
   */
  unregisterHandler(handler: Lotto80EventHandler): void {
    this.handlers.delete(handler);
    this.logger.log(
      `Handler unregistered. Total handlers: ${this.handlers.size}`
    );
  }

  private async subscribeToChannels(): Promise<void> {
    const channels = Object.values(LOTTO80_EVENTS);

    this.subscriber.on('message', (channel: string, message: string) => {
      this.handleRedisMessage(channel, message);
    });

    await this.subscriber.subscribe(...channels);

    this.logger.log(`Subscribed to ${channels.length} Lotto80 Redis channels`);
    channels.forEach((channel) => {
      this.logger.log(`  - ${channel}`);
    });
  }

  private handleRedisMessage(channel: string, message: string): void {
    try {
      const data = JSON.parse(message);
      this.notifyHandlers(channel as Lotto80EventType, data);
    } catch (error) {
      this.logger.error(
        `Failed to parse message from channel ${channel}: ${error}`
      );
    }
  }

  private notifyHandlers(
    eventType: Lotto80EventType,
    data: Lotto80EventData
  ): void {
    if (this.handlers.size === 0) {
      this.logger.warn(`No handlers registered for event: ${eventType}`);
      return;
    }

    this.handlers.forEach((handler) => {
      try {
        handler.handleEvent(eventType, data);
      } catch (error) {
        this.logger.error(
          `Handler failed to process event ${eventType}:`,
          error
        );
      }
    });
  }

  async onModuleDestroy() {
    await this.subscriber.quit();
    this.logger.log('Redis subscriber disconnected');
  }
}
