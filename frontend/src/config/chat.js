const configuredUrl = import.meta.env.VITE_CHAT_WS_URL?.trim().replace(/\/+$/, '');

export const chatWebSocketUrl =
  configuredUrl ||
  (import.meta.env.DEV
    ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`
    : '');

export const videoWebSocketUrl = (() => {
  if (!chatWebSocketUrl) return '';

  try {
    const url = new URL(chatWebSocketUrl);
    const path = url.pathname.replace(/\/+$/, '');
    url.pathname = path.endsWith('/ws') ? `${path.slice(0, -3)}/video` : `${path}/video`;
    return url.href.replace(/\/$/, '');
  } catch {
    return '';
  }
})();
