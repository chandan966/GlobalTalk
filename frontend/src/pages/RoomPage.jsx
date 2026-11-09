import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { chatWebSocketUrl } from '../config/chat';
import { rooms } from '../data/rooms';
import randomName from '../utils/randomName';
import usePageMetadata from '../utils/usePageMetadata';
import './RoomPage.css';

const countries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Brazil',
  'Japan',
  'Other',
];

function readSessionValue(key) {
  try {
    return sessionStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function writeSessionValue(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Chat remains usable when browser storage is unavailable.
  }
}

function isChatMessage(message) {
  return (
    message &&
    typeof message === 'object' &&
    !Array.isArray(message) &&
    typeof message.id === 'string' &&
    typeof message.name === 'string' &&
    typeof message.text === 'string' &&
    Number.isFinite(message.time)
  );
}

export default function RoomPage() {
  const { roomId } = useParams();
  const room = rooms.find((item) => item.id === roomId);
  usePageMetadata(
    room ? room.name : 'Room not found',
    room
      ? `${room.description}. Join the live public ${room.name} room on GlobalTalk.`
      : 'The requested GlobalTalk chat room could not be found.',
    room ? `/room/${room.id}` : '/',
    'noindex, nofollow',
  );
  const [name, setName] = useState(() => readSessionValue('gt-name') || randomName());
  const [country, setCountry] = useState(() => readSessionValue('gt-country'));
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('connecting');
  const [online, setOnline] = useState(0);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState([]);
  const socket = useRef(null);
  const bottom = useRef(null);

  useEffect(() => {
    setMessages([]);
    setOnline(0);
    setError('');
    setBlocked([]);
    setDraft('');
  }, [roomId]);

  useEffect(() => {
    if (!room) return;

    if (!chatWebSocketUrl) {
      setStatus('error');
      setError(
        'Chat is not configured. Set VITE_CHAT_WS_URL to your Cloudflare Worker WebSocket URL.',
      );
      return;
    }

    let active = true;
    let reconnectAttempt = 0;
    let reconnectTimer;
    let stableConnectionTimer;
    let activeSocket;

    const scheduleReconnect = () => {
      if (!active) return;
      const baseDelay = Math.min(1000 * 2 ** reconnectAttempt, 30000);
      const delay = Math.round(baseDelay * (0.75 + Math.random() * 0.5));
      reconnectAttempt = Math.min(reconnectAttempt + 1, 6);
      reconnectTimer = window.setTimeout(connect, delay);
    };

    const connect = () => {
      if (!active) return;

      let ws;
      try {
        ws = new WebSocket(`${chatWebSocketUrl}/${room.id}`);
      } catch {
        setStatus('reconnecting');
        setError('Chat connection could not start. Retrying shortly.');
        scheduleReconnect();
        return;
      }

      activeSocket = ws;
      socket.current = ws;

      ws.onopen = () => {
        if (!active) return;
        window.clearTimeout(stableConnectionTimer);
        stableConnectionTimer = window.setTimeout(() => {
          reconnectAttempt = 0;
        }, 30000);
        setStatus('connected');
        setError('');
        try {
          ws.send(JSON.stringify({ type: 'join', name, country }));
        } catch {
          ws.close();
        }
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (!data || typeof data !== 'object' || Array.isArray(data)) return;

          if (data.type === 'history' && Array.isArray(data.messages)) {
            const history = data.messages.filter(isChatMessage).slice(-150);
            if (history.length > 0) setMessages(history);
          } else if (data.type === 'message' && isChatMessage(data.message)) {
            setMessages((previous) => [...previous, data.message].slice(-150));
          } else if (
            data.type === 'presence' &&
            Number.isInteger(data.count) &&
            data.count >= 0
          ) {
            setOnline(data.count);
          } else if (data.type === 'error' && typeof data.message === 'string') {
            setError(data.message.slice(0, 240));
          } else if (data.type === 'report_result' && typeof data.message === 'string') {
            setError(data.message.slice(0, 240));
          }
        } catch {
          // Ignore malformed or unexpected WebSocket data.
        }
      };

      ws.onerror = () => {
        if (active) {
          setStatus('error');
          setError('Chat connection problem. Trying to reconnect.');
        }
      };

      ws.onclose = () => {
        if (!active) return;
        window.clearTimeout(stableConnectionTimer);
        if (socket.current === ws) socket.current = null;
        setOnline(0);
        setStatus('reconnecting');
        setError('Chat disconnected. Reconnecting…');
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      active = false;
      window.clearTimeout(reconnectTimer);
      window.clearTimeout(stableConnectionTimer);
      if (socket.current === activeSocket) socket.current = null;
      activeSocket?.close(1000, 'Room closed');
    };
  }, [roomId, name, country]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const visibleMessages = useMemo(
    () => messages.filter((message) => !blocked.includes(message.id)),
    [messages, blocked],
  );

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || socket.current?.readyState !== WebSocket.OPEN) return;

    if (text.length > 500) {
      setError('Messages must be 500 characters or fewer.');
      return;
    }

    try {
      socket.current.send(JSON.stringify({ type: 'message', text }));
      setDraft('');
      setError('');
    } catch {
      setError('Your message could not be sent. Reconnecting…');
    }
  };

  const reportMessage = (message) => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
      setError('The report could not be sent because chat is disconnected.');
      return;
    }

    try {
      socket.current.send(
        JSON.stringify({ type: 'report', messageId: message.id, reason: 'User report' }),
      );
      setBlocked((previous) => [...previous, message.id]);
      setError('Message hidden for you. Report sent to the service.');
    } catch {
      setError('The report could not be sent. Please try again.');
    }
  };

  const updateNickname = () => {
    const nextName = randomName();
    setName(nextName);
    writeSessionValue('gt-name', nextName);
    setError('Nickname updated.');
  };

  const updateCountry = (event) => {
    const nextCountry = event.target.value;
    setCountry(nextCountry);
    writeSessionValue('gt-country', nextCountry);
  };

  if (!room) {
    return (
      <main className="not-found">
        <h2>Room not found</h2>
        <Link to="/">Back to rooms</Link>
      </main>
    );
  }

  return (
    <main className="chat-page">
      <Link to="/" className="back-link">
        ← All rooms
      </Link>

      <div className="chat-room-title">
        <span>{room.icon}</span>
        <div>
          <h1>{room.name}</h1>
          <p>{room.description}</p>
        </div>
      </div>

      <div className="chat-layout">
        <aside className="room-sidebar">
          <div className="sidebar-label">YOUR ROOM</div>
          <div className="sidebar-room">
            {room.icon} {room.name}
          </div>
          <div className="sidebar-stat" role="status" aria-live="polite">
            <i
              className={`status-dot ${status === 'connected' ? '' : 'offline'}`}
              aria-hidden="true"
            />
            {status}
          </div>
          <div className="sidebar-stat" aria-label={`${online} people online`}>
            ◉ {online} online
          </div>

          <hr />
          <div className="sidebar-label">YOUR IDENTITY</div>
          <b>{name}</b>
          <small className="identity-country">{country || 'Country not selected'}</small>
          <button className="text-button" onClick={updateNickname}>
            ↻ New nickname
          </button>

          <label className="country-label">
            Country (optional)
            <select value={country} onChange={updateCountry}>
              <option value="">Prefer not to say</option>
              {countries.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <hr />
          <p className="sidebar-tip">
            Never share passwords, financial details, or your home address.
          </p>
        </aside>

        <section className="chat-panel">
          <div className="chat-panel-top">
            <div>
              <b>Room conversation</b>
              <small>Live messages · not saved</small>
            </div>
            <span className="secure-label">✦ Anonymous chat</span>
          </div>

          <div
            className="messages"
            role="log"
            aria-label={`${room.name} room messages`}
            aria-live="polite"
            aria-relevant="additions"
          >
            {!visibleMessages.length && (
              <div className="welcome-chat">
                <div>👋</div>
                <h3>You're in {room.name}</h3>
                <p>Say hello and start a conversation.</p>
              </div>
            )}
            {visibleMessages.map((message, index) => (
              <article
                className={`message ${message.name === name ? 'mine' : ''}`}
                key={message.id || index}
              >
                <div className="avatar">{(message.name || '?')[0].toUpperCase()}</div>
                <div className="message-body">
                  <div className="message-meta">
                    <b>{message.name || 'Guest'}</b>
                    {message.country && <span>{message.country}</span>}
                    <time>
                      {new Date(message.time || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <button
                      title="Hide and report"
                      aria-label={`Hide and report message from ${message.name || 'Guest'}`}
                      onClick={() => reportMessage(message)}
                    >
                      ⚑
                    </button>
                  </div>
                  <p>{message.text}</p>
                </div>
              </article>
            ))}
            <div ref={bottom} />
          </div>

          <div className="composer-wrap">
            {error && (
              <div className="inline-error" role="status" aria-live="polite">
                {error}
                <button aria-label="Dismiss chat notice" onClick={() => setError('')}>
                  ×
                </button>
              </div>
            )}
            <div className="composer">
              <input
                aria-label="Write a chat message"
                value={draft}
                maxLength={500}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={status === 'connected' ? 'Write a message...' : 'Connecting...'}
                disabled={status !== 'connected'}
              />
              <span className="char-count">{draft.length}/500</span>
              <button
                className="send-button"
                onClick={sendMessage}
                disabled={!draft.trim() || status !== 'connected'}
              >
                Send ↑
              </button>
            </div>
            <div className="composer-note">
              Press Enter to send · Keep personal information private
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
