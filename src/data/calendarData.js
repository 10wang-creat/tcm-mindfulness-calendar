// 2026 中藥正念日曆 - 行事曆資料
// 從 calendar_2026_complete.json 轉換

export const metadata = {
  year: 2026,
  title: "2026 中藥正念日曆",
  subtitle: "Traditional Chinese Medicine Mindfulness Calendar",
  version: "1.1.0",
  totalDays: 365,
  totalHerbs: 56,
  description: "結合傳統中藥智慧與正念冥想的全年日曆，每日一藥一冥想，跟隨二十四節氣養生"
};

// 56種草藥資料庫 - 按節氣養生邏輯分類
// 冬季(1-14)：溫補腎陽、藏精固本
// 春季(15-28)：疏肝理氣、活血養血  
// 夏季(29-42)：清熱解暑、養心安神
// 秋季(43-56)：滋陰潤燥、理氣和中
export const herbsDatabase = [
  // ===== 冬季養生 - 溫補腎陽、藏精固本 =====
  { id: 1, name: "人參", effect: "大補元氣", season: "冬" },
  { id: 2, name: "黃耆", effect: "補氣固表", season: "冬" },
  { id: 3, name: "黨參", effect: "補中益氣", season: "冬" },
  { id: 4, name: "白朮", effect: "健脾益氣", season: "冬" },
  { id: 5, name: "茯苓", effect: "健脾寧心", season: "冬" },
  { id: 6, name: "山藥", effect: "補脾養胃", season: "冬" },
  { id: 7, name: "甘草", effect: "調和諸藥", season: "冬" },
  { id: 8, name: "大棗", effect: "補中益氣", season: "冬" },
  { id: 9, name: "紅棗", effect: "養血安神", season: "冬" },
  { id: 10, name: "蜂蜜", effect: "補中潤燥", season: "冬" },
  { id: 11, name: "龍骨", effect: "鎮靜安神", season: "冬" },
  { id: 12, name: "牡蠣", effect: "收斂固澀", season: "冬" },
  { id: 13, name: "磁石", effect: "鎮心安神", season: "冬" },
  { id: 14, name: "琥珀", effect: "安神定志", season: "冬" },
  // ===== 春季養生 - 疏肝理氣、活血養血 =====
  { id: 15, name: "當歸", effect: "補血活血", season: "春" },
  { id: 16, name: "白芍", effect: "養血柔肝", season: "春" },
  { id: 17, name: "川芎", effect: "行氣活血", season: "春" },
  { id: 18, name: "丹參", effect: "活血養心", season: "春" },
  { id: 19, name: "紅花", effect: "活血祛瘀", season: "春" },
  { id: 20, name: "桃仁", effect: "活血祛瘀", season: "春" },
  { id: 21, name: "益母草", effect: "活血調經", season: "春" },
  { id: 22, name: "雞血藤", effect: "補血活絡", season: "春" },
  { id: 23, name: "三七", effect: "化瘀止血", season: "春" },
  { id: 24, name: "延胡索", effect: "活血止痛", season: "春" },
  { id: 25, name: "鬱金", effect: "行氣解鬱", season: "春" },
  { id: 26, name: "薑黃", effect: "活血行氣", season: "春" },
  { id: 27, name: "香附", effect: "理氣解鬱", season: "春" },
  { id: 28, name: "枸杞", effect: "滋補肝腎", season: "春" },
  // ===== 夏季養生 - 清熱解暑、養心安神 =====
  { id: 29, name: "薄荷", effect: "疏散風熱", season: "夏" },
  { id: 30, name: "菊花", effect: "清熱明目", season: "夏" },
  { id: 31, name: "艾草", effect: "溫經止血", season: "夏" },
  { id: 32, name: "茵陳", effect: "清利濕熱", season: "夏" },
  { id: 33, name: "金錢草", effect: "清熱利濕", season: "夏" },
  { id: 34, name: "車前草", effect: "清熱利尿", season: "夏" },
  { id: 35, name: "澤瀉", effect: "利水滲濕", season: "夏" },
  { id: 36, name: "滑石", effect: "清熱利濕", season: "夏" },
  { id: 37, name: "通草", effect: "清熱利水", season: "夏" },
  { id: 38, name: "薏苡仁", effect: "健脾祛濕", season: "夏" },
  { id: 39, name: "龍眼肉", effect: "養血安神", season: "夏" },
  { id: 40, name: "酸棗仁", effect: "安神助眠", season: "夏" },
  { id: 41, name: "遠志", effect: "開心益智", season: "夏" },
  { id: 42, name: "柏子仁", effect: "養心安神", season: "夏" },
  // ===== 秋季養生 - 滋陰潤燥、理氣和中 =====
  { id: 43, name: "地黃", effect: "滋陰養血", season: "秋" },
  { id: 44, name: "阿膠", effect: "補血滋陰", season: "秋" },
  { id: 45, name: "何首烏", effect: "補肝腎益精血", season: "秋" },
  { id: 46, name: "桑椹", effect: "滋陰補血", season: "秋" },
  { id: 47, name: "合歡皮", effect: "解鬱安神", season: "秋" },
  { id: 48, name: "夜交藤", effect: "養血安神", season: "秋" },
  { id: 49, name: "珍珠母", effect: "安神定驚", season: "秋" },
  { id: 50, name: "陳皮", effect: "理氣健脾", season: "秋" },
  { id: 51, name: "青皮", effect: "疏肝破氣", season: "秋" },
  { id: 52, name: "枳實", effect: "破氣消積", season: "秋" },
  { id: 53, name: "木香", effect: "行氣止痛", season: "秋" },
  { id: 54, name: "烏藥", effect: "順氣止痛", season: "秋" },
  { id: 55, name: "沉香", effect: "行氣止痛", season: "秋" },
  { id: 56, name: "檀香", effect: "理氣和胃", season: "秋" }
];

