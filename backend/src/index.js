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

    if (url.pathname === '/ws' || url.pathname.startsWith('/ws/')) {
      if (request.method !== 'GET') {
        return secureResponse('Method not allowed', 405, { Allow: 'GET' }, url.protocol === 'https:');
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
    this.state.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('ping', 'pong'),
    );
  }

  async fetch(request) {
    if (
      request.method !== 'GET' ||
      request.headers.get('Upgrade')?.toLowerCase() !== 'websocket' ||
      !isAllowedOrigin(request, this.env)
    ) {
      return secureResponse('Invalid WebSocket request', 400, {}, new URL(request.url).protocol === 'https:');
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

    this.state.acceptWebSocket(server);
    server.serializeAttachment(createSocketData());
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
        this.rejectInvalidMessage(socket, socketData, 'Profile is already set for this connection.');
        return;
      }

      socketData.name = cleanText(data.name, 24) || 'Guest';
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
    const recentMessages = socketData.messageTimes.filter(
      (time) => now - time < MESSAGE_WINDOW_MS,
    );

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

    const roomMessages = this.roomMessageTimes.filter(
      (time) => now - time < MESSAGE_WINDOW_MS,
    );

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
    this.roomMessageTimes = roomMessages;
    socket.serializeAttachment(socketData);

    this.broadcast({
      type: 'message',
      message: {
        id: crypto.randomUUID(),
        name: socketData.name,
        country: socketData.country,
        text,
        time: now,
      },
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
    const recentReports = socketData.reportTimes.filter(
      (time) => now - time < REPORT_WINDOW_MS,
    );

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

    console.log(
      JSON.stringify({
        event: 'message_report',
        messageId,
        room: this.state.id.toString(),
        reporter: socketData.name,
        time: now,
      }),
    );
    safeSend(socket, {
      type: 'report_result',
      messageId,
      message: 'Report received. Reports are not actively reviewed in this starter version.',
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

  webSocketClose() {
    this.presence();
  }

  webSocketError() {
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

function decodePayload(raw) {
  if (typeof raw === 'string') {
    if (raw.length > MAX_PAYLOAD_BYTES) return null;
    const encoded = new TextEncoder().encode(raw);
    if (encoded.byteLength > MAX_PAYLOAD_BYTES) return null;
    return raw;
  }

  if (raw instanceof ArrayBuffer) {
    if (raw.byteLength > MAX_PAYLOAD_BYTES) return null;
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(raw);
    } catch {
      return null;
    }
  }

  return null;
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
  responseHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isHttps) {
    responseHeaders.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  return new Response(body, { status, headers: responseHeaders });
}
