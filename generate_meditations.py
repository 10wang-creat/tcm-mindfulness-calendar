#!/usr/bin/env python3
"""
================================================================================
TCM 正念日曆 - 54種草藥冥想音檔批量生成器
================================================================================

使用方式：
    py generate_meditations.py              # 生成所有54個音檔
    py generate_meditations.py --start 1 --end 10    # 只生成第1到第10個
    py generate_meditations.py --herb 薄荷           # 只生成特定草藥

輸出：public/meditations/meditation_XX_herbname.mp3
================================================================================
"""

import asyncio
import subprocess
import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

try:
    import edge_tts
except ImportError:
    print("正在安裝 edge-tts...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
    import edge_tts


# ============================================================================
# 配置
# ============================================================================

VOICE = "zh-TW-HsiaoChenNeural"  # 台灣女聲
RATE = "-15%"   # 語速
PITCH = "-5Hz"  # 音調

# 輸出目錄
OUTPUT_DIR = Path(__file__).parent / "public" / "meditations"
TEMP_DIR = Path(__file__).parent / "temp_meditation"


# ============================================================================
# 54種草藥資料庫
# ============================================================================

HERBS_DATABASE = [
    # ===== 冬季養生 (1-14) =====
    {"id": 1, "name": "人參", "pinyin": "renshen", "effect": "大補元氣", "season": "冬",
     "visual": "人形般的根莖，帶著淡淡的金黃光澤",
     "sensation": "溫暖的能量從丹田向全身擴散，如同冬日暖陽",
     "aroma": "淡淡的泥土香與甘甜氣息"},
    {"id": 2, "name": "黃耆", "pinyin": "huangqi", "effect": "補氣固表", "season": "冬",
     "visual": "金黃色的根片，紋理細膩，散發著溫暖的光芒",
     "sensation": "一股溫和的力量從體表向內滲透，穩固而持久",
     "aroma": "微甜的藥香，帶有一絲豆香"},
    {"id": 3, "name": "黨參", "pinyin": "dangshen", "effect": "補中益氣", "season": "冬",
     "visual": "質地柔韌的根條，表面有細密的紋理",
     "sensation": "溫和的能量在脾胃區域緩緩流動，帶來滿足感",
     "aroma": "甜美的藥香，如同秋收的穀物"},
    {"id": 4, "name": "白朮", "pinyin": "baizhu", "effect": "健脾益氣", "season": "冬",
     "visual": "乳白色的塊根，質地堅實，切面細膩",
     "sensation": "脾胃區域感到溫暖踏實，消化系統變得輕盈",
     "aroma": "清新的藥香，帶有一絲辛香"},
    {"id": 5, "name": "茯苓", "pinyin": "fuling", "effect": "健脾寧心", "season": "冬",
     "visual": "潔白如玉的塊狀，質地輕盈，彷彿凝固的雲朵",
     "sensation": "心神逐漸安定，如同湖水歸於平靜",
     "aroma": "淡雅的松木香，帶有一絲甘甜"},
    {"id": 6, "name": "山藥", "pinyin": "shanyao", "effect": "補脾養胃", "season": "冬",
     "visual": "潔白細膩的切面，如同晨露中的白玉",
     "sensation": "脾胃被溫柔地滋養，身體感到輕盈舒適",
     "aroma": "清淡的澱粉香氣，帶有泥土的氣息"},
    {"id": 7, "name": "甘草", "pinyin": "gancao", "effect": "調和諸藥", "season": "冬",
     "visual": "金褐色的根條，纖維分明，質地堅韌",
     "sensation": "一股和諧的能量調和全身，各處都變得平衡",
     "aroma": "甜美的焦糖香，溫暖而親切"},
    {"id": 8, "name": "大棗", "pinyin": "dazao", "effect": "補中益氣", "season": "冬",
     "visual": "飽滿的深紅色果實，表面有細緻的皺紋",
     "sensation": "甜美的能量滋養著身心，帶來溫暖與滿足",
     "aroma": "濃郁的果香，甜美而溫馨"},
    {"id": 9, "name": "紅棗", "pinyin": "hongzao", "effect": "養血安神", "season": "冬",
     "visual": "溫潤的紅棕色，果肉飽滿，散發著生命力",
     "sensation": "血液被溫柔地滋養，心神逐漸安定",
     "aroma": "香甜的棗香，讓人感到安心"},
    {"id": 10, "name": "蜂蜜", "pinyin": "fengmi", "effect": "補中潤燥", "season": "冬",
     "visual": "晶瑩剔透的金黃色，緩緩流動，如同液態陽光",
     "sensation": "甜美的能量潤澤五臟六腑，帶來深層的滋養",
     "aroma": "百花的芬芳，甜美而自然"},
    {"id": 11, "name": "龍骨", "pinyin": "longgu", "effect": "鎮靜安神", "season": "冬",
     "visual": "古老而沉穩的灰白色塊狀，帶著歲月的沉澱",
     "sensation": "心神如大地般沉穩，雜念逐漸平息",
     "aroma": "淡淡的礦物質氣息，古樸而安定"},
    {"id": 12, "name": "牡蠣", "pinyin": "muli", "effect": "收斂固澀", "season": "冬",
     "visual": "層層疊疊的貝殼，帶著海洋的神秘",
     "sensation": "身體的能量被溫柔地收斂，如同潮水歸於平靜",
     "aroma": "淡淡的海洋氣息，清新而深遠"},
    {"id": 13, "name": "磁石", "pinyin": "cishi", "effect": "鎮心安神", "season": "冬",
     "visual": "深邃的黑色礦石，帶著神秘的磁性力量",
     "sensation": "心神被穩穩地錨定，如同大地的引力",
     "aroma": "清冽的礦石氣息，沉穩而有力"},
    {"id": 14, "name": "琥珀", "pinyin": "hupo", "effect": "安神定志", "season": "冬",
     "visual": "溫潤的金黃色，透明而溫暖，凝固了千年的時光",
     "sensation": "心志逐漸安定，思緒變得清明透徹",
     "aroma": "淡淡的松香，帶著遠古的溫暖"},
    
    # ===== 春季養生 (15-28) =====
    {"id": 15, "name": "當歸", "pinyin": "danggui", "effect": "補血活血", "season": "春",
     "visual": "深褐色的根莖，帶著生命的韌性與力量",
     "sensation": "血液被溫柔地活化，循環變得順暢",
     "aroma": "濃郁的藥香，帶有一絲辛甜"},
    {"id": 16, "name": "白芍", "pinyin": "baishao", "effect": "養血柔肝", "season": "春",
     "visual": "淡粉色的切面，質地細膩，如同春日的花瓣",
     "sensation": "肝氣被溫柔地舒緩，身心變得柔軟放鬆",
     "aroma": "淡雅的花香，帶有一絲微酸"},
    {"id": 17, "name": "川芎", "pinyin": "chuanxiong", "effect": "行氣活血", "season": "春",
     "visual": "紋理交錯的根莖，彷彿蘊含著流動的能量",
     "sensation": "氣血開始活絡流動，如同春水解凍",
     "aroma": "清新的辛香，帶有一絲芹菜香"},
    {"id": 18, "name": "丹參", "pinyin": "danshen", "effect": "活血養心", "season": "春",
     "visual": "深紫紅色的根，如同凝固的血液，蘊含生命力",
     "sensation": "心臟區域感到溫暖，血脈通暢無阻",
     "aroma": "淡淡的藥香，帶有一絲苦味"},
    {"id": 19, "name": "紅花", "pinyin": "honghua", "effect": "活血祛瘀", "season": "春",
     "visual": "艷麗的橙紅色花瓣，如同朝陽的光芒",
     "sensation": "瘀滯的能量被溫柔地化開，循環恢復流暢",
     "aroma": "獨特的花香，帶有一絲辛辣"},
    {"id": 20, "name": "桃仁", "pinyin": "taoren", "effect": "活血祛瘀", "season": "春",
     "visual": "扁平的種子，帶著桃花的記憶與春天的希望",
     "sensation": "瘀血被輕柔地化解，新的能量開始流動",
     "aroma": "淡淡的杏仁香，帶有一絲苦味"},
    {"id": 21, "name": "益母草", "pinyin": "yimucao", "effect": "活血調經", "season": "春",
     "visual": "翠綠的葉片，帶著母性般溫柔的力量",
     "sensation": "氣血被溫柔地調和，身體節律恢復和諧",
     "aroma": "青草的清香，帶有一絲苦味"},
    {"id": 22, "name": "雞血藤", "pinyin": "jixueteng", "effect": "補血活絡", "season": "春",
     "visual": "切面呈現紅褐色，如同流動的血液",
     "sensation": "經絡逐漸通暢，四肢感到溫暖有力",
     "aroma": "淡淡的木質香，帶有一絲甜味"},
    {"id": 23, "name": "三七", "pinyin": "sanqi", "effect": "化瘀止血", "season": "春",
     "visual": "質地堅實的塊根，蘊含強大的療癒力量",
     "sensation": "身體的自癒能力被喚醒，創傷開始修復",
     "aroma": "獨特的人參香，帶有一絲苦味"},
    {"id": 24, "name": "延胡索", "pinyin": "yanhusuo", "effect": "活血止痛", "season": "春",
     "visual": "金黃色的塊莖，如同凝固的陽光",
     "sensation": "疼痛被溫柔地化解，身體逐漸放鬆",
     "aroma": "淡淡的藥香，帶有一絲辛味"},
    {"id": 25, "name": "鬱金", "pinyin": "yujin", "effect": "行氣解鬱", "season": "春",
     "visual": "明亮的橙黃色，如同春日的陽光",
     "sensation": "鬱悶的情緒被輕柔地疏解，心胸逐漸開闊",
     "aroma": "清新的薑香，帶有一絲苦味"},
    {"id": 26, "name": "薑黃", "pinyin": "jianghuang", "effect": "活血行氣", "season": "春",
     "visual": "鮮豔的金黃色，充滿活力與能量",
     "sensation": "氣血開始活躍流動，身體充滿活力",
     "aroma": "溫暖的辛香，帶有一絲土地氣息"},
    {"id": 27, "name": "香附", "pinyin": "xiangfu", "effect": "理氣解鬱", "season": "春",
     "visual": "深褐色的塊莖，表面有著細密的紋理",
     "sensation": "肝氣被溫柔地疏導，情緒逐漸平和",
     "aroma": "特殊的香氣，帶有一絲辛甜"},
    {"id": 28, "name": "枸杞", "pinyin": "gouqi", "effect": "滋補肝腎", "season": "春",
     "visual": "飽滿的紅色果實，如同珍貴的紅寶石",
     "sensation": "眼睛感到明亮，腰膝變得有力",
     "aroma": "甜美的果香，溫暖而滋養"},
    
    # ===== 夏季養生 (29-42) =====
    {"id": 29, "name": "薄荷", "pinyin": "bohe", "effect": "疏散風熱", "season": "夏",
     "visual": "翠綠的葉片在微風中輕輕搖曳，清新自然",
     "sensation": "一股清涼從頭頂流向全身，暑熱消散",
     "aroma": "清涼的薄荷香，提神醒腦"},
    {"id": 30, "name": "菊花", "pinyin": "juhua", "effect": "清熱明目", "season": "夏",
     "visual": "優雅的花瓣層層綻放，如同秋日的陽光",
     "sensation": "眼睛感到清涼舒適，頭腦變得清明",
     "aroma": "淡雅的花香，清新怡人"},
    {"id": 31, "name": "艾草", "pinyin": "aicao", "effect": "溫經止血", "season": "夏",
     "visual": "銀灰色的絨毛覆蓋著葉片，帶著古老的智慧",
     "sensation": "溫暖的能量在經絡中流動，驅散寒涼",
     "aroma": "獨特的艾香，溫暖而安心"},
    {"id": 32, "name": "茵陳", "pinyin": "yinchen", "effect": "清利濕熱", "season": "夏",
     "visual": "纖細的莖葉，帶著春天的嫩綠",
     "sensation": "體內的濕熱被清理，身體變得輕盈",
     "aroma": "清新的青草香，帶有一絲苦味"},
    {"id": 33, "name": "金錢草", "pinyin": "jinqiancao", "effect": "清熱利濕", "season": "夏",
     "visual": "圓形的葉片如同小小的銅錢，排列整齊",
     "sensation": "濕熱之邪被溫柔地排出體外",
     "aroma": "淡淡的草香，清新自然"},
    {"id": 34, "name": "車前草", "pinyin": "cheqiancao", "effect": "清熱利尿", "season": "夏",
     "visual": "寬大的葉片貼地生長，質樸而堅韌",
     "sensation": "體內的濁水被清理，身體變得清爽",
     "aroma": "淡淡的青草香，帶有泥土氣息"},
    {"id": 35, "name": "澤瀉", "pinyin": "zexie", "effect": "利水滲濕", "season": "夏",
     "visual": "潔白的切面，如同水中的蓮藕",
     "sensation": "多餘的水分被溫柔地疏導排出",
     "aroma": "淡淡的清香，帶有一絲甜味"},
    {"id": 36, "name": "滑石", "pinyin": "huashi", "effect": "清熱利濕", "season": "夏",
     "visual": "細膩的白色粉末，如同夏日的清涼",
     "sensation": "暑熱被清涼地化解，身體感到舒爽",
     "aroma": "淡淡的礦物質氣息，清涼沁人"},
    {"id": 37, "name": "通草", "pinyin": "tongcao", "effect": "清熱利水", "season": "夏",
     "visual": "潔白輕盈的莖髓，如同凝固的泡沫",
     "sensation": "水道通暢，濕熱得以疏導",
     "aroma": "淡淡的清香，幾乎無味"},
    {"id": 38, "name": "薏苡仁", "pinyin": "yiyiren", "effect": "健脾祛濕", "season": "夏",
     "visual": "圓潤的乳白色種子，如同珍珠般飽滿",
     "sensation": "脾胃被健壯，濕氣逐漸消散",
     "aroma": "淡淡的穀物香，清新自然"},
    {"id": 39, "name": "龍眼肉", "pinyin": "longyanrou", "effect": "養血安神", "season": "夏",
     "visual": "飽滿的果肉，如同凝固的蜜糖",
     "sensation": "心神被溫柔地滋養，感到安定與滿足",
     "aroma": "甜美的果香，溫暖怡人"},
    {"id": 40, "name": "酸棗仁", "pinyin": "suanzaoren", "effect": "安神助眠", "season": "夏",
     "visual": "扁平的紅褐色種子，蘊含安眠的力量",
     "sensation": "心神逐漸平靜，如同夜幕降臨",
     "aroma": "淡淡的酸甜香，讓人放鬆"},
    {"id": 41, "name": "遠志", "pinyin": "yuanzhi", "effect": "開心益智", "season": "夏",
     "visual": "纖細的根條，蘊含著開啟智慧的力量",
     "sensation": "心竅被輕柔地打開，思緒變得清明",
     "aroma": "淡淡的藥香，帶有一絲苦味"},
    {"id": 42, "name": "柏子仁", "pinyin": "baiziren", "effect": "養心安神", "season": "夏",
     "visual": "油潤的種子，帶著松柏的常青力量",
     "sensation": "心神被深層滋養，安穩而持久",
     "aroma": "淡淡的松香，帶有油脂香"},
    
    # ===== 秋季養生 (43-54) =====
    {"id": 43, "name": "地黃", "pinyin": "dihuang", "effect": "滋陰養血", "season": "秋",
     "visual": "深黑的根莖，蘊含大地深處的精華",
     "sensation": "陰液被深層滋養，身體感到潤澤",
     "aroma": "甜美的藥香，帶有一絲土地氣息"},
    {"id": 44, "name": "阿膠", "pinyin": "ejiao", "effect": "補血滋陰", "season": "秋",
     "visual": "烏黑發亮的膠塊，如同凝固的血液精華",
     "sensation": "血液被深層滋養，肌膚變得潤澤",
     "aroma": "獨特的膠香，帶有甜味"},
    {"id": 45, "name": "何首烏", "pinyin": "heshouwu", "effect": "補肝腎益精血", "season": "秋",
     "visual": "紅褐色的塊根，帶著返老還童的傳說",
     "sensation": "肝腎被滋補，精氣神逐漸充盈",
     "aroma": "淡淡的藥香，帶有苦澀"},
    {"id": 46, "name": "桑椹", "pinyin": "sangshen", "effect": "滋陰補血", "season": "秋",
     "visual": "飽滿的紫黑色果實，如同夜空中的寶石",
     "sensation": "陰血被溫柔地滋養，身心感到滋潤",
     "aroma": "甜美的果香，帶有一絲酸味"},
    {"id": 47, "name": "合歡皮", "pinyin": "hehuanpi", "effect": "解鬱安神", "season": "秋",
     "visual": "淡紅色的樹皮，帶著合歡花的溫柔",
     "sensation": "憂鬱的情緒被溫柔地化解，心情逐漸開朗",
     "aroma": "淡淡的木香，帶有花香"},
    {"id": 48, "name": "夜交藤", "pinyin": "yejiaoteng", "effect": "養血安神", "season": "秋",
     "visual": "纏繞的藤蔓，如同夜間相交的思念",
     "sensation": "神經逐漸放鬆，準備迎接安穩的睡眠",
     "aroma": "淡淡的藥香，帶有一絲甜味"},
    {"id": 49, "name": "珍珠母", "pinyin": "zhenzhumu", "effect": "安神定驚", "season": "秋",
     "visual": "閃爍著虹彩的貝殼，如同月光下的海面",
     "sensation": "心神被溫柔地安撫，驚悸逐漸平息",
     "aroma": "淡淡的海洋氣息，清新而神秘"},
    {"id": 50, "name": "陳皮", "pinyin": "chenpi", "effect": "理氣健脾", "season": "秋",
     "visual": "金黃色的果皮，帶著歲月的芬芳",
     "sensation": "氣機順暢，脾胃感到舒適",
     "aroma": "濃郁的柑橘香，溫暖而醒脾"},
    {"id": 51, "name": "青皮", "pinyin": "qingpi", "effect": "疏肝破氣", "season": "秋",
     "visual": "青綠色的果皮，帶著年輕的活力",
     "sensation": "肝氣被有力地疏通，胸悶得以緩解",
     "aroma": "清新的柑橘香，帶有一絲苦味"},
    {"id": 52, "name": "枳實", "pinyin": "zhishi", "effect": "破氣消積", "season": "秋",
     "visual": "青綠色的幼果，帶著堅韌的力量",
     "sensation": "積滯的氣機被推動，腹部感到輕鬆",
     "aroma": "苦澀的柑橘香，帶有辛味"},
    {"id": 53, "name": "木香", "pinyin": "muxiang", "effect": "行氣止痛", "season": "秋",
     "visual": "深褐色的根片，散發著濃郁的香氣",
     "sensation": "氣機通暢，疼痛逐漸緩解",
     "aroma": "濃郁的木質香，帶有辛辣"},
    {"id": 54, "name": "烏藥", "pinyin": "wuyao", "effect": "順氣止痛", "season": "秋",
     "visual": "烏黑的根片，帶著溫暖的力量",
     "sensation": "氣機順暢，寒凝散開",
     "aroma": "淡淡的藥香，帶有辛味"},
]


# ============================================================================
# 生成冥想腳本
# ============================================================================

def generate_meditation_script(herb):
    """為每種草藥生成個性化的冥想腳本"""
    
    season_greetings = {
        "冬": "在這寧靜的冬日，讓我們一起進入這段溫暖的冥想。",
        "春": "在這生機盎然的春天，讓我們一起進入這段舒展的冥想。",
        "夏": "在這明媚的夏日，讓我們一起進入這段清涼的冥想。",
        "秋": "在這收穫的秋季，讓我們一起進入這段潤養的冥想。",
    }
    
    season_closings = {
        "冬": "帶著這份溫暖，繼續你的冬日時光。",
        "春": "帶著這份生機，迎接美好的春天。",
        "夏": "帶著這份清涼，度過舒適的夏日。",
        "秋": "帶著這份滋潤，享受豐收的季節。",
    }
    
    script = [
        # === 開場 ===
        (f"歡迎來到{herb['name']}觀想冥想。", 2),
        (season_greetings[herb['season']], 3),
        ("找一個舒適的姿勢，輕輕閉上眼睛。", 3),
        ("讓呼吸自然流動，不需要刻意控制。", 4),
        
        # === 進入觀想 ===
        ("現在，讓我們一起走進一座寧靜的草藥園。", 3),
        (f"在你的面前，出現了{herb['name']}。", 4),
        
        # === 視覺觀想 ===
        (f"仔細觀察它的樣子。{herb['visual']}。", 5),
        ("陽光輕柔地灑落，為它披上一層溫暖的光芒。", 5),
        
        # === 嗅覺觀想 ===
        ("深吸一口氣，感受它的氣息。", 3),
        (f"{herb['aroma']}。", 5),
        ("讓這股香氣緩緩進入你的身體。", 4),
        
        # === 能量觀想 ===
        (f"{herb['name']}的功效是{herb['effect']}。", 3),
        (f"想像它的能量開始流入你的身體。{herb['sensation']}。", 6),
        ("讓這股能量流向每一個需要滋養的地方。", 5),
        
        # === 身體掃描 ===
        ("從頭頂開始，讓這股能量緩緩向下流動。", 4),
        ("流過你的臉龐、頸部、肩膀。", 4),
        ("流過你的胸腔、腹部、背部。", 4),
        ("一路向下，流向你的四肢。", 5),
        ("每經過一處，都留下深層的滋養。", 5),
        
        # === 靜默空間 ===
        (f"現在，安靜地停留在{herb['name']}的能量中。", 3),
        ("讓它繼續滋養你的身心。", 3),
        ("", 20),
        
        # === 結束引導 ===
        ("慢慢地，讓這份觀想淡去。", 3),
        (f"但{herb['name']}的能量，已經融入你的身體。", 4),
        ("感覺你的呼吸，感覺此刻的寧靜。", 4),
        ("輕輕動一動手指和腳趾。", 3),
        ("準備好的時候，慢慢睜開眼睛。", 4),
        (season_closings[herb['season']], 5),
    ]
    
    return script


# ============================================================================
# 音頻生成函數
# ============================================================================

async def generate_speech(text: str, output_path: Path):
    """用 edge-tts 生成語音"""
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(str(output_path))


def create_silence(duration_sec: float, output_path: Path):
    """用 ffmpeg 生成靜音檔"""
    cmd = [
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", "anullsrc=r=24000:cl=mono",
        "-t", str(duration_sec),
        "-c:a", "libmp3lame", "-q:a", "2",
        str(output_path)
    ]
    subprocess.run(cmd, capture_output=True)


def concat_audio_files(file_list: list, output_path: Path):
    """用 ffmpeg 合併多個音頻檔"""
    list_file = TEMP_DIR / "filelist.txt"
    with open(list_file, "w", encoding="utf-8") as f:
        for file in file_list:
            safe_path = str(file.absolute()).replace("\\", "/")
            f.write(f"file '{safe_path}'\n")
    
    cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_file),
        "-c:a", "libmp3lame", "-q:a", "2",
        str(output_path)
    ]
    subprocess.run(cmd, capture_output=True)


