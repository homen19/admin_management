// Generates synthetic phone ringing sounds using the Web Audio API
// This avoids needing external MP3/WAV assets.

let audioCtx = null;

export const playRingtone = (type) => {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return { stop: () => {} };
      audioCtx = new AudioContext();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Use two oscillators to create a classic dual-tone phone ring (e.g. 440Hz + 480Hz)
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    
    if (type === 'incoming') {
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;
    } else { // calling
      osc1.frequency.value = 425;
      osc2.frequency.value = 425;
    }

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = 0; // start silent

    let isPlaying = true;
    let timeoutIds = [];

    const scheduleRing = () => {
      if (!isPlaying) return;
      const now = audioCtx.currentTime;
      
      if (type === 'incoming') {
        // UK style double ring: Ring, pause, Ring, long pause
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gainNode.gain.setValueAtTime(0.5, now + 0.4);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.45);
        
        gainNode.gain.setValueAtTime(0, now + 0.6);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.65);
        gainNode.gain.setValueAtTime(0.5, now + 1.0);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.05);
        
        timeoutIds.push(setTimeout(scheduleRing, 3000));
      } else {
        // US style single long ring: Ring, long pause
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now + 1.5);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.6);
        
        timeoutIds.push(setTimeout(scheduleRing, 4000));
      }
    };

    osc1.start();
    osc2.start();
    scheduleRing();

    return {
      stop: () => {
        isPlaying = false;
        timeoutIds.forEach(clearTimeout);
        try {
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
          setTimeout(() => {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            gainNode.disconnect();
          }, 200);
        } catch (e) {}
      }
    };
  } catch (err) {
    console.error("Failed to play ringtone:", err);
    return { stop: () => {} };
  }
};
