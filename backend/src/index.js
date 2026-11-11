const MAX_MESSAGE_LENGTH = 500;
const MAX_PAYLOAD_BYTES = 4096;
const MESSAGE_WINDOW_MS = 5000;
const MESSAGE_COOLDOWN_MS = 500;
const MAX_MESSAGES_PER_WINDOW = 6;
const MAX_ROOM_MESSAGES_PER_WINDOW = 300;
const MAX_ROOM_CONNECTIONS = 500;
const REPORT_WINDOW_MS = 60_000;
const MAX_REPORTS_PER_WINDOW = 3;
const MAX_INVALID_MESSAGES = 5;
const MAX_VIDEO_CONNECTIONS = 300;
const MAX_VIDEO_PAYLOAD_BYTES = 32_768;
const MAX_VIDEO_SDP_LENGTH = 24_000;
const VIDEO_QUEUE_WINDOW_MS = 60_000;
const VIDEO_QUEUE_COOLDOWN_MS = 750;
const MAX_VIDEO_QUEUE_ACTIONS_PER_WINDOW = 12;
const VIDEO_SIGNAL_WINDOW_MS = 10_000;
const MAX_VIDEO_SIGNALS_PER_WINDOW = 120;
const VIDEO_REPORT_WINDOW_MS = 60_000;
const MAX_VIDEO_REPORTS_PER_WINDOW = 3;
const MAX_VIDEO_BLOCKED_PEERS = 128;
const VIDEO_CONTROL_WINDOW_MS = 60_000;
const MAX_VIDEO_CONTROLS_PER_WINDOW = 60;
const MAX_CONNECTIONS_PER_IP = 6;
const GLOBAL_IP_WINDOW_MS = 60_000;
const MAX_GLOBAL_CONNECTS_PER_WINDOW = 15;
const RESERVED_USERNAMES =
  /^(admin|administrator|moderator|mod|globaltalk|support|helpdesk|police|cybercell|system|official|staff|root|founder)$/i;

const globalIpConnectionTimes = new Map();

function checkGlobalIpRateLimit(ip) {
  const now = Date.now();
  const times = globalIpConnectionTimes.get(ip) || [];
  const recent = times.filter((t) => now - t < GLOBAL_IP_WINDOW_MS);
  if (recent.length >= MAX_GLOBAL_CONNECTS_PER_WINDOW) {
    globalIpConnectionTimes.set(ip, recent);
    return false;
  }
  recent.push(now);
  globalIpConnectionTimes.set(ip, recent);
  return true;
}

async function timingSafeEqualString(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const hashA = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(a)));
  const hashB = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(b)));
  let diff = 0;
  for (let i = 0; i < 32; i++) {
    diff |= hashA[i] ^ hashB[i];
  }
  return diff === 0 && a.length === b.length;
}

async function verifyAdminAuth(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const provided = match[1].trim();
  const secret = typeof env.ADMIN_SECRET === 'string' ? env.ADMIN_SECRET.trim() : '';
  if (secret.length < 16) return false;
  return await timingSafeEqualString(provided, secret);
}

const VIDEO_REPORT_REASONS = new Set([
  'harassment',
  'inappropriate behavior',
  'spam',
  'scam',
  'hate/abuse',
  'illegal activity',
  'other',
]);

