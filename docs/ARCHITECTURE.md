# PulseChat architecture

## Goal

PulseChat demonstrates realtime application engineering rather than another CRUD-only portfolio project.

## Boundaries

- **Web:** Next.js/React presentation, HTTP client and realtime client.
- **API:** NestJS domain modules and WebSocket gateway.
- **PostgreSQL:** durable users, memberships, channels and messages.
- **Redis:** ephemeral presence and cross-instance realtime fan-out.

## Delivery semantics

The initial messaging design will use server-generated message IDs and persisted messages as the source of truth. Realtime events accelerate delivery but do not replace durable history. Reconnecting clients will resynchronize from the API instead of assuming every socket event was received.

## Security

Authentication and authorization remain server-side. Channel membership will be checked before history access, message creation or socket subscription. Redis is infrastructure, never an authorization source of truth.

## Tradeoffs

We will begin as a modular monolith. This keeps local development and transactional boundaries understandable while still allowing multiple API instances to share realtime events through Redis. Splitting into microservices is intentionally deferred until a concrete scaling boundary justifies it.
