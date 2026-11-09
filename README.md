# GlobalTalk

A real-time, anonymous-by-default chat-room starter project.

## Features
- Global Chat, India Chat, Music, Gaming, Movies, Technology, Sports, Friendship, Education, Memes, Language and Travel rooms.
- Temporary generated nicknames; no account or email required.
- Real-time WebSocket messaging and live participant counts.
- Basic message length and rate limits.
- Session-only local hide list and report action.
- Responsive React interface.
- No conventional database or persistent chat history.

## Requirements
- Node.js 20+ and npm.
- Cloudflare account only for deployment; local development works without one.

## Run locally (Windows PowerShell)

Extract the ZIP. Open Terminal 1:
```powershell
cd "D:\Web development\PROJECT\New folder\backend"
npm install
npm run dev
```
Open Terminal 2:
```powershell
cd "D:\Web development\PROJECT\New folder\frontend"
npm install
npm run dev
```
Open the Vite URL, normally `http://localhost:5173`. If you extracted the project elsewhere, replace the paths with your actual folder path.

## Deploy backend
```powershell
cd "D:\Web development\PROJECT\New folder\backend"
npm install
npx wrangler login
npm run deploy
```

## Deploy frontend
Set the Worker WebSocket URL before building:
```powershell
cd "D:\Web development\PROJECT\New folder\frontend"
$env:VITE_CHAT_WS_URL="wss://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/ws"
npm run build
```
Deploy `frontend/dist` to Cloudflare Pages (or another static host) and set the same environment variable in its build settings.

### Deploy frontend to Vercel
- Set the Vercel project **Root Directory** to `frontend` (the folder containing `package.json` and `vercel.json`).
- Use the Vite defaults: build command `npm run build` and output directory `dist`.
- Add `VITE_CHAT_WS_URL` to the Vercel project's Environment Variables for every deployment environment. Its value must be the Cloudflare Worker WebSocket endpoint, for example `wss://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/ws` (do not include a room name or a trailing slash).
- Redeploy after changing the environment variable; Vite embeds it during the build. Production does not fall back to the Vercel domain for WebSocket connections.

`frontend/vercel.json` rewrites the React room and safety routes to the Vite entry page for direct navigation and refreshes. It also sets browser security headers, including a Content Security Policy that permits the Cloudflare secure WebSocket endpoint and the Google Fonts used by the interface.

## Production notes
This is an MVP, not a fully moderated production social network. Nicknames and country labels are unverified and temporary. Reports are written to Worker logs; there is no moderator dashboard. Messages are not persisted. Add moderation workflows, abuse detection, monitoring, privacy/legal review and load testing before public launch. Hosting can incur charges if provider free-tier limits are exceeded.
