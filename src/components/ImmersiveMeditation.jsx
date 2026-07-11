import { useState, useEffect, useRef } from "react";
import { audioEngine } from "../lib/audioEngine.js";
import { herbImg, getRarityCfg } from "../data/herbs.js";
import { meditationAudioSrc } from "../data/meditations.js";
import { ld, sv } from "../lib/storage.js";
import { getSeason } from "../theme.js";
import { I } from "./Icons.jsx";

// 全螢幕沉浸呼吸冥想 — 深藏藍夜空 × 薰衣草微光
export default function ImmersiveMeditation({ herb, onClose }) {
  const [breathPhase, setBreathPhase] = useState("inhale");
  const breathRef = useRef(null);
  const audioRef = useRef(null);
  const audioSrc = meditationAudioSrc(herb.id, 5);
  const [mode, setMode] = useState(() => (audioSrc ? ld("immMode", "voice") : "scape"));
  const [bgMuted, setBgMuted] = useState(() => ld("immBgMuted", false));
  const setModeSaved = (m) => { setMode(m); sv("immMode", m); };
  const isVoice = mode === "voice" && audioSrc;
  const toggleBgMute = () => {
    const n = !bgMuted; setBgMuted(n); sv("immBgMuted", n);
    const base = (isVoice && audioRef.current && !audioRef.current.ended) ? 0.5 : 1;
    audioEngine.setVolume(n ? 0 : base);
  };

  // 呼吸節律
  useEffect(() => {
    const phases = ["inhale", "hold", "exhale", "rest"];
    const durations = [4000, 2000, 4000, 2000];
    let idx = 0;
    const cycle = () => {
      setBreathPhase(phases[idx]);
      breathRef.current = setTimeout(() => { idx = (idx + 1) % phases.length; cycle(); }, durations[idx]);
    };
    cycle();
    return () => clearTimeout(breathRef.current);
  }, []);

  // 音源：語音引導（人聲＋底下音景）或純自然音景
  useEffect(() => {
    let a = null;
    const season = getSeason(new Date());
    if (mode === "voice" && audioSrc) {
      a = new Audio(audioSrc);
      audioRef.current = a;
      audioEngine.playSoundscape(herb.category, season, bgMuted ? 0 : 0.5);   // 音景墊在語音底下
      a.onended = () => { if (!bgMuted) audioEngine.setVolume(1); };          // 語音結束音景轉為完整音量
      a.play().catch(() => { audioEngine.playSoundscape(herb.category, season, bgMuted ? 0 : 1); });
    } else {
      audioEngine.playSoundscape(herb.category, season, bgMuted ? 0 : 1);
    }
    return () => {
      if (a) { a.pause(); a.onended = null; }
      audioEngine.stop();
    };
  }, [herb, mode, audioSrc]);

  const label = { inhale: "吸氣", hold: "屏息", exhale: "呼氣", rest: "靜息" };
  const scale = { inhale: 1.3, hold: 1.3, exhale: 0.85, rest: 0.85 };
  const rc = getRarityCfg(herb.id);

  const toggleBtn = (active) => ({
    display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:22, cursor:"pointer",
    fontSize:13, fontFamily:"inherit", backdropFilter:"blur(10px)",
    border: active ? "1px solid rgba(187,173,216,0.6)" : "1px solid rgba(187,173,216,0.2)",
    background: active ? "rgba(187,173,216,0.22)" : "rgba(255,255,255,0.05)",
    color: active ? "#E7DEF5" : "#8E9AB4",
  });

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"radial-gradient(ellipse at center, #2B3247 0%, #1C2233 60%, #0E1220 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <button onClick={onClose} style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(187,173,216,0.3)", borderRadius:12, color:"#C9D4E8", padding:"8px 20px", cursor:"pointer", fontSize:14, fontFamily:"inherit", backdropFilter:"blur(10px)" }}>
        離開冥想
      </button>
      <div style={{ position:"relative", marginBottom:40 }}>
        <div style={{
          width:260, height:260, borderRadius:"50%", border:"2px solid rgba(187,173,216,0.35)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transform:`scale(${scale[breathPhase]})`,
          transition: (breathPhase === "inhale" || breathPhase === "exhale") ? "transform 4s ease-in-out" : "transform 0.3s ease",
          boxShadow:`0 0 60px rgba(187,173,216,${breathPhase === "hold" ? 0.3 : 0.15}), inset 0 0 40px rgba(170,201,232,0.06)`,
        }}>
          <img src={herbImg(herb)} alt={herb.name} style={{ width:200, height:200, objectFit:"contain", opacity:(breathPhase === "hold" || breathPhase === "inhale") ? 0.85 : 0.5, transition:"opacity 3s ease", filter:"drop-shadow(0 0 20px rgba(187,173,216,0.35))" }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      </div>
      <div style={{ textAlign:"center", color:"#C9D4E8" }}>
        <div style={{ fontSize:12, letterSpacing:3, marginBottom:6, color:"#BBADD8" }}>{"★".repeat(rc.stars)} {rc.label}</div>
        <div className="font-serif-tc" style={{ fontSize:38, fontWeight:600, letterSpacing:8, marginBottom:6 }}>{herb.name}</div>
        <div style={{ fontSize:15, fontStyle:"italic", opacity:0.6, marginBottom:36 }}>{herb.pinyin}</div>
        {isVoice
          ? <div style={{ fontSize:16, letterSpacing:4, fontWeight:300, color:"#BBADD8", opacity:0.85 }}>跟著聲音，慢慢呼吸</div>
          : <div style={{ fontSize:28, letterSpacing:12, fontWeight:300, color:"#BBADD8", textShadow:"0 0 20px rgba(187,173,216,0.45)" }}>{label[breathPhase]}</div>}
        <div style={{ fontSize:13, opacity:0.4, marginTop:14 }}>{herb.effect}</div>
      </div>

      {/* 語音引導 / 自然音景 切換 */}
      <div style={{ display:"flex", gap:10, marginTop:40 }}>
        <button onClick={() => setModeSaved("voice")} disabled={!audioSrc} style={{ ...toggleBtn(mode === "voice" && audioSrc), opacity:audioSrc ? 1 : 0.35 }}>
          <I.Mic/> 語音引導
        </button>
        <button onClick={() => setModeSaved("scape")} style={toggleBtn(mode === "scape" || !audioSrc)}>
          <I.Vol/> 自然音景
        </button>
      </div>
      <button onClick={toggleBgMute} style={{ marginTop:14, display:"flex", alignItems:"center", gap:6, padding:"6px 16px", borderRadius:20, cursor:"pointer", fontSize:12, fontFamily:"inherit", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(187,173,216,0.2)", color: bgMuted ? "#7C86A0" : "#C9D4E8", opacity: bgMuted ? 0.7 : 1 }}>
        <I.Vol/> {bgMuted ? "背景音：關" : "背景音：開"}
      </button>
    </div>
  );
}
