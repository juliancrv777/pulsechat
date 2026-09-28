# Production operations

## Runtime

PulseChat deploys the web and API independently. PostgreSQL stores durable state; Redis provides Socket.IO fan-out and ephemeral presence.

## Health

- `GET /api/health`: process liveness only.
- `GET /api/health/ready`: verifies PostgreSQL and, when configured, Redis readiness.

A platform healthcheck should use liveness so a transient dependency issue does not create a restart loop. Readiness is intended for diagnostics/traffic orchestration.

## Deployment order

1. Provision PostgreSQL and Redis.
2. Configure API secrets/references: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `WEB_ORIGIN`.
3. Run `npm run prisma:deploy -w @pulsechat/api` as a pre-deploy migration command.
4. Deploy API and verify health/readiness.
5. Build web with `NEXT_PUBLIC_API_URL` pointing at the public API URL.
6. Set API `WEB_ORIGIN` to the public web origin.

## Security baseline

Helmet sets HTTP security headers, global validation rejects unknown DTO fields, JWT protects application resources, workspace membership is enforced server-side, and HTTP requests are globally rate-limited. Secrets stay in the platform environment and are never committed.

## Recovery

Messages remain durable in PostgreSQL. Redis loss can degrade realtime fan-out/presence, but clients resynchronize message history through REST after reconnect.
