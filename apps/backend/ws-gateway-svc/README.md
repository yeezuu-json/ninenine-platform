# WebSocket Gateway Service

Real-time event broadcasting service for NineNine platform games using WebSocket connections.

## Overview

The WebSocket Gateway subscribes to Redis pub/sub channels to receive game events from the Game Engine Hub and broadcasts them to connected clients in real-time.

## Architecture

```
Game Engine Hub → Redis Pub/Sub → WebSocket Gateway → Connected Clients
```

### Components

1. **Lotto80RedisSubscriber**: Subscribes to Redis channels and receives game events
2. **Lotto80Gateway**: WebSocket gateway that broadcasts events to connected clients
3. **Redis Client**: Shared Redis connection for pub/sub

## Lotto80 Events

### Server → Client Events

| Event                     | Description                   | Data                                                           |
| ------------------------- | ----------------------------- | -------------------------------------------------------------- |
| `lotto80:round:opened`    | Round opens for betting (30s) | roundId, roundNumber, status, durationSeconds, openedAt        |
| `lotto80:countdown`       | Countdown tick (every 1s)     | roundId, roundNumber, countdown, serverTime                    |
| `lotto80:drawing:started` | Drawing phase begins          | roundId, roundNumber, isJackpot, jackpotOnRange                |
| `lotto80:drawing:ball`    | Each ball drawn               | roundId, roundNumber, ball, position, cumulativeSum            |
| `lotto80:drawing:delay`   | Delay between balls           | roundId, roundNumber, processDelay                             |
| `lotto80:round:finished`  | Drawing complete              | roundId, roundNumber, drawnNumbers, sum, ouResult, rangeResult |
| `lotto80:round:settled`   | Round settled with payouts    | roundId, roundNumber, totalBets, totalPayout                   |

### Client → Server Messages

| Message               | Description               | Payload                               |
| --------------------- | ------------------------- | ------------------------------------- |
| `lotto80:subscribe`   | Subscribe to all events   | `{ roundNumber?: string }` (optional) |
| `lotto80:unsubscribe` | Unsubscribe from events   | none                                  |
| `lotto80:stats`       | Get connection statistics | none                                  |

## Client Integration

### JavaScript/TypeScript Example

```typescript
import { io } from 'socket.io-client';

// Connect to Lotto80 namespace
const socket = io('ws://localhost:3005/lotto80', {
  transports: ['websocket'],
});

// Connection established
socket.on('connected', (data) => {
  console.log('Connected:', data);

  // Subscribe to all Lotto80 events
  socket.emit('lotto80:subscribe');

  // Or subscribe to specific round
  // socket.emit('lotto80:subscribe', { roundNumber: '12345' });
});

// Handle subscription confirmation
socket.on('lotto80:subscribed', (data) => {
  console.log('Subscribed:', data);
});

// Listen to game events
socket.on('lotto80:round:opened', (data) => {
  console.log('Round opened:', data);
  // Update UI: Show betting interface, start countdown
});

socket.on('lotto80:countdown', (data) => {
  console.log('Countdown:', data.countdown);
  // Update UI: Display countdown timer
});

socket.on('lotto80:drawing:started', (data) => {
  console.log('Drawing started:', data);
  // Update UI: Close betting, show drawing animation
});

socket.on('lotto80:drawing:ball', (data) => {
  console.log('Ball drawn:', data.ball, 'Position:', data.position);
  // Update UI: Animate ball drawing, update cumulative sum
});

socket.on('lotto80:round:finished', (data) => {
  console.log('Round finished:', data);
  console.log('Drawn numbers:', data.drawnNumbers);
  console.log('Sum:', data.sum);
  console.log('Over/Under:', data.ouResult);
  console.log('Range:', data.rangeResult);
  // Update UI: Show final results, winning numbers
});

socket.on('lotto80:round:settled', (data) => {
  console.log('Round settled:', data);
  // Update UI: Show payouts, winning tickets
});

// Get connection stats
socket.emit('lotto80:stats');
socket.on('lotto80:stats', (stats) => {
  console.log('Stats:', stats);
});

// Unsubscribe
socket.emit('lotto80:unsubscribe');

// Disconnect
socket.disconnect();
```

