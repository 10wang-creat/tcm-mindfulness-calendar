import { HERBS } from "./herbs.js";
import { TERM_HERBS, getCurrentSolarTerm } from "./solarTerms.js";

// ============================================================
// 冥想引導文案（依藥材分類）
// ============================================================
export const MEDITATIONS = {
  "補氣": [
    "想像溫暖的氣從丹田升起，充盈全身。每一次呼吸，都在補充生命的能量。",
    "大地之氣從腳底緩緩上升，脾胃如同磨坊，將天地精華化為你的力量。",
    "呼吸之間，感受元氣的充盈。不急不躁，氣足則神安，神安則萬事和。",
    "如同晨曦漸漸照亮大地，補氣是緩慢而確定的過程。相信你的身體，它正在恢復。",
  ],
  "補血": [
    "血是滋養的河流。閉上眼，感受它在經脈中溫暖地流淌，到達每一個角落。",
    "紅色是生命的顏色。想像溫潤的能量從心臟出發，滋養你的五臟六腑。",
    "血養神，神安則夢穩。此刻讓自己沉入安定，每一次呼吸都在養血。",
    "如同春雨潤澤大地，補血是對身體最深的灌溉。你值得這份滋養。",
  ],
  "養心安神": [
    "心主神明。此刻，讓所有紛飛的念頭慢慢沉降，像雪花落入寧靜的湖面。",
    "在心裡點一盞燈，不需要多亮。微光足以照見安定，足以找到回家的路。",
    "想像你坐在古老的松樹下，聽風穿過枝葉。心安了，世界也就靜了。",
    "每一次心跳都是生命的節拍。不快不慢，恰到好處。信任你心臟的智慧。",
  ],
  "重鎮安神": [
    "感受身體的重量，讓自己完全沉入大地的懷抱。沉重不是負擔，是安定的力量。",
    "如同山嶽巍然不動，讓內心也找到那份磐石般的穩定。一切浮躁，終將平息。",
    "深海之下是永恆的寧靜。讓意識沉入那份深沉，遠離表面的波瀾。",
    "夜空中最亮的星，也是最安靜的。穩定你的心，像星辰一樣恆常。",
  ],
  "理氣": [
    "氣行則血行。想像一陣清風吹過身體，所有的鬱結如落葉般被輕輕帶走。",
    "肝主疏泄，讓呼吸成為疏通的河流。每一次呼氣，都放下一份堵塞。",
    "想像身體裡有無數條小路，此刻它們都在暢通。氣到了，舒暢就到了。",
    "不壓抑也不放縱，理氣是找到情緒的中道。深呼吸，讓氣自然地流動。",
  ],
  "活血化瘀": [
    "血流如河，瘀滯如石。此刻讓溫暖的能量去融化那些凝滯，恢復流動的自由。",
    "每一次心跳，都是推動血液前行的力量。感受脈搏，生命在奔流。",
    "陽光融化冰雪，溫暖化開瘀結。那些累積的疲憊與疼痛，正在慢慢消散。",
    "經絡是氣血的高速公路。此刻，每一條道路都在通暢，能量自由地到達每一處。",
  ],
  "利水滲濕": [
    "想像身體裡多餘的水氣，如晨霧般慢慢蒸發。輕盈是身體本來的狀態。",
    "雨過天晴，大地重新清爽。讓體內的濕濁也像雨後的水窪，慢慢滲入大地。",
    "溪水清澈是因為它不停流動。保持身體水液的代謝，就是保持生命的清明。",
    "輕輕地呼吸，感受身體漸漸變得通透。濕去則脾健，脾健則萬物生長。",
  ],
};