// 藥材圖片對照表 - 56種草藥各有專屬插圖
export const herbImages = {
  // ===== 冬季養生草藥 =====
  "人參": "./herbs/04_ginseng.png",
  "黃耆": "./herbs/02_astragalus.png",
  "黨參": "./herbs/09_codonopsis.png",
  "白朮": "./herbs/10_atractylodes.png",
  "茯苓": "./herbs/53_poria.png",
  "山藥": "./herbs/11_chinese-yam.png",
  "甘草": "./herbs/06_licorice.png",
  "大棗": "./herbs/12_jujube.png",
  "紅棗": "./herbs/14_red-date.png",
  "蜂蜜": "./herbs/13_honey.png",
  "龍骨": "./herbs/26_dragon-bone.png",
  "牡蠣": "./herbs/27_oyster-shell.png",
  "磁石": "./herbs/29_magnetite.png",
  "琥珀": "./herbs/30_amber.png",
  // ===== 春季養生草藥 =====
  "當歸": "./herbs/07_angelica.png",
  "白芍": "./herbs/16_white-peony.png",
  "川芎": "./herbs/39_sichuan-lovage.png",
  "丹參": "./herbs/40_red-sage.png",
  "紅花": "./herbs/41_safflower.png",
  "桃仁": "./herbs/42_peach-kernel.png",
  "益母草": "./herbs/44_motherwort.png",
  "雞血藤": "./herbs/45_spatholobus.png",
  "三七": "./herbs/43_notoginseng.png",
  "延胡索": "./herbs/46_corydalis.png",
  "鬱金": "./herbs/47_curcuma.png",
  "薑黃": "./herbs/48_turmeric.png",
  "香附": "./herbs/35_cyperus.png",
  "枸杞": "./herbs/01_goji.png",
  // ===== 夏季養生草藥 =====
  "薄荷": "./herbs/08_mint.png",
  "菊花": "./herbs/05_chrysanthemum.png",
  "艾草": "./herbs/03_mugwort.png",
  "茵陳": "./herbs/49_artemisia.png",
  "金錢草": "./herbs/50_lysimachia.png",
  "車前草": "./herbs/51_plantain.png",
  "澤瀉": "./herbs/52_alisma.png",
  "滑石": "./herbs/55_talc.png",
  "通草": "./herbs/56_tetrapanax.png",
  "薏苡仁": "./herbs/54_coix-seed.png",
  "龍眼肉": "./herbs/18_longan.png",
  "酸棗仁": "./herbs/21_sour-jujube-seed.png",
  "遠志": "./herbs/23_polygala.png",
  "柏子仁": "./herbs/22_biota-seed.png",
  // ===== 秋季養生草藥 =====
  "地黃": "./herbs/15_rehmannia.png",
  "阿膠": "./herbs/17_ejiao.png",
  "何首烏": "./herbs/19_fo-ti.png",
  "桑椹": "./herbs/20_mulberry.png",
  "合歡皮": "./herbs/24_silk-tree-bark.png",
  "夜交藤": "./herbs/25_polygonum-vine.png",
  "珍珠母": "./herbs/28_mother-of-pearl.png",
  "陳皮": "./herbs/31_tangerine-peel.png",
  "青皮": "./herbs/32_green-tangerine-peel.png",
  "枳實": "./herbs/33_immature-bitter-orange.png",
  "木香": "./herbs/34_costus-root.png",
  "烏藥": "./herbs/36_lindera.png",
  "沉香": "./herbs/37_agarwood.png",
  "檀香": "./herbs/38_sandalwood.png"
};

