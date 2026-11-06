# Taskify backend on Cloudflare

Production API: https://backend-taskify.notesnaxa.workers.dev

Run from `backend`:

```powershell
npm.cmd ci
npm.cmd run deploy
npm.cmd run verify:cloudflare
```

Cloudflare Git builds must use `backend` as the root directory, install with
`npm ci`, and deploy with `npm run deploy`. No static-assets directory is needed.
The current release was deployed directly from the local backend; local changes
must be reviewed and pushed separately before Git builds will use them.

Configure `MONG_URI`, `JWT_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, and `SMTP_FROM` as encrypted Worker secrets. `OTP_SECRET` is optional.
Never commit `.env` or use real credentials in `.env.example`.

The Worker forwards all traffic to one named SQLite Durable Object. It keeps the
existing Express API, MongoDB connection, Socket.IO rooms, rate limits and reminder
timer together. Socket.IO WebSocket requests use the native Workers WebSocket
adapter; polling requests use the HTTP bridge. The bcrypt dependency is aliased
to bcryptjs so existing password hashes work without a native Node addon.

This is a single-object deployment and is subject to Workers free-plan and
Durable Object limits. After object restarts, clients reconnect and pending
reminders are checked. Reminders remain notifications for connected users.

`/health` checks runtime availability; `/ready` connects to MongoDB. The live
verification script uses the local JWT secret to sign a short-lived token for an
unused identifier, performs read-only database checks, verifies frontend CORS,
and tests authenticated WebSocket/polling plus rejection of invalid tokens.
It does not create production users, send signup emails or modify notes/tasks.

Frontend API configuration still points to the existing Render backend. Set its
API base URL to the production Worker URL when migrating the frontend.