def add_fade(input_path: Path, output_path: Path):
    """加入淡入淡出效果"""
    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-af", "afade=t=in:st=0:d=2,afade=t=out:st=178:d=5",
        "-c:a", "libmp3lame", "-q:a", "2",
        str(output_path)
    ]
    result = subprocess.run(cmd, capture_output=True)
    
    if result.returncode != 0:
        # 如果失敗，只加淡入
        cmd = [
            "ffmpeg", "-y", "-i", str(input_path),
            "-af", "afade=t=in:st=0:d=2",
            "-c:a", "libmp3lame", "-q:a", "2",
            str(output_path)
        ]
        subprocess.run(cmd, capture_output=True)


async def generate_herb_meditation(herb, progress_callback=None):
    """生成單個草藥的冥想音檔"""
    
    herb_temp_dir = TEMP_DIR / f"herb_{herb['id']:02d}"
    herb_temp_dir.mkdir(parents=True, exist_ok=True)
    
    script = generate_meditation_script(herb)
    audio_files = []
    segment_idx = 0
    
    for i, (text, pause) in enumerate(script):
        if progress_callback:
            progress_callback(i + 1, len(script))
        
        # 生成語音
        if text.strip():
            speech_file = herb_temp_dir / f"seg_{segment_idx:03d}_speech.mp3"
            await generate_speech(text, speech_file)
            audio_files.append(speech_file)
            segment_idx += 1
        
        # 生成停頓
        if pause > 0:
            silence_file = herb_temp_dir / f"seg_{segment_idx:03d}_silence.mp3"
            create_silence(pause, silence_file)
            audio_files.append(silence_file)
            segment_idx += 1
    
    # 合併
    temp_concat = herb_temp_dir / "concat.mp3"
    concat_audio_files(audio_files, temp_concat)
    
    # 淡入淡出
    output_filename = f"meditation_{herb['id']:02d}_{herb['pinyin']}.mp3"
    final_output = OUTPUT_DIR / output_filename
    add_fade(temp_concat, final_output)
    
    # 清理
    for f in herb_temp_dir.glob("*"):
        try:
            f.unlink()
        except:
            pass
    try:
        herb_temp_dir.rmdir()
    except:
        pass
    
    return final_output