// 取得藥材圖片路徑
export function getHerbImage(herbName) {
  return herbImages[herbName] || null;
}

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
  "小寒": "./solar-terms/23_xiaohan.png",
  "大寒": "./solar-terms/24_dahan.png",
  "立春": "./solar-terms/01_lichun.png",
  "雨水": "./solar-terms/02_yushui.png",
  "驚蟄": "./solar-terms/03_jingzhe.png",
  "春分": "./solar-terms/04_chunfen.png",
  "清明": "./solar-terms/05_qingming.png",
  "穀雨": "./solar-terms/06_guyu.png",
  "立夏": "./solar-terms/07_lixia.png",
  "小滿": "./solar-terms/08_xiaoman.png",
  "芒種": "./solar-terms/09_mangzhong.png",
  "夏至": "./solar-terms/10_xiazhi.png",
  "小暑": "./solar-terms/11_xiaoshu.png",
  "大暑": "./solar-terms/12_dashu.png",
  "立秋": "./solar-terms/13_liqiu.png",
  "處暑": "./solar-terms/14_chushu.png",
  "白露": "./solar-terms/15_bailu.png",
  "秋分": "./solar-terms/16_qiufen.png",
  "寒露": "./solar-terms/17_hanlu.png",
  "霜降": "./solar-terms/18_shuangjiang.png",
  "立冬": "./solar-terms/19_lidong.png",
  "小雪": "./solar-terms/20_xiaoxue.png",
  "大雪": "./solar-terms/21_daxue.png",
  "冬至": "./solar-terms/22_dongzhi.png"
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

