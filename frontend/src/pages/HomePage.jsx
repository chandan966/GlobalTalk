import { useState } from 'react';
import { Link } from 'react-router-dom';
import { rooms } from '../data/rooms';
import usePageMetadata from '../utils/usePageMetadata';
import './HomePage.css';

export default function HomePage() {
  usePageMetadata(
    'Meet the world',
    'Join live public chat rooms for conversations about interests, communities, and life around the world.',
    '/',
  );
  const [search, setSearch] = useState('');
  const filteredRooms = rooms.filter((room) =>
    `${room.name} ${room.description}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <section className="hero">
        <div className="eyebrow">
          <span /> ONE WORLD. MANY CONVERSATIONS.
        </div>
        <h1>
          Meet the world.
          <br />
          <em>One conversation</em> at a time.
        </h1>
        <p>
          Drop into a room, say hello, and connect with people around the globe.
          <br />
          No account. No pressure. Just conversation.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#rooms">
            Explore chat rooms <span>↗</span>
          </a>
          <span className="privacy-note">✦ Anonymous by default</span>
        </div>
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-globe">🌐</div>
      </section>

      <main className="content" id="rooms">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FIND YOUR PEOPLE</div>
            <h2>Choose your conversation</h2>
            <p>Every room is open. Join one that feels right.</p>
          </div>
          <label className="search">
            <span>⌕</span>
            <input
              aria-label="Search chat rooms"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search rooms..."
            />
          </label>
        </div>

        <div className="room-grid">
          {filteredRooms.map((room) => (
            <Link to={`/room/${room.id}`} className="room-card" key={room.id}>
              <div className="card-top">
                <span className="room-icon">{room.icon}</span>
                <span className="card-arrow">↗</span>
              </div>
              <span className="room-tag">{room.tag}</span>
              <h3>{room.name}</h3>
              <p>{room.description}</p>
              <div className="card-bottom">
                <span>Join room</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        {!filteredRooms.length && <p className="empty">No rooms match that search.</p>}

        <section className="info-strip" id="about">
          <div>
            <span className="strip-icon">◎</span>
            <div>
              <b>Come as you are</b>
              <p>Use a temporary nickname. Share only what you choose.</p>
            </div>
          </div>
          <div>
            <span className="strip-icon">⚡</span>
            <div>
              <b>Live conversations</b>
              <p>Messages appear instantly while people are in the room.</p>
            </div>
          </div>
          <div>
            <span className="strip-icon">🌐</span>
            <div>
              <b>Across borders</b>
              <p>Connect with people and perspectives worldwide.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
