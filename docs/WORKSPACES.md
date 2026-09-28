# Workspaces and channels

## Invariants

- A workspace creator becomes its `OWNER`.
- Workspace creation also creates `#general` in the same database transaction.
- Only workspace members may read workspace details/channels.
- `OWNER` and `ADMIN` may create channels; `MEMBER` cannot.
- Channel names are unique inside a workspace.
- Membership is checked server-side and is never inferred from the client UI.

## API

- `GET /api/workspaces` — workspaces for the authenticated user.
- `POST /api/workspaces` — create workspace + owner membership + general channel.
- `GET /api/workspaces/:id` — workspace detail for members.
- `POST /api/workspaces/:id/channels` — create a channel as owner/admin.

Stage 4 will attach durable messages and WebSocket subscriptions to this authorization boundary.
