// Fully procedural sound design via WebAudio — no audio asset files to host,
// version, or have go missing. Every effect is synthesized on demand.
class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;

  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  private tone(freq: number, duration: number, type: OscillatorType, gain: number, startAt = 0) {
    if (this.muted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + startAt;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  drop() {
    this.tone(220, 0.12, "sine", 0.18);
  }

  merge(tier: number) {
    const base = 260 + tier * 40;
    this.tone(base, 0.16, "triangle", 0.22);
    this.tone(base * 1.5, 0.14, "sine", 0.12, 0.03);
  }

  singularity() {
    [0, 0.08, 0.16, 0.26].forEach((delay, i) => {
      this.tone(180 - i * 20, 0.5, "sawtooth", 0.15, delay);
    });
  }

  gameOver() {
    [520, 440, 360, 260].forEach((f, i) => this.tone(f, 0.35, "triangle", 0.16, i * 0.12));
  }

  click() {
    this.tone(660, 0.05, "square", 0.08);
  }
}

export const sound = new SoundManager();