// 草藥冥想音檔映射 - 54種草藥各有專屬冥想音檔
export const herbMeditations = {
  // ===== 冬季養生草藥 =====
  "人參": "./meditations/meditation_01_renshen.mp3",
  "黃耆": "./meditations/meditation_02_huangqi.mp3",
  "黨參": "./meditations/meditation_03_dangshen.mp3",
  "白朮": "./meditations/meditation_04_baizhu.mp3",
  "茯苓": "./meditations/meditation_05_fuling.mp3",
  "山藥": "./meditations/meditation_06_shanyao.mp3",
  "甘草": "./meditations/meditation_07_gancao.mp3",
  "大棗": "./meditations/meditation_08_dazao.mp3",
  "紅棗": "./meditations/meditation_09_hongzao.mp3",
  "蜂蜜": "./meditations/meditation_10_fengmi.mp3",
  "龍骨": "./meditations/meditation_11_longgu.mp3",
  "牡蠣": "./meditations/meditation_12_muli.mp3",
  "磁石": "./meditations/meditation_13_cishi.mp3",
  "琥珀": "./meditations/meditation_14_hupo.mp3",
  // ===== 春季養生草藥 =====
  "當歸": "./meditations/meditation_15_danggui.mp3",
  "白芍": "./meditations/meditation_16_baishao.mp3",
  "川芎": "./meditations/meditation_17_chuanxiong.mp3",
  "丹參": "./meditations/meditation_18_danshen.mp3",
  "紅花": "./meditations/meditation_19_honghua.mp3",
  "桃仁": "./meditations/meditation_20_taoren.mp3",
  "益母草": "./meditations/meditation_21_yimucao.mp3",
  "雞血藤": "./meditations/meditation_22_jixueteng.mp3",
  "三七": "./meditations/meditation_23_sanqi.mp3",
  "延胡索": "./meditations/meditation_24_yanhusuo.mp3",
  "鬱金": "./meditations/meditation_25_yujin.mp3",
  "薑黃": "./meditations/meditation_26_jianghuang.mp3",
  "香附": "./meditations/meditation_27_xiangfu.mp3",
  "枸杞": "./meditations/meditation_28_gouqi.mp3",
  // ===== 夏季養生草藥 =====
  "薄荷": "./meditations/meditation_29_bohe.mp3",
  "菊花": "./meditations/meditation_30_juhua.mp3",
  "艾草": "./meditations/meditation_31_aicao.mp3",
  "茵陳": "./meditations/meditation_32_yinchen.mp3",
  "金錢草": "./meditations/meditation_33_jinqiancao.mp3",
  "車前草": "./meditations/meditation_34_cheqiancao.mp3",
  "澤瀉": "./meditations/meditation_35_zexie.mp3",
  "滑石": "./meditations/meditation_36_huashi.mp3",
  "通草": "./meditations/meditation_37_tongcao.mp3",
  "薏苡仁": "./meditations/meditation_38_yiyiren.mp3",
  "龍眼肉": "./meditations/meditation_39_longyanrou.mp3",
  "酸棗仁": "./meditations/meditation_40_suanzaoren.mp3",
  "遠志": "./meditations/meditation_41_yuanzhi.mp3",
  "柏子仁": "./meditations/meditation_42_baiziren.mp3",
  // ===== 秋季養生草藥 =====
  "地黃": "./meditations/meditation_43_dihuang.mp3",
  "阿膠": "./meditations/meditation_44_ejiao.mp3",
  "何首烏": "./meditations/meditation_45_heshouwu.mp3",
  "桑椹": "./meditations/meditation_46_sangshen.mp3",
  "合歡皮": "./meditations/meditation_47_hehuanpi.mp3",
  "夜交藤": "./meditations/meditation_48_yejiaoteng.mp3",
  "珍珠母": "./meditations/meditation_49_zhenzhumu.mp3",
  "陳皮": "./meditations/meditation_50_chenpi.mp3",
  "青皮": "./meditations/meditation_51_qingpi.mp3",
  "枳實": "./meditations/meditation_52_zhishi.mp3",
  "木香": "./meditations/meditation_53_muxiang.mp3",
  "烏藥": "./meditations/meditation_54_wuyao.mp3"
};

// 取得草藥冥想音檔路徑
export function getHerbMeditation(herbName) {
  return herbMeditations[herbName] || null;
}

// 匯出全部
export default {
  metadata,
  herbsDatabase,
  herbImages,
  herbMeditations,
  solarTerms,
  solarTermImages,
  solarTermThemes,
  seasonColors,
  getHerbForDate,
  getSolarTermForDate,
  getSolarTermTheme,
  getSolarTermImage,
  getSeasonColor,
  getHerbImage,
  getHerbMeditation,
  generateMeditationText
};
