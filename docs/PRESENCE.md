# Presence and typing

Stage 5 intentionally keeps ephemeral collaboration state in API memory. Redis becomes the shared ephemeral state/fan-out layer in Stage 6.

## Presence semantics

- Presence is scoped to a channel.
- One user may own multiple socket connections (tabs/devices).
- A user remains online until their last connection leaves/disconnects.
- Disconnect cleanup removes the socket from every joined channel and broadcasts updated presence.
- Presence is never persisted to PostgreSQL.

## Typing semantics

- `typing:set` requires an authenticated socket and current workspace membership.
- Typing updates are broadcast to peers, not echoed to the sender.
- The sender emits an explicit stop after inactivity/send.
- Clients also expire remote typing state after 2.5 seconds, preventing a stale indicator after an abrupt disconnect.

## Mobile

The channel list and conversation are separate mobile views. Selecting a channel opens the chat; the chat header exposes a back control to return to channels.
