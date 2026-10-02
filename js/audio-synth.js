/**
 * Web Audio API Synthesizer for AETHER 3D
 * Generates futuristic spatial audio feedback without external MP3 files.
 */
class SpatialAudioSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.scrollToneTimer = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15; // Safe comfortable volume
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  toggle() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playChime([523.25, 659.25, 783.99]); // C5, E5, G5 major triad swell
    }
    return !this.isMuted;
  }

  playChime(freqs = [440, 554.37, 659.25]) {
    if (this.isMuted || !this.ctx) return;

    freqs.forEach((freq, index) => {
      setTimeout(() => {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.65);
      }, index * 80);
    });
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playScrollTone(progress) {
    if (this.isMuted || !this.ctx) return;
    if (this.scrollToneTimer) return; // Throttled

    this.scrollToneTimer = setTimeout(() => {
      this.scrollToneTimer = null;
    }, 150);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Frequency mapped smoothly to scroll position (200Hz to 600Hz)
    const freq = 200 + progress * 400;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }
}

window.spatialAudio = new SpatialAudioSynth();
