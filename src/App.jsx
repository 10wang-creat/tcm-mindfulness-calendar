import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ============================================================
// AUDIO ENGINE - Herb-specific meditation soundscapes
// ============================================================

class MeditationAudioEngine {
  constructor() { this.ctx = null; this.nodes = []; this.isPlaying = false; }
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === "suspended") this.ctx.resume(); }
  stop() { this.nodes.forEach(n => { try { n.stop?.(); } catch(e) {} try { n.disconnect?.(); } catch(e) {} }); this.nodes = []; this.isPlaying = false; }
  createOsc(freq, type, gain, detune = 0) {
    const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
    osc.type = type; osc.frequency.value = freq; osc.detune.value = detune; g.gain.value = gain;
    osc.connect(g).connect(this.ctx.destination); osc.start(); this.nodes.push(osc, g); return { osc, gain: g };
  }
  createNoise(gain) {
    const sz = this.ctx.sampleRate * 2; const buf = this.ctx.createBuffer(1, sz, this.ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = this.ctx.createGain(); g.gain.value = gain;
    const f = this.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 400;
    src.connect(f).connect(g).connect(this.ctx.destination); src.start(); this.nodes.push(src, f, g); return { src, gain: g, filter: f };
  }
  playSoundscape(category, season) {
    this.init(); this.stop(); this.isPlaying = true;
    const profiles = {
      "補氣": { baseFreq: 80, type: "sine", harmonics: [1, 1.5, 2], vol: 0.07, nv: 0.01, ff: 220 },
      "補血": { baseFreq: 120, type: "sine", harmonics: [1, 1.33, 2], vol: 0.06, nv: 0.012, ff: 300 },
      "養心安神": { baseFreq: 180, type: "sine", harmonics: [1, 1.25, 1.5, 2], vol: 0.04, nv: 0.015, ff: 500 },
      "重鎮安神": { baseFreq: 55, type: "sine", harmonics: [1, 2, 3], vol: 0.06, nv: 0.008, ff: 180 },
      "理氣": { baseFreq: 200, type: "triangle", harmonics: [1, 1.33, 1.67, 2], vol: 0.045, nv: 0.015, ff: 600 },
      "活血化瘀": { baseFreq: 150, type: "triangle", harmonics: [1, 1.5, 2, 2.5], vol: 0.05, nv: 0.018, ff: 450 },
      "利水滲濕": { baseFreq: 260, type: "sine", harmonics: [1, 1.2, 1.5], vol: 0.04, nv: 0.02, ff: 700 },
    };
    const sMod = { spring: 1.05, summer: 1.1, autumn: 0.95, winter: 0.9 };
    const mod = sMod[season] || 1; const p = profiles[category] || profiles["理氣"];
    p.harmonics.forEach((h, i) => {
      const { gain } = this.createOsc(p.baseFreq * h * mod, p.type, p.vol * (1 / (i + 1)), Math.sin(Date.now() * 0.001 + i) * 5);
      const lfo = this.ctx.createOscillator(); const lg = this.ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.02; lg.gain.value = p.vol * 0.3;
      lfo.connect(lg).connect(gain.gain); lfo.start(); this.nodes.push(lfo, lg);
    });
    const { filter } = this.createNoise(p.nv); filter.frequency.value = p.ff;
  }
}
const audioEngine = new MeditationAudioEngine();

// ============================================================
// 56 HERBS DATABASE — matching public/herbs/ images
// ============================================================

