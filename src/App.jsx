import { useState, useRef } from "react";
import { getSeason, ThemeProvider, makeTheme } from "./theme.js";
import { ld, sv, fmtDate } from "./lib/storage.js";
import Nav from "./components/Nav.jsx";
import TodayView from "./components/TodayView.jsx";
import CalendarView from "./components/CalendarView.jsx";
import HerbsView from "./components/HerbsView.jsx";
import JourneyView from "./components/JourneyView.jsx";

// ============================================================
// App 殼 — 只負責 view 切換、全域狀態、主題供應
// 資料在 src/data/，工具在 src/lib/，畫面在 src/components/
// ============================================================
export default function App() {
  const [view, setView] = useState("today");
  const [stats, setStats] = useState(() => ld("stats", { totalDays:0, totalMinutes:0, streak:0, lastDate:null, herbsExplored:[], meditatedDates:[] }));
  const [collected, setCollected] = useState(() => ld("collected", []));
  const [medFavs, setMedFavs] = useState(() => ld("medFavs", []));
  const [todayDate, setTodayDate] = useState(fmtDate(new Date()));
  const [dark, setDark] = useState(() => {
    const saved = ld("darkMode", null);
    if (saved === null) { const h = new Date().getHours(); return h >= 19 || h < 6; }  // 預設：晚間自動深色
    return saved;
  });
  const toggleDark = () => { const n = !dark; setDark(n); sv("darkMode", n); };
  const canvasRef = useRef(null);
  const t = makeTheme(getSeason(new Date()), dark);

  // 日曆點某天 → 跳到今日頁看那天
  const goToDate = (ds) => { setTodayDate(ds); setView("today"); };

  return (
    <ThemeProvider value={t}>
      <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Noto Serif TC','Noto Sans TC','Hiragino Sans','Microsoft YaHei',serif", transition:"background 0.4s ease" }}>
        <canvas ref={canvasRef} style={{ display:"none" }} />
        <div style={{ maxWidth:480, margin:"0 auto", padding:"8px 16px", minHeight:"100vh" }}>
          {view === "today" && <TodayView stats={stats} setStats={setStats} collected={collected} setCollected={setCollected} medFavs={medFavs} setMedFavs={setMedFavs} dateStr={todayDate} setDateStr={setTodayDate} canvasRef={canvasRef}/>}
          {view === "calendar" && <CalendarView stats={stats} canvasRef={canvasRef} goToDate={goToDate}/>}
          {view === "herbs" && <HerbsView collected={collected} setCollected={setCollected} canvasRef={canvasRef}/>}
          {view === "journey" && <JourneyView stats={stats} setStats={setStats} collected={collected} medFavs={medFavs} setMedFavs={setMedFavs} dark={dark} toggleDark={toggleDark}/>}
        </div>
        <Nav view={view} setView={setView}/>
      </div>
    </ThemeProvider>
  );
}
