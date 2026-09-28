# Realtime messaging

## Delivery model

PostgreSQL is the durable source of truth. Socket.IO accelerates delivery but is not treated as durable storage.

1. Client authenticates the Socket.IO handshake with its JWT.
2. Before joining `channel:<id>`, the API resolves the channel and verifies workspace membership.
3. `message:send` repeats the authorization boundary and persists the message.
4. Only after persistence succeeds does the gateway broadcast `message:created`.
5. REST `GET /api/channels/:channelId/messages` returns the latest 50 durable messages.
6. On socket reconnect the client rejoins the room and resynchronizes history through REST.
7. Message IDs deduplicate realtime events against synchronized history in the UI.

This intentionally avoids pretending WebSocket delivery is exactly-once. A temporary disconnect may miss an event, while durable resynchronization restores state.

## Events

- `channel:join` — authorized room subscription.
- `channel:leave` — leave room.
- `message:send` — validate, authorize and persist a message.
- `message:created` — server broadcast after persistence.

Redis fan-out for multiple API instances is Stage 6; a single API instance is the current runtime boundary.
