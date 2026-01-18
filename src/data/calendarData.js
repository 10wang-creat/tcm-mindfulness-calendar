// 2026 中藥正念日曆 - 行事曆資料
// 從 calendar_2026_complete.json 轉換

export const metadata = {
  year: 2026,
  title: "2026 中藥正念日曆",
  subtitle: "Traditional Chinese Medicine Mindfulness Calendar",
  version: "1.0.0",
  totalDays: 365,
  totalHerbs: 54,
  description: "結合傳統中藥智慧與正念冥想的全年日曆，每日一藥一冥想，跟隨二十四節氣養生"
};

export const herbsDatabase = [
  { id: 1, name: "人參", effect: "大補元氣" },
  { id: 2, name: "黃耆", effect: "補氣固表" },
  { id: 3, name: "當歸", effect: "補血活血" },
  { id: 4, name: "枸杞", effect: "滋補肝腎" },
  { id: 5, name: "紅棗", effect: "補中益氣" },
  { id: 6, name: "茯苓", effect: "健脾寧心" },
  { id: 7, name: "白朮", effect: "健脾益氣" },
  { id: 8, name: "甘草", effect: "調和諸藥" },
  { id: 9, name: "生薑", effect: "溫中散寒" },
  { id: 10, name: "肉桂", effect: "溫補命門" },
  { id: 11, name: "附子", effect: "回陽救逆" },
  { id: 12, name: "乾薑", effect: "溫中暖脾" },
  { id: 13, name: "陳皮", effect: "理氣健脾" },
  { id: 14, name: "半夏", effect: "化痰降逆" },
  { id: 15, name: "麥門冬", effect: "滋陰潤燥" },
  { id: 16, name: "五味子", effect: "斂肺滋腎" },
  { id: 17, name: "山藥", effect: "補脾養胃" },
  { id: 18, name: "蓮子", effect: "養心安神" },
  { id: 19, name: "芡實", effect: "固腎益精" },
  { id: 20, name: "龍眼肉", effect: "養血安神" },
  { id: 21, name: "酸棗仁", effect: "安神助眠" },
  { id: 22, name: "遠志", effect: "開心益智" },
  { id: 23, name: "柏子仁", effect: "養心安神" },
  { id: 24, name: "合歡皮", effect: "解鬱安神" },
  { id: 25, name: "夜交藤", effect: "養血安神" },
  { id: 26, name: "天麻", effect: "息風止眩" },
  { id: 27, name: "鉤藤", effect: "清熱平肝" },
  { id: 28, name: "石決明", effect: "平肝明目" },
  { id: 29, name: "珍珠母", effect: "安神定驚" },
  { id: 30, name: "龍骨", effect: "鎮靜安神" },
  { id: 31, name: "牡蠣", effect: "收斂固澀" },
  { id: 32, name: "代赭石", effect: "重鎮降逆" },
  { id: 33, name: "磁石", effect: "鎮心安神" },
  { id: 34, name: "琥珀", effect: "安神定志" },
  { id: 35, name: "柴胡", effect: "疏肝解鬱" },
  { id: 36, name: "香附", effect: "理氣解鬱" },
  { id: 37, name: "川芎", effect: "行氣活血" },
  { id: 38, name: "丹參", effect: "活血養心" },
  { id: 39, name: "紅花", effect: "活血祛瘀" },
  { id: 40, name: "桃仁", effect: "活血祛瘀" },
  { id: 41, name: "益母草", effect: "活血調經" },
  { id: 42, name: "雞血藤", effect: "補血活絡" },
  { id: 43, name: "延胡索", effect: "活血止痛" },
  { id: 44, name: "鬱金", effect: "行氣解鬱" },
  { id: 45, name: "薑黃", effect: "活血行氣" },
  { id: 46, name: "三七", effect: "化瘀止血" },
  { id: 47, name: "蒲黃", effect: "活血止血" },
  { id: 48, name: "五靈脂", effect: "活血止痛" },
  { id: 49, name: "茵陳", effect: "清利濕熱" },
  { id: 50, name: "金錢草", effect: "清熱利濕" },
  { id: 51, name: "車前草", effect: "清熱利尿" },
  { id: 52, name: "澤瀉", effect: "利水滲濕" },
  { id: 53, name: "薏苡仁", effect: "健脾祛濕" },
  { id: 54, name: "滑石", effect: "清熱利濕" }
];

