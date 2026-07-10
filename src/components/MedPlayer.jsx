import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../theme.js";
import { audioEngine } from "../lib/audioEngine.js";
import { meditationAudioSrc } from "../data/meditations.js";
import { ld, sv, fmtDate } from "../lib/storage.js";
import { I } from "./Icons.jsx";

const DURS = [{ l:"3分鐘", v:180 }, { l:"5分鐘", v:300 }, { l:"10分鐘", v:600 }, { l:"15分鐘", v:900 }];

// 冥想計時播放器 — 支援語音引導 mp3 與合成音景兩種模式
export default function MedPlayer({ herb, med, term, stats, setStats }) {
  const t = useTheme();
  const audioSrc = meditationAudioSrc(herb.id);
  const [playing, setPlaying] = useState(false);
  const [dur, setDur] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [breath, setBreath] = useState("idle");
  const [mode, setMode] = useState(() => (audioSrc ? ld("medMode", "voice") : "scape"));
  const timerRef = useRef(null); const breathRef = useRef(null);
  const audioRef = useRef(null);

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
    setPlaying(true); setElapsed(0);
    if (mode === "voice" && audioSrc) {
      const a = new Audio(audioSrc);
      audioRef.current = a;
      // 語音結束後接續合成音景，直到計時結束
      a.onended = () => { audioEngine.playSoundscape(herb.category, term.season); };
      a.play().catch(() => { audioEngine.playSoundscape(herb.category, term.season); });
    } else {
      audioEngine.playSoundscape(herb.category, term.season);
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
  useEffect(() => { if (elapsed >= dur && playing) stop(); }, [elapsed, dur, playing, stop]);
  useEffect(() => () => { stopAudio(); if (breathRef.current) clearTimeout(breathRef.current); }, []);

  const rem = dur - elapsed; const mn = Math.floor(rem / 60); const sc = rem % 60; const prog = elapsed / dur;
  const bLabels = { idle:"", inhale:"吸氣", hold:"屏息", exhale:"呼氣" };
  const bScale = breath === "inhale" ? 1.3 : breath === "hold" ? 1.3 : 1;

  return (
    <div style={{ background:t.card, borderRadius:20, padding:24, marginTop:20, boxShadow:"0 2px 20px rgba(52,67,94,0.05)", border:"1px solid rgba(52,67,94,0.05)" }}>
      <div style={{ fontSize:11, color:t.accent, fontWeight:600, letterSpacing:"0.1em", marginBottom:12 }}>正念冥想 · {herb.name} · {herb.category}</div>
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
