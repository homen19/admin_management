import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone, PhoneOff, Minimize2, Maximize2, Monitor } from 'lucide-react';
import { sendWebRTCSignal, subscribeToWebRTC } from '../../services/chatService';
import { playRingtone } from '../../utils/ringtone';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function CallModal({
  stompClient,
  channelId,
  currentUser,
  targetUser,
  isVideo,
  isCaller,
  incomingOffer,
  onClose
}) {
  const [callStatus, setCallStatus] = useState(isCaller ? 'Calling...' : 'Connecting...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideo);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const subscriptionRef = useRef(null);
  const screenTrackRef = useRef(null);
  const ringtoneRef = useRef(null);

  useEffect(() => {
    if (callStatus === 'Calling...') {
      if (!ringtoneRef.current) {
        ringtoneRef.current = playRingtone('calling');
      }
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
    }
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
    };
  }, [callStatus]);

  useEffect(() => {
    const initCall = async () => {
      try {
        // 1. Get Local Media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideo,
          audio: true
        });
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Setup RTCPeerConnection
        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, stream);
        });

        // Always create a video transceiver so we can do screen share replaceTrack later
        if (!isVideo) {
          peerConnectionRef.current.addTransceiver('video', { direction: 'sendrecv' });
        }

        // Handle remote stream
        peerConnectionRef.current.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus('Connected');
          }
        };

        // Handle ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            sendWebRTCSignal(stompClient, channelId, 'ice-candidate', event.candidate);
          }
        };

        // Subscribe to WebRTC signals
        subscriptionRef.current = subscribeToWebRTC(stompClient, channelId, async (signal) => {
          if (signal.senderUsername === currentUser.username) return; // ignore self

          try {
            if (signal.type === 'answer' && isCaller) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.data));
            } else if (signal.type === 'ice-candidate') {
              if (peerConnectionRef.current.remoteDescription) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.data));
              }
            } else if (signal.type === 'end-call') {
              handleEndCall(false);
            } else if (signal.type === 'reject-call') {
              setCallStatus('Call Rejected');
              setTimeout(() => handleEndCall(false), 2000);
            } else if (signal.type === 'screen-share-started') {
              setIsRemoteScreenSharing(true);
            } else if (signal.type === 'screen-share-stopped') {
              setIsRemoteScreenSharing(false);
            }
          } catch (err) {
            console.error('Error handling signal:', err);
          }
        });

        // 3. Initiate or Answer Call
        if (isCaller) {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          sendWebRTCSignal(stompClient, channelId, 'offer', { offer, isVideo });
        } else if (incomingOffer) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          sendWebRTCSignal(stompClient, channelId, 'answer', answer);
        }

      } catch (err) {
        console.error("Call setup failed:", err);
        setCallStatus('Failed to access camera/mic');
        setTimeout(() => handleEndCall(false), 3000);
      }
    };

    initCall();

    return () => {
      cleanupCall();
    };
  }, []);

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
  };

  const handleEndCall = (emitSignal = true) => {
    if (emitSignal) {
      sendWebRTCSignal(stompClient, channelId, 'end-call', {});
    }
    cleanupCall();
    onClose();
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        stopScreenShare();
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        screenTrack.onended = () => {
          stopScreenShare();
        };
        
        screenTrackRef.current = screenTrack;
        
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          let videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (!videoSender) {
            // Handle transceiver without an active track
            videoSender = senders.find(s => !s.track || s.track.kind === 'video');
          }
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
            sendWebRTCSignal(stompClient, channelId, 'screen-share-started', {});
          }
        }
        
        if (localVideoRef.current) {
          const newLocalStream = new MediaStream([screenTrack]);
          if (localStreamRef.current) {
             const audioTrack = localStreamRef.current.getAudioTracks()[0];
             if (audioTrack) newLocalStream.addTrack(audioTrack);
          }
          localVideoRef.current.srcObject = newLocalStream;
        }
        
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Failed to start screen share:', err);
    }
  };

  const stopScreenShare = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      let videoSender = senders.find(s => s.track === screenTrackRef.current || (s.track && s.track.kind === 'video'));
      if (!videoSender) {
        videoSender = senders.find(s => !s.track || s.track.kind === 'video');
      }
      
      const originalVideoTrack = localStreamRef.current ? localStreamRef.current.getVideoTracks()[0] : null;
      
      if (videoSender) {
        videoSender.replaceTrack(originalVideoTrack || null);
        sendWebRTCSignal(stompClient, channelId, 'screen-share-stopped', {});
      }
      
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
    
    setIsScreenSharing(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (isScreenSharing) return;
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return ReactDOM.createPortal(
    <div className={`call-modal-overlay ${isMinimized ? 'minimized' : ''}`}>
      <div className={`call-modal-container ${isVideo ? 'video-mode' : 'audio-mode'} ${isMinimized ? 'minimized' : ''}`}>
        <div className="call-header">
          <div className="call-title">
            {isVideo ? <VideoIcon size={20} /> : <Phone size={20} />}
            <h3>{isVideo ? 'Video Call' : 'Voice Call'}</h3>
          </div>
          <div className="call-header-right">
            <span className={`call-status-badge ${callStatus === 'Connected' ? 'connected' : ''}`}>
              {callStatus}
            </span>
            <button className="call-action-btn" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Expand" : "Minimize"}>
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
          </div>
        </div>

        <div className="call-main-area">
          <div className="remote-video-container">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`remote-video ${((!isVideo && !isRemoteScreenSharing) || callStatus !== 'Connected') ? 'hidden' : ''}`}
            />
            {((!isVideo && !isRemoteScreenSharing) || callStatus !== 'Connected') && (
              <div className="audio-avatar large">
                {targetUser?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="video-label">{targetUser?.username || 'Colleague'}</div>
          </div>

          <div className="local-video-pip">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`local-video ${(isVideoOff && !isScreenSharing) ? 'hidden' : ''}`}
            />
            {(isVideoOff && !isScreenSharing) && (
              <div className="audio-avatar small">
                {currentUser?.username?.charAt(0).toUpperCase() || 'Me'}
              </div>
            )}
            <div className="video-label-mini">You</div>
          </div>
        </div>

        <div className="call-controls">
          <button className={`call-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          {isVideo && (
            <button className={`call-btn ${isVideoOff ? 'muted' : ''}`} onClick={toggleVideo} title={isVideoOff ? "Turn on camera" : "Turn off camera"} disabled={isScreenSharing}>
              {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
            </button>
          )}
          {callStatus === 'Connected' && (
            <button className={`call-btn ${isScreenSharing ? 'active' : ''}`} onClick={toggleScreenShare} title={isScreenSharing ? "Stop sharing" : "Share screen"}>
              <Monitor size={24} color={isScreenSharing ? '#60a5fa' : 'currentColor'} />
            </button>
          )}
          <button className="call-btn end-call" onClick={() => handleEndCall(true)} title="End Call">
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
