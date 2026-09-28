# PulseChat

> A real-time collaboration platform built to demonstrate event-driven full-stack engineering.

PulseChat is the next engineering portfolio project after OpsBoard, IssueDesk and ReserveFlow. Its focus is a different problem space: **real-time state, WebSocket delivery, presence, asynchronous events and resilient reconnects**.

## Target architecture

```text
Next.js + React
      │
      ├── HTTPS / REST
      └── WebSocket
             │
             ▼
        NestJS API
        ├── Auth / RBAC
        ├── Workspaces / Channels
        ├── Messages
        └── Realtime Gateway
             │
       ┌─────┴─────┐
       ▼           ▼
 PostgreSQL      Redis
 persistent     presence /
   data          pub-sub
```

## Planned capabilities

- Authenticated workspaces and channels
- Real-time messaging
- Online/offline presence and typing indicators
- Persistent message history
- Unread message state and reactions
- Reconnect/resynchronization strategy
- Rate limiting and authorization
- PostgreSQL persistence and Redis-backed realtime state
- Unit, integration and browser E2E tests
- Dockerized local environment and GitHub Actions
- Public production deployment and documented architecture

## Engineering principles

The repository will favor explicit domain boundaries, server-side authorization, deterministic tests and documented tradeoffs. Features will only be listed as implemented after they are validated.

## Delivery plan

1. Monorepo foundation and quality gates
2. Database model and authentication
3. Workspace/channel domain
4. WebSocket messaging
5. Presence, typing and reconnect handling
6. Unread state and reactions
7. Redis pub/sub and horizontal realtime design
8. Tests, security and failure handling
9. Docker, CI/CD and production deployment
10. Recruiter-facing documentation and demo

## Status

**Stage 6 — Redis-backed horizontal realtime scaling in progress.**

Implemented so far: durable authenticated realtime messaging, Redis-backed Socket.IO fan-out, TTL/heartbeat presence shared across API instances, multi-connection awareness, typing indicators, reconnect synchronization, and mobile chat UX.

Built by **Julian Carvalho** as a software engineering portfolio project.
