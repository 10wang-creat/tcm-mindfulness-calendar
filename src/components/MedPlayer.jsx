import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../theme.js";
import { audioEngine } from "../lib/audioEngine.js";
import { meditationAudioSrc } from "../data/meditations.js";
import { ld, sv, fmtDate } from "../lib/storage.js";
import { I } from "./Icons.jsx";

const DURS = [{ l:"5分鐘", v:300 }, { l:"10分鐘", v:600 }];

// 冥想計時播放器 — 支援語音引導 mp3 與合成音景兩種模式
export default function MedPlayer({ herb, med, term, stats, setStats, medFavs = [], setMedFavs }) {
  const t = useTheme();
  const audioSrc = meditationAudioSrc(herb.id);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dur, setDur] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [breath, setBreath] = useState("idle");
  const [mode, setMode] = useState(() => (audioSrc ? ld("medMode", "voice") : "scape"));
  const [bgMuted, setBgMuted] = useState(() => ld("medBgMuted", false));
  const [audioFailed, setAudioFailed] = useState(false);
  const [doneMsg, setDoneMsg] = useState(null);
  const timerRef = useRef(null); const breathRef = useRef(null);
  const audioRef = useRef(null);
  const voiceEndedRef = useRef(false);

  const isMedFav = medFavs.includes(herb.id);
  const togMedFav = () => {
    if (!setMedFavs) return;
    const n = isMedFav ? medFavs.filter(x => x !== herb.id) : [...medFavs, herb.id];
    setMedFavs(n); sv("medFavs", n);
  };
  const setModeSaved = (m) => { setMode(m); sv("medMode", m); };

  // 語音模式且引導語未結束時，音景墊在底下(0.5)；否則完整(1)；靜音則 0
  const scapeBase = () => (mode === "voice" && audioSrc && !voiceEndedRef.current ? 0.5 : 1);
  const applyBgVolume = (muted) => { audioEngine.setVolume(muted ? 0 : scapeBase()); };

  const startBreath = () => {
    const cycle = () => {
      setBreath("inhale");
      breathRef.current = setTimeout(() => {
        setBreath("hold");
        breathRef.current = setTimeout(() => {
          setBreath("exhale");
          breathRef.current = setTimeout(cycle, 7000);
        }, 2000);
      }, 5000);
    };
    cycle();
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; audioRef.current = null; }
    audioEngine.stop();
  };

  const startSound = () => {
    const season = term.season;
    if (mode === "voice" && audioSrc) {
      const src = meditationAudioSrc(herb.id, Math.round(dur / 60)) || audioSrc;
      const a = new Audio(src);
      audioRef.current = a;
      audioEngine.playSoundscape(herb.category, season, bgMuted ? 0 : 0.5);   // 音景墊在語音底下
      a.onended = () => { voiceEndedRef.current = true; if (!bgMuted) audioEngine.setVolume(1); };
      a.play().catch(() => { voiceEndedRef.current = true; setAudioFailed(true); audioEngine.playSoundscape(herb.category, season, bgMuted ? 0 : 1); });
    } else {
      audioEngine.playSoundscape(herb.category, season, bgMuted ? 0 : 1);
    }
  };

  const start = () => {
    setPlaying(true); setPaused(false); setElapsed(0); setDoneMsg(null);
    setAudioFailed(false); voiceEndedRef.current = false;
    startSound();
    startBreath();
  };

  const pause = () => {
    setPaused(true);
    if (audioRef.current) audioRef.current.pause();
    audioEngine.stop();
    if (breathRef.current) clearTimeout(breathRef.current);
  };

  const resume = () => {
    setPaused(false);
    audioEngine.playSoundscape(herb.category, term.season, bgMuted ? 0 : scapeBase());
    if (audioRef.current) audioRef.current.play().catch(() => {});
    startBreath();
  };

  const toggleBgMute = () => {
    const n = !bgMuted; setBgMuted(n); sv("medBgMuted", n);
    if (playing && !paused) applyBgVolume(n);
  };

  const stop = useCallback(() => {
    const secs = elapsed;
    setPlaying(false); setPaused(false); stopAudio();
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathRef.current) clearTimeout(breathRef.current);
    setBreath("idle");
    if (secs > 30) {
      const td = fmtDate(new Date());
      const ns = {
        ...stats,
        totalDays: (stats.totalDays || 0) + (stats.lastDate === td ? 0 : 1),
        totalMinutes: (stats.totalMinutes || 0) + Math.floor(secs / 60),
        lastDate: td,
        streak: stats.lastDate === fmtDate(new Date(Date.now() - 86400000)) ? (stats.streak || 0) + 1 : stats.lastDate === td ? (stats.streak || 1) : 1,
        herbsExplored: [...new Set([...(stats.herbsExplored || []), herb.id])],
        meditatedDates: [...new Set([...(stats.meditatedDates || []), td])],
      };
      setStats(ns); sv("stats", ns);
      setDoneMsg(`✨ 完成 ${Math.max(1, Math.floor(secs / 60))} 分鐘冥想　·　連續 ${ns.streak} 天`);
      setTimeout(() => setDoneMsg(null), 6000);
    }
  }, [elapsed, stats, herb.id, setStats]);

  useEffect(() => {
    if (playing && !paused) { timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, paused]);
  // 到時就結束；但語音模式若引導語還沒講完，等它講完再收尾（不切掉結尾）
  useEffect(() => {
    if (playing && !paused && elapsed >= dur && (mode !== "voice" || !audioSrc || voiceEndedRef.current)) stop();
  }, [elapsed, dur, playing, paused, stop, mode, audioSrc]);
  useEffect(() => () => { stopAudio(); if (breathRef.current) clearTimeout(breathRef.current); }, []);

  const rem = Math.max(0, dur - elapsed); const mn = Math.floor(rem / 60); const sc = rem % 60; const prog = Math.min(1, elapsed / dur);
  const bLabels = { idle:"", inhale:"吸氣", hold:"屏息", exhale:"呼氣" };
  const bScale = paused ? 1 : (breath === "inhale" || breath === "hold" ? 1.3 : 1);
  const isVoiceMode = mode === "voice" && audioSrc;   // 語音模式不顯示呼吸字，避免和旁白打架

  return (
    <div style={{ background:t.card, borderRadius:20, padding:24, marginTop:20, boxShadow:"0 2px 20px rgba(52,67,94,0.05)", border:`1px solid ${t.dark ? "rgba(180,195,225,0.08)" : "rgba(52,67,94,0.05)"}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ fontSize:12, color:t.accent, fontWeight:600, letterSpacing:"0.08em" }}>正念冥想 · {herb.name} · {herb.category}</div>
        {setMedFavs && (
          <button onClick={togMedFav} title={isMedFav ? "已收藏這段冥想音檔" : "收藏這段冥想音檔"} style={{ display:"flex", alignItems:"center", gap:4, background:isMedFav ? t.accentLight : "transparent", border:`1px solid ${isMedFav ? "transparent" : t.sub + "40"}`, borderRadius:20, padding:"4px 10px", cursor:"pointer", color:isMedFav ? "#C4708D" : t.textSec, fontSize:12 }}>
            <I.Heart f={isMedFav}/> {isMedFav ? "已收藏冥想" : "收藏冥想"}
          </button>
        )}
      </div>
      <div style={{ fontSize:11, color:t.textSec, marginBottom:10 }}>計時＋語音引導，適合躺著或坐著跟著做</div>
      <p style={{ fontSize:14, color:t.text, lineHeight:1.8, fontStyle:"italic", padding:"12px 16px", background:t.accentLight, borderRadius:12, borderLeft:`3px solid ${t.accent}`, marginBottom:16 }}>{med}</p>

      {/* 音源模式切換：語音引導 / 自然音景 */}
      {audioSrc && !playing && (
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16 }}>
          {[{ id:"voice", l:"語音引導", ic:<I.Mic/> }, { id:"scape", l:"自然音景", ic:<I.Vol/> }].map(m => (
            <button key={m.id} onClick={() => setModeSaved(m.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 16px", borderRadius:20, border:mode === m.id ? "none" : `1px solid ${t.sub}50`, cursor:"pointer", fontSize:13, fontWeight:500, background:mode === m.id ? t.sub : "transparent", color:mode === m.id ? "#fff" : t.sub }}>
              {m.ic} {m.l}
            </button>
          ))}
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"center", margin:"8px 0 20px" }}>
        <div style={{ position:"relative", width:160, height:160 }}>
          <svg width="160" height="160" style={{ position:"absolute", transform:"rotate(-90deg)" }}>
            <circle cx="80" cy="80" r="72" fill="none" stroke={t.accentLight} strokeWidth="4"/>
            <circle cx="80" cy="80" r="72" fill="none" stroke={t.accent} strokeWidth="4" strokeDasharray={`${prog * 452} 452`} strokeLinecap="round" style={{ transition:"stroke-dasharray 1s linear" }}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:90, height:90, borderRadius:"50%", background:`radial-gradient(circle,${t.accentLight} 0%,${t.accent}33 100%)`, transform:`scale(${bScale})`, transition: paused ? "transform 0.3s" : breath === "inhale" ? "transform 5s ease-in-out" : breath === "exhale" ? "transform 7s ease-in-out" : "transform 0.3s", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
              {paused
                ? <div style={{ fontSize:14, fontWeight:600, color:t.accent }}>已暫停</div>
                : playing
                  ? (isVoiceMode
                      ? <div style={{ fontSize:12, color:t.accent, opacity:0.75 }}>引導中…</div>
                      : <div style={{ fontSize:14, fontWeight:600, color:t.accent }}>{bLabels[breath]}</div>)
                  : <div className="font-serif-tc" style={{ fontSize:22, fontWeight:700, color:t.accent }}>{mn}:{String(sc).padStart(2, "0")}</div>}
            </div>
          </div>
        </div>
      </div>

      {playing && <div style={{ textAlign:"center", marginBottom:16 }}><span className="font-serif-tc" style={{ fontSize:28, fontWeight:700, color:t.text }}>{mn}:{String(sc).padStart(2, "0")}</span></div>}
      {!playing && <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16 }}>{DURS.map(d => <button key={d.v} onClick={() => setDur(d.v)} style={{ padding:"7px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, background:dur === d.v ? t.accent : t.accentLight, color:dur === d.v ? "#fff" : t.accent }}>{d.l}</button>)}</div>}

      {/* 完成回饋 */}
      {!playing && doneMsg && (
        <div style={{ textAlign:"center", marginBottom:16, padding:"12px 16px", borderRadius:14, background:t.accentLight, color:t.accent, fontSize:14, fontWeight:600 }}>{doneMsg}</div>
      )}

      {/* 主控制列 */}
      <div style={{ display:"flex", justifyContent:"center", gap:10 }}>
        {!playing && (
          <button onClick={start} style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 36px", borderRadius:28, border:"none", cursor:"pointer", background:t.accent, color:"#fff", fontSize:15, fontWeight:600, boxShadow:`0 4px 16px ${t.accent}44` }}>
            <I.Play/> 開始冥想
          </button>
        )}
        {playing && (
          <>
            <button onClick={paused ? resume : pause} style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:28, border:"none", cursor:"pointer", background:t.accent, color:"#fff", fontSize:15, fontWeight:600, boxShadow:`0 4px 16px ${t.accent}44` }}>
              {paused ? <><I.Play/> 繼續</> : <><I.Pause/> 暫停</>}
            </button>
            <button onClick={stop} style={{ display:"flex", alignItems:"center", gap:6, padding:"14px 24px", borderRadius:28, border:`1px solid ${t.sub}40`, cursor:"pointer", background:"transparent", color:t.textSec, fontSize:15, fontWeight:600 }}>
              <I.X/> 結束
            </button>
          </>
        )}
      </div>

      {/* 播放中狀態列：音源 + 背景音靜音 */}
      {playing && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:14, flexWrap:"wrap" }}>
          <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:t.textSec }}>
            {isVoiceMode ? <I.Mic/> : <I.Vol/>}
            {isVoiceMode ? `語音引導 · ${herb.name}` : `${herb.category}音景 · ${herb.name}`}
          </span>
          <button onClick={toggleBgMute} title={bgMuted ? "開啟背景音" : "關閉背景音"} style={{ display:"flex", alignItems:"center", gap:4, background:"transparent", border:`1px solid ${t.sub}40`, borderRadius:16, padding:"4px 10px", cursor:"pointer", color:bgMuted ? t.textSec : t.accent, fontSize:11, opacity:bgMuted ? 0.6 : 1 }}>
            <I.Vol/> {bgMuted ? "背景音：關" : "背景音：開"}
          </button>
        </div>
      )}

      {/* 語音載入失敗提示 */}
      {playing && audioFailed && isVoiceMode && (
        <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:t.textSec }}>此藥材語音尚未就緒，已改用自然音景陪伴。</div>
      )}
    </div>
  );
}
