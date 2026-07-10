import { useState, useEffect, useRef } from "react";
import { audioEngine } from "../lib/audioEngine.js";
import { herbImg, getRarityCfg } from "../data/herbs.js";
import { getSeason } from "../theme.js";

// 全螢幕沉浸呼吸冥想 — 深藏藍夜空 × 薰衣草微光
export default function ImmersiveMeditation({ herb, onClose }) {
  const [breathPhase, setBreathPhase] = useState("inhale");
  const breathRef = useRef(null);

  useEffect(() => {
    const phases = ["inhale", "hold", "exhale", "rest"];
    const durations = [4000, 2000, 4000, 2000];
    let idx = 0;
    const cycle = () => {
      setBreathPhase(phases[idx]);
      breathRef.current = setTimeout(() => { idx = (idx + 1) % phases.length; cycle(); }, durations[idx]);
    };
    cycle();
    audioEngine.playSoundscape(herb.category, getSeason(new Date()));
    return () => { clearTimeout(breathRef.current); audioEngine.stop(); };
  }, [herb]);

  const label = { inhale: "吸氣", hold: "屏息", exhale: "呼氣", rest: "靜息" };
  const scale = { inhale: 1.3, hold: 1.3, exhale: 0.85, rest: 0.85 };
  const rc = getRarityCfg(herb.id);

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
        <div style={{ fontSize:28, letterSpacing:12, fontWeight:300, color:"#BBADD8", textShadow:"0 0 20px rgba(187,173,216,0.45)" }}>{label[breathPhase]}</div>
        <div style={{ fontSize:13, opacity:0.4, marginTop:14 }}>{herb.effect}</div>
      </div>
    </div>
  );
}