### React Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function useLotto80Socket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

  useEffect(() => {
    const newSocket = io('ws://localhost:3005/lotto80');

    newSocket.on('connected', () => {
      console.log('Connected to Lotto80');
      newSocket.emit('lotto80:subscribe');
    });

    newSocket.on('lotto80:round:opened', (data) => {
      setCurrentRound(data);
      setDrawnNumbers([]);
    });

    newSocket.on('lotto80:countdown', (data) => {
      setCountdown(data.countdown);
    });

    newSocket.on('lotto80:drawing:ball', (data) => {
      setDrawnNumbers((prev) => [...prev, data.ball]);
    });

    newSocket.on('lotto80:round:finished', (data) => {
      setDrawnNumbers(data.drawnNumbers);
      setCountdown(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, currentRound, countdown, drawnNumbers };
}

function Lotto80Component() {
  const { currentRound, countdown, drawnNumbers } = useLotto80Socket();

  return (
    <div>
      <h2>Lotto80 Round {currentRound?.roundNumber}</h2>
      {countdown && <div>Countdown: {countdown}s</div>}
      <div>Drawn Numbers: {drawnNumbers.join(', ')}</div>
    </div>
  );
}
```

## Configuration

Environment variables (`.env`):

```bash
# HTTP Server
PORT=3005

# WebSocket (uses same port as HTTP)
WS_PORT=8080

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
```

## Running the Service

```bash
# Development
nx serve ws-gateway-svc

# Production build
nx build ws-gateway-svc

# Run production
node dist/apps/backend/ws-gateway-svc/main.js
```

## Testing WebSocket Connection

### Using wscat CLI

```bash
# Install wscat
npm install -g wscat

# Connect to gateway
wscat -c ws://localhost:3005/lotto80

# Subscribe to events
> {"event":"lotto80:subscribe"}

# Subscribe to specific round
> {"event":"lotto80:subscribe","data":{"roundNumber":"12345"}}

# Get stats
> {"event":"lotto80:stats"}

# Unsubscribe
> {"event":"lotto80:unsubscribe"}
```

### Using Postman

1. Create new WebSocket request
2. URL: `ws://localhost:3005/lotto80`
3. Connect
4. Send message: `{"event":"lotto80:subscribe"}`
5. Observe real-time events

## Monitoring

The gateway logs:

- Client connections/disconnections
- Subscription events
- Event broadcasts
- Redis subscription status

Example logs:

```
[Lotto80Gateway] Client connected: abc123
[Lotto80Gateway] Subscribed to all Lotto80 events - Client: abc123
[Lotto80RedisSubscriber] Subscribed to 7 Lotto80 Redis channels
[Lotto80Gateway] Broadcasting event: lotto80:round:opened
[Lotto80Gateway] Event lotto80:round:opened broadcasted to 5 clients
```

## Security Considerations

**For Production:**

1. **CORS Configuration**: Update CORS origin in gateway to match your frontend domain
2. **Authentication**: Add JWT token validation for WebSocket connections
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Redis Security**: Use strong Redis password and enable TLS
5. **Namespace Isolation**: Ensure proper namespace separation for different games

## Troubleshooting

### Clients not receiving events

1. Check Redis connection: `redis-cli ping`
2. Verify game engine is publishing events
3. Check client subscription: emit `lotto80:stats` to see connected clients
4. Check Redis channels: `redis-cli PUBSUB CHANNELS "lotto80:*"`

### High latency

1. Check Redis performance
2. Monitor WebSocket connection count
3. Consider using Redis Cluster for high load
4. Implement message batching for countdown events

## Future Enhancements

- [ ] Add authentication/authorization
- [ ] Implement rate limiting per client
- [ ] Add event replay capability
- [ ] Support for multiple game types (Lotto36, Lotto12, Lotto6)
- [ ] Add metrics and monitoring (Prometheus)
- [ ] Implement horizontal scaling with Redis adapter
- [ ] Add event compression for mobile clients
