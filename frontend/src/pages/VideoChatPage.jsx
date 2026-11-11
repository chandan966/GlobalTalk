import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { videoWebSocketUrl } from '../config/chat';
import usePageMetadata from '../utils/usePageMetadata';
import './VideoChatPage.css';

const reportReasons = [
  'harassment',
  'inappropriate behavior',
  'spam',
  'scam',
  'hate/abuse',
  'illegal activity',
  'other',
];

function permissionError(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
    return 'Camera or microphone permission was denied. Allow access in your browser settings and try again.';
  }
  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
    return 'A camera and microphone could not be found on this device.';
  }
  if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
    return 'Your camera or microphone is busy in another app. Close that app and try again.';
  }
  if (error?.name === 'SecurityError') {
    return 'Camera and microphone access requires HTTPS or localhost.';
  }
  return 'Camera and microphone could not be started. Check your device and browser permissions.';
}

export default function VideoChatPage() {
  usePageMetadata(
    'Random Video Chat',
    'Connect one-to-one with a random GlobalTalk stranger by live video.',
    '/random-video',
    'noindex, nofollow',
  );

  const [phase, setPhase] = useState('intro');
  const [status, setStatus] = useState('Ready when you are');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [microphoneOn, setMicrophoneOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const disconnectedTimerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const intentionalCloseRef = useRef(false);

  const clearPeerConnection = () => {
    window.clearTimeout(disconnectedTimerRef.current);
    disconnectedTimerRef.current = null;
    const peer = peerRef.current;
    peerRef.current = null;
    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.oniceconnectionstatechange = null;
      try {
        peer.close();
      } catch {
        // The connection may already be closed.
      }
    }

    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current = null;
    pendingCandidatesRef.current = [];
    setRemoteStream(null);
  };

  const stopLocalMedia = () => {
    const stream = localStreamRef.current;
    localStreamRef.current = null;
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
    }
    setLocalStream(null);
    setMicrophoneOn(false);
    setCameraOn(false);
  };

  const closeSocket = (sendLeave = false) => {
    const socket = socketRef.current;
    socketRef.current = null;
    intentionalCloseRef.current = true;
    window.clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
    if (socket?.readyState === 1 && sendLeave) {
      try {
        socket.send(JSON.stringify({ type: 'leave' }));
      } catch {
        // The peer will be released when the connection closes.
      }
    }
    if (socket && socket.readyState < 2) socket.close(1000, 'Call ended');
  };

  const sendSignal = (data) => {
    const socket = socketRef.current;
    if (socket?.readyState !== 1) return false;
    try {
      socket.send(JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  };

  const finishAfterTransportError = () => {
    setError('');
    setStatus('Ready when you are');
    setPhase('intro');
    clearPeerConnection();
    stopLocalMedia();
    closeSocket(false);
    setShowUnavailableModal(true);
  };

  const finishPeerCall = (message) => {
    sendSignal({ type: 'leave' });
    clearPeerConnection();
    stopLocalMedia();
    setStatus('Stranger disconnected');
    setNotice(message);
    setPhase('disconnected');
  };

  const createPeerConnection = async (message) => {
    if (peerRef.current || !localStreamRef.current) return;

    if (typeof window.RTCPeerConnection !== 'function') {
      finishAfterTransportError();
      return;
    }

    try {
      const icePolicy = message.iceTransportPolicy === 'relay' ? 'relay' : 'all';
      const peer = new RTCPeerConnection({
        iceServers: Array.isArray(message.iceServers) ? message.iceServers : [],
        iceTransportPolicy: icePolicy,
      });
      peerRef.current = peer;
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });

      peer.ontrack = (event) => {
        let stream = event.streams?.[0];
        if (!stream && typeof MediaStream === 'function') {
          stream = remoteStreamRef.current || new MediaStream();
          if (!stream.getTracks().some((track) => track.id === event.track.id)) {
            stream.addTrack(event.track);
          }
        }
        if (stream) {
          remoteStreamRef.current = stream;
          setRemoteStream(stream);
        }
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate) return;
        const candidate =
          typeof event.candidate.toJSON === 'function'
            ? event.candidate.toJSON()
            : {
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                usernameFragment: event.candidate.usernameFragment,
              };
        if (!sendSignal({ type: 'signal', signal: { type: 'candidate', candidate } })) {
          setError('Network signaling was interrupted. Try Next to reconnect.');
        }
      };

      peer.onconnectionstatechange = () => {
        if (peerRef.current !== peer) return;
        if (peer.connectionState === 'connected') {
          window.clearTimeout(disconnectedTimerRef.current);
          disconnectedTimerRef.current = null;
          setStatus('Connected');
          setError('');
          setPhase('connected');
        } else if (peer.connectionState === 'failed') {
          finishPeerCall('The video connection failed. Find another stranger to try again.');
        }
      };

      peer.oniceconnectionstatechange = () => {
        if (peerRef.current !== peer) return;
        if (peer.iceConnectionState === 'connected' || peer.iceConnectionState === 'completed') {
          window.clearTimeout(disconnectedTimerRef.current);
          disconnectedTimerRef.current = null;
        } else if (peer.iceConnectionState === 'disconnected') {
          setStatus('Reconnecting…');
          window.clearTimeout(disconnectedTimerRef.current);
          disconnectedTimerRef.current = window.setTimeout(() => {
            if (peerRef.current === peer && peer.iceConnectionState === 'disconnected') {
              finishPeerCall(
                'The stranger’s connection was lost. Find another person to continue.',
              );
            }
          }, 10_000);
        } else if (peer.iceConnectionState === 'failed') {
          finishPeerCall(
            'The network could not connect this call. Find another stranger to try again.',
          );
        }
      };

      if (message.initiator === true) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const sent = sendSignal({
          type: 'signal',
          signal: { type: 'offer', sdp: peer.localDescription.sdp },
        });
        if (!sent) throw new Error('The call offer could not be sent.');
      }
    } catch {
      finishPeerCall('The video connection could not start. Find another stranger to try again.');
    }
  };

  const handleSignal = async (signal) => {
    const peer = peerRef.current;
    if (!peer || !signal || typeof signal !== 'object') return;

    try {
      if (signal.type === 'offer' || signal.type === 'answer') {
        await peer.setRemoteDescription({ type: signal.type, sdp: signal.sdp });
        const candidates = pendingCandidatesRef.current.splice(0);
        for (const candidate of candidates) await peer.addIceCandidate(candidate);

        if (signal.type === 'offer') {
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          if (
            !sendSignal({
              type: 'signal',
              signal: { type: 'answer', sdp: peer.localDescription.sdp },
            })
          ) {
            throw new Error('The call answer could not be sent.');
          }
        }
      } else if (signal.type === 'candidate') {
        if (!peer.remoteDescription) {
          pendingCandidatesRef.current.push(signal.candidate);
        } else {
          await peer.addIceCandidate(signal.candidate);
        }
      }
    } catch {
      finishPeerCall('The call signaling failed. Find another stranger to try again.');
    }
  };

  const handleSocketMessage = async (socket, event) => {
    if (socketRef.current !== socket || typeof event.data !== 'string') return;
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    if (!message || typeof message !== 'object' || Array.isArray(message)) return;

    if (message.type === 'queued') {
      setPhase('searching');
      setStatus('Finding a stranger…');
      setError('');
      setNotice('');
    } else if (message.type === 'matched') {
      setPhase('connecting');
      setStatus('Stranger found · Connecting…');
      setError('');
      await createPeerConnection(message);
    } else if (message.type === 'signal') {
      await handleSignal(message.signal);
    } else if (message.type === 'peer_disconnected') {
      finishPeerCall('The stranger disconnected. You can find someone else.');
    } else if (message.type === 'blocked') {
      clearPeerConnection();
      stopLocalMedia();
      setPhase('disconnected');
      setStatus('User blocked');
      setNotice(
        'The person was blocked for this video session. Find another stranger when you are ready.',
      );
      setError('');
    } else if (message.type === 'report_result' && typeof message.message === 'string') {
      setNotice(message.message.slice(0, 200));
      setReportOpen(false);
    } else if (message.type === 'error') {
      finishAfterTransportError();
    }
  };

  const requestMedia = async () => {
    if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      throw new Error('Camera and microphone access requires HTTPS.');
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof window.RTCPeerConnection !== 'function') {
      throw new Error('This browser does not support camera, microphone, or WebRTC calls.');
    }

    const constraints = {
      audio: { echoCancellation: true, noiseSuppression: true },
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    };
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if (error?.name !== 'OverconstrainedError' && error?.name !== 'ConstraintNotSatisfiedError') {
        throw error;
      }
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    }

    localStreamRef.current = stream;
    setLocalStream(stream);
    setMicrophoneOn(stream.getAudioTracks().some((track) => track.enabled));
    setCameraOn(stream.getVideoTracks().some((track) => track.enabled));
    stream.getTracks().forEach((track) => {
      track.onended = () => {
        if (localStreamRef.current !== stream) return;
        closeSocket(true);
        clearPeerConnection();
        stopLocalMedia();
        setPhase('error');
        setStatus('Camera or microphone disconnected');
        setError('A camera or microphone was disconnected. Reconnect your device and try again.');
      };
    });
    return stream;
  };

  const openSignalingSocket = (queueType = 'queue') => {
    if (!videoWebSocketUrl) {
      finishAfterTransportError();
      return;
    }

    if (socketRef.current) {
      try {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close(1000, 'Reopening socket');
      } catch {
        // Discard lingering socket safely
      }
      socketRef.current = null;
    }

    intentionalCloseRef.current = false;
    let socket;
    try {
      socket = new WebSocket(videoWebSocketUrl);
    } catch {
      finishAfterTransportError();
      return;
    }
    socketRef.current = socket;
    socket.onopen = () => {
      if (socketRef.current !== socket) return;
      setPhase('searching');
      setStatus('Finding a stranger…');
      heartbeatRef.current = window.setInterval(() => {
        if (socket.readyState === 1) {
          try {
            socket.send(JSON.stringify({ type: 'ping' }));
          } catch {
            finishAfterTransportError();
          }
        }
      }, 25_000);
      try {
        socket.send(JSON.stringify({ type: queueType }));
      } catch {
        finishAfterTransportError();
      }
    };
    socket.onmessage = (event) => {
      void handleSocketMessage(socket, event);
    };
    socket.onerror = () => {
      if (socketRef.current === socket && !intentionalCloseRef.current) {
        finishAfterTransportError();
      }
    };
    socket.onclose = () => {
      if (socketRef.current !== socket || intentionalCloseRef.current) return;
      socketRef.current = null;
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
      finishAfterTransportError();
    };
  };

  const begin = async (queueType = 'queue') => {
    setError('');
    setNotice('');
    setPhase('starting');
    setStatus('Starting camera and microphone…');
    try {
      await requestMedia();
      setPhase('searching');
      setStatus('Connecting to secure matchmaking…');
      if (socketRef.current?.readyState === 1) {
        if (!sendSignal({ type: queueType })) {
          throw new Error('The matchmaking request could not be sent. Please try again.');
        }
      } else {
        openSignalingSocket(queueType);
      }
    } catch (caught) {
      closeSocket(true);
      stopLocalMedia();
      setPhase('error');
      setStatus('Unable to start video');
      setError(
        caught instanceof Error && caught.name === 'Error'
          ? caught.message
          : permissionError(caught),
      );
    }
  };

  const findNext = async () => {
    clearPeerConnection();
    if (socketRef.current?.readyState === 1) sendSignal({ type: 'leave' });
    stopLocalMedia();
    await begin('next');
  };

  const endCall = () => {
    closeSocket(true);
    clearPeerConnection();
    stopLocalMedia();
    setError('');
    setNotice('Call ended. Your camera and microphone are off.');
    setStatus('Ready when you are');
    setPhase('intro');
  };

  const blockPeer = () => {
    if (!sendSignal({ type: 'block' })) {
      setError('The block request could not be sent. Please try again.');
      return;
    }
    clearPeerConnection();
    stopLocalMedia();
    setPhase('disconnected');
    setStatus('Blocking user…');
  };

  const reportPeer = () => {
    if (!sendSignal({ type: 'report', reason: reportReason })) {
      setError('The report could not be sent. Check the connection and try again.');
    }
  };

  const toggleMicrophone = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    if (!tracks.length) return;
    const nextEnabled = !tracks.some((track) => track.enabled);
    tracks.forEach((track) => {
      track.enabled = nextEnabled;
    });
    setMicrophoneOn(nextEnabled);
  };

  const toggleCamera = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    if (!tracks.length) return;
    const nextEnabled = !tracks.some((track) => track.enabled);
    tracks.forEach((track) => {
      track.enabled = nextEnabled;
    });
    setCameraOn(nextEnabled);
  };

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      if (remoteStream) {
        void remoteVideoRef.current.play().catch(() => {
          setError('Tap the stranger’s video to allow audio playback in this browser.');
        });
      }
    }
  }, [remoteStream]);

  useEffect(
    () => () => {
      window.clearTimeout(disconnectedTimerRef.current);
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
      const socket = socketRef.current;
      socketRef.current = null;
      intentionalCloseRef.current = true;
      if (socket?.readyState === 1) {
        try {
          socket.send(JSON.stringify({ type: 'leave' }));
        } catch {
          // Closing the socket still releases the server-side session.
        }
      }
      socket?.close(1000, 'Video page closed');
      const peer = peerRef.current;
      peerRef.current = null;
      peer?.close();
      localStreamRef.current?.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const showCall = !['intro', 'error'].includes(phase);

  return (
    <main className="video-page">
      <Link to="/" className="back-link">
        ← Back to rooms
      </Link>

      <div className="video-heading">
        <div className="eyebrow">LIVE · ONE TO ONE</div>
        <h1>Random Video Chat</h1>
        <p>Meet one stranger at a time. Your camera and microphone start only when you choose.</p>
      </div>

      {error && (
        <div className="video-notice error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="video-notice" role="status">
          {notice}
        </div>
      )}

      {phase === 'intro' && (
        <section className="video-safety-card">
          <div className="video-safety-icon" aria-hidden="true">
            ✦
          </div>
          <h2>Before you connect</h2>
          <p>You’ll meet a random stranger. GlobalTalk does not verify age or identity.</p>
          <ul>
            <li>
              You must be 18 years or older, or have parental/guardian guidance, to participate.
            </li>
            <li>
              Nudity, sexual solicitation, harassment, and illegal acts are strictly prohibited.
            </li>
            <li>Do not share passwords, OTPs, bank details, addresses, or private documents.</li>
            <li>
              Leave or block anyone who makes you uncomfortable. You can report an abusive peer.
            </li>
            <li>Another person may record their screen with separate software.</li>
            <li>Your camera and microphone will be requested only after you press Start.</li>
          </ul>
          <button className="button primary video-start" onClick={() => void begin()}>
            Start Random Video <span>↗</span>
          </button>
          <p className="video-privacy-note">
            Calls are not recorded by GlobalTalk. Always be respectful and follow our Community
            Guidelines.
          </p>
        </section>
      )}

      {showCall && (
        <section className="video-call-card" aria-label="Random video call">
          <div className="video-call-status" role="status" aria-live="polite">
            <span className={`status-dot ${phase === 'connected' ? 'connected' : ''}`} />
            <strong>{status}</strong>
          </div>

          <div className="video-stage">
            <div className="remote-video-wrap">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                aria-label="Stranger video"
                className={remoteStream ? 'video-visible' : ''}
                onClick={() => {
                  if (remoteVideoRef.current) {
                    void remoteVideoRef.current.play().catch(() => {});
                  }
                }}
              />
              {!remoteStream && (
                <div className="video-placeholder">
                  <span aria-hidden="true">🌐</span>
                  <b>{phase === 'searching' ? 'Finding a stranger…' : status}</b>
                  <small>Your call is not recorded by GlobalTalk</small>
                </div>
              )}
              <div className="video-label">Stranger</div>
            </div>

            <div className="local-video-wrap">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                aria-label="Your camera preview"
                className={localStream && cameraOn ? 'video-visible' : ''}
              />
              {(!localStream || !cameraOn) && (
                <div className="local-video-placeholder">
                  {cameraOn ? 'Camera starting…' : 'Camera off'}
                </div>
              )}
              <div className="video-label">You</div>
            </div>
          </div>

          <div className="video-controls" aria-label="Call controls">
            <button className="video-control" onClick={toggleMicrophone} disabled={!localStream}>
              <span aria-hidden="true">{microphoneOn ? '🎤' : '🔇'}</span>
              {microphoneOn ? 'Mute' : 'Unmute'}
            </button>
            <button className="video-control" onClick={toggleCamera} disabled={!localStream}>
              <span aria-hidden="true">{cameraOn ? '📹' : '🚫'}</span>
              {cameraOn ? 'Camera off' : 'Camera on'}
            </button>
            <button
              className="video-control next-control"
              onClick={() => void findNext()}
              disabled={
                phase === 'starting' ||
                (['searching', 'connecting'].includes(phase) && socketRef.current?.readyState !== 1)
              }
            >
              <span aria-hidden="true">⏭️</span> Next
            </button>
            <button className="video-control end-control" onClick={endCall}>
              <span aria-hidden="true">📞</span> End call
            </button>
            <button
              className="video-control"
              onClick={() => setReportOpen((open) => !open)}
              disabled={phase !== 'connected'}
            >
              <span aria-hidden="true">🚩</span> Report
            </button>
            <button
              className="video-control block-control"
              onClick={blockPeer}
              disabled={phase !== 'connected'}
            >
              <span aria-hidden="true">🚫</span> Block
            </button>
          </div>

          {reportOpen && (
            <form
              className="video-report-form"
              onSubmit={(event) => {
                event.preventDefault();
                reportPeer();
              }}
            >
              <label>
                Report reason
                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                >
                  {reportReasons.map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </select>
              </label>
              <button className="video-control" type="submit">
                Send report
              </button>
            </form>
          )}

          <p className="video-call-footnote">
            Video is peer media; the Worker handles matchmaking and signaling only. Reports are
            logged but are not actively reviewed.
          </p>
        </section>
      )}

      {phase === 'error' && (
        <button className="button primary video-start video-retry" onClick={() => void begin()}>
          Try again <span>↻</span>
        </button>
      )}

      {showUnavailableModal && (
        <div
          className="video-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUnavailableModal(false);
            }
          }}
        >
          <div className="video-modal-card">
            <div className="video-modal-icon" aria-hidden="true">
              📹
            </div>
            <h2 id="video-modal-title" className="video-modal-title">
              Video Chat Unavailable
            </h2>
            <p className="video-modal-text">
              Video chat is temporarily unavailable. Please try again later.
            </p>
            <div className="video-modal-actions">
              <button
                type="button"
                className="button primary video-modal-button"
                onClick={() => setShowUnavailableModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
