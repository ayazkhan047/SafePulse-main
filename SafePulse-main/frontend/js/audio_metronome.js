/**
 * SafePulse Audio Metronome (AHA Standard 110 BPM for CPR Compressions)
 * Synthesizes crisp audible rhythmic clicks via Web Audio API
 */

const AudioMetronome = {
  audioCtx: null,
  bpm: 110,
  intervalId: null,
  isRunning: false,
  visualTarget: null,

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  },

  playTick() {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // 880 Hz High Pitch Click
    osc.frequency.exponentialRampToValueAtTime(220, this.audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(this.audioCtx.currentTime);
    osc.stop(this.audioCtx.currentTime + 0.05);

    // Visual pulse effect
    if (this.visualTarget) {
      this.visualTarget.classList.add('pulse-beat');
      setTimeout(() => {
        if (this.visualTarget) this.visualTarget.classList.remove('pulse-beat');
      }, 100);
    }
  },

  start(visualElement) {
    this.initAudio();
    this.visualTarget = visualElement;
    if (this.isRunning) return;

    this.isRunning = true;
    const intervalMs = (60 / this.bpm) * 1000; // ~545ms for 110 BPM
    this.playTick();
    this.intervalId = setInterval(() => {
      this.playTick();
    }, intervalMs);

    if (this.visualTarget) {
      this.visualTarget.classList.add('pulse-beat');
    }
  },

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.visualTarget) {
      this.visualTarget.classList.remove('pulse-beat');
    }
  },

  toggle(visualElement) {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start(visualElement);
      return true;
    }
  }
};

window.AudioMetronome = AudioMetronome;