const HERBS = [
  { id:1, name:"枸杞", pinyin:"Gǒuqǐ", img:"01_goji.png", category:"補血", nature:"平", taste:"甘", meridian:"肝、腎", effect:"滋補肝腎，益精明目", desc:"紅潤飽滿的枸杞子，是最廣為人知的養生藥材。滋養肝腎、明亮雙眼，如同一顆溫暖的小太陽。" },
  { id:2, name:"黃耆", pinyin:"Huángqí", img:"02_astragalus.png", category:"補氣", nature:"溫", taste:"甘", meridian:"脾、肺", effect:"補氣固表，利水消腫", desc:"補氣之長，守護身體的衛氣。如同一道溫暖的屏障，抵禦外在的侵擾。" },
  { id:3, name:"艾葉", pinyin:"Àiyè", img:"03_mugwort.png", category:"活血化瘀", nature:"溫", taste:"辛、苦", meridian:"脾、肝、腎", effect:"溫經止血，散寒止痛", desc:"端午的記憶，艾草香氣驅邪避穢。溫暖經絡、散寒止痛，是最古老的守護。" },
  { id:4, name:"人參", pinyin:"Rénshēn", img:"04_ginseng.png", category:"補氣", nature:"溫", taste:"甘、微苦", meridian:"脾、肺、心", effect:"大補元氣，補脾益肺", desc:"百草之王，深藏地下蓄積精華。大補元氣、安神益智，是冬日最深沉的滋養。" },
  { id:5, name:"菊花", pinyin:"Júhuā", img:"05_chrysanthemum.png", category:"養心安神", nature:"涼", taste:"甘、苦", meridian:"肺、肝", effect:"疏散風熱，平肝明目", desc:"秋日盛放的清雅之花，入茶清香宜人。疏風散熱、清肝明目，帶來寧靜的力量。" },
  { id:6, name:"甘草", pinyin:"Gāncǎo", img:"06_licorice.png", category:"補氣", nature:"平", taste:"甘", meridian:"心、肺、脾、胃", effect:"補脾益氣，清熱解毒，調和諸藥", desc:"「國老」之稱，調和百藥。甘甜平和，是所有藥方中最溫柔的存在。" },
  { id:7, name:"當歸", pinyin:"Dāngguī", img:"07_angelica.png", category:"補血", nature:"溫", taste:"甘、辛", meridian:"肝、心、脾", effect:"補血活血，調經止痛", desc:"「歸來」之意，引血歸經。溫暖的藥香裡，是對身體最深的呼喚與滋養。" },
  { id:8, name:"薄荷", pinyin:"Bòhé", img:"08_mint.png", category:"理氣", nature:"涼", taste:"辛", meridian:"肺、肝", effect:"疏散風熱，清利頭目", desc:"清涼的綠色精靈，一觸即發的涼意。疏散風熱、清利頭目，瞬間神清氣爽。" },
  { id:9, name:"黨參", pinyin:"Dǎngshēn", img:"09_codonopsis.png", category:"補氣", nature:"平", taste:"甘", meridian:"脾、肺", effect:"補中益氣，健脾益肺", desc:"平和的補氣良藥，不似人參霸道，卻能日日相伴。溫和地補養脾肺之氣。" },
  { id:10, name:"白朮", pinyin:"Báizhú", img:"10_atractylodes.png", category:"補氣", nature:"溫", taste:"甘、苦", meridian:"脾、胃", effect:"健脾益氣，燥濕利水", desc:"脾胃的守護者，燥濕健脾。如同大地吸收雨水，讓身體恢復乾爽清朗。" },
  { id:11, name:"山藥", pinyin:"Shānyào", img:"11_chinese-yam.png", category:"補氣", nature:"平", taste:"甘", meridian:"脾、肺、腎", effect:"補脾養胃，生津益肺", desc:"樸實無華的根莖，卻是補脾養胃的上品。平和中正，默默滋養三臟。" },
  { id:12, name:"大棗", pinyin:"Dàzǎo", img:"12_jujube.png", category:"補氣", nature:"溫", taste:"甘", meridian:"脾、胃", effect:"補中益氣，養血安神", desc:"日食三棗，容顏不老。甜蜜的果實裡，藏著補氣養血的質樸力量。" },
  { id:13, name:"蜂蜜", pinyin:"Fēngmì", img:"13_honey.png", category:"補氣", nature:"平", taste:"甘", meridian:"肺、脾、大腸", effect:"補中潤燥，止痛解毒", desc:"萬花釀成的甜蜜精華，潤而不膩。一勺蜂蜜水，是對身體最溫柔的善待。" },
  { id:14, name:"紅棗", pinyin:"Hóngzǎo", img:"14_red-date.png", category:"補血", nature:"溫", taste:"甘", meridian:"脾、胃、心", effect:"補中益氣，養血安神", desc:"補氣養血的甜蜜果實。紅潤飽滿的外表下，是對心脾最溫暖的守護。" },
  { id:15, name:"熟地黃", pinyin:"Shúdìhuáng", img:"15_rehmannia.png", category:"補血", nature:"微溫", taste:"甘", meridian:"肝、腎", effect:"補血滋陰，益精填髓", desc:"經九蒸九曬的炮製，生地黃轉為烏黑滋潤。滋陰補血，是腎精的深層滋養。" },
  { id:16, name:"白芍", pinyin:"Báisháo", img:"16_white-peony.png", category:"補血", nature:"微寒", taste:"苦、酸", meridian:"肝、脾", effect:"養血調經，柔肝止痛", desc:"白芍藥根潔白溫潤，柔肝養血。如月光般柔和，撫平肝氣的躁動。" },
  { id:17, name:"阿膠", pinyin:"Ējião", img:"17_ejiao.png", category:"補血", nature:"平", taste:"甘", meridian:"肺、肝、腎", effect:"補血止血，滋陰潤燥", desc:"珍貴的膠質藥材，千年來守護女性健康。潤澤滋養，如絲般細膩。" },
  { id:18, name:"桂圓", pinyin:"Guìyuán", img:"18_longan.png", category:"補血", nature:"溫", taste:"甘", meridian:"心、脾", effect:"補益心脾，養血安神", desc:"龍眼乾燥後的溫甜果肉，補心安神。每一顆圓滿的桂圓，都是對心脾的滋養。" },
  { id:19, name:"何首烏", pinyin:"Héshǒuwū", img:"19_fo-ti.png", category:"補血", nature:"微溫", taste:"甘、澀", meridian:"肝、腎", effect:"補益精血，固腎烏鬚", desc:"傳說中讓白髮轉黑的仙藥，補肝腎、益精血。蘊含時間沉澱的智慧。" },
  { id:20, name:"桑椹", pinyin:"Sāngshèn", img:"20_mulberry.png", category:"補血", nature:"寒", taste:"甘、酸", meridian:"心、肝、腎", effect:"滋陰補血，生津潤腸", desc:"從青澀轉為深紫，桑椹如人生般層層疊疊。滋陰養血，甘酸之間是自然的饋贈。" },
  { id:21, name:"酸棗仁", pinyin:"Suānzǎorén", img:"21_sour-jujube-seed.png", category:"養心安神", nature:"平", taste:"甘、酸", meridian:"心、肝、膽", effect:"養心安神，斂汗生津", desc:"安眠的良伴，養心寧神。夜深人靜時，讓酸棗仁帶你進入深沉的休息。" },
  { id:22, name:"柏子仁", pinyin:"Bǎizǐrén", img:"22_biota-seed.png", category:"養心安神", nature:"平", taste:"甘", meridian:"心、腎、大腸", effect:"養心安神，潤腸通便", desc:"松柏之子，寧靜安定。潤養心神，如松林中的清風，帶走紛擾的思緒。" },
  { id:23, name:"遠志", pinyin:"Yuǎnzhì", img:"23_polygala.png", category:"養心安神", nature:"溫", taste:"苦、辛", meridian:"心、腎、肺", effect:"安神益智，祛痰開竅", desc:"名為「遠志」，志在遠方。安定心神的同時，也開啟智慧的門扉。" },
  { id:24, name:"合歡皮", pinyin:"Héhuānpí", img:"24_silk-tree-bark.png", category:"養心安神", nature:"平", taste:"甘", meridian:"心、肝", effect:"解鬱安神，活血消腫", desc:"合歡樹的樹皮，帶著「合家歡樂」的美好寓意。解開心結，讓鬱悶散去。" },
  { id:25, name:"夜交藤", pinyin:"Yèjiāoténg", img:"25_polygonum-vine.png", category:"養心安神", nature:"平", taste:"甘", meridian:"心、肝", effect:"養心安神，祛風通絡", desc:"夜晚交纏的藤蔓，藏著安眠的秘密。養心安神，讓夜晚重歸寧靜。" },
  { id:26, name:"龍骨", pinyin:"Lónggǔ", img:"26_dragon-bone.png", category:"重鎮安神", nature:"平", taste:"甘、澀", meridian:"心、肝、腎", effect:"鎮驚安神，平肝潛陽", desc:"遠古化石凝結的力量，沉重而穩定。鎮住浮躁的心神，如磐石般安定。" },
  { id:27, name:"牡蠣", pinyin:"Mǔlì", img:"27_oyster-shell.png", category:"重鎮安神", nature:"微寒", taste:"鹹、澀", meridian:"肝、膽、腎", effect:"重鎮安神，平肝潛陽", desc:"海中貝殼的堅硬守護，重鎮安神。大海的力量，沉穩而不可撼動。" },
  { id:28, name:"珍珠母", pinyin:"Zhēnzhūmǔ", img:"28_mother-of-pearl.png", category:"重鎮安神", nature:"寒", taste:"鹹", meridian:"肝、心", effect:"平肝潛陽，安神定驚", desc:"珍珠的母體，虹彩般的光澤裡藏著安定的力量。清肝明目，柔和而堅定。" },
  { id:29, name:"磁石", pinyin:"Císhí", img:"29_magnetite.png", category:"重鎮安神", nature:"寒", taste:"鹹", meridian:"肝、心、腎", effect:"鎮驚安神，平肝潛陽", desc:"大地深處的磁力之石，向下收引的力量。將浮越的陽氣，穩穩地拉回。" },
  { id:30, name:"琥珀", pinyin:"Hǔpò", img:"30_amber.png", category:"重鎮安神", nature:"平", taste:"甘", meridian:"心、肝、膀胱", effect:"鎮驚安神，散瘀利尿", desc:"千萬年松脂凝結的琥珀，時光的結晶。安神定驚，如遠古的低語帶來寧靜。" },
  { id:31, name:"陳皮", pinyin:"Chénpí", img:"31_tangerine-peel.png", category:"理氣", nature:"溫", taste:"辛、苦", meridian:"脾、肺", effect:"理氣健脾，燥濕化痰", desc:"橘皮經年陳化，苦澀轉為芳香。越老越醇，時間賦予的理氣之力。" },
  { id:32, name:"青皮", pinyin:"Qīngpí", img:"32_green-tangerine-peel.png", category:"理氣", nature:"溫", taste:"苦、辛", meridian:"肝、膽、胃", effect:"疏肝破氣，消積化滯", desc:"青澀的橘皮，年輕而銳利。疏肝破氣的力道，比陳皮更加直接有力。" },
  { id:33, name:"枳實", pinyin:"Zhǐshí", img:"33_immature-bitter-orange.png", category:"理氣", nature:"微寒", taste:"苦、辛", meridian:"脾、胃、大腸", effect:"破氣消積，化痰散痞", desc:"未成熟的枳橙果實，破氣消積的勇士。打通堵塞，讓氣機重新暢通。" },
  { id:34, name:"木香", pinyin:"Mùxiāng", img:"34_costus-root.png", category:"理氣", nature:"溫", taste:"辛、苦", meridian:"脾、胃、大腸、膽", effect:"行氣止痛，健脾消食", desc:"獨特的木質香氣，行氣止痛。如同森林深處的清風，疏通每一條氣道。" },
  { id:35, name:"香附", pinyin:"Xiāngfù", img:"35_cyperus.png", category:"理氣", nature:"平", taste:"辛、微苦", meridian:"肝、脾、三焦", effect:"疏肝解鬱，理氣寬中", desc:"氣病之總司，女科之主帥。香附的力量，專門疏解肝氣的鬱結與不暢。" },
  { id:36, name:"烏藥", pinyin:"Wūyào", img:"36_lindera.png", category:"理氣", nature:"溫", taste:"辛", meridian:"肺、脾、腎、膀胱", effect:"順氣止痛，溫腎散寒", desc:"順氣散寒的溫暖使者。從上到下，疏通所有被寒氣凝滯的氣道。" },
  { id:37, name:"沉香", pinyin:"Chénxiāng", img:"37_agarwood.png", category:"理氣", nature:"溫", taste:"辛、苦", meridian:"脾、胃、腎", effect:"行氣止痛，溫中降逆", desc:"沉水而不浮的珍貴木材，香氣深沉悠遠。納氣歸腎，是最深層的寧靜。" },
  { id:38, name:"檀香", pinyin:"Tánxiāng", img:"38_sandalwood.png", category:"理氣", nature:"溫", taste:"辛", meridian:"脾、胃、肺", effect:"行氣溫中，開胃止痛", desc:"檀香的氣味，是千年寺廟的記憶。溫潤行氣，在寧靜中找到內心的安定。" },
  { id:39, name:"川芎", pinyin:"Chuānxiōng", img:"39_sichuan-lovage.png", category:"活血化瘀", nature:"溫", taste:"辛", meridian:"肝、膽、心包", effect:"活血行氣，祛風止痛", desc:"血中之氣藥，引血上行。芎穹之名，如穹頂般開闊氣血通道。" },
  { id:40, name:"丹參", pinyin:"Dānshēn", img:"40_red-sage.png", category:"活血化瘀", nature:"微寒", taste:"苦", meridian:"心、肝", effect:"活血祛瘀，通經止痛", desc:"一味丹參，功同四物。紅色的根部蘊含強大的活血力量，通達心脈。" },
  { id:41, name:"紅花", pinyin:"Hónghuā", img:"41_safflower.png", category:"活血化瘀", nature:"溫", taste:"辛", meridian:"心、肝", effect:"活血通經，散瘀止痛", desc:"紅似火焰的小花，活血化瘀的先鋒。讓凝滯的血液重新流動，帶走鬱積的痛。" },
  { id:42, name:"桃仁", pinyin:"Táorén", img:"42_peach-kernel.png", category:"活血化瘀", nature:"平", taste:"苦、甘", meridian:"心、肝、大腸", effect:"活血祛瘀，潤腸通便", desc:"桃花凋落後留下的核仁，破瘀而不傷正。春天桃花的力量，化開冬日的凝滯。" },
  { id:43, name:"三七", pinyin:"Sānqī", img:"43_notoginseng.png", category:"活血化瘀", nature:"溫", taste:"甘、微苦", meridian:"肝、胃", effect:"散瘀止血，消腫定痛", desc:"止血不留瘀，化瘀不傷正。三七的雙向調節，是活血藥中最智慧的平衡。" },
  { id:44, name:"益母草", pinyin:"Yìmǔcǎo", img:"44_motherwort.png", category:"活血化瘀", nature:"微寒", taste:"辛、苦", meridian:"肝、心包、膀胱", effect:"活血調經，利尿消腫", desc:"名為益母，守護女性的草藥。活血調經，如母親般溫柔而堅定的關懷。" },
  { id:45, name:"雞血藤", pinyin:"Jīxuèténg", img:"45_spatholobus.png", category:"活血化瘀", nature:"溫", taste:"苦、甘", meridian:"肝、腎", effect:"活血補血，調經止痛", desc:"切開藤莖流出紅色汁液如雞血，既活血又補血。剛柔並濟的療癒力量。" },
  { id:46, name:"延胡索", pinyin:"Yánhúsuǒ", img:"46_corydalis.png", category:"活血化瘀", nature:"溫", taste:"辛、苦", meridian:"心、肝、脾", effect:"活血行氣，止痛", desc:"止痛要藥，專攻氣血凝滯之痛。如同一把溫柔的鑰匙，打開疼痛的枷鎖。" },
  { id:47, name:"鬱金", pinyin:"Yùjīn", img:"47_curcuma.png", category:"活血化瘀", nature:"寒", taste:"辛、苦", meridian:"肝、心、肺", effect:"行氣化瘀，清心解鬱", desc:"鬱結之金，打開心中的結。涼血化瘀的同時，也疏解情志的鬱悶。" },
  { id:48, name:"薑黃", pinyin:"Jiānghuáng", img:"48_turmeric.png", category:"活血化瘀", nature:"溫", taste:"辛、苦", meridian:"脾、肝", effect:"破血行氣，通經止痛", desc:"金黃色的根莖，現代研究的明星。活血通絡、消炎止痛，東西方都推崇的寶藏。" },
  { id:49, name:"茵陳", pinyin:"Yīnchén", img:"49_artemisia.png", category:"利水滲濕", nature:"微寒", taste:"苦", meridian:"脾、胃、肝、膽", effect:"清利濕熱，利膽退黃", desc:"春天萌發的嫩芽，清利肝膽濕熱。經冬不凋的生命力，化解體內的鬱熱。" },
  { id:50, name:"金錢草", pinyin:"Jīnqiáncǎo", img:"50_lysimachia.png", category:"利水滲濕", nature:"微寒", taste:"甘、鹹", meridian:"肝、膽、腎、膀胱", effect:"利濕退黃，利尿通淋", desc:"圓如銅錢的葉片，利濕化石的好手。清理泌尿道的濕熱，如清泉般通透。" },
  { id:51, name:"車前子", pinyin:"Chēqiánzǐ", img:"51_plantain.png", category:"利水滲濕", nature:"寒", taste:"甘", meridian:"肝、腎、肺、小腸", effect:"清熱利尿，滲濕止瀉", desc:"路邊常見的小草，卻有強大的利水力量。清熱利尿，讓多餘的水液順暢排出。" },
  { id:52, name:"澤瀉", pinyin:"Zéxiè", img:"52_alisma.png", category:"利水滲濕", nature:"寒", taste:"甘", meridian:"腎、膀胱", effect:"利水滲濕，泄熱通淋", desc:"水邊生長的澤瀉，天生懂得如何與水共處。利水而不傷陰，溫柔的排濕使者。" },
  { id:53, name:"茯苓", pinyin:"Fúlíng", img:"53_poria.png", category:"利水滲濕", nature:"平", taste:"甘、淡", meridian:"心、肺、脾、腎", effect:"利水滲濕，健脾寧心", desc:"松根旁安靜生長的白色菌體，利水而不傷正。沉穩內斂，默默守護脾胃。" },
  { id:54, name:"薏仁", pinyin:"Yìrén", img:"54_coix-seed.png", category:"利水滲濕", nature:"涼", taste:"甘、淡", meridian:"脾、胃、肺", effect:"健脾滲濕，清熱排膿", desc:"溫和的祛濕高手，健脾利水。讓身體裡多餘的濕氣，如晨露般慢慢蒸發。" },
  { id:55, name:"滑石", pinyin:"Huáshí", img:"55_talc.png", category:"利水滲濕", nature:"寒", taste:"甘、淡", meridian:"膀胱、肺、胃", effect:"利尿通淋，清熱解暑", desc:"滑潤的礦石藥材，如溪水般帶走暑熱。利尿通淋，清涼而順暢。" },
  { id:56, name:"通草", pinyin:"Tōngcǎo", img:"56_tetrapanax.png", category:"利水滲濕", nature:"微寒", taste:"甘、淡", meridian:"肺、胃", effect:"清熱利尿，通氣下乳", desc:"白色輕盈的草髓，疏通水道。如同打開一條清澈的溪流，讓氣水暢通無阻。" },
];

