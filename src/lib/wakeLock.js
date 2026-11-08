// ============================================================
// 螢幕喚醒鎖 — 冥想進行中避免手機自動鎖屏
// （鎖屏後 Safari/Chrome 會暫停 Web Audio 音景與計時器，只剩 mp3 人聲）
// iOS 16.4+ / Android Chrome 支援；不支援的環境靜默略過。
// ============================================================
let lock = null;
let wanted = false;

async function request() {
  if (!wanted || lock || typeof navigator === "undefined" || !navigator.wakeLock) return;
  try {
    lock = await navigator.wakeLock.request("screen");
    lock.addEventListener("release", () => { lock = null; });
  } catch { /* 低電量模式或頁面不在前景時會被拒絕，略過即可 */ }
}

export function keepAwake() { wanted = true; request(); }

export function releaseAwake() {
  wanted = false;
  try { lock?.release(); } catch { /* */ }
  lock = null;
}

// 切回前景時重新上鎖（系統會在頁面退到背景時自動釋放）
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") request(); });
}
