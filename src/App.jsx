import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ============================================================
// AUDIO ENGINE - Herb-specific meditation soundscapes
// ============================================================

class MeditationAudioEngine {
  constructor() {
    this.ctx = null;
    this.nodes = [];
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  stop() {
    this.nodes.forEach(n => {
      try { n.stop?.(); } catch(e) {}
      try { n.disconnect?.(); } catch(e) {}
    });
    this.nodes = [];
    this.isPlaying = false;
  }

  createOsc(freq, type, gain, detune = 0) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    g.gain.value = gain;
    osc.connect(g).connect(this.ctx.destination);
    osc.start();
    this.nodes.push(osc, g);
    return { osc, gain: g };
  }

  createNoise(gain) {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    src.connect(filter).connect(g).connect(this.ctx.destination);
    src.start();
    this.nodes.push(src, filter, g);
    return { src, gain: g, filter };
  }

  playSoundscape(herbCategory, season) {
    this.init();
    this.stop();
    this.isPlaying = true;

    const profiles = {
      "根莖": { baseFreq: 60, type: "sine", harmonics: [1, 1.5, 2], vol: 0.08, noiseVol: 0.01, filterFreq: 200 },
      "花": { baseFreq: 320, type: "sine", harmonics: [1, 1.25, 1.5, 2], vol: 0.04, noiseVol: 0.015, filterFreq: 800 },
      "果實": { baseFreq: 180, type: "triangle", harmonics: [1, 1.33, 2], vol: 0.05, noiseVol: 0.01, filterFreq: 500 },
      "種子": { baseFreq: 220, type: "sine", harmonics: [1, 1.5, 2, 3], vol: 0.035, noiseVol: 0.008, filterFreq: 600 },
      "葉": { baseFreq: 260, type: "sine", harmonics: [1, 1.2, 1.5], vol: 0.04, noiseVol: 0.02, filterFreq: 700 },
      "皮": { baseFreq: 110, type: "triangle", harmonics: [1, 2, 3], vol: 0.05, noiseVol: 0.012, filterFreq: 350 },
      "菌類": { baseFreq: 80, type: "sine", harmonics: [1, 1.5, 2.5], vol: 0.06, noiseVol: 0.015, filterFreq: 250 },
      "全草": { baseFreq: 200, type: "sine", harmonics: [1, 1.33, 1.67, 2], vol: 0.04, noiseVol: 0.018, filterFreq: 550 },
    };

    const seasonMod = { spring: 1.05, summer: 1.1, autumn: 0.95, winter: 0.9 };
    const mod = seasonMod[season] || 1;
    const p = profiles[herbCategory] || profiles["全草"];

    p.harmonics.forEach((h, i) => {
      const { osc, gain } = this.createOsc(
        p.baseFreq * h * mod, p.type,
        p.vol * (1 / (i + 1)),
        Math.sin(Date.now() * 0.001 + i) * 5
      );
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.02;
      lfoGain.gain.value = p.vol * 0.3;
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();
      this.nodes.push(lfo, lfoGain);
    });

    const { filter } = this.createNoise(p.noiseVol);
    filter.frequency.value = p.filterFreq;
  }
}

const audioEngine = new MeditationAudioEngine();

// ============================================================
// DATA
// ============================================================

const SOLAR_TERMS_2026 = [
  { name: "小寒", date: "2026-01-05", season: "winter", theme: "溫腎散寒", icon: "❄️" },
  { name: "大寒", date: "2026-01-20", season: "winter", theme: "深藏蓄勢", icon: "🌨️" },
  { name: "立春", date: "2026-02-04", season: "spring", theme: "萬物復甦", icon: "🌱" },
  { name: "雨水", date: "2026-02-19", season: "spring", theme: "春雨潤澤", icon: "🌧️" },
  { name: "驚蟄", date: "2026-03-06", season: "spring", theme: "升陽護肝", icon: "⚡" },
  { name: "春分", date: "2026-03-21", season: "spring", theme: "陰陽平衡", icon: "⚖️" },
  { name: "清明", date: "2026-04-05", season: "spring", theme: "疏肝明目", icon: "🍃" },
  { name: "穀雨", date: "2026-04-20", season: "spring", theme: "雨生百穀", icon: "🌾" },
  { name: "立夏", date: "2026-05-06", season: "summer", theme: "養心安神", icon: "☀️" },
  { name: "小滿", date: "2026-05-21", season: "summer", theme: "清熱祛濕", icon: "🌿" },
  { name: "芒種", date: "2026-06-06", season: "summer", theme: "清心降火", icon: "🌾" },
  { name: "夏至", date: "2026-06-21", season: "summer", theme: "養心清暑", icon: "🔆" },
  { name: "小暑", date: "2026-07-07", season: "summer", theme: "消暑生津", icon: "🌡️" },
  { name: "大暑", date: "2026-07-23", season: "summer", theme: "清熱養陰", icon: "🔥" },
  { name: "立秋", date: "2026-08-07", season: "autumn", theme: "潤肺養陰", icon: "🍂" },
  { name: "處暑", date: "2026-08-23", season: "autumn", theme: "清餘熱", icon: "🌅" },
  { name: "白露", date: "2026-09-08", season: "autumn", theme: "滋陰潤燥", icon: "💧" },
  { name: "秋分", date: "2026-09-23", season: "autumn", theme: "平衡收藏", icon: "🍁" },
  { name: "寒露", date: "2026-10-08", season: "autumn", theme: "潤燥溫補", icon: "🌙" },
  { name: "霜降", date: "2026-10-23", season: "autumn", theme: "養陰潤肺", icon: "🌫️" },
  { name: "立冬", date: "2026-11-07", season: "winter", theme: "溫腎補陽", icon: "⛄" },
  { name: "小雪", date: "2026-11-22", season: "winter", theme: "養血安神", icon: "🌨️" },
  { name: "大雪", date: "2026-12-07", season: "winter", theme: "深度滋補", icon: "❄️" },
  { name: "冬至", date: "2026-12-22", season: "winter", theme: "陽氣初升", icon: "🕯️" },
];

