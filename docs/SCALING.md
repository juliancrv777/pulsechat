# Horizontal realtime scaling

## Runtime split

- **PostgreSQL** remains the durable source of truth for users, memberships, channels and messages.
- **Redis Pub/Sub** backs the Socket.IO Redis adapter so rooms/events span API instances.
- **Redis TTL keys** hold ephemeral channel presence. Presence is not written to PostgreSQL.

## Presence protocol

Each socket refreshes `presence:<channelId>:<userId>:<socketId>` every 15 seconds with a 45-second TTL. Multiple keys for the same user are deduplicated when presence is read, so tabs/devices do not inflate the online count. Graceful leave/disconnect deletes the key immediately; TTL handles crashed processes or severed connections.

## Failure behavior

If `REDIS_URL` is absent, PulseChat deliberately runs in single-instance fallback mode. Durable messaging still works because messages are persisted in PostgreSQL before broadcast. Horizontal fan-out and cross-instance presence require Redis.

A Redis outage can temporarily degrade fan-out/presence, but must not turn Redis into message storage. Clients recover durable messages through REST synchronization after reconnect.

## Scale boundary

Multiple NestJS instances can share Socket.IO broadcasts and presence when connected to the same Redis deployment. Sticky sessions are not required when clients use WebSocket transport only; the web client currently does so explicitly.
