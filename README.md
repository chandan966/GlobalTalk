# GlobalTalk

A real-time, anonymous-by-default chat-room starter project.

## Features
- Global Chat, India Chat, Music, Gaming, Movies, Technology, Sports, Friendship, Education, Memes, Language and Travel rooms.
- Temporary generated nicknames; no account or email required.
- Real-time WebSocket messaging and live participant counts.
- Optional one-to-one random video calls using WebRTC and Worker signaling.
- Camera/microphone controls, Next, End, reporting, and session-only block behavior.
- Basic message length and rate limits.
- Session-only local hide list and report action.
- Responsive React interface.
- No conventional database or persistent chat history.

## Frontend structure

```text
frontend/src/
  components/   Header.jsx + Header.css, Footer.jsx + Footer.css
  config/       WebSocket connection configuration
  data/         Chat room definitions
  pages/        HomePage, RoomPage, VideoChatPage, and SafetyPage with matching CSS files
  styles/       Global styles shared across the application
  utils/        Shared helpers such as nickname generation
  App.jsx + App.css  Client-side routes and shared page styles
  main.jsx      React entry point
```

Run `npm run format` from `frontend` to format frontend and backend source files.
Each page and component imports its adjacent CSS file. Global fonts, colors, and reset styles
are kept in `styles/global.css`.

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

The local Worker permits direct ICE only for `localhost` requests so local sessions can test signaling without a TURN account. Local direct calls can expose participants' network addresses to each other; do not expose the local Worker publicly. Production Worker hosts require TURN and do not fall back to direct ICE.
```powershell
cd "D:\Web development\PROJECT\New folder\backend"
npm run dev
```

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

`frontend/vercel.json` rewrites React routes to the Vite entry page for direct navigation and refreshes. It also sets browser security headers, including a Content Security Policy that permits the Cloudflare secure WebSocket endpoint and the Google Fonts used by the interface. Camera and microphone are allowed only for the GlobalTalk page origin.

## Random video calls

- The frontend captures camera and microphone only after the user presses **Start Random Video** and accepts the safety notice.
- A dedicated `VideoMatchmaker` Durable Object pairs waiting sessions and forwards validated offer, answer, and ICE signaling messages. Existing text-chat Durable Objects and message handling are separate.
- Media uses WebRTC and never passes through the Worker. Production ICE configuration is relay-only so call participants do not receive each other’s direct IP candidates.
- Production calls stay disabled until a TURN relay is configured. No TURN provider or credentials are included in the repository.
- Configure `VIDEO_TURN_URLS` as a comma-separated list of your TURN endpoints in the Cloudflare Worker environment. Configure `TURN_SHARED_SECRET` with `npx wrangler secret put TURN_SHARED_SECRET`; set the same secret in a Coturn deployment configured for its REST API (`use-auth-secret`). The Worker generates short-lived credentials. Do not put the shared secret in Vercel, `VITE_*` variables, source control, or frontend code.
- The TURN service needs a valid TLS certificate for `turns:` endpoints and reachable relay ports. Provider and bandwidth costs depend on the TURN host and call traffic; no provider has been selected or purchased.
- For local-only development, direct P2P testing can be enabled with `npm run dev -- --var VIDEO_ALLOW_DIRECT_P2P:true` in `backend`. It uses local ICE candidates and can expose test participants’ network addresses to each other; never set that mode on a public deployment. It is not the production privacy mode.
- Blocking excludes the current temporary session from rematching during that signaling connection. Anonymous users can reconnect with a new session, so permanent blocking is not guaranteed. Reports are logged but are not actively reviewed.
- Video calls are not age-verified or moderated. Another participant can record their screen with separate software. Keep the safety notice and privacy disclosures accurate before enabling the feature for the public.

### Public site settings
- Set `VITE_SITE_URL` to the public canonical origin if you use a custom domain. Update `frontend/public/robots.txt` and `frontend/public/sitemap.xml` to use that same domain.
- Set `VITE_CONTACT_EMAIL` to a real public inbox before launch. Until it is set, the Contact page explains that no address is configured.
- `VITE_*` variables are embedded in the public frontend bundle. Never put private credentials in them; use Cloudflare secrets for backend-only credentials.
- `frontend/public/ads.txt` is only a placeholder comment. After AdSense approves the site, replace it with the exact seller record copied from the account, in the form `google.com, pub-<publisher-id>, DIRECT, f08c47fec0942fa0`. Do not include the `ca-` product prefix or use a sample ID.
- AdSense scripts and placements are not enabled. The current restrictive CSP blocks third-party ad scripts; Google recommends nonce-based strict CSP for AdSense, so prepare that deployment mechanism before enabling ads rather than broadly allowing third-party scripts.

## Production notes
This is an MVP, not a fully moderated production social network. Nicknames and country labels are unverified and temporary. Reports are written to Worker logs; there is no moderator dashboard. Messages are not persisted. Add moderation workflows, abuse detection, monitoring, privacy/legal review and load testing before public launch. Hosting can incur charges if provider free-tier limits are exceeded.
