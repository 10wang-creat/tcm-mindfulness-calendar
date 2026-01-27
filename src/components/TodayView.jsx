import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Headphones, CheckCircle, ZoomIn, BookOpen, Coffee } from 'lucide-react';
import { useState } from 'react';
import { solarTermImages, herbImages, herbMeditations } from '../data/calendarData';
import MeditationPlayer from './MeditationPlayer';
import { useUserStats } from '../hooks/useUserStats';
import ImageLightbox from './ImageLightbox';
import ShareButton, { SHARE_TYPES } from './ShareButton';
import FavoriteButton from './FavoriteButton';

// 使用 Vite 的 BASE_URL 構建正確路徑
const getImagePath = (termName) => {
  const imagePath = solarTermImages[termName];
  if (!imagePath) return null;
  const cleanPath = imagePath.replace(/^\.\//, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

// 取得藥材圖片路徑
const getHerbImagePath = (herbName) => {
  const imagePath = herbImages[herbName];
  if (!imagePath) return null;
  const cleanPath = imagePath.replace(/^\.\//, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

// 取得冥想音檔路徑
const getMeditationPath = (herbName) => {
  const audioPath = herbMeditations[herbName];
  if (!audioPath) return null;
  const cleanPath = audioPath.replace(/^\.\//, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

// 藥材屬性顏色映射
const getHerbTags = (effect) => {
  const tags = [];
  if (effect.includes('補氣') || effect.includes('益氣')) tags.push({ label: '補氣', color: 'bg-orange-100 text-orange-600' });
  if (effect.includes('補血') || effect.includes('養血')) tags.push({ label: '補血', color: 'bg-red-100 text-red-600' });
  if (effect.includes('安神') || effect.includes('寧心')) tags.push({ label: '安神', color: 'bg-purple-100 text-purple-600' });
  if (effect.includes('活血') || effect.includes('化瘀')) tags.push({ label: '活血', color: 'bg-pink-100 text-pink-600' });
  if (effect.includes('清熱') || effect.includes('利濕')) tags.push({ label: '清熱', color: 'bg-blue-100 text-blue-600' });
  if (effect.includes('溫陽') || effect.includes('溫補')) tags.push({ label: '溫陽', color: 'bg-amber-100 text-amber-600' });
  if (effect.includes('滋陰')) tags.push({ label: '滋陰', color: 'bg-cyan-100 text-cyan-600' });
  if (tags.length === 0) tags.push({ label: '養生', color: 'bg-green-100 text-green-600' });
  return tags.slice(0, 2); // 最多顯示2個標籤
};

// 季節智慧語句
const seasonWisdom = {
  "春": { quote: "春生萬物，順應陽氣升發", tip: "宜早起活動，舒展筋骨，多吃清淡蔬菜。" },
  "夏": { quote: "夏養心神，清心寡欲保平安", tip: "宜午休養心，多食清涼瓜果，避免過度勞累。" },
  "秋": { quote: "秋收肺氣，滋陰潤燥保安康", tip: "宜早睡早起，多食滋潤食物，保持情緒平和。" },
  "冬": { quote: "冬藏精氣，養藏固本待來春", tip: "宜早睡晚起，保養腎氣，多喝溫水。" }
};

export default function TodayView({ todayInfo, onOpenCalendar }) {
  const [showFullMeditation, setShowFullMeditation] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [lightbox, setLightbox] = useState({ isOpen: false, src: '', alt: '', title: '', subtitle: '' });
  
  const { stats, recordMeditation, toggleFavoriteHerb, isFavorite } = useUserStats();

  const { herb, solarTerm, theme, seasonColor, meditation, dayOfYear, date } = todayInfo;
  const meditationSrc = getMeditationPath(herb.name);
  const herbTags = getHerbTags(herb.effect);
  const wisdom = seasonWisdom[solarTerm.season] || seasonWisdom["春"];
  
  // 檢查今日是否已完成冥想
  const isTodayCompleted = stats.lastMeditationDate === new Date().toDateString();
  
  // 冥想完成處理
  const handleMeditationComplete = (herbName, minutes) => {
    recordMeditation(herbName, minutes);
    setShowCompletionMessage(true);
    setTimeout(() => setShowCompletionMessage(false), 3000);
  };
  
  // 開啟圖片燈箱
  const openLightbox = (src, alt, title, subtitle) => {
    setLightbox({ isOpen: true, src, alt, title, subtitle });
  };
  
  // 關閉圖片燈箱
  const closeLightbox = () => {
    setLightbox({ ...lightbox, isOpen: false });
  };
  
  const formatDate = (d) => {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };
  
  const getWeekday = (d) => {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[d.getDay()];
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-4rem)]"
    >
      {/* 完成提示訊息 */}
      <AnimatePresence>
        {showCompletionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">冥想完成！已記錄到統計</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 沉浸式頭部區域 - 節氣主題 */}
      <div className="relative">
        <div className={`bg-gradient-to-br ${seasonColor.gradient} text-white px-4 pt-4 pb-24 rounded-b-3xl`}>
          {/* 日期資訊 */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white/70 text-sm">第 {dayOfYear} 天</p>
              <h1 className="text-2xl font-bold">{formatDate(date)}</h1>
              <p className="text-white/80">{getWeekday(date)}</p>
            </div>
            <div className="text-right">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm inline-block"
              >
                {solarTerm.season}季
              </motion.div>
            </div>
          </div>
          
          {/* 節氣特色區塊 */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/15 backdrop-blur-sm rounded-2xl p-4"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => openLightbox(
                  getImagePath(solarTerm.name),
                  solarTerm.name,
                  solarTerm.name,
                  `${solarTerm.season}季・${theme.theme}`
                )}
              >
                <img 
                  src={getImagePath(solarTerm.name)}
                  alt={solarTerm.name}
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-3xl">🌿</span>';
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-xs">節氣 Solar Term</p>
                <h2 className="text-xl font-bold">{solarTerm.name}</h2>
                <p className="text-white/80 text-sm">{theme.theme}</p>
              </div>
            </div>
          </motion.div>
          
          {/* 今日已完成標記 */}
          {isTodayCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 bg-green-400/30 backdrop-blur-sm border border-green-300/50 rounded-xl px-4 py-2 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">今日冥想已完成</span>
            </motion.div>
          )}
        </div>

        {/* 浮動藥材卡片 */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-20 left-4 right-4"
        >
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <p className="text-gray-400 text-xs mb-2">今日藥材 Today's Herb</p>
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer border-2 border-amber-100 group relative"
                onClick={() => openLightbox(
                  getHerbImagePath(herb.name),
                  herb.name,
                  herb.name,
                  herb.effect
                )}
              >
                <img 
                  src={getHerbImagePath(herb.name)}
                  alt={herb.name}
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-3xl">🌿</span>';
                  }}
                />
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-1">
                  <ZoomIn className="w-3 h-3 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-800">{herb.name}</h3>
                <p className="text-gray-500 text-sm truncate">{herb.effect}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {herbTags.map((tag, idx) => (
                    <span key={idx} className={`${tag.color} text-xs px-2 py-1 rounded-full`}>
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <FavoriteButton
                  herbName={herb.name}
                  isFavorite={isFavorite(herb.name)}
                  onToggle={toggleFavoriteHerb}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 內容區域 */}
      <div className="pt-24 px-4 pb-24">
        
        {/* 今日正念區塊 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <h3 className="text-gray-600 font-medium mb-3 flex items-center gap-2">
            <span>🧘</span> 今日正念
          </h3>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-800 font-medium leading-relaxed">
              「{wisdom.quote}」
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {wisdom.tip}
            </p>
          </div>
        </motion.div>

        {/* 冥想音頻播放器 */}
        {meditationSrc && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-4"
          >
            <button
              onClick={() => setShowAudioPlayer(!showAudioPlayer)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sage-100 to-terracotta-100 rounded-full flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-sage-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">{herb.name}・觀想冥想</p>
                  <p className="text-xs text-gray-400">聆聽引導音頻</p>
                </div>
              </div>
              <motion.div animate={{ rotate: showAudioPlayer ? 180 : 0 }}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showAudioPlayer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3">
                    <MeditationPlayer
                      herbName={herb.name}
                      audioSrc={meditationSrc}
                      herbEffect={herb.effect}
                      seasonColor={seasonColor}
                      onComplete={handleMeditationComplete}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 冥想文字 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 shadow-sm cursor-pointer mb-4"
          onClick={() => setShowFullMeditation(!showFullMeditation)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 冥想導引文
            </span>
            <motion.div animate={{ rotate: showFullMeditation ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </div>
          <AnimatePresence mode="wait">
            {showFullMeditation ? (
              <motion.p
                key="full"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-gray-700 whitespace-pre-line leading-relaxed text-sm"
              >
                {meditation}
              </motion.p>
            ) : (
              <motion.p
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-700 line-clamp-2 text-sm"
              >
                {meditation.split('\n').slice(0, 2).join('\n')}...
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 快捷操作區 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Coffee className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-sm text-gray-700 font-medium">養生茶飲</p>
            <p className="text-xs text-gray-400">推薦配方</p>
          </div>
          <div 
            className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={onOpenCalendar}
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-700 font-medium">瀏覽日曆</p>
            <p className="text-xs text-gray-400">探索更多</p>
          </div>
        </motion.div>

        {/* 分享按鈕區 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3"
        >
          <ShareButton
            type={SHARE_TYPES.HERB}
            herbName={herb.name}
            herbEffect={herb.effect}
            herbImage={getHerbImagePath(herb.name)}
            solarTermName={solarTerm.name}
          />
          {isTodayCompleted && (
            <ShareButton
              type={SHARE_TYPES.MEDITATION}
              herbName={herb.name}
              herbEffect={herb.effect}
              herbImage={getHerbImagePath(herb.name)}
              solarTermName={solarTerm.name}
              streakDays={stats.currentStreak}
              className="bg-green-100 hover:bg-green-200"
            />
          )}
        </motion.div>
      </div>
      
      {/* 圖片燈箱 */}
      <ImageLightbox
        isOpen={lightbox.isOpen}
        onClose={closeLightbox}
        imageSrc={lightbox.src}
        imageAlt={lightbox.alt}
        title={lightbox.title}
        subtitle={lightbox.subtitle}
      />
    </motion.div>
  );
}
