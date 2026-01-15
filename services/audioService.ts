class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private schedulerTimer: number | null = null;

  // Pentatonic Scale frequencies (C Major Pentatonic: C, D, E, G, A)
  private scale = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
  ];

  public async init() {
    if (this.audioContext) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
  }

  public async start() {
    if (!this.audioContext) await this.init();
    if (this.isPlaying || !this.audioContext || !this.masterGain) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isPlaying = true;
    
    // Reset volume to default on start
    this.setVolume(0.5, 0.5);

    this.playWhiteNoise();
    this.scheduleNotes();
  }

  public stop() {
    this.isPlaying = false;
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch (e) {
        // ignore if already stopped
      }
      this.noiseNode = null;
    }
    if (this.schedulerTimer) {
      window.clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  public setVolume(volume: number, rampTime: number = 2) {
    if (!this.masterGain || !this.audioContext) return;
    const currentTime = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(currentTime);
    this.masterGain.gain.linearRampToValueAtTime(volume, currentTime + rampTime);
  }

  private playWhiteNoise() {
    if (!this.audioContext || !this.masterGain) return;

    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // Filter the noise to make it "Pink/Brown" like (softer)
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Low frequency for ambient rumble

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.value = 0.05; // Very subtle

    this.noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  private playNote(time: number) {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const noteGain = this.audioContext.createGain();
    
    // Simple sine wave for pure tone, or triangle for more character
    osc.type = 'sine';
    
    // Pick random note
    const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
    // Randomly drop an octave for depth
    osc.frequency.value = Math.random() > 0.7 ? freq / 2 : freq;

    // Envelope
    const attack = 2.0;
    const release = 4.0;
    
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.1, time + attack);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + attack + release);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + attack + release);
  }

  private scheduleNotes() {
    if (!this.isPlaying || !this.audioContext) return;

    const lookahead = 25.0; // ms
    const scheduleAheadTime = 0.1; // seconds

    while (this.nextNoteTime < this.audioContext.currentTime + scheduleAheadTime) {
      this.playNote(this.nextNoteTime);
      // Random interval between 2s and 6s
      this.nextNoteTime += 2 + Math.random() * 4;
    }

    this.schedulerTimer = window.setTimeout(() => this.scheduleNotes(), lookahead);
  }
}

export const audioService = new AudioService();
