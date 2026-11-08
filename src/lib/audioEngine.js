// ============================================================
// AUDIO ENGINE — 依藥材分類合成冥想音景（Web Audio）
// ============================================================
// 真實背景音樂床（與 TTS 混音用的是同兩首）：依藥材分類選一首，HTMLAudio 循環播放。
// 用 <audio> 而非 Web Audio，iOS 靜音鍵開著也聽得到。
const BED_FILES = { bright: "/meditations/bed_bright.mp3", deep: "/meditations/bed_deep.mp3" };
const BED_BY_CATEGORY = {
  "補氣": "bright", "理氣": "bright", "利水滲濕": "bright", "活血化瘀": "bright",
  "補血": "deep", "養心安神": "deep", "重鎮安神": "deep",
};
export function bedSrc(category) { return BED_FILES[BED_BY_CATEGORY[category] || "bright"]; }

class MeditationAudioEngine {
  constructor() { this.ctx = null; this.nodes = []; this.master = null; this.isPlaying = false; this.bed = null; this.last = null; }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }
  stop() {
    if (this.bed) { try { this.bed.pause(); this.bed.onerror = null; this.bed.src = ""; } catch { /* */ } this.bed = null; }
    this.last = null;
    this.stopSynth();
  }
  stopSynth() {
    this.nodes.forEach(n => { try { n.stop?.(); } catch { /* */ } try { n.disconnect?.(); } catch { /* */ } });
    try { this.master?.disconnect?.(); } catch { /* */ }
    this.nodes = []; this.master = null; this.isPlaying = false;
  }
  // 平滑調整整體音量（給語音結束後把音景由弱轉強用）
  setVolume(vol, ramp = 1.5) {
    if (this.bed) { this.bed.volume = Math.max(0, Math.min(1, vol)); return; }
    if (!this.master || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(vol, now + ramp);
  }
  createOsc(freq, type, gain, detune = 0) {
    const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
    osc.type = type; osc.frequency.value = freq; osc.detune.value = detune; g.gain.value = gain;
    osc.connect(g).connect(this.master); osc.start(); this.nodes.push(osc, g); return { osc, gain: g };
  }
  createNoise(gain) {
    const sz = this.ctx.sampleRate * 2; const buf = this.ctx.createBuffer(1, sz, this.ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = this.ctx.createGain(); g.gain.value = gain;
    const f = this.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 400;
    src.connect(f).connect(g).connect(this.master); src.start(); this.nodes.push(src, f, g);
    return { src, gain: g, filter: f };
  }
  // 主要入口：播放該分類的真實背景床；載不到（離線未快取等）才退回合成音景
  playSoundscape(category, season, volume = 1) {
    this.stop();
    this.last = { category, season, volume };
    const a = new Audio(bedSrc(category));
    a.loop = true; a.preload = "auto"; a.volume = Math.max(0, Math.min(1, volume));
    this.bed = a; this.isPlaying = true;
    const fallback = () => { if (this.bed !== a) return; this.bed = null; this.playSynth(category, season, volume); };
    a.onerror = fallback;
    a.play().catch(fallback);
  }
  // 暫停／繼續（床：保留進度；合成音景：停掉再重建）
  pause() {
    if (this.bed) { this.bed.pause(); return; }
    this.stopSynth();
  }
  resume() {
    if (this.bed) { this.bed.play().catch(() => {}); return; }
    if (this.last) this.playSynth(this.last.category, this.last.season, this.last.volume);
  }
  // 合成音景（Web Audio）— 僅作為床載入失敗時的備援
  playSynth(category, season, volume = 1) {
    this.init(); this.stopSynth(); this.isPlaying = true;
    this.master = this.ctx.createGain(); this.master.gain.value = volume; this.master.connect(this.ctx.destination);
    const profiles = {
      "補氣": { baseFreq: 80, type: "sine", harmonics: [1, 1.5, 2], vol: 0.12, nv: 0.022, ff: 220 },
      "補血": { baseFreq: 120, type: "sine", harmonics: [1, 1.33, 2], vol: 0.11, nv: 0.026, ff: 300 },
      "養心安神": { baseFreq: 180, type: "sine", harmonics: [1, 1.25, 1.5, 2], vol: 0.075, nv: 0.032, ff: 500 },
      "重鎮安神": { baseFreq: 55, type: "sine", harmonics: [1, 2, 3], vol: 0.11, nv: 0.018, ff: 180 },
      "理氣": { baseFreq: 200, type: "triangle", harmonics: [1, 1.33, 1.67, 2], vol: 0.08, nv: 0.032, ff: 600 },
      "活血化瘀": { baseFreq: 150, type: "triangle", harmonics: [1, 1.5, 2, 2.5], vol: 0.09, nv: 0.04, ff: 450 },
      "利水滲濕": { baseFreq: 260, type: "sine", harmonics: [1, 1.2, 1.5], vol: 0.075, nv: 0.045, ff: 700 },
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

// iOS/Safari：AudioContext 預設為 suspended，必須在使用者手勢中唤醒。
// 首次觸碰畫面就解鎖，之後沉浸冥想在 useEffect 觸發的音訊也能發聲。
if (typeof document !== "undefined") {
  const unlockAudio = () => {
    try {
      audioEngine.init();
      const ctx = audioEngine.ctx;
      if (ctx) {
        if (ctx.state === "suspended") ctx.resume();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf; src.connect(ctx.destination); src.start(0);
      }
    } catch { /* */ }
    document.removeEventListener("touchend", unlockAudio);
    document.removeEventListener("click", unlockAudio);
  };
  document.addEventListener("touchend", unlockAudio, { passive: true });
  document.addEventListener("click", unlockAudio);
}