const HERBS = [
  { id: 1, name: "枸杞", pinyin: "Gǒuqǐ", category: "果實", nature: "平", taste: "甘", meridian: "肝、腎", effect: "滋補肝腎，益精明目", season: ["autumn", "winter"], description: "枸杞子紅潤飽滿，是最廣為人知的養生藥材。滋養肝腎、明亮雙眼，如同一顆溫暖的小太陽。" },
  { id: 2, name: "人參", pinyin: "Rénshēn", category: "根莖", nature: "溫", taste: "甘、微苦", meridian: "脾、肺、心", effect: "大補元氣，補脾益肺", season: ["winter"], description: "百草之王，深藏地下蓄積精華。大補元氣、安神益智，是冬日最深沉的滋養。" },
  { id: 3, name: "當歸", pinyin: "Dāngguī", category: "根莖", nature: "溫", taste: "甘、辛", meridian: "肝、心、脾", effect: "補血活血，調經止痛", season: ["winter", "spring"], description: "「歸來」之意，引血歸經。溫暖的藥香裡，是對身體最深的呼喚。" },
  { id: 4, name: "黃耆", pinyin: "Huángqí", category: "根莖", nature: "溫", taste: "甘", meridian: "脾、肺", effect: "補氣固表，利水消腫", season: ["winter", "autumn"], description: "補氣之長，守護身體的衛氣。如同一道溫暖的屏障，抵禦外邪。" },
  { id: 5, name: "生薑", pinyin: "Shēngjiāng", category: "根莖", nature: "溫", taste: "辛", meridian: "肺、脾、胃", effect: "發汗解表，溫中止嘔", season: ["winter"], description: "廚房裡最親切的藥材，辛辣中帶著溫暖。驅寒暖胃，是冬日的守護者。" },
  { id: 6, name: "甘草", pinyin: "Gāncǎo", category: "根莖", nature: "平", taste: "甘", meridian: "心、肺、脾、胃", effect: "補脾益氣，清熱解毒", season: ["spring", "summer", "autumn", "winter"], description: "「國老」之稱，調和百藥。甘甜平和，是所有藥方中最溫柔的存在。" },
  { id: 7, name: "菊花", pinyin: "Júhuā", category: "花", nature: "涼", taste: "甘、苦", meridian: "肺、肝", effect: "疏散風熱，平肝明目", season: ["spring", "autumn"], description: "秋日盛放的清雅之花，入茶清香宜人。疏風散熱、清肝明目，帶來寧靜的力量。" },
  { id: 8, name: "金銀花", pinyin: "Jīnyínhuā", category: "花", nature: "寒", taste: "甘", meridian: "肺、心、胃", effect: "清熱解毒，疏散風熱", season: ["summer", "spring"], description: "金銀雙色纏繞生長，清熱解毒的良藥。夏日裡一杯金銀花茶，清涼直達心底。" },
  { id: 9, name: "玫瑰花", pinyin: "Méiguīhuā", category: "花", nature: "溫", taste: "甘、微苦", meridian: "肝、脾", effect: "行氣解鬱，和血調經", season: ["spring"], description: "芳香理氣的溫柔使者。每一片花瓣都帶著疏肝解鬱的力量，讓心情如花綻放。" },
  { id: 10, name: "桂花", pinyin: "Guìhuā", category: "花", nature: "溫", taste: "辛", meridian: "肺、脾", effect: "化痰散瘀，溫中暖胃", season: ["autumn"], description: "八月桂花香，甜蜜的秋日記憶。溫暖脾胃、化解痰濁，是秋天最溫柔的擁抱。" },
  { id: 11, name: "茉莉花", pinyin: "Mòlìhuā", category: "花", nature: "溫", taste: "辛、甘", meridian: "脾、胃、肝", effect: "理氣開鬱，和中闢穢", season: ["spring", "summer"], description: "清雅芬芳，理氣而不傷氣。茉莉的香氣輕輕打開鬱結，讓心回到純粹。" },
  { id: 12, name: "洛神花", pinyin: "Luòshénhuā", category: "花", nature: "涼", taste: "酸", meridian: "肝、脾", effect: "清熱解渴，活血補血", season: ["summer"], description: "艷紅如寶石的花萼，酸甜中帶著生命力。消暑解渴，讓夏日也能清涼自在。" },
  { id: 13, name: "紅花", pinyin: "Hónghuā", category: "花", nature: "溫", taste: "辛", meridian: "心、肝", effect: "活血通經，散瘀止痛", season: ["spring"], description: "紅似火焰的小花，活血化瘀的先鋒。讓凝滯的血液重新流動，帶走鬱積的痛。" },
  { id: 14, name: "蓮子", pinyin: "Liánzǐ", category: "種子", nature: "平", taste: "甘、澀", meridian: "脾、腎、心", effect: "補脾止瀉，養心安神", season: ["summer"], description: "出淤泥而不染的蓮花之子，清心養神。夏日裡一碗蓮子湯，安定躁動的心。" },
  { id: 15, name: "薏仁", pinyin: "Yìrén", category: "種子", nature: "涼", taste: "甘、淡", meridian: "脾、胃、肺", effect: "健脾滲濕，清熱排膿", season: ["summer", "spring"], description: "溫和的祛濕高手，健脾利水。讓身體裡多餘的濕氣，如晨露般慢慢蒸發。" },
  { id: 16, name: "酸棗仁", pinyin: "Suānzǎorén", category: "種子", nature: "平", taste: "甘、酸", meridian: "心、肝、膽", effect: "養心安神，斂汗生津", season: ["autumn", "winter"], description: "安眠的良伴，養心寧神。夜深人靜時，讓酸棗仁帶你進入深沉的休息。" },
  { id: 17, name: "決明子", pinyin: "Juémíngzǐ", category: "種子", nature: "涼", taste: "甘、苦、鹹", meridian: "肝、腎、大腸", effect: "清肝明目，潤腸通便", season: ["spring", "autumn"], description: "「決」明之意，讓雙眼重獲清明。清肝火、潤腸道，由內而外的通透。" },
  { id: 18, name: "芝麻", pinyin: "Zhīma", category: "種子", nature: "平", taste: "甘", meridian: "肝、腎、大腸", effect: "補肝腎，益精血，潤腸燥", season: ["autumn", "winter"], description: "小小種子蘊含豐富油脂，滋養肝腎。黑芝麻烏髮潤膚，是秋冬的滋潤寶藏。" },
  { id: 19, name: "杏仁", pinyin: "Xìngrén", category: "種子", nature: "溫", taste: "苦", meridian: "肺、大腸", effect: "止咳平喘，潤腸通便", season: ["autumn"], description: "秋天的潤肺使者，止咳平喘。溫潤的力量，撫慰每一次乾燥的呼吸。" },
  { id: 20, name: "紅棗", pinyin: "Hóngzǎo", category: "果實", nature: "溫", taste: "甘", meridian: "脾、胃、心", effect: "補中益氣，養血安神", season: ["winter", "autumn", "spring"], description: "補氣養血的甜蜜果實，日食三顆棗，容顏不易老。最質樸的溫暖守護。" },
  { id: 21, name: "桂圓", pinyin: "Guìyuán", category: "果實", nature: "溫", taste: "甘", meridian: "心、脾", effect: "補益心脾，養血安神", season: ["winter", "autumn"], description: "龍眼乾燥後的溫甜果肉，補心安神。每一顆圓滿的桂圓，都是對心脾的滋養。" },
  { id: 22, name: "山楂", pinyin: "Shānzhā", category: "果實", nature: "微溫", taste: "酸、甘", meridian: "脾、胃、肝", effect: "消食化積，行氣散瘀", season: ["spring", "summer"], description: "酸甜的紅色果實，消食化積的好幫手。糖葫蘆裡藏著消化的智慧。" },
  { id: 23, name: "五味子", pinyin: "Wǔwèizǐ", category: "果實", nature: "溫", taste: "酸、甘", meridian: "肺、心、腎", effect: "收斂固澀，益氣生津", season: ["autumn", "summer"], description: "一果五味，酸甘苦辛鹹俱全。收斂精氣，讓散逸的能量回到核心。" },
  { id: 24, name: "烏梅", pinyin: "Wūméi", category: "果實", nature: "平", taste: "酸", meridian: "肝、脾、肺、大腸", effect: "斂肺止咳，生津止渴", season: ["summer"], description: "酸梅湯的靈魂，生津止渴的夏日良伴。一口酸甜，喚醒沉悶的味蕾。" },
  { id: 25, name: "陳皮", pinyin: "Chénpí", category: "皮", nature: "溫", taste: "辛、苦", meridian: "脾、肺", effect: "理氣健脾，燥濕化痰", season: ["spring", "autumn", "winter"], description: "橘皮經年陳化，苦澀轉為芳香。越老越醇，時間賦予的理氣之力。" },
  { id: 26, name: "肉桂", pinyin: "Ròuguì", category: "皮", nature: "熱", taste: "辛、甘", meridian: "腎、脾、心、肝", effect: "補火助陽，散寒止痛", season: ["winter"], description: "溫暖的桂皮香氣，是冬日最濃郁的火焰。補火助陽，從體內點燃溫暖。" },
  { id: 27, name: "薄荷", pinyin: "Bòhé", category: "全草", nature: "涼", taste: "辛", meridian: "肺、肝", effect: "疏散風熱，清利頭目", season: ["spring", "summer"], description: "清涼的綠色精靈，一觸即發的涼意。疏散風熱、清利頭目，瞬間神清氣爽。" },
  { id: 28, name: "蒲公英", pinyin: "Púgōngyīng", category: "全草", nature: "寒", taste: "苦、甘", meridian: "肝、胃", effect: "清熱解毒，消腫散結", season: ["spring"], description: "風中飄散的小傘兵，清熱解毒的草地英雄。吹散煩惱，帶走體內的熱毒。" },
  { id: 29, name: "紫蘇", pinyin: "Zǐsū", category: "葉", nature: "溫", taste: "辛", meridian: "肺、脾", effect: "解表散寒，行氣和胃", season: ["spring", "summer"], description: "紫色的葉片帶著獨特芳香，發汗解表。每一片葉子都是驅寒的溫暖擁抱。" },
  { id: 30, name: "桑葉", pinyin: "Sāngyè", category: "葉", nature: "寒", taste: "甘、苦", meridian: "肺、肝", effect: "疏散風熱，清肺潤燥", season: ["spring", "autumn"], description: "蠶食桑葉而成絲，桑葉疏風而護肺。秋霜之後的桑葉，清肺力更強。" },
  { id: 31, name: "荷葉", pinyin: "Héyè", category: "葉", nature: "平", taste: "苦", meridian: "肝、脾、胃", effect: "清暑利濕，升發清陽", season: ["summer"], description: "出水芙蓉的碧綠衣裳，不沾塵埃。清暑化濕，讓心也如荷葉般清淨。" },
  { id: 32, name: "艾葉", pinyin: "Àiyè", category: "葉", nature: "溫", taste: "辛、苦", meridian: "脾、肝、腎", effect: "溫經止血，散寒止痛", season: ["spring"], description: "端午的記憶，艾草香氣驅邪避穢。溫暖經絡、散寒止痛，是最古老的守護。" },
  { id: 33, name: "茯苓", pinyin: "Fúlíng", category: "菌類", nature: "平", taste: "甘、淡", meridian: "心、肺、脾、腎", effect: "利水滲濕，健脾寧心", season: ["spring", "summer", "autumn"], description: "松根旁安靜生長的白色菌體，利水而不傷正。沉穩內斂，默默守護脾胃。" },
  { id: 34, name: "靈芝", pinyin: "Língzhī", category: "菌類", nature: "平", taste: "甘", meridian: "心、肺、肝、腎", effect: "補氣安神，止咳平喘", season: ["winter", "autumn"], description: "仙草之名，瑞祥之兆。安神益壽、扶正固本，是最神聖的養生珍品。" },
  { id: 35, name: "白木耳", pinyin: "Báimùěr", category: "菌類", nature: "平", taste: "甘、淡", meridian: "肺、胃、腎", effect: "滋陰潤肺，養胃生津", season: ["autumn", "summer"], description: "如白雲般輕盈的銀耳，滋陰潤肺。秋燥時節的潤澤甘露，養顏又養心。" },
  { id: 36, name: "蜂蜜", pinyin: "Fēngmì", category: "全草", nature: "平", taste: "甘", meridian: "肺、脾、大腸", effect: "補中潤燥，止痛解毒", season: ["spring", "autumn", "winter"], description: "萬花釀成的甜蜜精華，潤而不膩。一勺蜂蜜水，是對身體最溫柔的善待。" },
  { id: 37, name: "珍珠", pinyin: "Zhēnzhū", category: "種子", nature: "寒", taste: "甘、鹹", meridian: "心、肝", effect: "安神定驚，明目消翳", season: ["summer"], description: "海中孕育的圓潤寶珠，安神定驚。如月光般柔和的力量，撫平焦躁不安。" },
  { id: 38, name: "百合", pinyin: "Bǎihé", category: "根莖", nature: "寒", taste: "甘", meridian: "心、肺", effect: "養陰潤肺，清心安神", season: ["autumn"], description: "百片合成的潔白鱗莖，養陰潤肺。秋日裡最溫柔的安撫，讓心回到安寧。" },
  { id: 39, name: "葛根", pinyin: "Gěgēn", category: "根莖", nature: "涼", taste: "甘、辛", meridian: "脾、胃", effect: "解肌退熱，生津止渴", season: ["summer", "spring"], description: "粗壯的根部蘊含清涼的力量，解肌退熱。夏日裡的一股清泉，解渴又解暑。" },
  { id: 40, name: "川芎", pinyin: "Chuānxiōng", category: "根莖", nature: "溫", taste: "辛", meridian: "肝、膽、心包", effect: "活血行氣，祛風止痛", season: ["spring"], description: "血中之氣藥，引血上行。芎穹之名，如穹頂般開闊氣血通道。" },
  { id: 41, name: "桂枝", pinyin: "Guìzhī", category: "根莖", nature: "溫", taste: "辛、甘", meridian: "心、肺、膀胱", effect: "發汗解肌，溫通經脈", season: ["winter", "spring"], description: "桂樹的嫩枝，溫通經脈的使者。如春風般溫和地打開身體的通道。" },
  { id: 42, name: "山藥", pinyin: "Shānyào", category: "根莖", nature: "平", taste: "甘", meridian: "脾、肺、腎", effect: "補脾養胃，生津益肺", season: ["autumn", "winter"], description: "樸實無華的根莖，卻是補脾養胃的上品。平和中正，默默滋養。" },
];