export const solarTerms = [
  { name: "小寒", date: "2026-01-05", season: "冬" },
  { name: "大寒", date: "2026-01-20", season: "冬" },
  { name: "立春", date: "2026-02-04", season: "春" },
  { name: "雨水", date: "2026-02-19", season: "春" },
  { name: "驚蟄", date: "2026-03-05", season: "春" },
  { name: "春分", date: "2026-03-20", season: "春" },
  { name: "清明", date: "2026-04-04", season: "春" },
  { name: "穀雨", date: "2026-04-20", season: "春" },
  { name: "立夏", date: "2026-05-05", season: "夏" },
  { name: "小滿", date: "2026-05-21", season: "夏" },
  { name: "芒種", date: "2026-06-05", season: "夏" },
  { name: "夏至", date: "2026-06-21", season: "夏" },
  { name: "小暑", date: "2026-07-07", season: "夏" },
  { name: "大暑", date: "2026-07-22", season: "夏" },
  { name: "立秋", date: "2026-08-07", season: "秋" },
  { name: "處暑", date: "2026-08-23", season: "秋" },
  { name: "白露", date: "2026-09-07", season: "秋" },
  { name: "秋分", date: "2026-09-23", season: "秋" },
  { name: "寒露", date: "2026-10-08", season: "秋" },
  { name: "霜降", date: "2026-10-23", season: "秋" },
  { name: "立冬", date: "2026-11-07", season: "冬" },
  { name: "小雪", date: "2026-11-22", season: "冬" },
  { name: "大雪", date: "2026-12-07", season: "冬" },
  { name: "冬至", date: "2026-12-21", season: "冬" }
];

// 節氣圖片映射
export const solarTermImages = {
  "小寒": "./solar-terms/23_xiaohan_小寒.png",
  "大寒": "./solar-terms/24_dahan_大寒.png",
  "立春": "./solar-terms/01_lichun_立春.png",
  "雨水": "./solar-terms/02_yushui_雨水.png",
  "驚蟄": "./solar-terms/03_jingzhe_驚蟄.png",
  "春分": "./solar-terms/04_chunfen_春分.png",
  "清明": "./solar-terms/05_qingming_清明.png",
  "穀雨": "./solar-terms/06_guyu_穀雨.png",
  "立夏": "./solar-terms/07_lixia_立夏.png",
  "小滿": "./solar-terms/08_xiaoman_小滿.png",
  "芒種": "./solar-terms/09_mangzhong_芒種.png",
  "夏至": "./solar-terms/10_xiazhi_夏至.png",
  "小暑": "./solar-terms/11_xiaoshu_小暑.png",
  "大暑": "./solar-terms/12_dashu_大暑.png",
  "立秋": "./solar-terms/13_liqiu_立秋.png",
  "處暑": "./solar-terms/14_chushu_處暑.png",
  "白露": "./solar-terms/15_bailu_白露.png",
  "秋分": "./solar-terms/16_qiufen_秋分.png",
  "寒露": "./solar-terms/17_hanlu_寒露.png",
  "霜降": "./solar-terms/18_shuangjiang_霜降.png",
  "立冬": "./solar-terms/19_lidong_立冬.png",
  "小雪": "./solar-terms/20_xiaoxue_小雪.png",
  "大雪": "./solar-terms/21_daxue_大雪.png",
  "冬至": "./solar-terms/22_dongzhi_冬至.png"
};

// 取得節氣圖片路徑
export function getSolarTermImage(termName) {
  return solarTermImages[termName] || null;
}

