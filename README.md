# PulseChat

[![CI](https://github.com/juliancrv777/pulsechat/actions/workflows/ci.yml/badge.svg)](https://github.com/juliancrv777/pulsechat/actions/workflows/ci.yml)

A production-deployed real-time collaboration app built as a software engineering portfolio project.

**Live app:** https://web-production-b634e.up.railway.app

PulseChat demonstrates authenticated multi-user messaging, persistent history, presence and typing state, Redis-backed Socket.IO fan-out, role-based workspace membership, automated tests and continuous integration.

## Demo

**Production:** https://web-production-b634e.up.railway.app

A recruiter can create two independent accounts, create a workspace with the first account, add the second account by email and open `#general` on both clients. PulseChat will show both users online and deliver messages bidirectionally in real time; reloading the page demonstrates PostgreSQL-backed persistence.

> Portfolio note: the same two-user collaboration flow is executed automatically in CI with Playwright against isolated PostgreSQL and Redis services.

## What is implemented

- Email/password authentication with JWT-protected API routes
- Workspaces with OWNER, ADMIN and MEMBER roles
- Workspace member management
- Channels with persistent message history
- Real-time bidirectional messaging with Socket.IO
- Online presence with heartbeat/TTL state and typing indicators
- Reconnect and history synchronization
- Redis-backed Socket.IO adapter for multi-instance realtime delivery
- PostgreSQL persistence through Prisma
- Responsive mobile chat experience
- Session validation and explicit sign out
- DTO validation and server-side authorization
- Helmet, CORS and API rate limiting
- Automated API and web tests
- GitHub Actions quality gate
- Dockerized Railway production deployment

## Architecture

```text
Next.js / React (Railway)
        |
   REST + WebSocket
        |
   NestJS API (Railway)
     /          \
    /            \
Neon PostgreSQL  Upstash Redis
persistent data  realtime / pub-sub
```

PostgreSQL is the source of truth for users, memberships, workspaces, channels and messages. Redis is used for distributed realtime delivery and ephemeral presence state, so application instances do not need to share in-process state.

## Tech stack

| Layer | Technology |
| --- | --- |
| Web | Next.js 16, React 19, TypeScript |
| API | NestJS 11, TypeScript |
| Realtime | Socket.IO, Socket.IO Redis Adapter |
| Database | PostgreSQL, Prisma |
| Redis | Upstash Redis |
| Production database | Neon |
| Deployment | Railway, Docker |
| Testing | Vitest, Jest |
| CI | GitHub Actions |

## Validated production flow

The deployed application has been manually validated with two independent accounts:

1. User A creates a workspace and channel.
2. User A adds User B as a workspace member.
3. Both users join the same channel and presence reports both connections.
4. Messages sent by either account appear immediately on the other client.
5. Typing and presence events are delivered in real time.
6. Reloading a client restores message history from PostgreSQL.

This validates the Web -> API -> Socket.IO/Redis -> client path and PostgreSQL persistence.

## Repository structure

```text
pulsechat/
├── apps/
│   ├── api/        # NestJS API, Prisma and Socket.IO gateway
│   └── web/        # Next.js client
├── .github/
│   └── workflows/  # CI quality gate
└── package.json    # npm workspaces
```

## Local development

Requirements: Node.js 22, PostgreSQL and Redis. Redis is optional for single-instance local development, but required to exercise distributed realtime behavior.

Copy the example environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Install dependencies and prepare Prisma:

```bash
npm install
npm run prisma:generate -w @pulsechat/api
npm run prisma:migrate -w @pulsechat/api
```

Run the API and Web app in separate terminals:

```bash
npm run dev -w @pulsechat/api
npm run dev -w @pulsechat/web
```

Defaults: Web at `http://localhost:3000`, API at `http://localhost:4000/api`, Socket.IO namespace `/chat`.

## Quality checks

```bash
npm run typecheck
npm test
npm run build
```

GitHub Actions runs the quality gate on pushes and pull requests targeting `main`.

## Security and resilience

- JWT authentication protects private API and WebSocket operations.
- Workspace/channel membership is checked server-side.
- Request DTOs use allowlisted validation and reject unexpected fields.
- Blank realtime messages are rejected after normalization.
- Invalid history cursors return a controlled client error.
- A temporary API outage does not automatically destroy a valid local session.
- Redis connection failure can fall back to single-instance Socket.IO rather than preventing API startup.
- Production credentials are supplied through environment variables and are not stored in the repository.

## Status

**Production MVP - deployed and validated.**

Core realtime collaboration, persistence, distributed Redis delivery, mobile UX, automated tests and CI are operational. Future iterations can add unread state, reactions, richer member management and browser-level E2E coverage.

Built by **Julian Carvalho** as a software engineering portfolio project.