const TERM_HERBS = {
  "小寒": [5, 26, 3, 20, 21, 4],
  "大寒": [2, 4, 3, 26, 1, 34],
  "立春": [9, 25, 27, 7, 29, 28],
  "雨水": [33, 15, 25, 35, 22, 6],
  "驚蟄": [7, 8, 28, 17, 30, 27],
  "春分": [9, 11, 27, 1, 7, 36],
  "清明": [7, 1, 17, 3, 9, 30],
  "穀雨": [15, 33, 25, 22, 31, 20],
  "立夏": [14, 33, 27, 7, 20, 21],
  "小滿": [15, 31, 8, 27, 14, 35],
  "芒種": [14, 31, 7, 8, 24, 12],
  "夏至": [14, 27, 7, 31, 16, 33],
  "小暑": [24, 12, 27, 31, 14, 35],
  "大暑": [8, 31, 15, 35, 36, 39],
  "立秋": [35, 36, 19, 1, 38, 14],
  "處暑": [7, 30, 35, 36, 24, 1],
  "白露": [38, 14, 1, 35, 16, 18],
  "秋分": [38, 33, 14, 20, 1, 10],
  "寒露": [1, 20, 21, 18, 35, 36],
  "霜降": [38, 19, 1, 20, 18, 25],
  "立冬": [26, 5, 3, 20, 21, 1],
  "小雪": [3, 20, 21, 4, 1, 18],
  "大雪": [2, 4, 3, 26, 21, 20],
  "冬至": [2, 4, 5, 26, 20, 1],
};