const SOLAR_TERMS_2026 = [
  { name:"小寒", date:"2026-01-05", season:"winter", theme:"溫腎散寒", icon:"❄️" },
  { name:"大寒", date:"2026-01-20", season:"winter", theme:"深藏蓄勢", icon:"🌨️" },
  { name:"立春", date:"2026-02-04", season:"spring", theme:"萬物復甦", icon:"🌱" },
  { name:"雨水", date:"2026-02-19", season:"spring", theme:"春雨潤澤", icon:"🌧️" },
  { name:"驚蟄", date:"2026-03-06", season:"spring", theme:"升陽護肝", icon:"⚡" },
  { name:"春分", date:"2026-03-21", season:"spring", theme:"陰陽平衡", icon:"⚖️" },
  { name:"清明", date:"2026-04-05", season:"spring", theme:"疏肝明目", icon:"🍃" },
  { name:"穀雨", date:"2026-04-20", season:"spring", theme:"雨生百穀", icon:"🌾" },
  { name:"立夏", date:"2026-05-06", season:"summer", theme:"養心安神", icon:"☀️" },
  { name:"小滿", date:"2026-05-21", season:"summer", theme:"清熱祛濕", icon:"🌿" },
  { name:"芒種", date:"2026-06-06", season:"summer", theme:"清心降火", icon:"🌾" },
  { name:"夏至", date:"2026-06-21", season:"summer", theme:"養心清暑", icon:"🔆" },
  { name:"小暑", date:"2026-07-07", season:"summer", theme:"消暑生津", icon:"🌡️" },
  { name:"大暑", date:"2026-07-23", season:"summer", theme:"清熱養陰", icon:"🔥" },
  { name:"立秋", date:"2026-08-07", season:"autumn", theme:"潤肺養陰", icon:"🍂" },
  { name:"處暑", date:"2026-08-23", season:"autumn", theme:"清餘熱", icon:"🌅" },
  { name:"白露", date:"2026-09-08", season:"autumn", theme:"滋陰潤燥", icon:"💧" },
  { name:"秋分", date:"2026-09-23", season:"autumn", theme:"平衡收藏", icon:"🍁" },
  { name:"寒露", date:"2026-10-08", season:"autumn", theme:"潤燥溫補", icon:"🌙" },
  { name:"霜降", date:"2026-10-23", season:"autumn", theme:"養陰潤肺", icon:"🌫️" },
  { name:"立冬", date:"2026-11-07", season:"winter", theme:"溫腎補陽", icon:"⛄" },
  { name:"小雪", date:"2026-11-22", season:"winter", theme:"養血安神", icon:"🌨️" },
  { name:"大雪", date:"2026-12-07", season:"winter", theme:"深度滋補", icon:"❄️" },
  { name:"冬至", date:"2026-12-22", season:"winter", theme:"陽氣初升", icon:"🕯️" },
];

