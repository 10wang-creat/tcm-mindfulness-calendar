import { createContext, useContext } from "react";

// ============================================================
// THEME — 夏季型冷柔色盤，四季變奏
// 春=薄荷綠 · 夏=霧藍 · 秋=薰衣草 · 冬=藏藍灰
// 鼠尾草綠為全年品牌錨色（sub），文字統一藏藍
// ============================================================

export const BRAND = {
  navy: "#34435E",       // 藏藍（錨色・文字）
  sage: "#6E967F",       // 鼠尾草綠（品牌錨・全年不變）
  sageLight: "#E6EFE9",
  lavender: "#BBADD8",   // 薰衣草
  wisteria: "#8981C2",   // 紫藤
  mist: "#AAC9E8",       // 霧藍
  sea: "#6D93C8",        // 海藍
  mint: "#A9D7BC",       // 薄荷
  pearl: "#F0EEF3",      // 珍珠白
  silver: "#C3CBD8",     // 銀（取代金）
};

export const THEMES = {
  spring: {
    name: "春", key: "spring",
    bg: "#F2F6F3", card: "#FFFFFF",
    accent: "#5C8672", accentLight: "#E3F1E9",
    text: BRAND.navy, textSec: "#66788A",
    sub: BRAND.sage, subLight: BRAND.sageLight,
    gradient: "linear-gradient(135deg, #E3F1E9 0%, #EAF2F6 100%)",
    headerBg: "linear-gradient(180deg, #DCEDE3 0%, #F2F6F3 100%)",
  },
  summer: {
    name: "夏", key: "summer",
    bg: "#F0F4F9", card: "#FFFFFF",
    accent: "#5B84BC", accentLight: "#E4EDF8",
    text: BRAND.navy, textSec: "#66788A",
    sub: BRAND.sage, subLight: BRAND.sageLight,
    gradient: "linear-gradient(135deg, #E4EDF8 0%, #EDF0F8 100%)",
    headerBg: "linear-gradient(180deg, #D7E5F4 0%, #F0F4F9 100%)",
  },
  autumn: {
    name: "秋", key: "autumn",
    bg: "#F3F2F7", card: "#FFFFFF",
    accent: "#7C73B8", accentLight: "#ECE9F6",
    text: BRAND.navy, textSec: "#66788A",
    sub: BRAND.sage, subLight: BRAND.sageLight,
    gradient: "linear-gradient(135deg, #ECE9F6 0%, #F2ECF3 100%)",
    headerBg: "linear-gradient(180deg, #E2DEF1 0%, #F3F2F7 100%)",
  },
  winter: {
    name: "冬", key: "winter",
    bg: "#F0F2F5", card: "#FFFFFF",
    accent: "#4C5F82", accentLight: "#E3E8F0",
    text: BRAND.navy, textSec: "#66788A",
    sub: BRAND.sage, subLight: BRAND.sageLight,
    gradient: "linear-gradient(135deg, #E3E8F0 0%, #EAEAF3 100%)",
    headerBg: "linear-gradient(180deg, #D9DFEA 0%, #F0F2F5 100%)",
  },
};

export function getSeason(d) {
  const m = d.getMonth();
  if (m >= 1 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

// Context — 全站共用，不再一層層傳 t
const ThemeContext = createContext(THEMES.summer);
export const ThemeProvider = ThemeContext.Provider;
export function useTheme() { return useContext(ThemeContext); }