const VALID_ROOMS = new Set([
  'global',
  'india',
  'music',
  'gaming',
  'movies',
  'technology',
  'sports',
  'friendship',
  'education',
  'memes',
  'language',
  'travel',
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health' && request.method === 'GET') {
      return secureResponse(
        JSON.stringify({ status: 'ok', service: 'GlobalTalk API' }),
        200,
        { 'Content-Type': 'application/json; charset=utf-8' },
        url.protocol === 'https:',
      );
    }

    if (url.pathname === '/api/admin/moderate') {
      if (request.method !== 'POST') {
        return secureResponse(
          'Method not allowed',
          405,
          { Allow: 'POST' },
          url.protocol === 'https:',
        );
      }

      const isAuthed = await verifyAdminAuth(request, env);
      if (!isAuthed) {
        return secureResponse(
          JSON.stringify({ error: 'Unauthorized: invalid or missing admin token' }),
          401,
          { 'Content-Type': 'application/json' },
          url.protocol === 'https:',
        );
      }

      try {
        const body = await request.json();
        const { action, room, messageId } = body || {};

        if (action === 'delete') {
          if (!room || !VALID_ROOMS.has(room) || typeof messageId !== 'string') {
            return secureResponse(
              JSON.stringify({ error: 'Invalid room or messageId' }),
              400,
              { 'Content-Type': 'application/json' },
              url.protocol === 'https:',
            );
          }
          const roomId = env.CHAT_ROOM.idFromName(room);
          const roomObj = env.CHAT_ROOM.get(roomId);
          const internalReq = new Request('http://internal/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', messageId }),
          });
          return await roomObj.fetch(internalReq);
        }

        if (action === 'reports') {
          if (!room || !VALID_ROOMS.has(room)) {
            return secureResponse(
              JSON.stringify({ error: 'Invalid room' }),
              400,
              { 'Content-Type': 'application/json' },
              url.protocol === 'https:',
            );
          }
          const roomId = env.CHAT_ROOM.idFromName(room);
          const roomObj = env.CHAT_ROOM.get(roomId);
          const internalReq = new Request('http://internal/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reports' }),
          });
          return await roomObj.fetch(internalReq);
        }

        if (action === 'status') {
          return secureResponse(
            JSON.stringify({
              service: 'GlobalTalk',
              timestamp: Date.now(),
              rooms: Array.from(VALID_ROOMS),
            }),
            200,
            { 'Content-Type': 'application/json' },
            url.protocol === 'https:',
          );
        }

        return secureResponse(
          JSON.stringify({ error: 'Unknown admin action' }),
          400,
          { 'Content-Type': 'application/json' },
          url.protocol === 'https:',
        );
      } catch {
        return secureResponse(
          JSON.stringify({ error: 'Malformed request payload' }),
          400,
          { 'Content-Type': 'application/json' },
          url.protocol === 'https:',
        );
      }
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    const isWsUpgrade = request.headers.get('Upgrade')?.toLowerCase() === 'websocket';

    if (isWsUpgrade && !checkGlobalIpRateLimit(clientIp)) {
      return secureResponse(
        'Too many connection attempts. Please slow down and try again shortly.',
        429,
        { 'Retry-After': '60' },
        url.protocol === 'https:',
      );
    }

    if (url.pathname === '/video') {
      if (request.method !== 'GET') {
        return secureResponse(
          'Method not allowed',
          405,
          { Allow: 'GET' },
          url.protocol === 'https:',
        );
      }

      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return secureResponse(
          'WebSocket upgrade required',
          426,
          { Upgrade: 'websocket' },
          url.protocol === 'https:',
        );
      }

      if (!isAllowedOrigin(request, env)) {
        return secureResponse('Origin not allowed', 403, {}, url.protocol === 'https:');
      }

      try {
        const id = env.VIDEO_MATCHMAKER.idFromName('global-video-queue');
        return await env.VIDEO_MATCHMAKER.get(id).fetch(request);
      } catch {
        console.error(JSON.stringify({ event: 'video_matchmaker_unavailable' }));
        return secureResponse(
          'Random video is temporarily unavailable. Please try again.',
          503,
          {},
          url.protocol === 'https:',
        );
      }
    }

    if (url.pathname === '/ws' || url.pathname.startsWith('/ws/')) {
      if (request.method !== 'GET') {
        return secureResponse(
          'Method not allowed',
          405,
          { Allow: 'GET' },
          url.protocol === 'https:',
        );
      }

      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return secureResponse(
          'WebSocket upgrade required',
          426,
          { Upgrade: 'websocket' },
          url.protocol === 'https:',
        );
      }

      if (!isAllowedOrigin(request, env)) {
        return secureResponse('Origin not allowed', 403, {}, url.protocol === 'https:');
      }

      const path = url.pathname.replace(/\/+$/, '');
      const room = path === '/ws' ? 'global' : path.slice('/ws/'.length);

      if (!/^\/ws(?:\/[a-z0-9-]+)?$/.test(path) || !VALID_ROOMS.has(room)) {
        return secureResponse('Room not found', 404, {}, url.protocol === 'https:');
      }

      try {
        const id = env.CHAT_ROOM.idFromName(room);
        return await env.CHAT_ROOM.get(id).fetch(request);
      } catch {
        console.error(JSON.stringify({ event: 'chat_room_unavailable', room }));
        return secureResponse(
          'Chat is temporarily unavailable. Please try again.',
          503,
          {},
          url.protocol === 'https:',
        );
      }
    }

    if (request.method !== 'GET') {
      return secureResponse('Method not allowed', 405, { Allow: 'GET' }, url.protocol === 'https:');
    }

    return secureResponse(
      'GlobalTalk API. Connect through /ws/<room>.',
      200,
      { 'Content-Type': 'text/plain; charset=utf-8' },
      url.protocol === 'https:',
    );
  },
};

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.roomMessageTimes = [];
    this.socketsByIp = new Map();
    this.recentMessages = [];
    this.recentReports = [];
    this.state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  async fetch(request) {
    const requestUrl = new URL(request.url);

    // Handle internal authenticated admin moderation dispatch
    if (requestUrl.pathname === '/admin' && request.method === 'POST') {
      try {
        const adminData = await request.json();
        if (adminData.action === 'delete' && typeof adminData.messageId === 'string') {
          const targetId = adminData.messageId;
          this.recentMessages = (this.recentMessages || []).filter((m) => m.id !== targetId);
          this.deletedMessageIds = this.deletedMessageIds || new Set();
          this.deletedMessageIds.add(targetId);
          try {
            await this.state.storage.put(
              'deleted_message_ids',
              Array.from(this.deletedMessageIds).slice(-200),
            );
          } catch {
            // Storage fallback
          }
          this.broadcast({ type: 'delete_message', messageId: targetId });
          console.log(
            JSON.stringify({
              event: 'admin_message_deleted',
              messageId: targetId,
              room: this.state.id.toString(),
              timestamp: Date.now(),
            }),
          );
          return secureResponse(
            JSON.stringify({ status: 'ok', deleted: targetId }),
            200,
            { 'Content-Type': 'application/json' },
            false,
          );
        }

        if (adminData.action === 'reports') {
          let reports = this.recentReports || [];
          try {
            const stored = await this.state.storage.get('recent_reports');
            if (Array.isArray(stored)) {
              reports = stored;
              this.recentReports = stored;
            }
          } catch {
            // Storage fallback
          }
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const filtered = reports.filter((r) => r.timestamp > thirtyDaysAgo);
          return secureResponse(
            JSON.stringify({
              room: this.state.id.toString(),
              count: filtered.length,
              reports: filtered,
            }),
            200,
            { 'Content-Type': 'application/json' },
            false,
          );
        }

        return secureResponse(
          JSON.stringify({ error: 'Unknown internal admin action' }),
          400,
          { 'Content-Type': 'application/json' },
          false,
        );
      } catch {
        return secureResponse(
          JSON.stringify({ error: 'Internal admin error' }),
          500,
          { 'Content-Type': 'application/json' },
          false,
        );
      }
    }

    if (
      request.method !== 'GET' ||
      request.headers.get('Upgrade')?.toLowerCase() !== 'websocket' ||
      !isAllowedOrigin(request, this.env)
    ) {
      return secureResponse(
        'Invalid WebSocket request',
        400,
        {},
        new URL(request.url).protocol === 'https:',
      );
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    const activeForIp = this.socketsByIp.get(clientIp) || 0;
    if (activeForIp >= MAX_CONNECTIONS_PER_IP) {
      return secureResponse(
        `Too many connections from this network. Maximum ${MAX_CONNECTIONS_PER_IP} connections per IP are permitted.`,
        429,
        { 'Retry-After': '30' },
        new URL(request.url).protocol === 'https:',
      );
    }

    if (this.state.getWebSockets().length >= MAX_ROOM_CONNECTIONS) {
      return secureResponse(
        'This room is full. Please try again later.',
        503,
        {},
        new URL(request.url).protocol === 'https:',
      );
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.socketsByIp.set(clientIp, activeForIp + 1);
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ ...createSocketData(), ip: clientIp });
    safeSend(server, { type: 'history', messages: [] });
    this.presence();

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(socket, raw) {
    const socketData = readSocketData(socket);
    const payload = decodePayload(raw);

    if (payload === null) {
      this.rejectInvalidMessage(socket, socketData, 'Invalid or oversized message.');
      return;
    }

    let data;
    try {
      data = JSON.parse(payload);
    } catch {
      this.rejectInvalidMessage(socket, socketData, 'Message must be valid JSON.');
      return;
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      this.rejectInvalidMessage(socket, socketData, 'Invalid message format.');
      return;
    }

    if (data.type === 'join') {
      if (socketData.joined) {
        this.rejectInvalidMessage(
          socket,
          socketData,
          'Profile is already set for this connection.',
        );
        return;
      }

      let rawName = cleanText(data.name, 24);
      const normalizedName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!rawName || RESERVED_USERNAMES.test(normalizedName)) {
        rawName = 'Guest#' + Math.floor(1000 + Math.random() * 9000);
      }

      socketData.name = rawName;
      socketData.country = cleanText(data.country, 40);
      socketData.joined = true;
      socket.serializeAttachment(socketData);
      this.presence();
      return;
    }

    if (data.type === 'message') {
      this.handleChatMessage(socket, socketData, data.text);
      return;
    }

    if (data.type === 'report') {
      this.handleReport(socket, socketData, data.messageId);
      return;
    }

    this.rejectInvalidMessage(socket, socketData, 'Unknown message type.');
  }

  handleChatMessage(socket, socketData, rawText) {
    if (!socketData.joined) {
      this.rejectInvalidMessage(socket, socketData, 'Join the room before sending messages.');
      return;
    }

    if (typeof rawText !== 'string') {
      this.rejectInvalidMessage(socket, socketData, 'Message text must be plain text.');
      return;
    }

    const text = cleanText(rawText, Number.MAX_SAFE_INTEGER);
    const length = Array.from(text).length;

    if (!text) {
      safeSend(socket, { type: 'error', message: 'Message cannot be empty.' });
      return;
    }

    if (length > MAX_MESSAGE_LENGTH) {
      safeSend(socket, {
        type: 'error',
        message: `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      });
      return;
    }

    const now = Date.now();
    const normalizedText = text.toLowerCase().trim();

    // Prevent identical message spam from the same connection
    if (
      socketData.lastMessageText &&
      socketData.lastMessageText === normalizedText &&
      now - socketData.lastMessageAt < 10000
    ) {
      safeSend(socket, {
        type: 'error',
        message: 'Please do not repeat the exact same message.',
      });
      return;
    }

    const recentMessages = socketData.messageTimes.filter((time) => now - time < MESSAGE_WINDOW_MS);

    if (now - socketData.lastMessageAt < MESSAGE_COOLDOWN_MS) {
      socketData.messageTimes = recentMessages;
      socket.serializeAttachment(socketData);
      safeSend(socket, {
        type: 'error',
        message: 'Please wait a moment before sending another message.',
      });
      return;
    }

    if (recentMessages.length >= MAX_MESSAGES_PER_WINDOW) {
      socketData.messageTimes = recentMessages;
      socket.serializeAttachment(socketData);
      safeSend(socket, {
        type: 'error',
        message: 'Slow down and try again in a moment.',
      });
      return;
    }

    const roomMessages = this.roomMessageTimes.filter((time) => now - time < MESSAGE_WINDOW_MS);

    if (roomMessages.length >= MAX_ROOM_MESSAGES_PER_WINDOW) {
      this.roomMessageTimes = roomMessages;
      safeSend(socket, {
        type: 'error',
        message: 'This room is busy. Please try again shortly.',
      });
      return;
    }

    recentMessages.push(now);
    roomMessages.push(now);
    socketData.messageTimes = recentMessages;
    socketData.lastMessageAt = now;
    socketData.lastMessageText = normalizedText;
    this.roomMessageTimes = roomMessages;
    socket.serializeAttachment(socketData);

    const messageId = crypto.randomUUID();
    const messagePayload = {
      id: messageId,
      name: socketData.name,
      country: socketData.country,
      text,
      time: now,
    };

    // Keep recent messages in memory buffer for moderation and reporting verification
    this.recentMessages = this.recentMessages || [];
    this.recentMessages.push({ ...messagePayload, ip: socketData.ip || '127.0.0.1' });
    if (this.recentMessages.length > 50) this.recentMessages.shift();

    this.broadcast({
      type: 'message',
      message: messagePayload,
    });
  }

  handleReport(socket, socketData, messageId) {
    if (!socketData.joined) {
      this.rejectInvalidMessage(socket, socketData, 'Join the room before reporting messages.');
      return;
    }

    if (
      typeof messageId !== 'string' ||
      !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(messageId)
    ) {
      this.rejectInvalidMessage(socket, socketData, 'Invalid report reference.');
      return;
    }

    const now = Date.now();
    const recentReports = socketData.reportTimes.filter((time) => now - time < REPORT_WINDOW_MS);

    if (recentReports.length >= MAX_REPORTS_PER_WINDOW) {
      socketData.reportTimes = recentReports;
      socket.serializeAttachment(socketData);
      safeSend(socket, {
        type: 'error',
        message: 'Too many reports. Please try again later.',
      });
      return;
    }

    recentReports.push(now);
    socketData.reportTimes = recentReports;
    socket.serializeAttachment(socketData);

    // Locate reported message in memory buffer to record meaningful abuse evidence
    const foundMsg = (this.recentMessages || []).find((m) => m.id === messageId);
    const abuseSnapshot = {
      event: 'abuse_report_recorded',
      reportId: crypto.randomUUID(),
      messageId,
      room: this.state.id.toString(),
      reportedText: foundMsg ? foundMsg.text : '[Message no longer in recent buffer]',
      reportedSender: foundMsg ? foundMsg.name : 'Unknown',
      reportedIp: foundMsg ? foundMsg.ip : 'Unknown',
      reporterName: socketData.name,
      reporterIp: socketData.ip || '127.0.0.1',
      timestamp: now,
    };

    console.log(JSON.stringify(abuseSnapshot));

    this.recentReports = this.recentReports || [];
    this.recentReports.push(abuseSnapshot);
    if (this.recentReports.length > 50) this.recentReports.shift();
    try {
      void this.state.storage.put('recent_reports', this.recentReports);
    } catch {
      // Storage fallback
    }

    safeSend(socket, {
      type: 'report_result',
      messageId,
      message: 'Report received. Our moderation team has recorded this incident.',
    });
  }

  rejectInvalidMessage(socket, socketData, message) {
    socketData.invalidMessages += 1;
    socket.serializeAttachment(socketData);
    safeSend(socket, { type: 'error', message });

    if (socketData.invalidMessages >= MAX_INVALID_MESSAGES) {
      try {
        socket.close(1008, 'Too many invalid messages');
      } catch {
        // The socket may already be closed.
      }
    }
  }

  webSocketClose(socket) {
    const socketData = readSocketData(socket);
    if (socketData.ip && this.socketsByIp) {
      const cur = this.socketsByIp.get(socketData.ip) || 1;
      if (cur <= 1) this.socketsByIp.delete(socketData.ip);
      else this.socketsByIp.set(socketData.ip, cur - 1);
    }
    this.presence();
  }

  webSocketError(socket) {
    const socketData = readSocketData(socket);
    if (socketData.ip && this.socketsByIp) {
      const cur = this.socketsByIp.get(socketData.ip) || 1;
      if (cur <= 1) this.socketsByIp.delete(socketData.ip);
      else this.socketsByIp.set(socketData.ip, cur - 1);
    }
    this.presence();
  }

  broadcast(data) {
    for (const socket of this.state.getWebSockets()) {
      if (!safeSend(socket, data)) {
        try {
          socket.close(1011, 'Unable to send message');
        } catch {
          // The socket may already be closed.
        }
      }
    }
  }

  presence() {
    this.broadcast({
      type: 'presence',
      count: this.state.getWebSockets().length,
    });
  }
}

export class VideoMatchmaker {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.socketsByIp = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (
      request.method !== 'GET' ||
      url.pathname !== '/video' ||
      request.headers.get('Upgrade')?.toLowerCase() !== 'websocket' ||
      !isAllowedOrigin(request, this.env)
    ) {
      return secureResponse('Invalid video WebSocket request', 400, {}, url.protocol === 'https:');
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
    const activeForIp = this.socketsByIp.get(clientIp) || 0;
    if (activeForIp >= MAX_CONNECTIONS_PER_IP) {
      return secureResponse(
        `Too many video connections from this network. Maximum ${MAX_CONNECTIONS_PER_IP} connections per IP are permitted.`,
        429,
        { 'Retry-After': '30' },
        url.protocol === 'https:',
      );
    }

    if (this.state.getWebSockets().length >= MAX_VIDEO_CONNECTIONS) {
      return secureResponse(
        'Random video is busy. Please try again later.',
        503,
        {},
        url.protocol === 'https:',
      );
    }

    const sessionId = crypto.randomUUID();
    let iceConfig = null;
    try {
      iceConfig = await createVideoIceConfig(this.env, url.hostname, sessionId);
    } catch {
      console.error(JSON.stringify({ event: 'video_ice_config_unavailable' }));
    }

    const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (!isLocalHost && !iceConfig) {
      return secureResponse(
        'Random video is temporarily unavailable because a secure relay is required in production to protect user IP privacy.',
        503,
        {},
        url.protocol === 'https:',
      );
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.socketsByIp.set(clientIp, activeForIp + 1);
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ ...createVideoSocketData(iceConfig, sessionId), ip: clientIp });

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(socket, raw) {
    const socketData = readVideoSocketData(socket);
    const payload = decodePayload(raw, MAX_VIDEO_PAYLOAD_BYTES);
    if (payload === null) {
      this.rejectVideoMessage(socket, socketData, 'Invalid or oversized video message.');
      return;
    }

    let data;
    try {
      data = JSON.parse(payload);
    } catch {
      this.rejectVideoMessage(socket, socketData, 'Video message must be valid JSON.');
      return;
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      this.rejectVideoMessage(socket, socketData, 'Invalid video message format.');
      return;
    }

    if (data.type !== 'signal' && data.type !== 'ping') {
      const now = Date.now();
      const recentControls = socketData.controlTimes.filter(
        (time) => now - time < VIDEO_CONTROL_WINDOW_MS,
      );
      if (recentControls.length >= MAX_VIDEO_CONTROLS_PER_WINDOW) {
        this.closeVideoSocket(socket, 'Too many control messages');
        return;
      }
      recentControls.push(now);
      socketData.controlTimes = recentControls;
      this.saveVideoSocketData(socket, socketData);
    }

    if (data.type === 'queue' || data.type === 'next' || data.type === 'block') {
      this.queueSocket(socket, socketData, data.type);
      return;
    }

    if (data.type === 'signal') {
      this.forwardSignal(socket, socketData, data.signal);
      return;
    }

    if (data.type === 'report') {
      this.reportPeer(socket, socketData, data.reason);
      return;
    }

    if (data.type === 'leave') {
      this.releasePeer(socket, socketData, true);
      socketData.status = 'idle';
      this.saveVideoSocketData(socket, socketData);
      safeSend(socket, { type: 'left' });
      return;
    }

    if (data.type === 'ping') {
      safeSend(socket, { type: 'pong' });
      return;
    }

    this.rejectVideoMessage(socket, socketData, 'Unknown video message type.');
  }

  queueSocket(socket, socketData, action) {
    if (!socketData.iceConfig) {
      safeSend(socket, {
        type: 'error',
        code: 'TURN_NOT_CONFIGURED',
        message: 'Random video is not available until a private TURN relay is configured.',
      });
      try {
        socket.close(1013, 'TURN relay is not configured');
      } catch {
        // The socket may already be closed.
      }
      return;
    }

    if (action === 'block' && socketData.status !== 'matched') {
      safeSend(socket, {
        type: 'error',
        message: 'You can block someone while connected to them.',
      });
      return;
    }

    const now = Date.now();
    const recentActions = socketData.queueActions.filter(
      (time) => now - time < VIDEO_QUEUE_WINDOW_MS,
    );

    if (
      recentActions.length >= MAX_VIDEO_QUEUE_ACTIONS_PER_WINDOW ||
      (socketData.status === 'waiting' &&
        now - socketData.lastQueueActionAt < VIDEO_QUEUE_COOLDOWN_MS)
    ) {
      socketData.queueActions = recentActions;
      this.saveVideoSocketData(socket, socketData);
      safeSend(socket, {
        type: 'error',
        code: 'QUEUE_RATE_LIMITED',
        message: 'Please wait before searching again.',
      });
      return;
    }

    recentActions.push(now);
    socketData.queueActions = recentActions;
    socketData.lastQueueActionAt = now;

    if (socketData.status === 'matched') {
      this.releasePeer(socket, socketData, true);
    }

    if (action === 'block') {
      socketData.status = 'idle';
      socketData.peerId = '';
      this.saveVideoSocketData(socket, socketData);
      safeSend(socket, { type: 'blocked' });
      return;
    }

    socketData.status = 'waiting';
    socketData.peerId = '';
    this.saveVideoSocketData(socket, socketData);
    safeSend(socket, { type: 'queued', message: 'Finding a stranger...' });
    this.matchWaitingSockets();
  }

  matchWaitingSockets() {
    const waiting = this.state
      .getWebSockets()
      .map((socket) => ({ socket, data: readVideoSocketData(socket) }))
      .filter(({ data }) => data.status === 'waiting' && data.iceConfig);

    for (let index = waiting.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [waiting[index], waiting[randomIndex]] = [waiting[randomIndex], waiting[index]];
    }

    while (waiting.length > 1) {
      let pair = null;
      for (let firstIndex = 0; firstIndex < waiting.length && !pair; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < waiting.length; secondIndex += 1) {
          const first = waiting[firstIndex];
          const second = waiting[secondIndex];
          if (
            first.data.sessionId !== second.data.sessionId &&
            !first.data.blockedPeerIds.includes(second.data.sessionId) &&
            !second.data.blockedPeerIds.includes(first.data.sessionId)
          ) {
            pair = { firstIndex, secondIndex };
            break;
          }
        }
      }

      if (!pair) break;
      const [second] = waiting.splice(pair.secondIndex, 1);
      const [first] = waiting.splice(pair.firstIndex, 1);

      const firstData = { ...first.data, status: 'matched', peerId: second.data.sessionId };
      const secondData = { ...second.data, status: 'matched', peerId: first.data.sessionId };
      const firstInitiates = Math.random() < 0.5;
      firstData.initiator = firstInitiates;
      secondData.initiator = !firstInitiates;
      this.saveVideoSocketData(first.socket, firstData);
      this.saveVideoSocketData(second.socket, secondData);

      const firstSent = safeSend(first.socket, {
        type: 'matched',
        initiator: firstData.initiator,
        iceServers: firstData.iceConfig?.iceServers || [],
        iceTransportPolicy: firstData.iceConfig?.iceTransportPolicy || 'relay',
      });
      const secondSent = safeSend(second.socket, {
        type: 'matched',
        initiator: secondData.initiator,
        iceServers: secondData.iceConfig?.iceServers || [],
        iceTransportPolicy: secondData.iceConfig?.iceTransportPolicy || 'relay',
      });

      if (!firstSent) this.closeVideoSocket(first.socket, 'Unable to start the call');
      if (!secondSent) this.closeVideoSocket(second.socket, 'Unable to start the call');
      if (!firstSent || !secondSent) {
        if (firstSent) this.releasePeer(first.socket, firstData, true);
        if (secondSent) this.releasePeer(second.socket, secondData, true);
      }
    }
  }

  forwardSignal(socket, socketData, rawSignal) {
    const now = Date.now();
    const recentSignals = socketData.signalTimes.filter(
      (time) => now - time < VIDEO_SIGNAL_WINDOW_MS,
    );
    if (recentSignals.length >= MAX_VIDEO_SIGNALS_PER_WINDOW) {
      this.closeVideoSocket(socket, 'Too many signaling messages');
      return;
    }

    const signal = validateVideoSignal(rawSignal);
    if (!signal || socketData.status !== 'matched' || !socketData.peerId) {
      this.rejectVideoMessage(socket, socketData, 'Invalid or unauthorized signaling message.');
      return;
    }

    if (
      (signal.type === 'offer' && !socketData.initiator) ||
      (signal.type === 'answer' && socketData.initiator)
    ) {
      this.rejectVideoMessage(socket, socketData, 'Unexpected offer or answer for this call.');
      return;
    }

    const peer = this.findSocket(socketData.peerId);
    if (!peer) {
      this.releasePeer(socket, socketData, true);
      return;
    }

    recentSignals.push(now);
    socketData.signalTimes = recentSignals;
    this.saveVideoSocketData(socket, socketData);
    if (!safeSend(peer.socket, { type: 'signal', signal })) {
      this.closeVideoSocket(peer.socket, 'Unable to deliver signaling data');
      this.releasePeer(socket, socketData, true);
    }
  }

  reportPeer(socket, socketData, reason) {
    if (
      socketData.status !== 'matched' ||
      !socketData.peerId ||
      typeof reason !== 'string' ||
      !VIDEO_REPORT_REASONS.has(reason)
    ) {
      this.rejectVideoMessage(socket, socketData, 'Choose a valid reason while on a call.');
      return;
    }

    if (!this.findSocket(socketData.peerId)) {
      safeSend(socket, { type: 'error', message: 'The other person has disconnected.' });
      return;
    }

    const now = Date.now();
    const recentReports = socketData.reportTimes.filter(
      (time) => now - time < VIDEO_REPORT_WINDOW_MS,
    );
    if (recentReports.length >= MAX_VIDEO_REPORTS_PER_WINDOW) {
      socketData.reportTimes = recentReports;
      this.saveVideoSocketData(socket, socketData);
      safeSend(socket, {
        type: 'error',
        code: 'REPORT_RATE_LIMITED',
        message: 'Too many reports. Please try again later.',
      });
      return;
    }

    recentReports.push(now);
    socketData.reportTimes = recentReports;
    this.saveVideoSocketData(socket, socketData);
    console.log(
      JSON.stringify({
        event: 'video_report',
        reportId: crypto.randomUUID(),
        targetSessionId: socketData.peerId,
        reason,
        time: now,
      }),
    );
    safeSend(socket, {
      type: 'report_result',
      message: 'Report received. Our moderation team has recorded this incident.',
    });
  }

  releasePeer(socket, socketData, notifyPeer) {
    if (!socketData.peerId) return;

    const peer = this.findSocket(socketData.peerId);
    const previousPeerId = socketData.peerId;
    socketData.peerId = '';
    socketData.initiator = false;
    if (previousPeerId) {
      socketData.blockedPeerIds = addVideoBlockedPeer(socketData.blockedPeerIds, previousPeerId);
    }

    if (!peer) return;
    const peerData = peer.data;
    peerData.peerId = '';
    peerData.initiator = false;
    if (socketData.sessionId) {
      peerData.blockedPeerIds = addVideoBlockedPeer(peerData.blockedPeerIds, socketData.sessionId);
    }
    if (peerData.status === 'matched') peerData.status = 'idle';
    this.saveVideoSocketData(peer.socket, peerData);
    if (notifyPeer) safeSend(peer.socket, { type: 'peer_disconnected' });
  }

  findSocket(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId) return null;
    for (const socket of this.state.getWebSockets()) {
      const data = readVideoSocketData(socket);
      if (data.sessionId === sessionId) return { socket, data };
    }
    return null;
  }

  rejectVideoMessage(socket, socketData, message) {
    socketData.invalidMessages += 1;
    this.saveVideoSocketData(socket, socketData);
    safeSend(socket, { type: 'error', message });
    if (socketData.invalidMessages >= MAX_INVALID_MESSAGES) {
      this.closeVideoSocket(socket, 'Too many invalid messages');
    }
  }

  closeVideoSocket(socket, reason) {
    try {
      socket.close(1008, reason.slice(0, 120));
    } catch {
      // The socket may already be closed.
    }
  }

  saveVideoSocketData(socket, socketData) {
    try {
      socket.serializeAttachment(socketData);
    } catch {
      this.closeVideoSocket(socket, 'Unable to store session state');
    }
  }

  webSocketClose(socket) {
    const socketData = readVideoSocketData(socket);
    if (socketData.ip && this.socketsByIp) {
      const cur = this.socketsByIp.get(socketData.ip) || 1;
      if (cur <= 1) this.socketsByIp.delete(socketData.ip);
      else this.socketsByIp.set(socketData.ip, cur - 1);
    }
    this.releasePeer(socket, socketData, true);
  }

  webSocketError(socket) {
    const socketData = readVideoSocketData(socket);
    if (socketData.ip && this.socketsByIp) {
      const cur = this.socketsByIp.get(socketData.ip) || 1;
      if (cur <= 1) this.socketsByIp.delete(socketData.ip);
      else this.socketsByIp.set(socketData.ip, cur - 1);
    }
    this.releasePeer(socket, socketData, true);
  }
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;

  let normalizedOrigin;
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.origin !== origin) return false;
    normalizedOrigin = parsedOrigin.origin;
  } catch {
    return false;
  }

  const allowedOrigins = (env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const requestUrl = new URL(request.url);
  if (['localhost', '127.0.0.1'].includes(requestUrl.hostname)) {
    allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  }

  return allowedOrigins.includes(normalizedOrigin);
}

function createSocketData() {
  return {
    name: 'Guest',
    country: '',
    joined: false,
    ip: '127.0.0.1',
    lastMessageText: '',
    messageTimes: [],
    lastMessageAt: 0,
    reportTimes: [],
    invalidMessages: 0,
  };
}

function readSocketData(socket) {
  try {
    const data = socket.deserializeAttachment();
    if (
      data &&
      typeof data === 'object' &&
      typeof data.name === 'string' &&
      typeof data.country === 'string'
    ) {
      return {
        ...createSocketData(),
        ...data,
        ip: typeof data.ip === 'string' ? data.ip : '127.0.0.1',
        lastMessageText: typeof data.lastMessageText === 'string' ? data.lastMessageText : '',
        messageTimes: Array.isArray(data.messageTimes)
          ? data.messageTimes.filter(Number.isFinite)
          : [],
        reportTimes: Array.isArray(data.reportTimes)
          ? data.reportTimes.filter(Number.isFinite)
          : [],
        lastMessageAt: Number.isFinite(data.lastMessageAt) ? data.lastMessageAt : 0,
        invalidMessages: Number.isInteger(data.invalidMessages) ? data.invalidMessages : 0,
      };
    }
  } catch {
    // Replace invalid or missing attachment data with safe defaults.
  }

  return createSocketData();
}

function decodePayload(raw, maxBytes = MAX_PAYLOAD_BYTES) {
  if (typeof raw === 'string') {
    if (raw.length > maxBytes) return null;
    const encoded = new TextEncoder().encode(raw);
    if (encoded.byteLength > maxBytes) return null;
    return raw;
  }

  if (raw instanceof ArrayBuffer) {
    if (raw.byteLength > maxBytes) return null;
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(raw);
    } catch {
      return null;
    }
  }

  return null;
}

function createVideoSocketData(iceConfig, sessionId = crypto.randomUUID()) {
  return {
    sessionId,
    status: 'idle',
    peerId: '',
    initiator: false,
    iceConfig,
    queueActions: [],
    lastQueueActionAt: 0,
    signalTimes: [],
    reportTimes: [],
    controlTimes: [],
    blockedPeerIds: [],
    invalidMessages: 0,
  };
}

function readVideoSocketData(socket) {
  try {
    const data = socket.deserializeAttachment();
    if (data && typeof data === 'object') {
      return {
        ...createVideoSocketData(null),
        ...data,
        sessionId:
          typeof data.sessionId === 'string' && data.sessionId.length <= 64
            ? data.sessionId
            : crypto.randomUUID(),
        status: ['idle', 'waiting', 'matched'].includes(data.status) ? data.status : 'idle',
        peerId: typeof data.peerId === 'string' && data.peerId.length <= 64 ? data.peerId : '',
        initiator: data.initiator === true,
        iceConfig: isValidIceConfig(data.iceConfig) ? data.iceConfig : null,
        queueActions: Array.isArray(data.queueActions)
          ? data.queueActions.filter(Number.isFinite).slice(-MAX_VIDEO_QUEUE_ACTIONS_PER_WINDOW)
          : [],
        lastQueueActionAt: Number.isFinite(data.lastQueueActionAt) ? data.lastQueueActionAt : 0,
        signalTimes: Array.isArray(data.signalTimes)
          ? data.signalTimes.filter(Number.isFinite).slice(-MAX_VIDEO_SIGNALS_PER_WINDOW)
          : [],
        reportTimes: Array.isArray(data.reportTimes)
          ? data.reportTimes.filter(Number.isFinite).slice(-MAX_VIDEO_REPORTS_PER_WINDOW)
          : [],
        controlTimes: Array.isArray(data.controlTimes)
          ? data.controlTimes.filter(Number.isFinite).slice(-MAX_VIDEO_CONTROLS_PER_WINDOW)
          : [],
        blockedPeerIds: Array.isArray(data.blockedPeerIds)
          ? data.blockedPeerIds
              .filter((value) => typeof value === 'string' && value.length <= 64)
              .slice(-MAX_VIDEO_BLOCKED_PEERS)
          : [],
        invalidMessages: Number.isInteger(data.invalidMessages) ? data.invalidMessages : 0,
      };
    }
  } catch {
    // Replace missing or invalid attachment data with safe defaults.
  }

  return createVideoSocketData(null);
}

function isValidIceConfig(value) {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.iceServers) &&
    ['all', 'relay'].includes(value.iceTransportPolicy)
  );
}

let cachedMeteredServers = null;
let cachedMeteredExpiresAt = 0;

async function fetchMeteredIceServers(domain, apiKey) {
  const now = Date.now();
  if (cachedMeteredServers && now < cachedMeteredExpiresAt) {
    return cachedMeteredServers;
  }

  const cleanDomain = domain
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  const cleanApiKey = apiKey.trim();
  const url = `https://${cleanDomain}/api/v1/turn/credentials?apiKey=${encodeURIComponent(cleanApiKey)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.error(JSON.stringify({ event: 'metered_api_error', status: response.status }));
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.error(JSON.stringify({ event: 'metered_api_empty_response' }));
      return null;
    }

    const sanitizedServers = [];
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      const urls = Array.isArray(item.urls)
        ? item.urls
        : typeof item.urls === 'string'
          ? [item.urls]
          : [];
      const validUrls = urls.filter(
        (u) => typeof u === 'string' && /^(?:stun|turns?):/i.test(u.trim()),
      );
      if (validUrls.length === 0) continue;

      const serverObj = { urls: validUrls.length === 1 ? validUrls[0] : validUrls };
      if (typeof item.username === 'string') serverObj.username = item.username;
      if (typeof item.credential === 'string') serverObj.credential = item.credential;
      sanitizedServers.push(serverObj);
    }

    if (sanitizedServers.length === 0) return null;

    cachedMeteredServers = sanitizedServers;
    cachedMeteredExpiresAt = now + 600_000; // Cache for 10 minutes
    return sanitizedServers;
  } catch (err) {
    console.error(JSON.stringify({ event: 'metered_fetch_failed', message: err?.message }));
    return null;
  }
}

