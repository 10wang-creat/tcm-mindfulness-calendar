import { HERB_QUOTES, getRarityCfg, herbImg } from "../data/herbs.js";
import { SOLAR_TERM_QUOTES, SOLAR_TERM_CUSTOMS, solarTermImg } from "../data/solarTerms.js";

// ============================================================
// 分享圖卡與桌布產生器 — 夏季冷柔色盤
// 藏藍文字 / 銀色框線 / 珍珠白底，四季各配冷調底色
// ============================================================
const C = {
  text: "#34435E",       // 藏藍
  textSoft: "#4A5B7C",
  textSec: "#5E6E85",
  brand: "#9AA5B5",      // 品牌落款
  border: "#B7C0CE",     // 銀（外框）
  borderInner: "#D3D9E2",// 銀（內框）
  sage: "#6E967F",       // 鼠尾草綠（茶飲等草本強調）
};
const SEASON_BG = { spring: "#EFF5F0", summer: "#EAF1F9", autumn: "#F1EFF7", winter: "#EBEEF3" };
const SEASON_GRADS = {
  spring: ["#EFF5F0", "#E3F1E9", "#D3E6DB"],
  summer: ["#EFF4FA", "#E0EBF7", "#CFE0F1"],
  autumn: ["#F3F1F8", "#E9E5F4", "#DCD6ED"],
  winter: ["#EFF1F5", "#E1E6EF", "#D2D9E6"],
};

async function shareOrDownload(canvas, filename, title, text) {
  try {
    const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title, text, files: [file] });
      return;
    }
  } catch (e) {
    if (e.name === "AbortError") return;
  }
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawFrame(ctx) {
  ctx.strokeStyle = C.border; ctx.lineWidth = 3; ctx.strokeRect(40, 40, 1000, 1360);
  ctx.strokeStyle = C.borderInner; ctx.lineWidth = 1; ctx.strokeRect(52, 52, 976, 1336);
}

// ── 藥材分享圖卡 ──
export function generateShareCard(herb, canvasRef) {
  const canvas = canvasRef.current; if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = 1080; canvas.height = 1440;
  ctx.fillStyle = "#F0EEF3"; ctx.fillRect(0, 0, 1080, 1440);
  drawFrame(ctx);
  const rc = getRarityCfg(herb.id);
  ctx.textAlign = "right"; ctx.fillStyle = rc.color; ctx.font = "20px sans-serif";
  ctx.fillText("★".repeat(rc.stars) + " " + rc.label, 990, 85);

  const img = new Image(); img.crossOrigin = "anonymous";
  img.onload = () => {
    ctx.save(); ctx.shadowColor = "rgba(52,67,94,0.14)"; ctx.shadowBlur = 24;
    ctx.drawImage(img, 140, 70, 800, 800); ctx.restore();
    let y = 1000;
    ctx.textAlign = "center";
    ctx.font = "36px sans-serif"; ctx.fillStyle = C.text;
    ctx.fillText(`性味：${herb.nature}性 / ${herb.taste}`, 540, y); y += 56;
    ctx.fillText(`歸經：${herb.meridian}`, 540, y); y += 56;
    ctx.fillText(`功效：${herb.effect}`, 540, y); y += 62;
    const hq = HERB_QUOTES[herb.id] || herb.effect;
    ctx.fillStyle = C.textSoft; ctx.font = "italic 34px Georgia, serif";
    ctx.fillText(`「${hq}」`, 540, y); y += 60;
    ctx.fillStyle = C.brand; ctx.font = "20px sans-serif";
    ctx.fillText("— 本草圖鑑 TCM Herb Collection —", 540, y);
    shareOrDownload(canvas, `${herb.name}_${herb.pinyin}_card.png`, `${herb.name} 藥材卡片`, `${herb.name}（${herb.pinyin}）\n「${hq}」\n#本草圖鑑 #中醫養生`);
  };
  img.onerror = () => {
    ctx.fillStyle = "#DDE2EA"; ctx.fillRect(165, 150, 750, 750);
    ctx.fillStyle = C.textSec; ctx.textAlign = "center"; ctx.font = "80px serif"; ctx.fillText(herb.name, 540, 560);
    ctx.font = "26px serif"; ctx.fillStyle = C.textSoft;
    ctx.fillText(`功效：${herb.effect}`, 540, 920);
    ctx.fillStyle = C.brand; ctx.font = "20px sans-serif";
    ctx.fillText("— 本草圖鑑 TCM Herb Collection —", 540, 1350);
    shareOrDownload(canvas, `${herb.name}_card.png`, `${herb.name} 藥材卡片`, `${herb.name} — ${herb.effect}`);
  };
  img.src = herbImg(herb);
}

