// ============================================================
// AUDIO ENGINE — 依藥材分類合成冥想音景（Web Audio）
// ============================================================
class MeditationAudioEngine {
  constructor() { this.ctx = null; this.nodes = []; this.isPlaying = false; }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }
  stop() {
    this.nodes.forEach(n => { try { n.stop?.(); } catch { /* */ } try { n.disconnect?.(); } catch { /* */ } });
    this.nodes = []; this.isPlaying = false;
  }
  createOsc(freq, type, gain, detune = 0) {
    const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
    osc.type = type; osc.frequency.value = freq; osc.detune.value = detune; g.gain.value = gain;
    osc.connect(g).connect(this.ctx.destination); osc.start(); this.nodes.push(osc, g); return { osc, gain: g };
  }
  createNoise(gain) {
    const sz = this.ctx.sampleRate * 2; const buf = this.ctx.createBuffer(1, sz, this.ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = this.ctx.createGain(); g.gain.value = gain;
    const f = this.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 400;
    src.connect(f).connect(g).connect(this.ctx.destination); src.start(); this.nodes.push(src, f, g);
    return { src, gain: g, filter: f };
  }
  playSoundscape(category, season) {
    this.init(); this.stop(); this.isPlaying = true;
    const profiles = {
      "補氣": { baseFreq: 80, type: "sine", harmonics: [1, 1.5, 2], vol: 0.07, nv: 0.01, ff: 220 },
      "補血": { baseFreq: 120, type: "sine", harmonics: [1, 1.33, 2], vol: 0.06, nv: 0.012, ff: 300 },
      "養心安神": { baseFreq: 180, type: "sine", harmonics: [1, 1.25, 1.5, 2], vol: 0.04, nv: 0.015, ff: 500 },
      "重鎮安神": { baseFreq: 55, type: "sine", harmonics: [1, 2, 3], vol: 0.06, nv: 0.008, ff: 180 },
      "理氣": { baseFreq: 200, type: "triangle", harmonics: [1, 1.33, 1.67, 2], vol: 0.045, nv: 0.015, ff: 600 },
      "活血化瘀": { baseFreq: 150, type: "triangle", harmonics: [1, 1.5, 2, 2.5], vol: 0.05, nv: 0.018, ff: 450 },
      "利水滲濕": { baseFreq: 260, type: "sine", harmonics: [1, 1.2, 1.5], vol: 0.04, nv: 0.02, ff: 700 },
    };
    const sMod = { spring: 1.05, summer: 1.1, autumn: 0.95, winter: 0.9 };
    const mod = sMod[season] || 1; const p = profiles[category] || profiles["理氣"];
    p.harmonics.forEach((h, i) => {
      const { gain } = this.createOsc(p.baseFreq * h * mod, p.type, p.vol * (1 / (i + 1)), Math.sin(Date.now() * 0.001 + i) * 5);
      const lfo = this.ctx.createOscillator(); const lg = this.ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.02; lg.gain.value = p.vol * 0.3;
      lfo.connect(lg).connect(gain.gain); lfo.start(); this.nodes.push(lfo, lg);
    });
    const { filter } = this.createNoise(p.nv); filter.frequency.value = p.ff;
  }
}

export const audioEngine = new MeditationAudioEngine();