// Solar term → herb IDs (using the 56 herbs)
const TERM_HERBS = {
  "小寒": [4, 2, 7, 14, 18, 15, 26, 37],
  "大寒": [4, 2, 6, 15, 17, 18, 7, 30],
  "立春": [8, 31, 35, 39, 5, 7, 3, 9],
  "雨水": [53, 54, 31, 10, 11, 6, 49, 56],
  "驚蟄": [5, 8, 35, 39, 32, 40, 49, 51],
  "春分": [35, 8, 5, 1, 7, 24, 16, 23],
  "清明": [5, 1, 35, 7, 39, 40, 24, 16],
  "穀雨": [54, 53, 31, 10, 49, 50, 11, 14],
  "立夏": [21, 53, 8, 5, 14, 18, 22, 25],
  "小滿": [54, 49, 53, 8, 21, 50, 51, 56],
  "芒種": [21, 5, 40, 47, 8, 24, 25, 50],
  "夏至": [21, 8, 5, 53, 22, 25, 28, 55],
  "小暑": [54, 8, 50, 49, 21, 55, 56, 52],
  "大暑": [54, 49, 50, 55, 53, 56, 51, 52],
  "立秋": [1, 15, 17, 11, 21, 16, 22, 13],
  "處暑": [5, 1, 13, 15, 21, 31, 16, 53],
  "白露": [1, 15, 21, 16, 22, 18, 11, 7],
  "秋分": [1, 53, 21, 14, 31, 11, 15, 16],
  "寒露": [1, 14, 18, 15, 11, 13, 31, 34],
  "霜降": [1, 15, 14, 11, 18, 31, 17, 7],
  "立冬": [4, 2, 7, 14, 18, 1, 15, 37],
  "小雪": [7, 14, 18, 2, 1, 15, 17, 21],
  "大雪": [4, 2, 7, 15, 18, 14, 17, 37],
  "冬至": [4, 2, 7, 14, 1, 15, 18, 6],
};

