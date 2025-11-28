import {
  Lotto80CountdownEvent,
  Lotto80DrawingBallEvent,
  Lotto80DrawingDelayEvent,
  Lotto80DrawingStartedEvent,
  Lotto80RoundFinishedEvent,
  Lotto80RoundOpenedEvent,
  Lotto80RoundSettledEvent,
} from '../events/lotto80.events';

export interface GameEventsPublisher {
  publishRoundOpened(event: Lotto80RoundOpenedEvent): Promise<void>;
  publishRoundCountdown(event: Lotto80CountdownEvent): Promise<void>;
  publishDrawingStarted(event: Lotto80DrawingStartedEvent): Promise<void>;
  publishDrawingDelay(event: Lotto80DrawingDelayEvent): Promise<void>;
  publishDrawingBall(event: Lotto80DrawingBallEvent): Promise<void>;
  publishRoundFinished(event: Lotto80RoundFinishedEvent): Promise<void>;
  publishRoundSettled(event: Lotto80RoundSettledEvent): Promise<void>;
}
