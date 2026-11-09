const configuredUrl = import.meta.env.VITE_CHAT_WS_URL?.trim().replace(/\/+$/, '');

export const chatWebSocketUrl =
  configuredUrl ||
  (import.meta.env.DEV
    ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`
    : '');
