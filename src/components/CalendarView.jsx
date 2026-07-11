import { useState } from "react";
import { useTheme } from "../theme.js";
import { SOLAR_TERMS_2026, SOLAR_TERM_CUSTOMS, getCurrentSolarTerm, solarTermImg } from "../data/solarTerms.js";
import { getDayHerb } from "../data/meditations.js";
import { herbImg } from "../data/herbs.js";
import { LUNAR_DAYS, FESTIVALS, getLunarDay } from "../data/lunar.js";
import { generateSolarTermCard, generateSolarTermWallpaper } from "../lib/shareCards.js";
import { fmtDate } from "../lib/storage.js";
import { I } from "./Icons.jsx";

export default function CalendarView({ stats, canvasRef, goToDate }) {
  const t = useTheme();
  const [vd, setVd] = useState(new Date());
  const [sel, setSel] = useState(null);
  const y = vd.getFullYear(); const m = vd.getMonth();
  const fd = new Date(y, m, 1).getDay();
  const dim = new Date(y, m + 1, 0).getDate();
  const today = fmtDate(new Date());
  const mTerms = SOLAR_TERMS_2026.filter(tt => { const d = new Date(tt.date); return d.getFullYear() === y && d.getMonth() === m; });
  const days = [];
  for (let i = 0; i < fd; i++) days.push(null);
  for (let d = 1; d <= dim; d++) days.push(d);

  // 節氣習俗卡（選取日或今日所屬節氣）
  const activeDate = sel || today;
  const activeTerm = getCurrentSolarTerm(activeDate);
  const customs = SOLAR_TERM_CUSTOMS[activeTerm?.name];
  const dayHerb = getDayHerb(activeDate);

  return (
    <div style={{ paddingBottom:90 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 0 16px" }}>
        <button onClick={() => setVd(new Date(y, m - 1, 1))} style={{ background:"none", border:"none", cursor:"pointer", color:t.text, padding:8 }}><I.CL/></button>
        <div style={{ textAlign:"center" }}>
          <div className="font-serif-tc" style={{ fontSize:22, fontWeight:700, color:t.text }}>{y} 年 {m + 1} 月</div>
          {mTerms.length > 0 && <div style={{ fontSize:12, color:t.accent, marginTop:4 }}>{mTerms.map(tt => `${tt.icon} ${tt.name}`).join("  ")}</div>}
        </div>
        <button onClick={() => setVd(new Date(y, m + 1, 1))} style={{ background:"none", border:"none", cursor:"pointer", color:t.text, padding:8 }}><I.CR/></button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>{["日", "一", "二", "三", "四", "五", "六"].map(w => <div key={w} style={{ textAlign:"center", fontSize:11, color:t.textSec, padding:"6px 0", fontWeight:500 }}>{w}</div>)}</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {days.map((d, i) => {
          if (!d) return <div key={i}/>;
          const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const key = String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
          const isT = ds === today; const isS = ds === sel;
          const isST = mTerms.some(tt => tt.date === ds);
          const hasMed = (stats.meditatedDates || []).includes(ds);
          const lunar = getLunarDay(m + 1, d);
          const fest = FESTIVALS[key];
          const isMonth = LUNAR_DAYS[key]?.includes("月");
          return (
            <button key={i} onClick={() => setSel(isS ? null : ds)} style={{ position:"relative", background:isS ? t.accent : isT ? t.accentLight : "transparent", border:"none", borderRadius:12, padding:"6px 0 4px", cursor:"pointer", color:isS ? "#fff" : isT ? t.accent : t.text, fontWeight:isT || isS ? 700 : 400, fontSize:14, transition:"all 0.15s", minHeight:48 }}>
              <div>{d}</div>
              <div style={{ fontSize:8, marginTop:1, lineHeight:1, color:isS ? "rgba(255,255,255,0.7)" : fest ? "#C4708D" : isMonth ? t.accent : t.textSec, fontWeight:fest || isMonth ? 600 : 400, letterSpacing:fest ? 0 : 0.5 }}>{lunar}</div>
              {isST && <div style={{ position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:isS ? "#fff" : t.accent }}/>}
              {hasMed && !isST && <div style={{ position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:isS ? "#fff" : t.sub }}/>}
            </button>
          );
        })}
      </div>

      {/* 當日藥材 */}
      {dayHerb && (
        <div style={{ background:t.card, borderRadius:20, padding:"16px 20px", marginTop:20, boxShadow:"0 2px 16px rgba(52,67,94,0.05)", border:"1px solid rgba(52,67,94,0.05)", display:"flex", alignItems:"center", gap:14 }}>
          <img src={herbImg(dayHerb)} alt={dayHerb.name} style={{ width:52, height:52, borderRadius:12, objectFit:"cover", background:t.accentLight }} onError={e => { e.target.style.display = "none"; }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:t.accent, fontWeight:600, letterSpacing:"0.08em", marginBottom:2 }}>{activeDate === today ? "今日藥材" : `${activeDate.slice(5)} 藥材`} · {dayHerb.category}</div>
            <div className="font-serif-tc" style={{ fontSize:20, fontWeight:700, color:t.text }}>{dayHerb.name}</div>
            <div style={{ fontSize:12, color:t.textSec, marginTop:2 }}>功效：{dayHerb.effect}</div>
          </div>
          {goToDate && (
            <button onClick={() => goToDate(activeDate)} title="到今日頁看這天" style={{ alignSelf:"stretch", display:"flex", alignItems:"center", gap:4, padding:"0 12px", borderRadius:12, border:`1px solid ${t.accent}40`, background:"transparent", color:t.accent, fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>開啟 <I.CR/></button>
          )}
        </div>
      )}

      {/* 節氣習俗卡 */}
      {customs && activeTerm && (
        <div style={{ background:t.card, borderRadius:20, padding:"20px 24px", marginTop:20, boxShadow:"0 2px 16px rgba(52,67,94,0.05)", border:"1px solid rgba(52,67,94,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <img src={solarTermImg(activeTerm.name)} alt="" style={{ width:40, height:40, borderRadius:10, objectFit:"cover" }} onError={e => { e.target.style.display = "none"; }} />
            <div>
              <div className="font-serif-tc" style={{ fontSize:18, fontWeight:700, color:t.text }}>{activeTerm.icon} {activeTerm.name}習俗</div>
              <div style={{ fontSize:11, color:t.textSec }}>{activeTerm.theme} · {activeTerm.date}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {customs.customs.map((cu, i) => <span key={i} style={{ fontSize:12, padding:"5px 12px", borderRadius:14, background:t.accentLight, color:t.accent, fontWeight:500 }}>{cu}</span>)}
          </div>
          <div style={{ fontSize:13, color:t.text, lineHeight:1.8, marginBottom:8 }}>
            <span style={{ fontWeight:600, color:t.accent }}>養生提示　</span>{customs.health}
          </div>
          <div style={{ fontSize:13, color:t.text, lineHeight:1.8, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontWeight:600, color:t.sub }}>推薦茶飲　</span>
            <span style={{ padding:"3px 10px", borderRadius:10, background:t.subLight, color:t.sub, fontSize:12 }}>{customs.tea}</span>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:14, paddingTop:12, borderTop:"1px solid rgba(52,67,94,0.05)" }}>
            <button onClick={() => generateSolarTermCard(activeTerm, canvasRef)} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px", borderRadius:14, border:`1px solid ${t.accent}30`, background:"transparent", color:t.accent, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}><I.Share/> 分享節氣圖卡</button>
            <button onClick={() => generateSolarTermWallpaper(activeTerm, "phone", canvasRef)} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px", borderRadius:14, border:`1px solid ${t.accent}30`, background:"transparent", color:t.accent, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}><I.Download/> 節氣桌布</button>
          </div>
        </div>
      )}
    </div>
  );
}
