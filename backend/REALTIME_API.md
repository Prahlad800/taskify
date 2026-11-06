# Live updates and reminders

The API on port 3030 now serves Socket.IO on /socket.io using WebSocket with polling fallback. Use a Socket.IO client, not a raw WebSocket protocol client. Login/signup verification returns the JWT used for socket authentication.

## Connect

~~~js
import {io} from 'socket.io-client';
const socket = io('http://localhost:3030', {
  auth: {token: jwtToken},
  transports: ['websocket', 'polling']
});
socket.on('realtime:ready', () => { /* refresh current list after reconnect */ });
socket.on('note:changed', event => { /* merge or remove event.item */ });
socket.on('task:changed', event => { /* merge or remove event.item */ });
socket.on('reminder:due', reminder => { /* show the in-app alert */ });
~~~

Connections require a valid, unexpired HS256 JWT with a user _id. The server chooses the user's room; clients cannot join arbitrary user rooms. Sockets disconnect when their JWT expires. Sign in again when the session expires. Allowed browser origins match the app's existing local/Vercel origins. JWTs are sent through handshake auth, not query strings.

## Mutation events

Successful POST/PUT/PATCH/DELETE requests under /home and /task broadcast to this user's other tabs/devices:

~~~json
{"id":"item-id","action":"create|update|delete","item":{"_id":"item-id","title":"Example","updatedAt":"ISO date"}}
~~~

Deletes send item: null. Failed/unauthorized requests do not broadcast. The frontend sends X-Realtime-Client: socket.id on its own API requests to avoid processing the same mutation twice; exclusion is honored only when that socket belongs to the authenticated user. Content is never broadcast globally.

Lists update immediately. A clean note editor reloads remote changes; typing in the current note is retained until its local autosave completes. This is single-user multi-tab synchronization, not collaborative conflict resolution: concurrent writes use the existing last-write-wins API behavior. Reconnect refreshes the list to recover events missed while disconnected.

## Reminders

Notes: PATCH /home/:id/settings with reminderAt: ISO string or null.
Tasks: PATCH /task/:id/reminder with dueDate: ISO string or null.

Set/remove reminder actions are available from the three-dot menu. A server worker checks due dates approximately every five seconds while the backend is running. Archived/trashed notes and completed tasks are skipped. The server atomically claims a due reminder in MongoDB using reminderNotifiedAt to avoid repeated alerts on each scan; changing the scheduled time resets the claim. Notification delivery itself does not change the item's updatedAt or list order.

~~~json
{"kind":"note|task","id":"item-id","title":"Example","scheduledAt":"ISO date","notificationId":"stable-reminder-id"}
~~~

Alerts appear inside the open app. If a user has no connected socket, the reminder stays pending and is checked on reconnect. Delivery is best-effort to connected tabs; this is not background browser push, SMS or email delivery when the app is closed. No Notification permission is requested.

## Deployment and verification

Current configuration supports one backend process. Multiple instances need a shared Socket.IO adapter for cross-instance rooms. Reminder claims are persisted in MongoDB. Ensure the hosting proxy allows WebSocket upgrade and keeps the backend worker running; a sleeping process cannot emit at the due time.

Run npm test in backend for isolated database, authentication, room-isolation, cross-tab mutation, due reminder, duplicate suppression, reschedule, offline/reconnect and canceled-item tests. Tests never use the configured application database.

References: https://socket.io/docs/v4/middlewares/ and https://socket.io/docs/v4/rooms/