const MEDITATIONS = {
  "根莖": [
    "想像你是一棵大樹，根系深入大地。每一次呼吸，從土壤中吸取力量，穩固而安定。",
    "感受腳底與大地的連結。根莖藥材提醒我們——最深的力量，來自最安靜的地方。",
    "閉上眼睛，感覺溫暖從腳底慢慢上升，如同大地深處的暖流，滋養全身。",
    "深深扎根，不急不躁。你的力量一直在那裡，只是需要安靜下來才能感受到。",
  ],
  "花": [
    "想像一朵花在心口慢慢綻放。每一片花瓣展開，都是一份壓力的釋放。",
    "花開不為討好誰，只為完成自己。讓呼吸像花香一樣，自然地散發。",
    "閉上眼睛，感受鼻尖淡淡的花香。每一次吸氣，都是一次與芬芳的相遇。",
    "花朵從含苞到綻放，不急不緩。你的成長也是如此——相信時間的力量。",
  ],
  "果實": [
    "果實是植物一整年的心血。此刻也讓自己沉澱，品嘗生命中每個甜美的時刻。",
    "想像手中握著一顆溫潤的果實，感受它的重量和溫度。你值得這份豐盛。",
    "每一顆果實都經歷了風雨。深呼吸，你所經歷的一切，正在醞釀美好的結果。",
    "圓滿不是沒有缺口，而是接受了所有的形狀。像果實一樣，飽滿而完整。",
  ],
  "種子": [
    "種子裡藏著一整座森林的可能。你的每一個念頭，也都是一顆種子。",
    "想像你將善意的種子播入土壤。不需要著急發芽，只需要耐心澆灌。",
    "小小的種子不害怕黑暗，因為它知道光明在等待。深呼吸，信任這個過程。",
    "每一次呼吸都是一次播種。吸氣播下平靜，呼氣讓焦慮離開。",
  ],
  "葉": [
    "葉子在風中輕輕搖擺，不抗拒也不執著。讓你的思緒也像葉子一樣，自由來去。",
    "想像自己是一片綠葉，沐浴在陽光中。光合作用正在發生——你正在將壓力轉化為能量。",
    "葉脈如同經絡，氣在其中流動。感受你身體裡的能量，正沿著經脈運行。",
    "一片葉子就是一個呼吸的器官。和它一起，吸入清新，釋放濁氣。",
  ],
  "皮": [
    "皮是植物的盔甲，保護內在的柔軟。你也有這樣的力量——溫柔又堅韌。",
    "陳年的皮越來越香。時間不是敵人，而是最好的釀造師。慢慢呼吸，品味當下。",
    "表皮之下是流動的生命。感受你的皮膚——它是你與世界之間最溫柔的界線。",
    "包裹與保護，也是一種愛。深呼吸，感謝身體忠實地守護著你。",
  ],
  "菌類": [
    "菌類在暗處靜靜生長，不需要陽光也能飽滿。你的內在力量，也不需要外在證明。",
    "感受與大地的連結，像菌絲般延伸。你與萬物相連，從不孤單。",
    "在松根旁安靜共生，互相滋養。呼吸之間，感受你與周圍環境的和諧。",
    "菌類將腐朽化為養分。深呼吸，那些困難的經歷，也正在轉化為你的智慧。",
  ],
  "全草": [
    "全草入藥，莖葉花根皆是力量。你的每一個面向，都有獨特的價值。",
    "小草柔軟卻不易折斷。深呼吸，柔韌是一種被低估的力量。",
    "想像自己在草地上，微風拂面。所有的緊張，隨風散去。",
    "草木有情，大地有愛。此刻只需要安靜地呼吸，讓自然的療癒力包圍你。",
  ],
};

