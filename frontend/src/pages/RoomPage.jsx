import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { chatWebSocketUrl } from '../config/chat';
import { rooms } from '../data/rooms';
import randomName from '../utils/randomName';
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

export default function RoomPage() {
  const { roomId } = useParams();
  const room = rooms.find((item) => item.id === roomId);
  const [name, setName] = useState(() => sessionStorage.getItem('gt-name') || randomName());
  const [country, setCountry] = useState(() => sessionStorage.getItem('gt-country') || '');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('connecting');
  const [online, setOnline] = useState(0);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState([]);
  const socket = useRef(null);
  const bottom = useRef(null);

  useEffect(() => {
    if (!room) return;

    if (!chatWebSocketUrl) {
      setStatus('error');
      setError(
        'Chat is not configured. Set VITE_CHAT_WS_URL to your Cloudflare Worker WebSocket URL.',
      );
      return;
    }

    const ws = new WebSocket(`${chatWebSocketUrl}/${room.id}`);
    socket.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      ws.send(JSON.stringify({ type: 'join', name, country }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'history') setMessages(data.messages || []);
        if (data.type === 'message')
          setMessages((previous) => [...previous, data.message].slice(-150));
        if (data.type === 'presence') setOnline(data.count);
        if (data.type === 'error') setError(data.message);
      } catch {}
    };

    ws.onerror = () => setStatus('error');
    ws.onclose = () => setStatus('disconnected');

    return () => ws.close();
  }, [roomId]);

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

    socket.current.send(JSON.stringify({ type: 'message', text }));
    setDraft('');
    setError('');
  };

  const reportMessage = (message) => {
    socket.current?.send(
      JSON.stringify({ type: 'report', messageId: message.id, reason: 'User report' }),
    );
    setBlocked((previous) => [...previous, message.id]);
    setError('Message hidden and report submitted.');
  };

  const updateNickname = () => {
    const nextName = randomName();
    setName(nextName);
    sessionStorage.setItem('gt-name', nextName);
    setError('Nickname changed locally. Refresh the room to apply it.');
  };

  const updateCountry = (event) => {
    const nextCountry = event.target.value;
    setCountry(nextCountry);
    sessionStorage.setItem('gt-country', nextCountry);
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
          <div className="sidebar-stat">
            <i className={`status-dot ${status === 'connected' ? '' : 'offline'}`} />
            {status}
          </div>
          <div className="sidebar-stat">◉ {online} online</div>

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

          <div className="messages">
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
                    <button title="Hide and report" onClick={() => reportMessage(message)}>
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
              <div className="inline-error">
                {error}
                <button onClick={() => setError('')}>×</button>
              </div>
            )}
            <div className="composer">
              <input
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
