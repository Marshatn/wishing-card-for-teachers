/**
 * Web Audio API Synthesizer for 3D Teacher Farewell Keepsake Card
 * Generates beautiful, emotional music box / celesta farewell melodies,
 * including the timeless farewell classic "Auld Lang Syne", "To Sir With Love",
 * celebratory bells, pop effects, and ribbon untie sounds.
 */

export interface NoteItem {
  note: number;
  duration: number;
  pauseAfter?: number;
}

class FarewellAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlayingTune: boolean = false;
  private currentSongId: string = 'auld-lang-syne';
  private tuneTimeoutIds: number[] = [];

  constructor() {
    // Initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopFarewellSong();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Play gentle ribbon untie / whoosh sound
  public playWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(550, t);
      filter.frequency.exponentialRampToValueAtTime(2200, t + 0.35);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(650, t + 0.35);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.42);
    } catch {
      // Audio fallback silent
    }
  }

  // Play crisp box pop sound when lid lifts & confetti bursts
  public playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);

      // Add high sparkle chime
      this.playChime(1200, 0.05, 0.2);
      this.playChime(1568, 0.1, 0.28);
    } catch {
      // Audio fallback
    }
  }

  // Play metallic celebration chime / bell tone
  public playChime(freq = 880, delay = 0, duration = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Celesta / Glockenspiel bell tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch {
      // Audio fallback
    }
  }

  // Play celebratory burst fanfare
  public playFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // F major warm celebration arpeggio: F4, A4, C5, F5
    const notes = [349.23, 440.0, 523.25, 698.46, 880.0];
    notes.forEach((freq, idx) => {
      this.playChime(freq, idx * 0.09, 0.65);
    });
  }

  /**
   * Play the Chosen Farewell Song
   * Default: Auld Lang Syne (The universal farewell song)
   */
  public playFarewellSong(songId: string = 'auld-lang-syne', onComplete?: () => void) {
    if (this.isMuted) return;
    this.stopFarewellSong();
    this.initContext();
    if (!this.ctx) return;

    this.isPlayingTune = true;
    this.currentSongId = songId;

    let melody: NoteItem[] = [];

    if (songId === 'to-sir-with-love') {
      // "To Sir With Love" (Chorus melody: "Those school days have begun to fade...")
      melody = [
        { note: 392.0, duration: 0.45 }, // G4
        { note: 440.0, duration: 0.45 }, // A4
        { note: 493.88, duration: 0.7 }, // B4
        { note: 440.0, duration: 0.45 }, // A4
        { note: 392.0, duration: 0.7 }, // G4
        { note: 329.63, duration: 0.8 }, // E4

        { note: 392.0, duration: 0.45 }, // G4
        { note: 440.0, duration: 0.45 }, // A4
        { note: 493.88, duration: 0.6 }, // B4
        { note: 523.25, duration: 0.5 }, // C5
        { note: 493.88, duration: 0.5 }, // B4
        { note: 440.0, duration: 1.1 }, // A4

        { note: 440.0, duration: 0.45 }, // A4
        { note: 493.88, duration: 0.45 }, // B4
        { note: 523.25, duration: 0.7 }, // C5
        { note: 493.88, duration: 0.45 }, // B4
        { note: 440.0, duration: 0.7 }, // A4
        { note: 392.0, duration: 0.8 }, // G4

        // "A friend who taught me right from wrong... To Sir With Love"
        { note: 523.25, duration: 0.55 }, // C5
        { note: 493.88, duration: 0.55 }, // B4
        { note: 440.0, duration: 0.6 }, // A4
        { note: 392.0, duration: 0.6 }, // G4
        { note: 587.33, duration: 0.8 }, // D5
        { note: 523.25, duration: 1.4 }, // C5
      ];
    } else if (songId === 'pomp-circumstance') {
      // "Pomp and Circumstance / Land of Hope and Glory" (Graduation / Farewell March)
      melody = [
        { note: 523.25, duration: 0.6 }, // C5
        { note: 587.33, duration: 0.35 }, // D5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 523.25, duration: 0.6 }, // C5
        { note: 698.46, duration: 0.7 }, // F5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 587.33, duration: 1.1 }, // D5

        { note: 587.33, duration: 0.6 }, // D5
        { note: 659.25, duration: 0.35 }, // E5
        { note: 698.46, duration: 0.6 }, // F5
        { note: 587.33, duration: 0.6 }, // D5
        { note: 783.99, duration: 0.7 }, // G5
        { note: 698.46, duration: 0.6 }, // F5
        { note: 659.25, duration: 1.1 }, // E5

        { note: 523.25, duration: 0.6 }, // C5
        { note: 587.33, duration: 0.35 }, // D5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 698.46, duration: 0.6 }, // F5
        { note: 783.99, duration: 0.9 }, // G5
        { note: 880.0, duration: 0.9 }, // A5
        { note: 783.99, duration: 0.6 }, // G5
        { note: 587.33, duration: 0.6 }, // D5
        { note: 523.25, duration: 1.6 }, // C5
      ];
    } else {
      // --- "Auld Lang Syne" (The Best Farewell Song of All Time) ---
      // Phrase 1: "Should auld acquaintance be forgot, and never brought to mind?"
      // Phrase 2: "Should auld acquaintance be forgot, and days of auld lang syne?"
      // Phrase 3 (Chorus): "For auld lang syne, my dear, for auld lang syne,"
      // Phrase 4: "We'll take a cup o' kindness yet, for auld lang syne."
      melody = [
        // Pickup: "Should" (G4)
        { note: 392.0, duration: 0.4 }, // G4
        // "auld ac-" (C5, C5)
        { note: 523.25, duration: 0.6 }, // C5
        { note: 523.25, duration: 0.3 }, // C5
        // "quain-tance" (C5, E5)
        { note: 523.25, duration: 0.6 }, // C5
        { note: 659.25, duration: 0.6 }, // E5
        // "be for-" (D5, C5)
        { note: 587.33, duration: 0.6 }, // D5
        { note: 523.25, duration: 0.3 }, // C5
        // "got, and" (D5, E5)
        { note: 587.33, duration: 0.6 }, // D5
        { note: 659.25, duration: 0.6 }, // E5
        // "nev-er" (C5, C5)
        { note: 523.25, duration: 0.6 }, // C5
        { note: 523.25, duration: 0.3 }, // C5
        // "brought to" (E5, G5)
        { note: 659.25, duration: 0.6 }, // E5
        { note: 783.99, duration: 0.7 }, // G5
        // "mind?" (A5)
        { note: 880.0, duration: 1.3 }, // A5

        // "Should auld acquaintance be forgot,"
        { note: 880.0, duration: 0.4 }, // A5
        { note: 783.99, duration: 0.6 }, // G5
        { note: 659.25, duration: 0.3 }, // E5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 523.25, duration: 0.6 }, // C5
        // "and days of auld lang syne"
        { note: 587.33, duration: 0.6 }, // D5
        { note: 523.25, duration: 0.3 }, // C5
        { note: 587.33, duration: 0.6 }, // D5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 523.25, duration: 0.6 }, // C5
        { note: 440.0, duration: 0.35 }, // A4
        { note: 440.0, duration: 0.55 }, // A4
        { note: 392.0, duration: 0.55 }, // G4
        { note: 523.25, duration: 1.5 }, // C5

        // Chorus: "For auld lang syne, my dear"
        { note: 880.0, duration: 0.5 }, // A5
        { note: 783.99, duration: 0.7 }, // G5
        { note: 659.25, duration: 0.35 }, // E5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 783.99, duration: 0.7 }, // G5
        { note: 880.0, duration: 1.3 }, // A5

        // "for auld lang syne"
        { note: 880.0, duration: 0.4 }, // A5
        { note: 783.99, duration: 0.6 }, // G5
        { note: 659.25, duration: 0.3 }, // E5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 523.25, duration: 0.6 }, // C5
        { note: 587.33, duration: 0.6 }, // D5
        { note: 523.25, duration: 0.3 }, // C5
        { note: 587.33, duration: 0.6 }, // D5
        { note: 659.25, duration: 0.7 }, // E5

        // "We'll take a cup o' kindness yet, for auld lang syne!"
        { note: 523.25, duration: 0.6 }, // C5
        { note: 440.0, duration: 0.35 }, // A4
        { note: 440.0, duration: 0.55 }, // A4
        { note: 392.0, duration: 0.55 }, // G4
        { note: 523.25, duration: 1.8 }, // C5
      ];
    }

    let accumulatedTime = 0.08;
    melody.forEach((item, index) => {
      const timer = window.setTimeout(() => {
        if (!this.isPlayingTune || this.isMuted) return;
        this.playMelodyNote(item.note, item.duration * 0.92);
        if (index === melody.length - 1) {
          this.isPlayingTune = false;
          onComplete?.();
        }
      }, accumulatedTime * 1000);
      this.tuneTimeoutIds.push(timer);
      accumulatedTime += item.duration;
    });
  }

  private playMelodyNote(freq: number, duration: number) {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // Celesta / Music Box bells with harmonic resonance
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Fundamental warm sine
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);

      // Sparkling octave bell overtone
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t);

      // Fifth harmonic shimmer
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);

      osc1.stop(t + duration);
      osc2.stop(t + duration);
      osc3.stop(t + duration);
    } catch {
      // Audio safe fallback
    }
  }

  public stopFarewellSong() {
    this.isPlayingTune = false;
    this.tuneTimeoutIds.forEach((id) => clearTimeout(id));
    this.tuneTimeoutIds = [];
  }

  public getIsPlayingTune(): boolean {
    return this.isPlayingTune;
  }

  public getCurrentSongId(): string {
    return this.currentSongId;
  }
}

export const audioEngine = new FarewellAudioEngine();
