import { useState } from "react";
import { useTheme } from "../theme.js";
import { herbImg, getRarityCfg } from "../data/herbs.js";
import { getCurrentSolarTerm, solarTermImg, SOLAR_TERM_CUSTOMS } from "../data/solarTerms.js";
import { getDayHerb, getDayMeditation } from "../data/meditations.js";
import { generateShareCard, generateSolarTermCard, generateSolarTermWallpaper, generateWallpaper } from "../lib/shareCards.js";
import { ld, sv, fmtDate } from "../lib/storage.js";
import { I } from "./Icons.jsx";
import MedPlayer from "./MedPlayer.jsx";
import ImmersiveMeditation from "./ImmersiveMeditation.jsx";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function TodayView({ stats, setStats, collected, setCollected, medFavs, setMedFavs, dateStr, setDateStr, canvasRef }) {
  const t = useTheme();
  const today = fmtDate(new Date());
  const isToday = dateStr === today;
  const term = getCurrentSolarTerm(dateStr);
  const herb = getDayHerb(dateStr);
  const med = getDayMeditation(herb, dateStr);
  const d = new Date(dateStr + "T00:00:00");
  const shiftDay = (n) => {
    const nd = new Date(dateStr + "T00:00:00");
    nd.setDate(nd.getDate() + n);
    const ns = fmtDate(nd);
    if (ns <= today) setDateStr(ns);   // 只能回溯，不能看未來
  };
  const isCollected = collected.includes(herb.id);
  const rc = getRarityCfg(herb.id);
  const [showMeditation, setShowMeditation] = useState(false);
  const customs = SOLAR_TERM_CUSTOMS[term.name];
  const [showHint, setShowHint] = useState(() => !ld("seenHint", false) && (stats.totalDays || 0) === 0);
  const dismissHint = () => { setShowHint(false); sv("seenHint", true); };

  const toggleCollect = () => {
    const n = isCollected ? collected.filter(i => i !== herb.id) : [...collected, herb.id];
    setCollected(n); sv("collected", n);
  };

  return (
    <div style={{ paddingBottom:90 }}>
      {showMeditation && <ImmersiveMeditation herb={herb} onClose={() => setShowMeditation(false)} />}

      {/* 節氣頁首 */}
      <div style={{ background:t.headerBg, margin:"-8px -16px 0", borderRadius:"0 0 28px 28px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:t.dark ? 0.12 : 0.18 }}>
          <img src={solarTermImg(term.name)} alt={term.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display = "none"; }} />
        </div>
        {t.dark && <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, rgba(16,19,26,0.45) 0%, rgba(16,19,26,0.7) 100%)" }} />}
        <div style={{ position:"relative", padding:"32px 24px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
            <img src={solarTermImg(term.name)} alt={term.name} style={{ width:56, height:56, borderRadius:16, objectFit:"cover", border:"2px solid rgba(255,255,255,0.6)", boxShadow:"0 2px 12px rgba(52,67,94,0.12)" }} onError={e => { e.target.style.display = "none"; }} />
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                <button onClick={() => shiftDay(-1)} title="前一天" style={{ background:"rgba(255,255,255,0.5)", border:"none", borderRadius:8, width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:t.accent, padding:0 }}><I.CL/></button>
                <div style={{ fontSize:12, color:t.textSec, letterSpacing:"0.1em" }}>{d.getFullYear()} 年 {d.getMonth() + 1} 月 {d.getDate()} 日 星期{WEEKDAYS[d.getDay()]}</div>
                <button onClick={() => shiftDay(1)} disabled={isToday} title="後一天" style={{ background:"rgba(255,255,255,0.5)", border:"none", borderRadius:8, width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", cursor:isToday ? "default" : "pointer", color:t.accent, padding:0, opacity:isToday ? 0.3 : 1 }}><I.CR/></button>
                {!isToday && <button onClick={() => setDateStr(today)} style={{ background:t.accent, border:"none", borderRadius:10, color:"#fff", fontSize:11, padding:"3px 10px", cursor:"pointer", fontFamily:"inherit" }}>回今日</button>}
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span className="font-serif-tc" style={{ fontSize:28, fontWeight:700, color:t.text }}>{term.name}</span>
                <span style={{ fontSize:13, color:t.accent, fontWeight:500 }}>{term.theme}</span>
              </div>
            </div>
          </div>
          {customs && (
            <div style={{ fontSize:11, color:t.textSec, marginBottom:6, lineHeight:1.6 }}>
              <span style={{ color:t.accent, fontWeight:600 }}>習俗：</span>{customs.customs.join("、")}
              <span style={{ marginLeft:8, color:t.sub, fontWeight:600 }}>茶飲：</span>{customs.tea}
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:13, color:t.textSec }}>{term.icon} 節氣養生 · {herb.category}</div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => generateSolarTermCard(term, canvasRef)} style={{ background:t.dark ? "rgba(46,56,78,0.75)" : "rgba(255,255,255,0.6)", border:"none", borderRadius:10, padding:"6px 11px", fontSize:12, cursor:"pointer", color:t.dark ? "#DCE6F5" : t.accent, display:"flex", alignItems:"center", gap:3, backdropFilter:"blur(8px)" }}><I.Share/> 節氣圖卡</button>
              <button onClick={() => generateSolarTermWallpaper(term, "phone", canvasRef)} style={{ background:t.dark ? "rgba(46,56,78,0.75)" : "rgba(255,255,255,0.6)", border:"none", borderRadius:10, padding:"6px 11px", fontSize:12, cursor:"pointer", color:t.dark ? "#DCE6F5" : t.accent, display:"flex", alignItems:"center", gap:3, backdropFilter:"blur(8px)" }}><I.Download/> 節氣桌布</button>
            </div>
          </div>
        </div>
      </div>

      {/* 新手引導 */}
      {showHint && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:t.accentLight, borderRadius:14, padding:"14px 16px", marginTop:16 }}>
          <div style={{ flex:1, fontSize:13, color:t.text, lineHeight:1.7 }}>
            歡迎來到本草冥想。每天回來看看<b>當日藥材</b>，點愛心收藏它，再聽一段<b>冥想</b>放鬆一下。用左右箭頭可以回顧過去的日子，慢慢養成自己的節奏。
          </div>
          <button onClick={dismissHint} title="知道了" style={{ background:"transparent", border:"none", cursor:"pointer", color:t.textSec, flexShrink:0 }}><I.X/></button>
        </div>
      )}

      {/* 今日藥材卡 */}
      <div style={{ background:t.card, borderRadius:20, padding:"24px", marginTop:20, boxShadow:"0 2px 20px rgba(52,67,94,0.05)", border:`1px solid ${isCollected ? rc.color + "30" : "rgba(52,67,94,0.05)"}` }}>
        <div style={{ display:"flex", gap:16, marginBottom:16 }}>
          <div style={{ position:"relative" }}>
            <img src={herbImg(herb)} alt={herb.name} style={{ width:88, height:88, borderRadius:16, objectFit:"cover", background:t.accentLight }} onError={e => { e.target.style.display = "none"; }} />
            <div style={{ position:"absolute", top:-4, right:-4, fontSize:10, color:rc.color, background:t.card, borderRadius:8, padding:"1px 4px", border:`1px solid ${rc.color}40`, letterSpacing:1 }}>{"★".repeat(rc.stars)}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11, color:t.accent, fontWeight:600, letterSpacing:"0.1em", marginBottom:4 }}>{isToday ? "今日藥材" : "當日藥材"} · {herb.category}</div>
                <div className="font-serif-tc" style={{ fontSize:24, fontWeight:700, color:t.text }}>{herb.name}</div>
                <div style={{ fontSize:12, color:t.textSec, marginTop:2 }}>{herb.pinyin}</div>
              </div>
              <button onClick={toggleCollect} title={isCollected ? "已收藏（點擊取消）" : "收藏到本草圖鑑"} style={{ background:isCollected ? t.accentLight : "rgba(52,67,94,0.04)", border:"none", borderRadius:12, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:isCollected ? "#C4708D" : t.textSec }}><I.Heart f={isCollected}/></button>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {[`性 ${herb.nature}`, `味 ${herb.taste}`, herb.meridian].map((tag, i) => <span key={i} style={{ fontSize:12, padding:"4px 10px", borderRadius:20, background:t.accentLight, color:t.accent, fontWeight:500 }}>{tag}</span>)}
          <span style={{ fontSize:11, padding:"4px 10px", borderRadius:20, background:rc.color + "15", color:rc.color, fontWeight:500 }}>{"★".repeat(rc.stars)} {rc.label}</span>
        </div>
        <p style={{ fontSize:14, color:t.text, lineHeight:1.8, marginBottom:8 }}>{herb.desc}</p>
        <div style={{ fontSize:12, color:t.accent, fontWeight:500, marginBottom:14 }}>功效：{herb.effect}</div>

        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={toggleCollect} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:500, background:isCollected ? t.accentLight : t.accent, color:isCollected ? t.accent : "#fff" }}>{isCollected ? "✓ 已收藏" : "♡ 收藏藥材"}</button>
          <button onClick={() => setShowMeditation(true)} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px", borderRadius:20, border:`1px solid ${t.accent}40`, cursor:"pointer", fontSize:12, background:"transparent", color:t.accent }}><I.Zen/> 沉浸冥想</button>
          <button onClick={() => generateShareCard(herb, canvasRef)} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px", borderRadius:20, border:`1px solid ${t.accent}40`, cursor:"pointer", fontSize:12, background:"transparent", color:t.accent }}><I.Share/> 分享</button>
          <button onClick={() => generateWallpaper(herb, "phone", canvasRef)} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px", borderRadius:20, border:`1px solid ${t.accent}40`, cursor:"pointer", fontSize:12, background:"transparent", color:t.accent }}><I.Download/> 桌布</button>
        </div>
      </div>

      <MedPlayer herb={herb} med={med} term={term} stats={stats} setStats={setStats} medFavs={medFavs} setMedFavs={setMedFavs} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }}>
        {[{ l:"冥想天數", v:stats.totalDays || 0 }, { l:"連續天數", v:stats.streak || 0 }, { l:"收藏卡牌", v:collected.length }].map((s, i) => (
          <div key={i} style={{ background:t.card, borderRadius:16, padding:"16px 12px", textAlign:"center", boxShadow:"0 1px 8px rgba(52,67,94,0.04)", border:"1px solid rgba(52,67,94,0.05)" }}>
            <div className="font-serif-tc" style={{ fontSize:24, fontWeight:700, color:t.accent }}>{s.v}</div>
            <div style={{ fontSize:12, color:t.textSec, marginTop:4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
