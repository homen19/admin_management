import React, { useEffect, useRef, useState } from 'react';
import { sendWebRTCSignal, subscribeToWebRTC } from '../../services/chatService';
import './CallOverlay.css';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function CallOverlay({ 
  stompClient, 
  channelId, 
  currentUsername, 
  remoteUsername, 
  isInitiator, 
  initialOffer,
  onEndCall 
}) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callError, setCallError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingSubRef = useRef(null);
  const screenTrackRef = useRef(null);

  useEffect(() => {
    // 1. Subscribe to WebRTC signals
    signalingSubRef.current = subscribeToWebRTC(stompClient, channelId, handleSignalingData);

    // 2. Initialize Call
    startCall();

    return () => {
      cleanupCall();
    };
    // eslint-disable-next-line
  }, []);

  const handleSignalingData = async (signal) => {
    // Ignore our own signals
    if (signal.senderUsername === currentUsername) return;

    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      if (signal.type === 'offer' && !isInitiator) {
        // Technically handled by initialOffer, but just in case
        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendWebRTCSignal(stompClient, channelId, 'answer', answer);
      } else if (signal.type === 'answer' && isInitiator) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
      } else if (signal.type === 'ice-candidate') {
        if (signal.data) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.data));
        }
      } else if (signal.type === 'end-call') {
        cleanupCall();
        onEndCall();
      }
    } catch (err) {
      console.error('WebRTC Signaling Error:', err);
    }
  };

  const startCall = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera/Microphone access is not supported in this browser or requires HTTPS.');
      }

      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Create Peer Connection
      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks to PC
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendWebRTCSignal(stompClient, channelId, 'ice-candidate', event.candidate);
        }
      };

      // Handle remote tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      };

      if (isInitiator) {
        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendWebRTCSignal(stompClient, channelId, 'offer', offer);
      } else if (initialOffer) {
        // We are receiver, set remote description and send answer
        await pc.setRemoteDescription(new RTCSessionDescription(initialOffer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendWebRTCSignal(stompClient, channelId, 'answer', answer);
      }

    } catch (err) {
      console.error('Failed to start call:', err);
      setCallError(err.message || 'Could not access camera or microphone.');
      // Do not automatically end the call, let the user see the error in the overlay
    }
  };

  const cleanupCall = () => {
    if (signalingSubRef.current) {
      signalingSubRef.current.unsubscribe();
      signalingSubRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const handleEndCall = () => {
    sendWebRTCSignal(stompClient, channelId, 'end-call', null);
    cleanupCall();
    onEndCall();
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
          const sender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }
        
        if (localVideoRef.current) {
          const newLocalStream = new MediaStream([screenTrack]);
          if (localStream) {
             const audioTrack = localStream.getAudioTracks()[0];
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
    
    if (localStream && peerConnectionRef.current) {
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
    
    setIsScreenSharing(false);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (isScreenSharing) return; // Disable toggling video while screen sharing
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="call-overlay">
      <div className="call-header">
        <h3>Call with {remoteUsername}</h3>
      </div>
      
      <div className="video-container">
        {/* Remote Video (Main) */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="remote-video"
          poster="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e293b'/></svg>"
        />
        
        {/* Local Video (PiP) */}
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`local-video ${isVideoOff ? 'hidden' : ''}`}
        />
        
        {callError ? (
          <div className="call-status error-status" style={{ color: '#ef4444' }}>
            {callError}
          </div>
        ) : !remoteStream && (
          <div className="call-status">Connecting to {remoteUsername}...</div>
        )}
      </div>

      <div className="call-controls">
        <button className={`control-btn ${isMuted ? 'danger' : ''}`} onClick={toggleMute} title="Toggle Mute" disabled={!!callError}>
          {isMuted ? '🔇' : '🎤'}
        </button>
        <button className={`control-btn ${isVideoOff ? 'danger' : ''}`} onClick={toggleVideo} title="Toggle Video" disabled={!!callError || isScreenSharing}>
          {isVideoOff ? '📵' : '📹'}
        </button>
        {remoteStream && (
          <button className={`control-btn ${isScreenSharing ? 'active' : ''}`} onClick={toggleScreenShare} title="Toggle Screen Share" disabled={!!callError}>
            {isScreenSharing ? '🖥️❌' : '🖥️'}
          </button>
        )}
        <button className="control-btn end-call" onClick={handleEndCall} title="End Call">
          ❌
        </button>
      </div>
    </div>
  );
}