const MEDITATIONS = {
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

function getCurrentSolarTerm(dateStr) {
  const d = new Date(dateStr);
  let cur = SOLAR_TERMS_2026[SOLAR_TERMS_2026.length - 1];
  for (let i = 0; i < SOLAR_TERMS_2026.length; i++) { if (d >= new Date(SOLAR_TERMS_2026[i].date)) cur = SOLAR_TERMS_2026[i]; }
  return cur;
}
function getDayHerb(dateStr) {
  const term = getCurrentSolarTerm(dateStr);
  const dayOff = Math.floor((new Date(dateStr) - new Date(term.date)) / 86400000);
  const ids = TERM_HERBS[term.name] || TERM_HERBS["立春"];
  return HERBS.find(h => h.id === ids[((dayOff % ids.length) + ids.length) % ids.length]) || HERBS[0];
}
function getDayMeditation(herb, dateStr) {
  const ms = MEDITATIONS[herb.category] || MEDITATIONS["理氣"];
  const doy = Math.floor((new Date(dateStr) - new Date(dateStr.substring(0, 4) + "-01-01")) / 86400000);
  return ms[doy % ms.length];
}
function fmtDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

// ============================================================
// THEME
// ============================================================
const THEMES = {
  spring: { name:"春", bg:"#F7F3EB", card:"#FFFFFF", accent:"#5B8C5A", accentLight:"#E8F0E4", text:"#2C3E2D", textSec:"#6B7C6B", warm:"#C4956A", gradient:"linear-gradient(135deg, #E8F0E4 0%, #F0E8D8 100%)", headerBg:"linear-gradient(180deg, #DAE8D4 0%, #F7F3EB 100%)" },
  summer: { name:"夏", bg:"#FBF6EE", card:"#FFFFFF", accent:"#D4804E", accentLight:"#FDE8D8", text:"#3D2C1E", textSec:"#8B7355", warm:"#E8A065", gradient:"linear-gradient(135deg, #FDE8D8 0%, #FCF0E0 100%)", headerBg:"linear-gradient(180deg, #F5DFC8 0%, #FBF6EE 100%)" },
  autumn: { name:"秋", bg:"#F5F0E8", card:"#FFFFFF", accent:"#A0522D", accentLight:"#F0E0D0", text:"#3E2B1C", textSec:"#8B7355", warm:"#C07830", gradient:"linear-gradient(135deg, #F0E0D0 0%, #E8DBC8 100%)", headerBg:"linear-gradient(180deg, #E5D4C0 0%, #F5F0E8 100%)" },
  winter: { name:"冬", bg:"#F0F2F5", card:"#FFFFFF", accent:"#4A6B8A", accentLight:"#DDE6EE", text:"#1E2D3D", textSec:"#5A6B7D", warm:"#7B9AB5", gradient:"linear-gradient(135deg, #DDE6EE 0%, #E8E4F0 100%)", headerBg:"linear-gradient(180deg, #D0DCE8 0%, #F0F2F5 100%)" },
};
function getSeason(d) { const m = d.getMonth(); if (m >= 1 && m <= 4) return "spring"; if (m >= 5 && m <= 7) return "summer"; if (m >= 8 && m <= 10) return "autumn"; return "winter"; }

// Persistence
function ld(k, d) { try { const v = localStorage.getItem("tcm_"+k); return v ? JSON.parse(v) : d; } catch { return d; } }
function sv(k, v) { try { localStorage.setItem("tcm_"+k, JSON.stringify(v)); } catch {} }

// ============================================================
// ICONS
// ============================================================
const I = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Cal: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Leaf: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Play: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Pause: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Heart: ({f}) => f ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  CL: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  CR: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Vol: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  Chk: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
};

// Herb image path helper
function herbImg(herb) { return `./herbs/${herb.img}`; }

// ============================================================
// COMPONENTS
// ============================================================

function Nav({ view, setView, t }) {
  const tabs = [{ id:"today", label:"今日", icon:I.Home }, { id:"calendar", label:"日曆", icon:I.Cal }, { id:"herbs", label:"本草", icon:I.Leaf }, { id:"journey", label:"旅程", icon:I.User }];
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderTop:"1px solid rgba(0,0,0,0.06)", zIndex:100, display:"flex", justifyContent:"center", padding:"0 0 env(safe-area-inset-bottom)" }}>
      <div style={{ display:"flex", maxWidth:420, width:"100%", justifyContent:"space-around" }}>
        {tabs.map(tb => { const a = view===tb.id; return (
          <button key={tb.id} onClick={()=>setView(tb.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", color:a?t.accent:t.textSec, transition:"all 0.2s", opacity:a?1:0.6 }}>
            <tb.icon /><span style={{ fontSize:10, fontWeight:a?600:400, letterSpacing:"0.05em" }}>{tb.label}</span>
          </button>);
        })}
      </div>
    </nav>
  );
}