// ── 節氣分享圖卡 ──
export function generateSolarTermCard(term, canvasRef) {
  const canvas = canvasRef.current; if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = 1080; canvas.height = 1440;
  ctx.fillStyle = SEASON_BG[term.season] || "#F0EEF3"; ctx.fillRect(0, 0, 1080, 1440);
  drawFrame(ctx);
  ctx.textAlign = "center";
  const img = new Image(); img.crossOrigin = "anonymous";
  img.onload = () => {
    ctx.save(); ctx.shadowColor = "rgba(52,67,94,0.12)"; ctx.shadowBlur = 24;
    ctx.drawImage(img, 140, 70, 800, 800); ctx.restore();
    const tq = SOLAR_TERM_QUOTES[term.name] || term.theme;
    const tc = SOLAR_TERM_CUSTOMS[term.name];
    ctx.textAlign = "center";
    let y = 1030;
    if (tc) {
      ctx.font = "44px sans-serif"; ctx.fillStyle = C.text;
      ctx.fillText("習俗：" + tc.customs.join("、"), 540, y); y += 72;
      ctx.font = "44px sans-serif"; ctx.fillStyle = C.sage;
      ctx.fillText("推薦茶飲：" + tc.tea, 540, y); y += 76;
    }
    ctx.fillStyle = C.textSoft; ctx.font = "italic 40px Georgia, serif";
    ctx.fillText(`「${tq}」`, 540, y); y += 68;
    ctx.fillStyle = C.brand; ctx.font = "20px sans-serif";
    ctx.fillText("— 本草圖鑑 · 二十四節氣 —", 540, y);
    const shareText = tc
      ? `${term.icon} ${term.name}\n「${tq}」\n習俗：${tc.customs.join("、")}\n推薦茶飲：${tc.tea}\n#二十四節氣 #本草圖鑑 #節氣養生`
      : `${term.icon} ${term.name}\n「${tq}」\n#二十四節氣 #本草圖鑑 #節氣養生`;
    shareOrDownload(canvas, `${term.name}_節氣圖卡.png`, `${term.name} 節氣圖卡`, shareText);
  };
  img.onerror = () => {
    ctx.font = "160px serif"; ctx.fillStyle = C.borderInner; ctx.textAlign = "center"; ctx.fillText(term.icon, 540, 700);
    ctx.fillStyle = C.brand; ctx.font = "20px sans-serif"; ctx.fillText("— 本草圖鑑 · 二十四節氣 —", 540, 1350);
    shareOrDownload(canvas, `${term.name}_節氣圖卡.png`, `${term.name} 節氣圖卡`, `${term.icon} ${term.name} — ${term.theme}`);
  };
  img.src = solarTermImg(term.name);
}

// ── 節氣桌布 ──
export function generateSolarTermWallpaper(term, size, canvasRef) {
  const canvas = canvasRef.current; if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = size === "phone" ? 1170 : 2560; const h = size === "phone" ? 2532 : 1440;
  canvas.width = w; canvas.height = h;
  const colors = SEASON_GRADS[term.season] || SEASON_GRADS.spring;
  const grad = ctx.createRadialGradient(w / 2, h * 0.4, 100, w / 2, h / 2, w * 0.8);
  grad.addColorStop(0, colors[0]); grad.addColorStop(0.5, colors[1]); grad.addColorStop(1, colors[2]);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(94,110,133,0.05)"; ctx.lineWidth = 1;
  for (let i = 0; i < h; i += 4) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
  const img = new Image(); img.crossOrigin = "anonymous";
  img.onload = () => {
    const imgSize = size === "phone" ? 800 : 700;
    const ix = (w - imgSize) / 2; const iy = size === "phone" ? h * 0.2 : (h - imgSize) / 2 - 60;
    ctx.save(); ctx.globalAlpha = 0.92; ctx.drawImage(img, ix, iy, imgSize, imgSize); ctx.restore();
    const nameY = size === "phone" ? h * 0.7 : h * 0.82;
    ctx.textAlign = "center"; ctx.fillStyle = C.text;
    ctx.font = `bold ${size === "phone" ? 80 : 64}px serif`; ctx.fillText(term.name, w / 2, nameY);
    ctx.font = `${size === "phone" ? 32 : 26}px serif`; ctx.fillStyle = C.textSoft;
    ctx.fillText(term.theme, w / 2, nameY + (size === "phone" ? 55 : 45));
    ctx.font = `${size === "phone" ? 24 : 20}px serif`; ctx.fillStyle = C.textSec;
    ctx.fillText(term.date, w / 2, nameY + (size === "phone" ? 95 : 80));
    const twq = SOLAR_TERM_QUOTES[term.name] || term.theme;
    ctx.font = `italic ${size === "phone" ? 22 : 18}px Georgia, serif`; ctx.fillStyle = C.textSoft;
    ctx.fillText(`「${twq}」`, w / 2, nameY + (size === "phone" ? 135 : 110));
    shareOrDownload(canvas, `${term.name}_wallpaper_${size}.png`, `${term.name} 節氣桌布`, `${term.icon} ${term.name}\n「${twq}」\n#二十四節氣 #節氣桌布`);
  };
  img.onerror = () => {
    ctx.textAlign = "center"; ctx.fillStyle = C.text; ctx.font = "bold 120px serif"; ctx.fillText(term.name, w / 2, h * 0.45);
    ctx.font = "40px serif"; ctx.fillStyle = C.textSoft; ctx.fillText(term.theme, w / 2, h * 0.45 + 70);
    shareOrDownload(canvas, `${term.name}_wallpaper_${size}.png`, `${term.name} 節氣桌布`, `${term.name} — ${term.theme}`);
  };
  img.src = solarTermImg(term.name);
}

