import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import {
  GameEventsPublisher,
  Lotto80CountdownEvent,
  Lotto80DrawingBallEvent,
  Lotto80DrawingDelayEvent,
  Lotto80DrawingStartedEvent,
  Lotto80RoundFinishedEvent,
  Lotto80RoundOpenedEvent,
  Lotto80RoundSettledEvent,
} from '@ninenine/game-events';

@Injectable()
export class RedisGameEventsPublisher implements GameEventsPublisher {
  constructor(private readonly redis: Redis) {}

  private async publish(channel: string, payload: unknown) {
    const msg = JSON.stringify(payload);
    await this.redis.publish(channel, msg);
  }

  publishRoundOpened(event: Lotto80RoundOpenedEvent): Promise<void> {
    return this.publish('lotto80:round:opened', event);
  }

  publishRoundCountdown(event: Lotto80CountdownEvent): Promise<void> {
    return this.publish('lotto80:countdown', event);
  }

  publishDrawingStarted(event: Lotto80DrawingStartedEvent): Promise<void> {
    return this.publish('lotto80:drawing:started', event);
  }

  publishDrawingDelay(event: Lotto80DrawingDelayEvent): Promise<void> {
    return this.publish('lotto80:drawing:delay', event);
  }

  publishDrawingBall(event: Lotto80DrawingBallEvent): Promise<void> {
    return this.publish('lotto80:drawing:ball', event);
  }

  publishRoundFinished(event: Lotto80RoundFinishedEvent): Promise<void> {
    return this.publish('lotto80:round:finished', event);
  }

  publishRoundSettled(event: Lotto80RoundSettledEvent): Promise<void> {
    return this.publish('lotto80:round:settled', event);
  }
}
