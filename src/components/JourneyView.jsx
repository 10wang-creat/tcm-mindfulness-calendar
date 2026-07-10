import { useTheme } from "../theme.js";
import { HERBS, getRarity } from "../data/herbs.js";
import { I } from "./Icons.jsx";

const LEVEL_NAMES = ["初學者", "入門者", "修習者", "靜心者", "覺察者", "內觀者", "明心者", "養生者", "通達者", "大師"];

export default function JourneyView({ stats, collected }) {
  const t = useTheme();
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
      <div style={{ padding:"20px 0 16px" }}><h1 className="font-serif-tc" style={{ fontSize:24, fontWeight:700, color:t.text }}>我的旅程</h1></div>
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
    </div>
  );
}