async function createVideoIceConfig(env, hostname, sessionId) {
  // Provider 1: Metered REST API (Metered TURN)
  if (typeof env.METERED_API_KEY === 'string' && env.METERED_API_KEY.trim().length > 0) {
    const domain =
      typeof env.METERED_DOMAIN === 'string' && env.METERED_DOMAIN.trim().length > 0
        ? env.METERED_DOMAIN.trim()
        : 'globaltalk.metered.live';
    const meteredServers = await fetchMeteredIceServers(domain, env.METERED_API_KEY);
    if (meteredServers && meteredServers.length > 0) {
      return {
        iceServers: meteredServers,
        iceTransportPolicy: 'relay',
      };
    }
  }

  // Provider 2: RFC 5766 HMAC-SHA1 Ephemeral Credentials (Coturn / Twilio)
  const turnUrls = parseTurnUrls(env.VIDEO_TURN_URLS);
  const sharedSecret =
    typeof env.TURN_SHARED_SECRET === 'string' ? env.TURN_SHARED_SECRET.trim() : '';

  if (turnUrls.length > 0 && sharedSecret.length >= 16) {
    const expiresAt = Math.floor(Date.now() / 1000) + 3_600;
    const username = `${expiresAt}:${sessionId}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(sharedSecret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(username));
    const credential = btoa(
      Array.from(new Uint8Array(signature), (byte) => String.fromCharCode(byte)).join(''),
    );

    return {
      iceServers: [{ urls: turnUrls, username, credential }],
      iceTransportPolicy: 'relay',
    };
  }

  // Provider 3: Static Authenticated Credentials
  const staticUser = typeof env.TURN_USERNAME === 'string' ? env.TURN_USERNAME.trim() : '';
  const staticPass = typeof env.TURN_CREDENTIAL === 'string' ? env.TURN_CREDENTIAL.trim() : '';
  if (turnUrls.length > 0 && staticUser.length > 0 && staticPass.length > 0) {
    return {
      iceServers: [{ urls: turnUrls, username: staticUser, credential: staticPass }],
      iceTransportPolicy: 'relay',
    };
  }

  // Development: Localhost fallback
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  if (isLocalHost) {
    return {
      iceServers: [],
      iceTransportPolicy: 'all',
    };
  }

  return null;
}

function parseTurnUrls(value) {
  if (typeof value !== 'string') return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => {
      const match = item.match(
        /^(?:stun|turns?):(?:\/\/)?(?:\[[\da-f:]+\]|[a-z\d.-]+)(?::\d{1,5})?(?:\?transport=(?:udp|tcp))?$/i,
      );
      return Boolean(match);
    })
    .slice(0, 12);
}

function validateVideoSignal(rawSignal) {
  if (!rawSignal || typeof rawSignal !== 'object' || Array.isArray(rawSignal)) return null;

  if (rawSignal.type === 'offer' || rawSignal.type === 'answer') {
    if (
      !rawSignal.sdp ||
      typeof rawSignal.sdp !== 'string' ||
      rawSignal.sdp.length > MAX_VIDEO_SDP_LENGTH ||
      !rawSignal.sdp.startsWith('v=0')
    ) {
      return null;
    }
    return { type: rawSignal.type, sdp: rawSignal.sdp };
  }

  if (rawSignal.type === 'candidate') {
    if (rawSignal.candidate === null) return { type: 'candidate', candidate: null };
    if (
      !rawSignal.candidate ||
      typeof rawSignal.candidate !== 'object' ||
      Array.isArray(rawSignal.candidate) ||
      typeof rawSignal.candidate.candidate !== 'string' ||
      rawSignal.candidate.candidate.length > 4096
    ) {
      return null;
    }

    const { sdpMid, sdpMLineIndex, usernameFragment } = rawSignal.candidate;
    if (
      (sdpMid !== null &&
        sdpMid !== undefined &&
        (typeof sdpMid !== 'string' || sdpMid.length > 128)) ||
      (sdpMLineIndex !== null &&
        sdpMLineIndex !== undefined &&
        (!Number.isInteger(sdpMLineIndex) || sdpMLineIndex < 0 || sdpMLineIndex > 32)) ||
      (usernameFragment !== null &&
        usernameFragment !== undefined &&
        (typeof usernameFragment !== 'string' || usernameFragment.length > 256))
    ) {
      return null;
    }

    return {
      type: 'candidate',
      candidate: {
        candidate: rawSignal.candidate.candidate,
        sdpMid: sdpMid ?? null,
        sdpMLineIndex: sdpMLineIndex ?? null,
        ...(usernameFragment ? { usernameFragment } : {}),
      },
    };
  }

  return null;
}

function addVideoBlockedPeer(blockedPeerIds, peerId) {
  if (typeof peerId !== 'string' || !peerId) return blockedPeerIds;
  return [...new Set([...blockedPeerIds, peerId])].slice(-MAX_VIDEO_BLOCKED_PEERS);
}

function cleanText(value, maxLength = MAX_MESSAGE_LENGTH) {
  if (typeof value !== 'string') return '';

  return value
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '')
    .trim()
    .slice(0, maxLength);
}

function safeSend(socket, data) {
  try {
    socket.send(JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function secureResponse(body, status, headers = {}, isHttps = false) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('X-Frame-Options', 'DENY');
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  responseHeaders.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), display-capture=(), payment=(), usb=()',
  );
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
  responseHeaders.set('Cross-Origin-Resource-Policy', 'same-origin');
  responseHeaders.set('X-Permitted-Cross-Domain-Policies', 'none');
  responseHeaders.set('X-XSS-Protection', '0');
  if (isHttps) {
    responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return new Response(body, { status, headers: responseHeaders });
}