function getCurrentSolarTerm(dateStr) {
  const d = new Date(dateStr);
  let current = SOLAR_TERMS_2026[SOLAR_TERMS_2026.length - 1];
  for (let i = 0; i < SOLAR_TERMS_2026.length; i++) {
    if (d >= new Date(SOLAR_TERMS_2026[i].date)) current = SOLAR_TERMS_2026[i];
  }
  return current;
}

function getDayHerb(dateStr) {
  const term = getCurrentSolarTerm(dateStr);
  const termStart = new Date(term.date);
  const d = new Date(dateStr);
  const dayOffset = Math.floor((d - termStart) / 86400000);
  const herbIds = TERM_HERBS[term.name] || TERM_HERBS["立春"];
  const herbId = herbIds[dayOffset % herbIds.length];
  return HERBS.find(h => h.id === herbId) || HERBS[0];
}

function getDayMeditation(herb, dateStr) {
  const meditations = MEDITATIONS[herb.category] || MEDITATIONS["全草"];
  const dayOfYear = Math.floor((new Date(dateStr) - new Date(dateStr.substring(0, 4) + "-01-01")) / 86400000);
  return meditations[dayOfYear % meditations.length];
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ============================================================
// THEME
// ============================================================

const THEMES = {
  spring: { name: "春", bg: "#F7F3EB", card: "#FFFFFF", accent: "#5B8C5A", accentLight: "#E8F0E4", text: "#2C3E2D", textSec: "#6B7C6B", warm: "#C4956A", gradient: "linear-gradient(135deg, #E8F0E4 0%, #F0E8D8 100%)", headerBg: "linear-gradient(180deg, #DAE8D4 0%, #F7F3EB 100%)" },
  summer: { name: "夏", bg: "#FBF6EE", card: "#FFFFFF", accent: "#D4804E", accentLight: "#FDE8D8", text: "#3D2C1E", textSec: "#8B7355", warm: "#E8A065", gradient: "linear-gradient(135deg, #FDE8D8 0%, #FCF0E0 100%)", headerBg: "linear-gradient(180deg, #F5DFC8 0%, #FBF6EE 100%)" },
  autumn: { name: "秋", bg: "#F5F0E8", card: "#FFFFFF", accent: "#A0522D", accentLight: "#F0E0D0", text: "#3E2B1C", textSec: "#8B7355", warm: "#C07830", gradient: "linear-gradient(135deg, #F0E0D0 0%, #E8DBC8 100%)", headerBg: "linear-gradient(180deg, #E5D4C0 0%, #F5F0E8 100%)" },
  winter: { name: "冬", bg: "#F0F2F5", card: "#FFFFFF", accent: "#4A6B8A", accentLight: "#DDE6EE", text: "#1E2D3D", textSec: "#5A6B7D", warm: "#7B9AB5", gradient: "linear-gradient(135deg, #DDE6EE 0%, #E8E4F0 100%)", headerBg: "linear-gradient(180deg, #D0DCE8 0%, #F0F2F5 100%)" },
};

function getSeasonFromDate(d) {
  const m = d.getMonth();
  if (m >= 1 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

// ============================================================
// PERSISTENCE
// ============================================================

function loadData(key, def) {
  try { const v = localStorage.getItem("tcm_" + key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function saveData(key, val) {
  try { localStorage.setItem("tcm_" + key, JSON.stringify(val)); } catch {}
}

// ============================================================
// SVG ICONS
// ============================================================

const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Calendar: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Leaf: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Play: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Pause: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Heart: ({filled}) => filled ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ChevLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Volume: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ============================================================
// COMPONENTS
// ============================================================

function BottomNav({ view, setView, theme }) {
  const tabs = [
    { id: "today", label: "今日", icon: Icons.Home },
    { id: "calendar", label: "日曆", icon: Icons.Calendar },
    { id: "herbs", label: "本草", icon: Icons.Leaf },
    { id: "journey", label: "旅程", icon: Icons.User },
  ];
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,0,0,0.06)", zIndex: 100, display: "flex", justifyContent: "center", padding: "0 0 env(safe-area-inset-bottom)" }}>
      <div style={{ display: "flex", maxWidth: 420, width: "100%", justifyContent: "space-around" }}>
        {tabs.map(t => {
          const active = view === t.id;
          return (
            <button key={t.id} onClick={() => setView(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", color: active ? theme.accent : theme.textSec, transition: "all 0.2s", opacity: active ? 1 : 0.6 }}>
              <t.icon />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: "0.05em" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TodayView({ theme, stats, setStats }) {
  const today = formatDate(new Date());
  const term = getCurrentSolarTerm(today);
  const herb = getDayHerb(today);
  const meditation = getDayMeditation(herb, today);
  const [favorites, setFavorites] = useState(() => loadData("favorites", []));
  const isFav = favorites.includes(herb.id);
  const toggleFav = () => { const next = isFav ? favorites.filter(f => f !== herb.id) : [...favorites, herb.id]; setFavorites(next); saveData("favorites", next); };
  const d = new Date();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ background: theme.headerBg, margin: "-8px -16px 0", padding: "32px 24px 24px", borderRadius: "0 0 28px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 12, right: 16, fontSize: 56, opacity: 0.12 }}>{term.icon}</div>
        <div style={{ fontSize: 12, color: theme.textSec, letterSpacing: "0.15em", marginBottom: 4 }}>{d.getFullYear()} 年 {d.getMonth()+1} 月 {d.getDate()} 日 星期{weekdays[d.getDay()]}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
          <span className="font-serif-tc" style={{ fontSize: 28, fontWeight: 700, color: theme.text }}>{term.name}</span>
          <span style={{ fontSize: 13, color: theme.accent, fontWeight: 500 }}>{term.theme}</span>
        </div>
        <div style={{ fontSize: 13, color: theme.textSec, lineHeight: 1.6 }}>{term.icon} 節氣養生 · {herb.meridian}經調養</div>
      </div>

      <div style={{ background: theme.card, borderRadius: 20, padding: "28px 24px", marginTop: 20, boxShadow: "0 2px 20px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 6 }}>今日藥材 · {herb.category}</div>
            <div className="font-serif-tc" style={{ fontSize: 26, fontWeight: 700, color: theme.text }}>{herb.name}</div>
            <div style={{ fontSize: 12, color: theme.textSec, marginTop: 2 }}>{herb.pinyin}</div>
          </div>
          <button onClick={toggleFav} style={{ background: isFav ? theme.accentLight : "rgba(0,0,0,0.03)", border: "none", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isFav ? "#E25555" : theme.textSec, transition: "all 0.2s" }}>
            <Icons.Heart filled={isFav} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {[`性 ${herb.nature}`, `味 ${herb.taste}`, herb.meridian].map((tag, i) => (
            <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: theme.accentLight, color: theme.accent, fontWeight: 500 }}>{tag}</span>
          ))}
        </div>
        <p style={{ fontSize: 14, color: theme.text, lineHeight: 1.8, marginBottom: 12 }}>{herb.description}</p>
        <div style={{ fontSize: 12, color: theme.accent, fontWeight: 500 }}>功效：{herb.effect}</div>
      </div>

      <MeditationPlayer theme={theme} herb={herb} meditation={meditation} term={term} stats={stats} setStats={setStats} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
        {[{ label: "冥想天數", value: stats.totalDays || 0 }, { label: "連續天數", value: stats.streak || 0 }, { label: "收藏藥材", value: favorites.length }].map((s, i) => (
          <div key={i} style={{ background: theme.card, borderRadius: 16, padding: "16px 12px", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <div className="font-serif-tc" style={{ fontSize: 24, fontWeight: 700, color: theme.accent }}>{s.value}</div>
            <div style={{ fontSize: 11, color: theme.textSec, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeditationPlayer({ theme, herb, meditation, term, stats, setStats }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [breathPhase, setBreathPhase] = useState("idle");
  const timerRef = useRef(null);
  const breathRef = useRef(null);

  const durations = [{ label: "3 分鐘", value: 180 }, { label: "5 分鐘", value: 300 }, { label: "10 分鐘", value: 600 }, { label: "15 分鐘", value: 900 }];

  const startBreathCycle = () => {
    const cycle = () => {
      setBreathPhase("inhale");
      breathRef.current = setTimeout(() => {
        setBreathPhase("hold");
        breathRef.current = setTimeout(() => {
          setBreathPhase("exhale");
          breathRef.current = setTimeout(cycle, 4000);
        }, 2000);
      }, 4000);
    };
    cycle();
  };

  const startMeditation = () => { setIsPlaying(true); setElapsed(0); audioEngine.playSoundscape(herb.category, term.season); startBreathCycle(); };

  const stopMeditation = useCallback(() => {
    setIsPlaying(false); audioEngine.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathRef.current) clearTimeout(breathRef.current);
    setBreathPhase("idle");
    if (elapsed > 30) {
      const today = formatDate(new Date());
      const newStats = { ...stats, totalDays: (stats.totalDays || 0) + (stats.lastDate === today ? 0 : 1), totalMinutes: (stats.totalMinutes || 0) + Math.floor(elapsed / 60), lastDate: today, streak: stats.lastDate === formatDate(new Date(Date.now() - 86400000)) ? (stats.streak || 0) + 1 : stats.lastDate === today ? (stats.streak || 1) : 1, herbsExplored: [...new Set([...(stats.herbsExplored || []), herb.id])], meditatedDates: [...new Set([...(stats.meditatedDates || []), today])] };
      setStats(newStats); saveData("stats", newStats);
    }
  }, [elapsed, stats, herb.id, setStats]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => { if (prev + 1 >= duration) { return prev + 1; } return prev + 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, duration]);

  useEffect(() => { if (elapsed >= duration && isPlaying) stopMeditation(); }, [elapsed, duration, isPlaying, stopMeditation]);

  useEffect(() => { return () => { audioEngine.stop(); if (breathRef.current) clearTimeout(breathRef.current); }; }, []);

  const remaining = duration - elapsed;
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const progress = elapsed / duration;
  const breathLabels = { idle: "", inhale: "吸氣", hold: "屏息", exhale: "呼氣" };
  const breathScale = breathPhase === "inhale" ? 1.3 : breathPhase === "hold" ? 1.3 : 1;

  return (
    <div style={{ background: theme.card, borderRadius: 20, padding: 24, marginTop: 20, boxShadow: "0 2px 20px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>正念冥想 · {herb.name}音頻</div>
      <p style={{ fontSize: 14, color: theme.text, lineHeight: 1.8, fontStyle: "italic", padding: "12px 16px", background: theme.accentLight, borderRadius: 12, borderLeft: `3px solid ${theme.accent}`, marginBottom: 20 }}>{meditation}</p>

      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 20px" }}>
        <div style={{ position: "relative", width: 160, height: 160 }}>
          <svg width="160" height="160" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            <circle cx="80" cy="80" r="72" fill="none" stroke={theme.accentLight} strokeWidth="4" />
            <circle cx="80" cy="80" r="72" fill="none" stroke={theme.accent} strokeWidth="4" strokeDasharray={`${progress * 452} 452`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s linear" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: `radial-gradient(circle, ${theme.accentLight} 0%, ${theme.accent}33 100%)`, transform: `scale(${breathScale})`, transition: breathPhase === "inhale" || breathPhase === "exhale" ? "transform 4s ease-in-out" : "transform 0.3s", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              {isPlaying ? <div style={{ fontSize: 13, fontWeight: 600, color: theme.accent }}>{breathLabels[breathPhase]}</div> : <div className="font-serif-tc" style={{ fontSize: 22, fontWeight: 700, color: theme.accent }}>{min}:{String(sec).padStart(2, "0")}</div>}
            </div>
          </div>
        </div>
      </div>

      {isPlaying && <div style={{ textAlign: "center", marginBottom: 16 }}><span className="font-serif-tc" style={{ fontSize: 28, fontWeight: 700, color: theme.text }}>{min}:{String(sec).padStart(2, "0")}</span></div>}

      {!isPlaying && <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>{durations.map(d => <button key={d.value} onClick={() => setDuration(d.value)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.2s", background: duration === d.value ? theme.accent : theme.accentLight, color: duration === d.value ? "#fff" : theme.accent }}>{d.label}</button>)}</div>}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={isPlaying ? stopMeditation : startMeditation} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 36px", borderRadius: 28, border: "none", cursor: "pointer", background: isPlaying ? "rgba(0,0,0,0.06)" : theme.accent, color: isPlaying ? theme.text : "#fff", fontSize: 15, fontWeight: 600, transition: "all 0.2s", boxShadow: isPlaying ? "none" : `0 4px 16px ${theme.accent}44` }}>
          {isPlaying ? <><Icons.Pause /> 結束冥想</> : <><Icons.Play /> 開始冥想</>}
        </button>
      </div>

      {isPlaying && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
          <Icons.Volume />
          <span style={{ fontSize: 11, color: theme.textSec }}>{herb.category}音景 · {herb.name}</span>
          <div style={{ display: "flex", gap: 2, alignItems: "end" }}>
            {[12, 18, 10, 16, 8].map((h, i) => <div key={i} style={{ width: 3, height: h, background: theme.accent, borderRadius: 2, opacity: 0.5, animation: `tcm-audioBar 0.8s ease-in-out ${i * 0.1}s infinite alternate` }} />)}
          </div>
        </div>
      )}
      <style>{`@keyframes tcm-audioBar { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
    </div>
  );
}

function CalendarView({ theme, stats }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const year = viewDate.getFullYear(); const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = formatDate(new Date());
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const monthTerms = SOLAR_TERMS_2026.filter(t => { const td = new Date(t.date); return td.getFullYear() === year && td.getMonth() === month; });
  const days = []; for (let i = 0; i < firstDay; i++) days.push(null); for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const selectedHerb = selectedDate ? getDayHerb(selectedDate) : null;
  const selectedTerm = selectedDate ? getCurrentSolarTerm(selectedDate) : null;
  const selectedMeditation = selectedDate && selectedHerb ? getDayMeditation(selectedHerb, selectedDate) : null;

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 16px" }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, padding: 8 }}><Icons.ChevLeft /></button>
        <div style={{ textAlign: "center" }}>
          <div className="font-serif-tc" style={{ fontSize: 22, fontWeight: 700, color: theme.text }}>{year} 年 {month + 1} 月</div>
          {monthTerms.length > 0 && <div style={{ fontSize: 12, color: theme.accent, marginTop: 4 }}>{monthTerms.map(t => `${t.icon} ${t.name}`).join("  ")}</div>}
        </div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, padding: 8 }}><Icons.ChevRight /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {["日", "一", "二", "三", "四", "五", "六"].map(w => <div key={w} style={{ textAlign: "center", fontSize: 11, color: theme.textSec, padding: "6px 0", fontWeight: 500 }}>{w}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isToday = dateStr === today; const isSelected = dateStr === selectedDate;
          const isSolarTerm = monthTerms.some(t => t.date === dateStr);
          const hasMeditated = (stats.meditatedDates || []).includes(dateStr);
          return (
            <button key={i} onClick={() => setSelectedDate(isSelected ? null : dateStr)} style={{ position: "relative", background: isSelected ? theme.accent : isToday ? theme.accentLight : "transparent", border: "none", borderRadius: 12, padding: "10px 0", cursor: "pointer", color: isSelected ? "#fff" : isToday ? theme.accent : theme.text, fontWeight: isToday || isSelected ? 700 : 400, fontSize: 14, transition: "all 0.15s" }}>
              {d}
              {isSolarTerm && <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: isSelected ? "#fff" : theme.accent }} />}
              {hasMeditated && !isSolarTerm && <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: isSelected ? "#fff" : theme.warm }} />}
            </button>
          );
        })}
      </div>

      {selectedDate && selectedHerb && (
        <div style={{ background: theme.card, borderRadius: 20, padding: "20px 24px", marginTop: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)", animation: "tcm-fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: "0.1em" }}>{selectedTerm?.icon} {selectedTerm?.name} · {selectedTerm?.theme}</div>
              <div className="font-serif-tc" style={{ fontSize: 22, fontWeight: 700, color: theme.text, marginTop: 4 }}>{selectedHerb.name}</div>
            </div>
            <span style={{ fontSize: 12, color: theme.textSec }}>{selectedDate.replace(/-/g, "/")}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {[`${selectedHerb.nature}性`, selectedHerb.taste, selectedHerb.category].map((t, i) => <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 12, background: theme.accentLight, color: theme.accent }}>{t}</span>)}
          </div>
          <p style={{ fontSize: 13, color: theme.textSec, lineHeight: 1.7, marginBottom: 10 }}>{selectedHerb.description}</p>
          <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.7, fontStyle: "italic", padding: "10px 14px", background: theme.accentLight, borderRadius: 10 }}>{selectedMeditation}</p>
        </div>
      )}
      <style>{`@keyframes tcm-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function HerbsView({ theme }) {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("全部"); const [selectedHerb, setSelectedHerb] = useState(null);
  const categories = ["全部", "根莖", "花", "果實", "種子", "葉", "皮", "菌類", "全草"];
  const filtered = useMemo(() => HERBS.filter(h => { const ms = !search || h.name.includes(search) || h.pinyin.toLowerCase().includes(search.toLowerCase()) || h.effect.includes(search); const mc = category === "全部" || h.category === category; return ms && mc; }), [search, category]);
  const catIcons = { "花": "🌸", "根莖": "🌿", "果實": "🫐", "種子": "🌰", "葉": "🍃", "皮": "🪵", "菌類": "🍄", "全草": "🌱" };

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ padding: "20px 0 12px" }}>
        <h1 className="font-serif-tc" style={{ fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 4 }}>本草圖鑑</h1>
        <p style={{ fontSize: 13, color: theme.textSec }}>收錄 {HERBS.length} 種常見中藥材</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: theme.card, borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", marginBottom: 12 }}>
        <Icons.Search />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋藥材名稱、功效..." style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 14, color: theme.text, fontFamily: "inherit" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSec }}><Icons.X /></button>}
      </div>
      <div className="no-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
        {categories.map(c => <button key={c} onClick={() => setCategory(c)} style={{ whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.2s", flexShrink: 0, background: category === c ? theme.accent : theme.accentLight, color: category === c ? "#fff" : theme.accent }}>{c}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {filtered.map(h => (
          <button key={h.id} onClick={() => setSelectedHerb(h)} style={{ background: theme.card, borderRadius: 16, padding: 16, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 1px 8px rgba(0,0,0,0.03)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.accentLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, fontSize: 20 }}>{catIcons[h.category] || "🌱"}</div>
            <div className="font-serif-tc" style={{ fontSize: 17, fontWeight: 700, color: theme.text }}>{h.name}</div>
            <div style={{ fontSize: 11, color: theme.textSec, marginTop: 2 }}>{h.pinyin}</div>
            <div style={{ fontSize: 10, marginTop: 8, padding: "3px 8px", borderRadius: 8, background: theme.accentLight, color: theme.accent, display: "inline-block" }}>{h.category} · {h.nature}性</div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: theme.textSec }}>找不到符合條件的藥材</div>}

      {selectedHerb && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "tcm-fadeIn 0.2s ease" }} onClick={() => setSelectedHerb(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: theme.bg, borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto", animation: "tcm-slideUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: "0.1em" }}>{selectedHerb.category}</div>
                <div className="font-serif-tc" style={{ fontSize: 26, fontWeight: 700, color: theme.text, marginTop: 4 }}>{selectedHerb.name}</div>
                <div style={{ fontSize: 13, color: theme.textSec, marginTop: 2 }}>{selectedHerb.pinyin}</div>
              </div>
              <button onClick={() => setSelectedHerb(null)} style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.textSec }}><Icons.X /></button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {[`性味：${selectedHerb.nature}性 ${selectedHerb.taste}`, `歸經：${selectedHerb.meridian}`].map((t, i) => <span key={i} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, background: theme.accentLight, color: theme.accent }}>{t}</span>)}
            </div>
            <div style={{ background: theme.card, borderRadius: 16, padding: "16px 18px", marginBottom: 16, border: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.accent, marginBottom: 6 }}>功效</div>
              <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.6 }}>{selectedHerb.effect}</div>
            </div>
            <p style={{ fontSize: 14, color: theme.text, lineHeight: 1.8 }}>{selectedHerb.description}</p>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.accent, marginBottom: 8 }}>適合季節</div>
              <div style={{ display: "flex", gap: 8 }}>
                {selectedHerb.season.map(s => <span key={s} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 12, background: THEMES[s]?.accentLight || theme.accentLight, color: THEMES[s]?.accent || theme.accent }}>{s === "spring" ? "🌱 春" : s === "summer" ? "☀️ 夏" : s === "autumn" ? "🍂 秋" : "❄️ 冬"}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes tcm-slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } @keyframes tcm-fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

function JourneyView({ theme, stats }) {
  const level = Math.floor((stats.totalDays || 0) / 7) + 1;
  const xpInLevel = ((stats.totalDays || 0) % 7);
  const xpProgress = xpInLevel / 7;
  const levelNames = ["初學者", "入門者", "修習者", "靜心者", "覺察者", "內觀者", "明心者", "養生者", "通達者", "大師"];
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];
  const achievements = [
    { name: "初心萌芽", desc: "完成第一次冥想", unlocked: (stats.totalDays || 0) >= 1, icon: "🌱" },
    { name: "七日啟程", desc: "累計冥想 7 天", unlocked: (stats.totalDays || 0) >= 7, icon: "🚶" },
    { name: "月滿初成", desc: "累計冥想 30 天", unlocked: (stats.totalDays || 0) >= 30, icon: "🌕" },
    { name: "本草初識", desc: "探索 5 種藥材", unlocked: (stats.herbsExplored || []).length >= 5, icon: "📖" },
    { name: "百草學者", desc: "探索 20 種藥材", unlocked: (stats.herbsExplored || []).length >= 20, icon: "🎓" },
    { name: "連續三日", desc: "連續冥想 3 天", unlocked: (stats.streak || 0) >= 3, icon: "🔥" },
    { name: "週週不斷", desc: "連續冥想 7 天", unlocked: (stats.streak || 0) >= 7, icon: "⚡" },
    { name: "靜坐一時", desc: "累計冥想 60 分鐘", unlocked: (stats.totalMinutes || 0) >= 60, icon: "⏰" },
    { name: "深度冥想", desc: "累計冥想 300 分鐘", unlocked: (stats.totalMinutes || 0) >= 300, icon: "🧘" },
  ];

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ padding: "20px 0 16px" }}><h1 className="font-serif-tc" style={{ fontSize: 24, fontWeight: 700, color: theme.text }}>我的旅程</h1></div>
      <div style={{ background: theme.gradient, borderRadius: 20, padding: 24, marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 12, right: 16, fontSize: 48, opacity: 0.1 }}>🏔️</div>
        <div style={{ fontSize: 12, color: theme.accent, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 4 }}>等級 {level}</div>
        <div className="font-serif-tc" style={{ fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 12 }}>{levelName}</div>
        <div style={{ height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
          <div style={{ height: "100%", background: theme.accent, borderRadius: 4, width: `${xpProgress * 100}%`, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ fontSize: 11, color: theme.textSec }}>{xpInLevel} / 7 天升級</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[{ label: "冥想天數", value: stats.totalDays || 0, icon: "📅" }, { label: "連續天數", value: stats.streak || 0, icon: "🔥" }, { label: "總分鐘數", value: stats.totalMinutes || 0, icon: "⏱️" }, { label: "探索藥材", value: (stats.herbsExplored || []).length, icon: "🌿" }].map((s, i) => (
          <div key={i} style={{ background: theme.card, borderRadius: 16, padding: "18px 16px", boxShadow: "0 1px 8px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div className="font-serif-tc" style={{ fontSize: 26, fontWeight: 700, color: theme.text }}>{s.value}</div>
            <div style={{ fontSize: 12, color: theme.textSec, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <h2 className="font-serif-tc" style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 14 }}>成就 ({achievements.filter(a => a.unlocked).length}/{achievements.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {achievements.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: a.unlocked ? theme.card : "rgba(0,0,0,0.02)", borderRadius: 14, border: a.unlocked ? "1px solid rgba(0,0,0,0.04)" : "1px solid rgba(0,0,0,0.02)", opacity: a.unlocked ? 1 : 0.5, boxShadow: a.unlocked ? "0 1px 8px rgba(0,0,0,0.03)" : "none" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: a.unlocked ? theme.accentLight : "rgba(0,0,0,0.04)" }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{a.name}</div>
              <div style={{ fontSize: 11, color: theme.textSec, marginTop: 2 }}>{a.desc}</div>
            </div>
            {a.unlocked && <div style={{ color: theme.accent }}><Icons.Check /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [view, setView] = useState("today");
  const [stats, setStats] = useState(() => loadData("stats", { totalDays: 0, totalMinutes: 0, streak: 0, lastDate: null, herbsExplored: [], meditatedDates: [] }));
  const season = getSeasonFromDate(new Date());
  const theme = THEMES[season];

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Noto Serif TC', 'Noto Sans TC', 'Hiragino Sans', 'Microsoft YaHei', serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "8px 16px", minHeight: "100vh" }}>
        {view === "today" && <TodayView theme={theme} stats={stats} setStats={setStats} />}
        {view === "calendar" && <CalendarView theme={theme} stats={stats} />}
        {view === "herbs" && <HerbsView theme={theme} />}
        {view === "journey" && <JourneyView theme={theme} stats={stats} />}
      </div>
      <BottomNav view={view} setView={setView} theme={theme} />
    </div>
  );
}
