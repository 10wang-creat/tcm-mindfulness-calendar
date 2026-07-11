import { useState } from "react";
import { useTheme } from "../theme.js";
import { HERBS, getRarity, herbImg } from "../data/herbs.js";
import { getDayMeditation } from "../data/meditations.js";
import { getCurrentSolarTerm } from "../data/solarTerms.js";
import { fmtDate, sv } from "../lib/storage.js";
import { I } from "./Icons.jsx";
import MedPlayer from "./MedPlayer.jsx";

const LEVEL_NAMES = ["初學者", "入門者", "修習者", "靜心者", "覺察者", "內觀者", "明心者", "養生者", "通達者", "大師"];

export default function JourneyView({ stats, setStats, collected, medFavs = [], setMedFavs, dark, toggleDark }) {
  const t = useTheme();
  const today = fmtDate(new Date());
  const [playHerb, setPlayHerb] = useState(null);
  const favHerbs = HERBS.filter(h => medFavs.includes(h.id));
  const removeMedFav = (id) => { const n = medFavs.filter(x => x !== id); setMedFavs(n); sv("medFavs", n); };

  const lv = Math.floor((stats.totalDays || 0) / 7) + 1;
  const xpIn = (stats.totalDays || 0) % 7;
  const xpProg = xpIn / 7;
  const lvName = LEVEL_NAMES[Math.min(lv - 1, LEVEL_NAMES.length - 1)];
  const achs = [
    { n:"初心萌芽", d:"完成第一次冥想", u:(stats.totalDays || 0) >= 1, i:"🌱" },
    { n:"七日啟程", d:"累計冥想 7 天", u:(stats.totalDays || 0) >= 7, i:"🚶" },
    { n:"月滿初成", d:"累計冥想 30 天", u:(stats.totalDays || 0) >= 30, i:"🌕" },
    { n:"本草初識", d:"探索 10 種藥材", u:(stats.herbsExplored || []).length >= 10, i:"📖" },
    { n:"百草學者", d:"探索 30 種藥材", u:(stats.herbsExplored || []).length >= 30, i:"🎓" },
    { n:"連續三日", d:"連續冥想 3 天", u:(stats.streak || 0) >= 3, i:"🔥" },
    { n:"週週不斷", d:"連續冥想 7 天", u:(stats.streak || 0) >= 7, i:"⚡" },
    { n:"靜坐一時", d:"累計冥想 60 分鐘", u:(stats.totalMinutes || 0) >= 60, i:"⏰" },
    { n:"深度冥想", d:"累計冥想 300 分鐘", u:(stats.totalMinutes || 0) >= 300, i:"🧘" },
    { n:"卡牌收藏家", d:"收藏 10 張藥材卡牌", u:collected.length >= 10, i:"🃏" },
    { n:"圖鑑大師", d:"收藏全部 56 張卡牌", u:collected.length >= 56, i:"👑" },
    { n:"珍稀獵人", d:"收藏所有珍稀藥材", u:HERBS.filter(h => getRarity(h.id) === "rare").every(h => collected.includes(h.id)), i:"💎" },
    { n:"傳說收集者", d:"收藏所有傳說藥材", u:HERBS.filter(h => getRarity(h.id) === "legendary").every(h => collected.includes(h.id)), i:"🏆" },
  ];
  return (
    <div style={{ paddingBottom:90 }}>
      <div style={{ padding:"20px 0 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <h1 className="font-serif-tc" style={{ fontSize:24, fontWeight:700, color:t.text }}>我的旅程</h1>
        {toggleDark && (
          <button onClick={toggleDark} title="切換日間／夜間" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:20, border:`1px solid ${t.sub}40`, background:t.card, color:t.text, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            {dark ? "☀️ 日間" : "🌙 夜間"}
          </button>
        )}
      </div>
      <div style={{ background:t.gradient, borderRadius:20, padding:24, marginBottom:20, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:12, right:16, fontSize:48, opacity:0.1 }}>🏔️</div>
        <div style={{ fontSize:12, color:t.accent, fontWeight:600, letterSpacing:"0.1em", marginBottom:4 }}>等級 {lv}</div>
        <div className="font-serif-tc" style={{ fontSize:24, fontWeight:700, color:t.text, marginBottom:12 }}>{lvName}</div>
        <div style={{ height:8, background:"rgba(52,67,94,0.07)", borderRadius:4, overflow:"hidden", marginBottom:6 }}><div style={{ height:"100%", background:t.accent, borderRadius:4, width:`${xpProg * 100}%`, transition:"width 0.5s ease" }}/></div>
        <div style={{ fontSize:11, color:t.textSec }}>{xpIn} / 7 天升級</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        {[{ l:"冥想天數", v:stats.totalDays || 0, i:"📅" }, { l:"連續天數", v:stats.streak || 0, i:"🔥" }, { l:"總分鐘數", v:stats.totalMinutes || 0, i:"⏱️" }, { l:"收藏卡牌", v:collected.length + "/" + HERBS.length, i:"🃏" }].map((s, i) => (
          <div key={i} style={{ background:t.card, borderRadius:16, padding:"18px 16px", boxShadow:"0 1px 8px rgba(52,67,94,0.04)", border:"1px solid rgba(52,67,94,0.05)" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>{s.i}</div>
            <div className="font-serif-tc" style={{ fontSize:26, fontWeight:700, color:t.text }}>{s.v}</div>
            <div style={{ fontSize:12, color:t.textSec, marginTop:4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* 冥想音檔收藏 */}
      <h2 className="font-serif-tc" style={{ fontSize:18, fontWeight:700, color:t.text, marginBottom:14 }}>冥想收藏 ({favHerbs.length})</h2>
      {favHerbs.length === 0 ? (
        <div style={{ background:"rgba(52,67,94,0.02)", borderRadius:14, padding:"18px 16px", fontSize:13, color:t.textSec, lineHeight:1.7, marginBottom:24 }}>
          在冥想播放器上點「收藏」，喜歡的冥想音檔就會收進這裡，隨時回來重播。
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {favHerbs.map(h => (
            <div key={h.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:t.card, borderRadius:14, border:"1px solid rgba(52,67,94,0.05)" }}>
              <img src={herbImg(h)} alt={h.name} style={{ width:40, height:40, borderRadius:10, objectFit:"cover", background:t.accentLight }} onError={e => { e.target.style.display = "none"; }} />
              <div style={{ flex:1 }}>
                <div className="font-serif-tc" style={{ fontSize:15, fontWeight:600, color:t.text }}>{h.name}</div>
                <div style={{ fontSize:11, color:t.textSec, marginTop:2 }}>{h.category} · {h.effect}</div>
              </div>
              <button onClick={() => setPlayHerb(h)} title="播放" style={{ background:t.accent, border:"none", borderRadius:"50%", width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}><I.Play/></button>
              <button onClick={() => removeMedFav(h.id)} title="移除收藏" style={{ background:"transparent", border:"none", cursor:"pointer", color:"#C4708D", display:"flex", alignItems:"center" }}><I.Heart f={true}/></button>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-serif-tc" style={{ fontSize:18, fontWeight:700, color:t.text, marginBottom:14 }}>成就 ({achs.filter(a => a.u).length}/{achs.length})</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {achs.map((a, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:a.u ? t.card : "rgba(52,67,94,0.02)", borderRadius:14, border:a.u ? "1px solid rgba(52,67,94,0.05)" : "1px solid rgba(52,67,94,0.03)", opacity:a.u ? 1 : 0.5 }}>
            <div style={{ width:42, height:42, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, background:a.u ? t.accentLight : "rgba(52,67,94,0.05)" }}>{a.i}</div>
            <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600, color:t.text }}>{a.n}</div><div style={{ fontSize:11, color:t.textSec, marginTop:2 }}>{a.d}</div></div>
            {a.u && <div style={{ color:t.accent }}><I.Chk/></div>}
          </div>
        ))}
      </div>

      {/* 重播收藏冥想的彈窗 */}
      {playHerb && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(20,26,40,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={() => setPlayHerb(null)}>
          <div style={{ width:"100%", maxWidth:440, maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
              <button onClick={() => setPlayHerb(null)} style={{ background:"rgba(255,255,255,0.9)", border:"none", borderRadius:12, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:t.text }}><I.X/></button>
            </div>
            <MedPlayer herb={playHerb} med={getDayMeditation(playHerb, today)} term={getCurrentSolarTerm(today)} stats={stats} setStats={setStats} medFavs={medFavs} setMedFavs={setMedFavs} />
          </div>
        </div>
      )}
    </div>
  );
}