# ============================================================================
# 主程式
# ============================================================================

async def main():
    parser = argparse.ArgumentParser(description='生成草藥冥想音檔')
    parser.add_argument('--start', type=int, default=1, help='起始編號 (1-54)')
    parser.add_argument('--end', type=int, default=54, help='結束編號 (1-54)')
    parser.add_argument('--herb', type=str, help='指定草藥名稱')
    args = parser.parse_args()
    
    print("=" * 70)
    print("[TCM] 正念日曆 - 54種草藥冥想音檔生成器")
    print("=" * 70)
    print(f"\n語音：{VOICE}")
    print(f"語速：{RATE}")
    print(f"輸出目錄：{OUTPUT_DIR}\n")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    
    # 確定要生成的草藥
    if args.herb:
        herbs_to_generate = [h for h in HERBS_DATABASE if h['name'] == args.herb]
        if not herbs_to_generate:
            print(f"[ERR] 找不到草藥：{args.herb}")
            return
    else:
        herbs_to_generate = [h for h in HERBS_DATABASE 
                           if args.start <= h['id'] <= args.end]
    
    total = len(herbs_to_generate)
    print(f"準備生成 {total} 個冥想音檔...\n")
    print("-" * 70)
    
    start_time = datetime.now()
    
    for idx, herb in enumerate(herbs_to_generate, 1):
        herb_start = datetime.now()
        print(f"\n[{idx}/{total}] [Herb] {herb['name']} ({herb['pinyin']}) - {herb['effect']}")
        
        def progress(current, total_segments):
            bar_len = 30
            filled = int(bar_len * current / total_segments)
            bar = "#" * filled + "-" * (bar_len - filled)
            print(f"\r    Progress: [{bar}] {current}/{total_segments}", end="", flush=True)
        
        try:
            output_file = await generate_herb_meditation(herb, progress)
            
            herb_time = (datetime.now() - herb_start).total_seconds()
            file_size = output_file.stat().st_size / 1024
            
            print(f"\n    [OK] 完成! ({herb_time:.1f}秒, {file_size:.0f}KB)")
            print(f"    [FILE] {output_file.name}")
            
        except Exception as e:
            print(f"\n    [FAIL]: {e}")
    
    # 清理總暫存目錄
    try:
        for f in TEMP_DIR.glob("*"):
            if f.is_file():
                f.unlink()
        TEMP_DIR.rmdir()
    except:
        pass
    
    total_time = (datetime.now() - start_time).total_seconds()
    
    print("\n" + "=" * 70)
    print("[DONE] 全部完成!")
    print("=" * 70)
    print(f"\n[Stats] 統計:")
    print(f"   - 生成數量: {total} 個音檔")
    print(f"   - 總耗時: {total_time/60:.1f} 分鐘")
    print(f"   - 平均每個: {total_time/total:.1f} 秒")
    print(f"\n[Output] 輸出目錄: {OUTPUT_DIR.absolute()}")


if __name__ == "__main__":
    asyncio.run(main())