// 節氣對應的養生主題
export const solarTermThemes = {
  "小寒": { theme: "藏精養腎", color: "#4A5568" },
  "大寒": { theme: "溫補禦寒", color: "#2D3748" },
  "立春": { theme: "升發陽氣", color: "#68D391" },
  "雨水": { theme: "調養脾胃", color: "#9AE6B4" },
  "驚蟄": { theme: "疏肝理氣", color: "#48BB78" },
  "春分": { theme: "平調陰陽", color: "#38A169" },
  "清明": { theme: "柔肝養肺", color: "#2F855A" },
  "穀雨": { theme: "健脾祛濕", color: "#276749" },
  "立夏": { theme: "養心安神", color: "#FC8181" },
  "小滿": { theme: "清熱利濕", color: "#F56565" },
  "芒種": { theme: "清暑益氣", color: "#E53E3E" },
  "夏至": { theme: "養陰生津", color: "#C53030" },
  "小暑": { theme: "消暑寧心", color: "#9B2C2C" },
  "大暑": { theme: "清熱解暑", color: "#822727" },
  "立秋": { theme: "養陰潤燥", color: "#ED8936" },
  "處暑": { theme: "滋陰潤肺", color: "#DD6B20" },
  "白露": { theme: "養肺防燥", color: "#C05621" },
  "秋分": { theme: "平補陰陽", color: "#9C4221" },
  "寒露": { theme: "養陰防燥", color: "#7B341E" },
  "霜降": { theme: "養肺潤燥", color: "#652B19" },
  "立冬": { theme: "滋陰補腎", color: "#63B3ED" },
  "小雪": { theme: "溫腎助陽", color: "#4299E1" },
  "大雪": { theme: "溫補強身", color: "#3182CE" },
  "冬至": { theme: "養藏固本", color: "#2B6CB0" }
};

// 季節配色
export const seasonColors = {
  "春": { primary: "#48BB78", secondary: "#9AE6B4", bg: "from-green-50 to-emerald-100" },
  "夏": { primary: "#F56565", secondary: "#FC8181", bg: "from-red-50 to-orange-100" },
  "秋": { primary: "#ED8936", secondary: "#F6AD55", bg: "from-orange-50 to-amber-100" },
  "冬": { primary: "#4299E1", secondary: "#63B3ED", bg: "from-blue-50 to-cyan-100" }
};

// 取得指定日期的藥材（循環54種藥材）
export function getHerbForDate(date) {
  const startOfYear = new Date(2026, 0, 1);
  const targetDate = new Date(date);
  const dayOfYear = Math.floor((targetDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
  const herbIndex = ((dayOfYear - 1) % 54);
  return herbsDatabase[herbIndex];
}

// 取得指定日期所屬的節氣
export function getSolarTermForDate(date) {
  const targetDate = new Date(date);
  
  // 找出最接近且不超過目標日期的節氣
  let currentTerm = { name: "冬至", date: "2025-12-22", season: "冬" }; // 預設為前一年冬至
  
  for (let i = 0; i < solarTerms.length; i++) {
    const termDate = new Date(solarTerms[i].date);
    if (targetDate >= termDate) {
      currentTerm = solarTerms[i];
    } else {
      break;
    }
  }
  
  return currentTerm;
}

// 取得節氣主題資訊
export function getSolarTermTheme(termName) {
  return solarTermThemes[termName] || { theme: "調和身心", color: "#718096" };
}

// 取得季節配色
export function getSeasonColor(season) {
  return seasonColors[season] || seasonColors["春"];
}

// 生成冥想引導文
export function generateMeditationText(herb, solarTerm) {
  const theme = getSolarTermTheme(solarTerm.name);
  return `今日藥材：${herb.name}
功效：${herb.effect}

節氣：${solarTerm.name}
養生主題：${theme.theme}

冥想引導：
閉上眼睛，深呼吸三次。
想像${herb.name}的能量緩緩流入體內，
${herb.effect}，滋養身心。
在這${solarTerm.name}時節，
讓我們${theme.theme}，與自然和諧共處。
保持這份寧靜，感受內在的平和。`;
}

// 匯出全部
export default {
  metadata,
  herbsDatabase,
  solarTerms,
  solarTermImages,
  solarTermThemes,
  seasonColors,
  getHerbForDate,
  getSolarTermForDate,
  getSolarTermTheme,
  getSolarTermImage,
  getSeasonColor,
  generateMeditationText
};
