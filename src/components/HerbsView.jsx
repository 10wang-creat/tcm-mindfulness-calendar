import { useState, useMemo } from "react";
import { useTheme, BRAND } from "../theme.js";
import { HERBS, HERB_CATEGORIES, RARITY, getRarity, getRarityCfg, herbImg } from "../data/herbs.js";
import { generateShareCard, generateWallpaper } from "../lib/shareCards.js";
import { sv } from "../lib/storage.js";
import { I } from "./Icons.jsx";
import ImmersiveMeditation from "./ImmersiveMeditation.jsx";

function abtn(bg) {
  return { display:"flex", alignItems:"center", gap:4, padding:"8px 14px", borderRadius:14, border:"none", background:bg, color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(52,67,94,0.18)" };
}

export default function HerbsView({ collected, setCollected, canvasRef }) {
  const t = useTheme();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("全部");
  const [sel, setSel] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [showWpMenu, setShowWpMenu] = useState(false);
  const [showMeditation, setShowMeditation] = useState(null);

  const filtered = useMemo(() => HERBS.filter(h => {
    const ms = !search || h.name.includes(search) || h.pinyin.toLowerCase().includes(search.toLowerCase()) || h.effect.includes(search);
    const mc = cat === "全部" || h.category === cat;
    return ms && mc;
  }), [search, cat]);

  const collectedCount = collected.length;
  const progress = Math.round((collectedCount / HERBS.length) * 100);

  const toggleCollect = (id) => {
    const n = collected.includes(id) ? collected.filter(i => i !== id) : [...collected, id];
    setCollected(n); sv("collected", n);
  };

  return (
    <div style={{ paddingBottom:90 }}>
      {showMeditation && <ImmersiveMeditation herb={showMeditation} onClose={() => setShowMeditation(null)} />}

      <div style={{ padding:"20px 0 12px" }}>
        <h1 className="font-serif-tc" style={{ fontSize:24, fontWeight:700, color:t.text, marginBottom:4 }}>本草圖鑑</h1>
        <p style={{ fontSize:13, color:t.textSec }}>收錄 {HERBS.length} 種中藥材</p>
      </div>

      {/* 收藏進度 */}
      <div style={{ background:t.card, borderRadius:16, padding:"14px 18px", marginBottom:12, border:"1px solid rgba(52,67,94,0.05)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontSize:13, color:t.textSec }}>收藏進度</span>
          <span style={{ fontSize:13, fontWeight:600, color:t.accent }}>{collectedCount} / {HERBS.length} ({progress}%)</span>
        </div>
        <div style={{ height:6, background:"rgba(52,67,94,0.05)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg, ${t.accent}, ${t.sub})`, width:`${progress}%`, transition:"width 0.5s ease" }} />
        </div>
        <div style={{ display:"flex", gap:10, marginTop:8 }}>
          {Object.entries(RARITY).map(([key, cfg]) => {
            const count = HERBS.filter(h => getRarity(h.id) === key && collected.includes(h.id)).length;
            const total = HERBS.filter(h => getRarity(h.id) === key).length;
            return <span key={key} style={{ fontSize:11, color:cfg.color }}>{"★".repeat(cfg.stars)} {cfg.label} {count}/{total}</span>;
          })}
        </div>
      </div>

      {/* 搜尋 */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:t.card, borderRadius:14, border:"1px solid rgba(52,67,94,0.07)", marginBottom:12 }}>
        <I.Search/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋藥材名稱、功效..." style={{ flex:1, border:"none", background:"none", outline:"none", fontSize:14, color:t.text, fontFamily:"inherit" }}/>
        {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:t.textSec }}><I.X/></button>}
      </div>
      <div className="no-scrollbar" style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:12, scrollbarWidth:"none" }}>
        {HERB_CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} style={{ whiteSpace:"nowrap", padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:500, flexShrink:0, background:cat === c ? t.accent : t.accentLight, color:cat === c ? "#fff" : t.accent }}>{c}</button>)}
      </div>

      {/* 卡牌格 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {filtered.map(h => {
          const isCol = collected.includes(h.id);
          const rc = getRarityCfg(h.id);
          return (
            <button key={h.id} onClick={() => { setSel(h); setFlipped(false); setShowWpMenu(false); }} style={{ background:t.card, borderRadius:16, padding:14, border:`1px solid ${isCol ? rc.color + "30" : "rgba(52,67,94,0.05)"}`, boxShadow:"0 1px 8px rgba(52,67,94,0.04)", cursor:"pointer", textAlign:"left", position:"relative", transition:"all 0.2s" }}>
              <div style={{ position:"absolute", top:8, right:8, fontSize:9, color:rc.color, letterSpacing:1 }}>{"★".repeat(rc.stars)}</div>
              {isCol && <div style={{ position:"absolute", top:8, left:8, width:18, height:18, borderRadius:"50%", background:t.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff" }}>✓</div>}
              <img src={herbImg(h)} alt={h.name} style={{ width:"100%", height:100, borderRadius:12, objectFit:"cover", background:t.accentLight, marginBottom:10, filter:isCol ? "none" : "grayscale(0.4) opacity(0.6)", transition:"filter 0.3s" }} onError={e => { e.target.style.display = "none"; }}/>
              <div className="font-serif-tc" style={{ fontSize:16, fontWeight:700, color:t.text }}>{h.name}</div>
              <div style={{ fontSize:11, color:t.textSec, marginTop:2 }}>{h.pinyin}</div>
              <div style={{ fontSize:10, marginTop:6, padding:"3px 8px", borderRadius:8, background:t.subLight, color:t.sub, display:"inline-block" }}>{h.category}</div>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && <div style={{ textAlign:"center", padding:"40px 0", color:t.textSec }}>找不到符合條件的藥材</div>}

      {/* 翻卡 Modal */}
      {sel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(14,18,32,0.55)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"tcmFI 0.2s ease" }} onClick={() => setSel(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:400 }}>
            <div style={{ perspective:1000, minHeight:440 }}>
              <div style={{ position:"relative", transformStyle:"preserve-3d", transform:flipped ? "rotateY(180deg)" : "rotateY(0)", transition:"transform 0.6s cubic-bezier(0.4,0,0.2,1)", minHeight:440 }}>
                {/* 正面 */}
                <div style={{ position:"absolute", width:"100%", minHeight:440, backfaceVisibility:"hidden", background:t.bg, borderRadius:24, overflow:"hidden", border:`2px solid ${getRarityCfg(sel.id).color}40`, boxShadow:"0 16px 48px rgba(14,18,32,0.3)" }}>
                  <div style={{ height:4, background:`linear-gradient(90deg, transparent, ${getRarityCfg(sel.id).color}, transparent)` }} />
                  <div style={{ padding:"20px 24px 24px", textAlign:"center" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ fontSize:12, color:getRarityCfg(sel.id).color, letterSpacing:2 }}>{"★".repeat(getRarityCfg(sel.id).stars)} {getRarityCfg(sel.id).label}</span>
                      <span style={{ fontSize:11, color:t.textSec, background:"rgba(52,67,94,0.05)", borderRadius:12, padding:"3px 10px" }}>{sel.category}</span>
                    </div>
                    <h2 className="font-serif-tc" style={{ fontSize:32, fontWeight:700, letterSpacing:6, margin:"0 0 4px", color:t.text }}>{sel.name}</h2>
                    <p style={{ fontSize:13, color:t.textSec, fontStyle:"italic", margin:"0 0 16px" }}>{sel.pinyin}</p>
                    <div style={{ width:200, height:200, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(52,67,94,0.03)", borderRadius:20 }}>
                      <img src={herbImg(sel)} alt={sel.name} style={{ width:"88%", height:"88%", objectFit:"contain" }} onError={e => { e.target.style.display = "none"; }} />
                    </div>
                    <p style={{ fontSize:14, color:t.text, lineHeight:1.7, marginBottom:8 }}>{sel.effect}</p>
                    <div style={{ fontSize:12, color:t.textSec }}>點擊「翻轉」查看詳細資訊</div>
                  </div>
                </div>

                {/* 背面 */}
                <div style={{ position:"absolute", width:"100%", minHeight:440, backfaceVisibility:"hidden", transform:"rotateY(180deg)", background:t.bg, borderRadius:24, overflow:"hidden", border:`2px solid ${getRarityCfg(sel.id).color}40`, boxShadow:"0 16px 48px rgba(14,18,32,0.3)" }}>
                  <div style={{ height:4, background:`linear-gradient(90deg, transparent, ${getRarityCfg(sel.id).color}, transparent)` }} />
                  <div style={{ padding:"24px" }}>
                    <h3 className="font-serif-tc" style={{ fontSize:22, letterSpacing:4, margin:"0 0 20px", textAlign:"center", color:t.text }}>{sel.name} 詳細資訊</h3>
                    {[["性　味", `${sel.nature}性 / ${sel.taste}`], ["歸　經", sel.meridian], ["功　效", sel.effect], ["分　類", sel.category]].map(([label, value]) => (
                      <div key={label} style={{ display:"flex", gap:12, marginBottom:14, fontSize:14, borderBottom:"1px solid rgba(52,67,94,0.06)", paddingBottom:14 }}>
                        <span style={{ color:t.textSec, minWidth:55, fontWeight:600 }}>{label}</span>
                        <span style={{ color:t.text }}>{value}</span>
                      </div>
                    ))}
                    <p style={{ fontSize:13, color:t.text, lineHeight:1.8, marginTop:8 }}>{sel.desc}</p>
                    <div style={{ fontSize:12, color:t.textSec, textAlign:"center", marginTop:10 }}>← 點擊「翻轉」回到正面</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 卡下操作列 */}
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16, flexWrap:"wrap" }}>
              <button onClick={() => setFlipped(!flipped)} style={abtn(t.textSec)}><I.Flip/> 翻轉</button>
              <button onClick={() => toggleCollect(sel.id)} style={abtn(collected.includes(sel.id) ? "#C4708D" : BRAND.sage)}>
                {collected.includes(sel.id) ? "💔 取消" : "✓ 收藏"}
              </button>
              <button onClick={() => { setSel(null); setShowMeditation(sel); }} style={abtn("#5B84BC")}><I.Zen/> 冥想</button>
              <button onClick={() => generateShareCard(sel, canvasRef)} style={abtn(t.accent)}><I.Share/> 圖卡</button>
              <button onClick={() => setShowWpMenu(!showWpMenu)} style={abtn("#7C73B8")}><I.Download/> 桌布</button>
            </div>
            {showWpMenu && (
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:8 }}>
                <button onClick={() => { generateWallpaper(sel, "phone", canvasRef); setShowWpMenu(false); }} style={abtn("#4C5F82")}>📱 手機</button>
                <button onClick={() => { generateWallpaper(sel, "desktop", canvasRef); setShowWpMenu(false); }} style={abtn("#4C5F82")}>🖥️ 桌機</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
