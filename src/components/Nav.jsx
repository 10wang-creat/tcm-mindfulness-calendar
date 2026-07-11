import { useTheme } from "../theme.js";
import { I } from "./Icons.jsx";

const TABS = [
  { id: "today", label: "今日", icon: I.Home },
  { id: "calendar", label: "日曆", icon: I.Cal },
  { id: "herbs", label: "本草", icon: I.Leaf },
  { id: "journey", label: "旅程", icon: I.User },
];

export default function Nav({ view, setView }) {
  const t = useTheme();
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:t.dark ? "rgba(18,21,28,0.92)" : "rgba(255,255,255,0.92)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderTop:`1px solid ${t.dark ? "rgba(180,195,225,0.12)" : "rgba(52,67,94,0.08)"}`, zIndex:100, display:"flex", justifyContent:"center", padding:"0 0 env(safe-area-inset-bottom)" }}>
      <div style={{ display:"flex", maxWidth:420, width:"100%", justifyContent:"space-around" }}>
        {TABS.map(tb => {
          const a = view === tb.id;
          return (
            <button key={tb.id} onClick={() => setView(tb.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:a ? t.accent : t.textSec, transition:"all 0.2s", opacity:a ? 1 : 0.6 }}>
              <tb.icon /><span style={{ fontSize:10, fontWeight:a ? 600 : 400, letterSpacing:"0.05em" }}>{tb.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
