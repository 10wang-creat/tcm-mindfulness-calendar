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
  const [dur, setDur] = useState(300);
  const isMedFav = medFavs.includes(herb.id);
  const togMedFav = () => {
    if (!setMedFavs) return;
    const n = isMedFav ? medFavs.filter(x => x !== herb.id) : [...medFavs, herb.id];
    setMedFavs(n); sv("medFavs", n);
  };
  const [elapsed, setElapsed] = useState(0);
  const [breath, setBreath] = useState("idle");
  const [mode, setMode] = useState(() => (audioSrc ? ld("medMode", "voice") : "scape"));
  const timerRef = useRef(null); const breathRef = useRef(null);
  const audioRef = useRef(null);
  const voiceEndedRef = useRef(false);

  const setModeSaved = (m) => { setMode(m); sv("medMode", m); };

  const startBreath = () => {
    const cycle = () => {
      setBreath("inhale");
      breathRef.current = setTimeout(() => {
        setBreath("hold");
        breathRef.current = setTimeout(() => {
          setBreath("exhale");
          breathRef.current = setTimeout(cycle, 4000);
        }, 2000);
      }, 4000);
    };
    cycle();
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; audioRef.current = null; }
    audioEngine.stop();
  };

  const start = () => {
    setPlaying(true); setElapsed(0); voiceEndedRef.current = false;
    if (mode === "voice" && audioSrc) {
      // 依所選時長挑對應長度的音檔（有 5/10 分版就用，否則退回原檔）
      const src = meditationAudioSrc(herb.id, Math.round(dur / 60)) || audioSrc;
      const a = new Audio(src);
      audioRef.current = a;
      // 音景在語音底下輕輕墊著（同時即時合成，音量壓低）
      audioEngine.playSoundscape(herb.category, term.season, 0.5);
      // 語音結束後把音景平滑轉為完整音量；並標記引導語已結束（可讓計時收尾）
      a.onended = () => { voiceEndedRef.current = true; audioEngine.setVolume(1); };
      a.play().catch(() => { voiceEndedRef.current = true; audioEngine.playSoundscape(herb.category, term.season, 1); });
    } else {
      audioEngine.playSoundscape(herb.category, term.season, 1);
    }
    startBreath();
  };

  const stop = useCallback(() => {
    setPlaying(false); stopAudio();
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathRef.current) clearTimeout(breathRef.current);
    setBreath("idle");
    if (elapsed > 30) {
      const td = fmtDate(new Date());
      const ns = {
        ...stats,
        totalDays: (stats.totalDays || 0) + (stats.lastDate === td ? 0 : 1),
        totalMinutes: (stats.totalMinutes || 0) + Math.floor(elapsed / 60),
        lastDate: td,
        streak: stats.lastDate === fmtDate(new Date(Date.now() - 86400000)) ? (stats.streak || 0) + 1 : stats.lastDate === td ? (stats.streak || 1) : 1,
        herbsExplored: [...new Set([...(stats.herbsExplored || []), herb.id])],
        meditatedDates: [...new Set([...(stats.meditatedDates || []), td])],
      };
      setStats(ns); sv("stats", ns);
    }
  }, [elapsed, stats, herb.id, setStats]);

  useEffect(() => {
    if (playing) { timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);
  // 到時就結束；但語音模式若引導語還沒講完，等它講完再收尾（不切掉結尾）
  useEffect(() => {
    if (playing && elapsed >= dur && (mode !== "voice" || !audioSrc || voiceEndedRef.current)) stop();
  }, [elapsed, dur, playing, stop, mode, audioSrc]);
  useEffect(() => () => { stopAudio(); if (breathRef.current) clearTimeout(breathRef.current); }, []);

  const rem = Math.max(0, dur - elapsed); const mn = Math.floor(rem / 60); const sc = rem % 60; const prog = Math.min(1, elapsed / dur);
  const bLabels = { idle:"", inhale:"吸氣", hold:"屏息", exhale:"呼氣" };
  const bScale = breath === "inhale" ? 1.3 : breath === "hold" ? 1.3 : 1;

  return (
    <div style={{ background:t.card, borderRadius:20, padding:24, marginTop:20, boxShadow:"0 2px 20px rgba(52,67,94,0.05)", border:"1px solid rgba(52,67,94,0.05)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ fontSize:11, color:t.accent, fontWeight:600, letterSpacing:"0.1em" }}>正念冥想 · {herb.name} · {herb.category}</div>
        {setMedFavs && (
          <button onClick={togMedFav} title={isMedFav ? "已收藏音檔" : "收藏這段冥想"} style={{ display:"flex", alignItems:"center", gap:4, background:isMedFav ? t.accentLight : "transparent", border:`1px solid ${isMedFav ? "transparent" : t.sub + "40"}`, borderRadius:20, padding:"4px 10px", cursor:"pointer", color:isMedFav ? "#C4708D" : t.textSec, fontSize:11 }}>
            <I.Heart f={isMedFav}/> {isMedFav ? "已收藏" : "收藏"}
          </button>
        )}
      </div>
      <p style={{ fontSize:14, color:t.text, lineHeight:1.8, fontStyle:"italic", padding:"12px 16px", background:t.accentLight, borderRadius:12, borderLeft:`3px solid ${t.accent}`, marginBottom:16 }}>{med}</p>

      {/* 音源模式切換：語音引導 / 自然音景 */}
      {audioSrc && !playing && (
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16 }}>
          {[{ id:"voice", l:"語音引導", ic:<I.Mic/> }, { id:"scape", l:"自然音景", ic:<I.Vol/> }].map(m => (
            <button key={m.id} onClick={() => setModeSaved(m.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:20, border:mode === m.id ? "none" : `1px solid ${t.sub}50`, cursor:"pointer", fontSize:12, fontWeight:500, background:mode === m.id ? t.sub : "transparent", color:mode === m.id ? "#fff" : t.sub }}>
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
            <div style={{ width:90, height:90, borderRadius:"50%", background:`radial-gradient(circle,${t.accentLight} 0%,${t.accent}33 100%)`, transform:`scale(${bScale})`, transition:breath === "inhale" || breath === "exhale" ? "transform 4s ease-in-out" : "transform 0.3s", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
              {playing
                ? <div style={{ fontSize:13, fontWeight:600, color:t.accent }}>{bLabels[breath]}</div>
                : <div className="font-serif-tc" style={{ fontSize:22, fontWeight:700, color:t.accent }}>{mn}:{String(sc).padStart(2, "0")}</div>}
            </div>
          </div>
        </div>
      </div>
      {playing && <div style={{ textAlign:"center", marginBottom:16 }}><span className="font-serif-tc" style={{ fontSize:28, fontWeight:700, color:t.text }}>{mn}:{String(sc).padStart(2, "0")}</span></div>}
      {!playing && <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16 }}>{DURS.map(d => <button key={d.v} onClick={() => setDur(d.v)} style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:500, background:dur === d.v ? t.accent : t.accentLight, color:dur === d.v ? "#fff" : t.accent }}>{d.l}</button>)}</div>}
      <div style={{ display:"flex", justifyContent:"center" }}>
        <button onClick={playing ? stop : start} style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 36px", borderRadius:28, border:"none", cursor:"pointer", background:playing ? "rgba(52,67,94,0.06)" : t.accent, color:playing ? t.text : "#fff", fontSize:15, fontWeight:600, boxShadow:playing ? "none" : `0 4px 16px ${t.accent}44` }}>
          {playing ? <><I.Pause/> 結束冥想</> : <><I.Play/> 開始冥想</>}
        </button>
      </div>
      {playing && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:12 }}>
          {mode === "voice" && audioSrc ? <I.Mic/> : <I.Vol/>}
          <span style={{ fontSize:11, color:t.textSec }}>{mode === "voice" && audioSrc ? `語音引導 · ${herb.name}` : `${herb.category}音景 · ${herb.name}`}</span>
          <div style={{ display:"flex", gap:2, alignItems:"end" }}>{[12, 18, 10, 16, 8].map((h, i) => <div key={i} style={{ width:3, height:h, background:t.accent, borderRadius:2, opacity:0.5, animation:`tcmAB 0.8s ease-in-out ${i * 0.1}s infinite alternate` }}/>)}</div>
        </div>
      )}
    </div>
  );
}