// ── 藥材桌布 ──
export function generateWallpaper(herb, size, canvasRef) {
  const canvas = canvasRef.current; if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = size === "phone" ? 1170 : 2560; const h = size === "phone" ? 2532 : 1440;
  canvas.width = w; canvas.height = h;
  const grad = ctx.createRadialGradient(w / 2, h * 0.4, 100, w / 2, h / 2, w * 0.8);
  grad.addColorStop(0, "#F2F4F8"); grad.addColorStop(0.5, "#E5EAF2"); grad.addColorStop(1, "#D6DEEA");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(94,110,133,0.06)"; ctx.lineWidth = 1;
  for (let i = 0; i < h; i += 4) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

  const img = new Image(); img.crossOrigin = "anonymous";
  img.onload = () => {
    const imgSize = size === "phone" ? 700 : 600;
    const ix = (w - imgSize) / 2; const iy = size === "phone" ? h * 0.25 : (h - imgSize) / 2 - 40;
    ctx.save(); ctx.globalAlpha = 0.9; ctx.drawImage(img, ix, iy, imgSize, imgSize); ctx.restore();
    const nameY = size === "phone" ? h * 0.72 : h * 0.85;
    ctx.textAlign = "center"; ctx.fillStyle = C.text; ctx.font = `bold ${size === "phone" ? 72 : 56}px serif`; ctx.fillText(herb.name, w / 2, nameY);
    ctx.font = `italic ${size === "phone" ? 28 : 22}px Georgia, serif`; ctx.fillStyle = C.textSec; ctx.fillText(herb.pinyin, w / 2, nameY + (size === "phone" ? 50 : 40));
    ctx.font = `${size === "phone" ? 24 : 20}px serif`; ctx.fillStyle = C.textSec; ctx.fillText(herb.effect, w / 2, nameY + (size === "phone" ? 95 : 75));
    const hwq = HERB_QUOTES[herb.id] || herb.effect;
    ctx.font = `italic ${size === "phone" ? 22 : 18}px Georgia, serif`; ctx.fillStyle = C.textSoft;
    ctx.fillText(`「${hwq}」`, w / 2, nameY + (size === "phone" ? 135 : 105));
    shareOrDownload(canvas, `${herb.name}_wallpaper_${size}.png`, `${herb.name} 藥材桌布`, `${herb.name}\n「${hwq}」\n#本草圖鑑 #藥材桌布`);
  };
  img.onerror = () => {
    const nameY = h * 0.45; ctx.textAlign = "center"; ctx.fillStyle = C.text; ctx.font = "bold 96px serif"; ctx.fillText(herb.name, w / 2, nameY);
    ctx.font = "italic 32px Georgia, serif"; ctx.fillStyle = C.textSec; ctx.fillText(herb.pinyin, w / 2, nameY + 60);
    shareOrDownload(canvas, `${herb.name}_wallpaper_${size}.png`, `${herb.name} 藥材桌布`, `${herb.name} — ${herb.pinyin}`);
  };
  img.src = herbImg(herb);
}
