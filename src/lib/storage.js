// localStorage 持久化 + 日期工具
export function ld(k, d) {
  try { const v = localStorage.getItem("tcm_" + k); return v ? JSON.parse(v) : d; } catch { return d; }
}
export function sv(k, v) {
  try { localStorage.setItem("tcm_" + k, JSON.stringify(v)); } catch { /* ignore */ }
}
export function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
