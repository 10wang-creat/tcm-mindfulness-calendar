import { useState, useRef } from "react";
import { THEMES, getSeason, ThemeProvider } from "./theme.js";
import { ld } from "./lib/storage.js";
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
  const canvasRef = useRef(null);
  const t = THEMES[getSeason(new Date())];

  return (
    <ThemeProvider value={t}>
      <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Noto Serif TC','Noto Sans TC','Hiragino Sans','Microsoft YaHei',serif" }}>
        <canvas ref={canvasRef} style={{ display:"none" }} />
        <div style={{ maxWidth:480, margin:"0 auto", padding:"8px 16px", minHeight:"100vh" }}>
          {view === "today" && <TodayView stats={stats} setStats={setStats} collected={collected} setCollected={setCollected} medFavs={medFavs} setMedFavs={setMedFavs} canvasRef={canvasRef}/>}
          {view === "calendar" && <CalendarView stats={stats} canvasRef={canvasRef}/>}
          {view === "herbs" && <HerbsView collected={collected} setCollected={setCollected} canvasRef={canvasRef}/>}
          {view === "journey" && <JourneyView stats={stats} setStats={setStats} collected={collected} medFavs={medFavs} setMedFavs={setMedFavs}/>}
        </div>
        <Nav view={view} setView={setView}/>
      </div>
    </ThemeProvider>
  );
}