// ============================================================
// 語音引導音檔 — herb id → public/meditations/*.mp3
// （54 味有音檔；沉香 37、檀香 38 無，自動退回合成音景）
// ============================================================
const AUDIO_FILES = {
  1: "meditation_28_gouqi.mp3", 2: "meditation_02_huangqi.mp3", 3: "meditation_31_aicao.mp3",
  4: "meditation_01_renshen.mp3", 5: "meditation_30_juhua.mp3", 6: "meditation_07_gancao.mp3",
  7: "meditation_15_danggui.mp3", 8: "meditation_29_bohe.mp3", 9: "meditation_03_dangshen.mp3",
  10: "meditation_04_baizhu.mp3", 11: "meditation_06_shanyao.mp3", 12: "meditation_08_dazao.mp3",
  13: "meditation_10_fengmi.mp3", 14: "meditation_09_hongzao.mp3", 15: "meditation_43_dihuang.mp3",
  16: "meditation_16_baishao.mp3", 17: "meditation_44_ejiao.mp3", 18: "meditation_39_longyanrou.mp3",
  19: "meditation_45_heshouwu.mp3", 20: "meditation_46_sangshen.mp3", 21: "meditation_40_suanzaoren.mp3",
  22: "meditation_42_baiziren.mp3", 23: "meditation_41_yuanzhi.mp3", 24: "meditation_47_hehuanpi.mp3",
  25: "meditation_48_yejiaoteng.mp3", 26: "meditation_11_longgu.mp3", 27: "meditation_12_muli.mp3",
  28: "meditation_49_zhenzumu.mp3", 29: "meditation_13_cishi.mp3", 30: "meditation_14_hupo.mp3",
  31: "meditation_50_chenpi.mp3", 32: "meditation_51_qingpi.mp3", 33: "meditation_52_zhishi.mp3",
  34: "meditation_53_muxiang.mp3", 35: "meditation_27_xiangfu.mp3", 36: "meditation_54_wuyao.mp3",
  39: "meditation_17_chuanxiong.mp3", 40: "meditation_18_danshen.mp3", 41: "meditation_19_honghua.mp3",
  42: "meditation_20_taoren.mp3", 43: "meditation_23_sanqi.mp3", 44: "meditation_21_yimucao.mp3",
  45: "meditation_22_jixueteng.mp3", 46: "meditation_24_yanhusuo.mp3", 47: "meditation_25_yujin.mp3",
  48: "meditation_26_jianghuang.mp3", 49: "meditation_32_yinchen.mp3", 50: "meditation_33_jinqiancao.mp3",
  51: "meditation_34_cheqiancao.mp3", 52: "meditation_35_zexie.mp3", 53: "meditation_05_fuling.mp3",
  54: "meditation_38_yiyiren.mp3", 55: "meditation_36_huashi.mp3", 56: "meditation_37_tongcao.mp3",
};
// 所有藥材都備有 5 分與 10 分兩種長度版本
// 檔名規則：在原檔名 .mp3 前加 _05m / _10m，如 meditation_40_suanzaoren_10m.mp3
const AVAILABLE_LENGTHS = [5, 10];
export function meditationAudioSrc(herbId, minutes) {
  const f = AUDIO_FILES[herbId];
  if (!f) return null;
  if (minutes && AVAILABLE_LENGTHS.includes(minutes)) {
    const mm = String(minutes).padStart(2, "0");
    const base = f.replace(/\.mp3$/, "");
    return `./meditations/${base}_${mm}m.mp3`;
  }
  return `./meditations/${f}`;
}

// ============================================================
// 每日藥材與冥想文案
// ============================================================
export function getDayHerb(dateStr) {
  const term = getCurrentSolarTerm(dateStr);
  const dayOff = Math.floor((new Date(dateStr) - new Date(term.date)) / 86400000);
  const ids = TERM_HERBS[term.name] || TERM_HERBS["立春"];
  return HERBS.find(h => h.id === ids[((dayOff % ids.length) + ids.length) % ids.length]) || HERBS[0];
}

export function getDayMeditation(herb, dateStr) {
  const ms = MEDITATIONS[herb.category] || MEDITATIONS["理氣"];
  const doy = Math.floor((new Date(dateStr) - new Date(dateStr.substring(0, 4) + "-01-01")) / 86400000);
  return ms[doy % ms.length];
}