function TodayView({ t, stats, setStats }) {
  const today = fmtDate(new Date()); const term = getCurrentSolarTerm(today); const herb = getDayHerb(today);
  const med = getDayMeditation(herb, today);
  const [favs, setFavs] = useState(()=>ld("favs",[])); const isFav = favs.includes(herb.id);
  const togFav = () => { const n = isFav ? favs.filter(f=>f!==herb.id) : [...favs, herb.id]; setFavs(n); sv("favs", n); };
  const d = new Date(); const wd = ["日","一","二","三","四","五","六"];

  return (
    <div style={{ paddingBottom:90 }}>
      <div style={{ background:t.headerBg, margin:"-8px -16px 0", padding:"32px 24px 24px", borderRadius:"0 0 28px 28px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:12, right:16, fontSize:56, opacity:0.12 }}>{term.icon}</div>
        <div style={{ fontSize:12, color:t.textSec, letterSpacing:"0.15em", marginBottom:4 }}>{d.getFullYear()} 年 {d.getMonth()+1} 月 {d.getDate()} 日 星期{wd[d.getDay()]}</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:6 }}>
          <span className="font-serif-tc" style={{ fontSize:28, fontWeight:700, color:t.text }}>{term.name}</span>
          <span style={{ fontSize:13, color:t.accent, fontWeight:500 }}>{term.theme}</span>
        </div>
        <div style={{ fontSize:13, color:t.textSec }}>{term.icon} 節氣養生 · {herb.category}</div>
      </div>

      {/* Herb card with image */}
      <div style={{ background:t.card, borderRadius:20, padding:"24px", marginTop:20, boxShadow:"0 2px 20px rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", gap:16, marginBottom:16 }}>
          <img src={herbImg(herb)} alt={herb.name} style={{ width:88, height:88, borderRadius:16, objectFit:"cover", background:t.accentLight }} onError={e=>{e.target.style.display='none'}} />
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11, color:t.accent, fontWeight:600, letterSpacing:"0.1em", marginBottom:4 }}>今日藥材 · {herb.category}</div>
                <div className="font-serif-tc" style={{ fontSize:24, fontWeight:700, color:t.text }}>{herb.name}</div>
                <div style={{ fontSize:12, color:t.textSec, marginTop:2 }}>{herb.pinyin}</div>
              </div>
              <button onClick={togFav} style={{ background:isFav?t.accentLight:"rgba(0,0,0,0.03)", border:"none", borderRadius:12, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:isFav?"#E25555":t.textSec }}><I.Heart f={isFav}/></button>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {[`性 ${herb.nature}`,`味 ${herb.taste}`, herb.meridian].map((tag,i)=><span key={i} style={{ fontSize:11, padding:"4px 10px", borderRadius:20, background:t.accentLight, color:t.accent, fontWeight:500 }}>{tag}</span>)}
        </div>
        <p style={{ fontSize:14, color:t.text, lineHeight:1.8, marginBottom:8 }}>{herb.desc}</p>
        <div style={{ fontSize:12, color:t.accent, fontWeight:500 }}>功效：{herb.effect}</div>
      </div>

      <MedPlayer t={t} herb={herb} med={med} term={term} stats={stats} setStats={setStats} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }}>
        {[{ l:"冥想天數", v:stats.totalDays||0 },{ l:"連續天數", v:stats.streak||0 },{ l:"收藏藥材", v:favs.length }].map((s,i)=>(
          <div key={i} style={{ background:t.card, borderRadius:16, padding:"16px 12px", textAlign:"center", boxShadow:"0 1px 8px rgba(0,0,0,0.03)", border:"1px solid rgba(0,0,0,0.04)" }}>
            <div className="font-serif-tc" style={{ fontSize:24, fontWeight:700, color:t.accent }}>{s.v}</div>
            <div style={{ fontSize:11, color:t.textSec, marginTop:4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedPlayer({ t, herb, med, term, stats, setStats }) {
  const [playing, setPlaying] = useState(false);
  const [dur, setDur] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [breath, setBreath] = useState("idle");
  const timerRef = useRef(null); const breathRef = useRef(null);
  const durs = [{l:"3分鐘",v:180},{l:"5分鐘",v:300},{l:"10分鐘",v:600},{l:"15分鐘",v:900}];

  const startBreath = () => { const cycle = () => { setBreath("inhale"); breathRef.current = setTimeout(()=>{ setBreath("hold"); breathRef.current = setTimeout(()=>{ setBreath("exhale"); breathRef.current = setTimeout(cycle, 4000); }, 2000); }, 4000); }; cycle(); };
  const start = () => { setPlaying(true); setElapsed(0); audioEngine.playSoundscape(herb.category, term.season); startBreath(); };
  const stop = useCallback(() => {
    setPlaying(false); audioEngine.stop();
    if(timerRef.current) clearInterval(timerRef.current);
    if(breathRef.current) clearTimeout(breathRef.current);
    setBreath("idle");
    if(elapsed>30) {
      const td = fmtDate(new Date());
      const ns = { ...stats, totalDays:(stats.totalDays||0)+(stats.lastDate===td?0:1), totalMinutes:(stats.totalMinutes||0)+Math.floor(elapsed/60), lastDate:td, streak: stats.lastDate===fmtDate(new Date(Date.now()-86400000))?(stats.streak||0)+1:stats.lastDate===td?(stats.streak||1):1, herbsExplored:[...new Set([...(stats.herbsExplored||[]), herb.id])], meditatedDates:[...new Set([...(stats.meditatedDates||[]), td])] };
      setStats(ns); sv("stats", ns);
    }
  }, [elapsed, stats, herb.id, setStats]);

  useEffect(()=>{ if(playing){ timerRef.current=setInterval(()=>setElapsed(p=>p+1),1000); } return ()=>{if(timerRef.current)clearInterval(timerRef.current);}; },[playing]);
  useEffect(()=>{ if(elapsed>=dur&&playing) stop(); },[elapsed,dur,playing,stop]);
  useEffect(()=>()=>{ audioEngine.stop(); if(breathRef.current)clearTimeout(breathRef.current); },[]);

  const rem=dur-elapsed; const mn=Math.floor(rem/60); const sc=rem%60; const prog=elapsed/dur;
  const bLabels={idle:"",inhale:"吸氣",hold:"屏息",exhale:"呼氣"};
  const bScale=breath==="inhale"?1.3:breath==="hold"?1.3:1;

  return (
    <div style={{ background:t.card, borderRadius:20, padding:24, marginTop:20, boxShadow:"0 2px 20px rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize:11, color:t.accent, fontWeight:600, letterSpacing:"0.1em", marginBottom:12 }}>正念冥想 · {herb.name} · {herb.category}音頻</div>
      <p style={{ fontSize:14, color:t.text, lineHeight:1.8, fontStyle:"italic", padding:"12px 16px", background:t.accentLight, borderRadius:12, borderLeft:`3px solid ${t.accent}`, marginBottom:20 }}>{med}</p>
      <div style={{ display:"flex", justifyContent:"center", margin:"8px 0 20px" }}>
        <div style={{ position:"relative", width:160, height:160 }}>
          <svg width="160" height="160" style={{ position:"absolute", transform:"rotate(-90deg)" }}>
            <circle cx="80" cy="80" r="72" fill="none" stroke={t.accentLight} strokeWidth="4"/>
            <circle cx="80" cy="80" r="72" fill="none" stroke={t.accent} strokeWidth="4" strokeDasharray={`${prog*452} 452`} strokeLinecap="round" style={{transition:"stroke-dasharray 1s linear"}}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:90, height:90, borderRadius:"50%", background:`radial-gradient(circle,${t.accentLight} 0%,${t.accent}33 100%)`, transform:`scale(${bScale})`, transition:breath==="inhale"||breath==="exhale"?"transform 4s ease-in-out":"transform 0.3s", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
              {playing ? <div style={{ fontSize:13, fontWeight:600, color:t.accent }}>{bLabels[breath]}</div> : <div className="font-serif-tc" style={{ fontSize:22, fontWeight:700, color:t.accent }}>{mn}:{String(sc).padStart(2,"0")}</div>}
            </div>
          </div>
        </div>
      </div>
      {playing && <div style={{textAlign:"center",marginBottom:16}}><span className="font-serif-tc" style={{fontSize:28,fontWeight:700,color:t.text}}>{mn}:{String(sc).padStart(2,"0")}</span></div>}
      {!playing && <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>{durs.map(d=><button key={d.v} onClick={()=>setDur(d.v)} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:dur===d.v?t.accent:t.accentLight,color:dur===d.v?"#fff":t.accent}}>{d.l}</button>)}</div>}
      <div style={{display:"flex",justifyContent:"center"}}>
        <button onClick={playing?stop:start} style={{display:"flex",alignItems:"center",gap:8,padding:"14px 36px",borderRadius:28,border:"none",cursor:"pointer",background:playing?"rgba(0,0,0,0.06)":t.accent,color:playing?t.text:"#fff",fontSize:15,fontWeight:600,boxShadow:playing?"none":`0 4px 16px ${t.accent}44`}}>
          {playing?<><I.Pause/> 結束冥想</>:<><I.Play/> 開始冥想</>}
        </button>
      </div>
      {playing && <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:12}}>
        <I.Vol/><span style={{fontSize:11,color:t.textSec}}>{herb.category}音景 · {herb.name}</span>
        <div style={{display:"flex",gap:2,alignItems:"end"}}>{[12,18,10,16,8].map((h,i)=><div key={i} style={{width:3,height:h,background:t.accent,borderRadius:2,opacity:0.5,animation:`tcmAB 0.8s ease-in-out ${i*0.1}s infinite alternate`}}/>)}</div>
      </div>}
      <style>{`@keyframes tcmAB{from{transform:scaleY(0.4)}to{transform:scaleY(1)}}`}</style>
    </div>
  );
}

function CalendarView({ t, stats }) {
  const [vd, setVd] = useState(new Date()); const [sel, setSel] = useState(null);
  const y=vd.getFullYear(); const m=vd.getMonth(); const fd=new Date(y,m,1).getDay(); const dim=new Date(y,m+1,0).getDate(); const today=fmtDate(new Date());
  const mTerms=SOLAR_TERMS_2026.filter(t=>{const d=new Date(t.date);return d.getFullYear()===y&&d.getMonth()===m;});
  const days=[]; for(let i=0;i<fd;i++)days.push(null); for(let d=1;d<=dim;d++)days.push(d);
  const sHerb=sel?getDayHerb(sel):null; const sTerm=sel?getCurrentSolarTerm(sel):null; const sMed=sel&&sHerb?getDayMeditation(sHerb,sel):null;

  return (
    <div style={{paddingBottom:90}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 0 16px"}}>
        <button onClick={()=>setVd(new Date(y,m-1,1))} style={{background:"none",border:"none",cursor:"pointer",color:t.text,padding:8}}><I.CL/></button>
        <div style={{textAlign:"center"}}>
          <div className="font-serif-tc" style={{fontSize:22,fontWeight:700,color:t.text}}>{y} 年 {m+1} 月</div>
          {mTerms.length>0&&<div style={{fontSize:12,color:t.accent,marginTop:4}}>{mTerms.map(tt=>`${tt.icon} ${tt.name}`).join("  ")}</div>}
        </div>
        <button onClick={()=>setVd(new Date(y,m+1,1))} style={{background:"none",border:"none",cursor:"pointer",color:t.text,padding:8}}><I.CR/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{["日","一","二","三","四","五","六"].map(w=><div key={w} style={{textAlign:"center",fontSize:11,color:t.textSec,padding:"6px 0",fontWeight:500}}>{w}</div>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {days.map((d,i)=>{
          if(!d)return <div key={i}/>;
          const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isT=ds===today; const isS=ds===sel; const isST=mTerms.some(tt=>tt.date===ds);
          const hasMed=(stats.meditatedDates||[]).includes(ds);
          return (<button key={i} onClick={()=>setSel(isS?null:ds)} style={{position:"relative",background:isS?t.accent:isT?t.accentLight:"transparent",border:"none",borderRadius:12,padding:"10px 0",cursor:"pointer",color:isS?"#fff":isT?t.accent:t.text,fontWeight:isT||isS?700:400,fontSize:14,transition:"all 0.15s"}}>
            {d}
            {isST&&<div style={{position:"absolute",bottom:3,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:isS?"#fff":t.accent}}/>}
            {hasMed&&!isST&&<div style={{position:"absolute",bottom:3,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:isS?"#fff":t.warm}}/>}
          </button>);
        })}
      </div>
      {sel&&sHerb&&(
        <div style={{background:t.card,borderRadius:20,padding:"20px 24px",marginTop:20,boxShadow:"0 2px 16px rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.04)",animation:"tcmFI 0.3s ease"}}>
          <div style={{display:"flex",gap:14,marginBottom:12}}>
            <img src={herbImg(sHerb)} alt={sHerb.name} style={{width:60,height:60,borderRadius:12,objectFit:"cover",background:t.accentLight}} onError={e=>{e.target.style.display='none'}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:t.accent,fontWeight:600}}>{sTerm?.icon} {sTerm?.name} · {sTerm?.theme}</div>
              <div className="font-serif-tc" style={{fontSize:20,fontWeight:700,color:t.text,marginTop:2}}>{sHerb.name}</div>
              <div style={{fontSize:11,color:t.textSec}}>{sHerb.pinyin} · {sHerb.category}</div>
            </div>
            <span style={{fontSize:12,color:t.textSec}}>{sel.replace(/-/g,"/")}</span>
          </div>
          <p style={{fontSize:13,color:t.textSec,lineHeight:1.7,marginBottom:10}}>{sHerb.desc}</p>
          <p style={{fontSize:13,color:t.text,lineHeight:1.7,fontStyle:"italic",padding:"10px 14px",background:t.accentLight,borderRadius:10}}>{sMed}</p>
        </div>
      )}
      <style>{`@keyframes tcmFI{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function HerbsView({ t }) {
  const [search, setSearch] = useState(""); const [cat, setCat] = useState("全部"); const [sel, setSel] = useState(null);
  const cats = ["全部","補氣","補血","養心安神","重鎮安神","理氣","活血化瘀","利水滲濕"];
  const filtered = useMemo(()=>HERBS.filter(h=>{const ms=!search||h.name.includes(search)||h.pinyin.toLowerCase().includes(search.toLowerCase())||h.effect.includes(search);const mc=cat==="全部"||h.category===cat;return ms&&mc;}),[search,cat]);

  return (
    <div style={{paddingBottom:90}}>
      <div style={{padding:"20px 0 12px"}}>
        <h1 className="font-serif-tc" style={{fontSize:24,fontWeight:700,color:t.text,marginBottom:4}}>本草圖鑑</h1>
        <p style={{fontSize:13,color:t.textSec}}>收錄 {HERBS.length} 種中藥材</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:t.card,borderRadius:14,border:"1px solid rgba(0,0,0,0.06)",marginBottom:12}}>
        <I.Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋藥材名稱、功效..." style={{flex:1,border:"none",background:"none",outline:"none",fontSize:14,color:t.text,fontFamily:"inherit"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:t.textSec}}><I.X/></button>}
      </div>
      <div className="no-scrollbar" style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:12,scrollbarWidth:"none"}}>
        {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{whiteSpace:"nowrap",padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,flexShrink:0,background:cat===c?t.accent:t.accentLight,color:cat===c?"#fff":t.accent}}>{c}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {filtered.map(h=>(
          <button key={h.id} onClick={()=>setSel(h)} style={{background:t.card,borderRadius:16,padding:14,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 1px 8px rgba(0,0,0,0.03)",cursor:"pointer",textAlign:"left"}}>
            <img src={herbImg(h)} alt={h.name} style={{width:"100%",height:100,borderRadius:12,objectFit:"cover",background:t.accentLight,marginBottom:10}} onError={e=>{e.target.style.display='none'}}/>
            <div className="font-serif-tc" style={{fontSize:16,fontWeight:700,color:t.text}}>{h.name}</div>
            <div style={{fontSize:11,color:t.textSec,marginTop:2}}>{h.pinyin}</div>
            <div style={{fontSize:10,marginTop:6,padding:"3px 8px",borderRadius:8,background:t.accentLight,color:t.accent,display:"inline-block"}}>{h.category}</div>
          </button>
        ))}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:t.textSec}}>找不到符合條件的藥材</div>}

      {sel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"tcmFI 0.2s ease"}} onClick={()=>setSel(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"24px 24px 0 0",padding:"24px 24px 40px",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto",animation:"tcmSU 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div style={{display:"flex",gap:14}}>
                <img src={herbImg(sel)} alt={sel.name} style={{width:72,height:72,borderRadius:16,objectFit:"cover",background:t.accentLight}} onError={e=>{e.target.style.display='none'}}/>
                <div>
                  <div style={{fontSize:11,color:t.accent,fontWeight:600}}>{sel.category}</div>
                  <div className="font-serif-tc" style={{fontSize:24,fontWeight:700,color:t.text,marginTop:2}}>{sel.name}</div>
                  <div style={{fontSize:13,color:t.textSec}}>{sel.pinyin}</div>
                </div>
              </div>
              <button onClick={()=>setSel(null)} style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:12,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:t.textSec}}><I.X/></button>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {[`性味：${sel.nature}性 ${sel.taste}`,`歸經：${sel.meridian}`].map((tag,i)=><span key={i} style={{fontSize:12,padding:"5px 12px",borderRadius:20,background:t.accentLight,color:t.accent}}>{tag}</span>)}
            </div>
            <div style={{background:t.card,borderRadius:16,padding:"16px 18px",marginBottom:16,border:"1px solid rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:12,fontWeight:600,color:t.accent,marginBottom:6}}>功效</div>
              <div style={{fontSize:14,color:t.text,lineHeight:1.6}}>{sel.effect}</div>
            </div>
            <p style={{fontSize:14,color:t.text,lineHeight:1.8}}>{sel.desc}</p>
          </div>
        </div>
      )}
      <style>{`@keyframes tcmSU{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes tcmFI{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}

function JourneyView({ t, stats }) {
  const lv=Math.floor((stats.totalDays||0)/7)+1; const xpIn=(stats.totalDays||0)%7; const xpProg=xpIn/7;
  const lvNames=["初學者","入門者","修習者","靜心者","覺察者","內觀者","明心者","養生者","通達者","大師"];
  const lvName=lvNames[Math.min(lv-1,lvNames.length-1)];
  const achs=[
    {n:"初心萌芽",d:"完成第一次冥想",u:(stats.totalDays||0)>=1,i:"🌱"},
    {n:"七日啟程",d:"累計冥想 7 天",u:(stats.totalDays||0)>=7,i:"🚶"},
    {n:"月滿初成",d:"累計冥想 30 天",u:(stats.totalDays||0)>=30,i:"🌕"},
    {n:"本草初識",d:"探索 10 種藥材",u:(stats.herbsExplored||[]).length>=10,i:"📖"},
    {n:"百草學者",d:"探索 30 種藥材",u:(stats.herbsExplored||[]).length>=30,i:"🎓"},
    {n:"連續三日",d:"連續冥想 3 天",u:(stats.streak||0)>=3,i:"🔥"},
    {n:"週週不斷",d:"連續冥想 7 天",u:(stats.streak||0)>=7,i:"⚡"},
    {n:"靜坐一時",d:"累計冥想 60 分鐘",u:(stats.totalMinutes||0)>=60,i:"⏰"},
    {n:"深度冥想",d:"累計冥想 300 分鐘",u:(stats.totalMinutes||0)>=300,i:"🧘"},
  ];
  return (
    <div style={{paddingBottom:90}}>
      <div style={{padding:"20px 0 16px"}}><h1 className="font-serif-tc" style={{fontSize:24,fontWeight:700,color:t.text}}>我的旅程</h1></div>
      <div style={{background:t.gradient,borderRadius:20,padding:24,marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:12,right:16,fontSize:48,opacity:0.1}}>🏔️</div>
        <div style={{fontSize:12,color:t.accent,fontWeight:600,letterSpacing:"0.1em",marginBottom:4}}>等級 {lv}</div>
        <div className="font-serif-tc" style={{fontSize:24,fontWeight:700,color:t.text,marginBottom:12}}>{lvName}</div>
        <div style={{height:8,background:"rgba(0,0,0,0.06)",borderRadius:4,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",background:t.accent,borderRadius:4,width:`${xpProg*100}%`,transition:"width 0.5s ease"}}/></div>
        <div style={{fontSize:11,color:t.textSec}}>{xpIn} / 7 天升級</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
        {[{l:"冥想天數",v:stats.totalDays||0,i:"📅"},{l:"連續天數",v:stats.streak||0,i:"🔥"},{l:"總分鐘數",v:stats.totalMinutes||0,i:"⏱️"},{l:"探索藥材",v:(stats.herbsExplored||[]).length,i:"🌿"}].map((s,i)=>(
          <div key={i} style={{background:t.card,borderRadius:16,padding:"18px 16px",boxShadow:"0 1px 8px rgba(0,0,0,0.03)",border:"1px solid rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:20,marginBottom:8}}>{s.i}</div>
            <div className="font-serif-tc" style={{fontSize:26,fontWeight:700,color:t.text}}>{s.v}</div>
            <div style={{fontSize:12,color:t.textSec,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      <h2 className="font-serif-tc" style={{fontSize:18,fontWeight:700,color:t.text,marginBottom:14}}>成就 ({achs.filter(a=>a.u).length}/{achs.length})</h2>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {achs.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:a.u?t.card:"rgba(0,0,0,0.02)",borderRadius:14,border:a.u?"1px solid rgba(0,0,0,0.04)":"1px solid rgba(0,0,0,0.02)",opacity:a.u?1:0.5}}>
            <div style={{width:42,height:42,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,background:a.u?t.accentLight:"rgba(0,0,0,0.04)"}}>{a.i}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:t.text}}>{a.n}</div><div style={{fontSize:11,color:t.textSec,marginTop:2}}>{a.d}</div></div>
            {a.u&&<div style={{color:t.accent}}><I.Chk/></div>}
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
  const [stats, setStats] = useState(()=>ld("stats",{totalDays:0,totalMinutes:0,streak:0,lastDate:null,herbsExplored:[],meditatedDates:[]}));
  const season = getSeason(new Date()); const t = THEMES[season];
  return (
    <div style={{minHeight:"100vh",background:t.bg,fontFamily:"'Noto Serif TC','Noto Sans TC','Hiragino Sans','Microsoft YaHei',serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"8px 16px",minHeight:"100vh"}}>
        {view==="today"&&<TodayView t={t} stats={stats} setStats={setStats}/>}
        {view==="calendar"&&<CalendarView t={t} stats={stats}/>}
        {view==="herbs"&&<HerbsView t={t}/>}
        {view==="journey"&&<JourneyView t={t} stats={stats}/>}
      </div>
      <Nav view={view} setView={setView} t={t}/>
    </div>
  );
}
