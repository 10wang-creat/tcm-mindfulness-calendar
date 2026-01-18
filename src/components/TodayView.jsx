import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Headphones, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { solarTermImages, herbImages, herbMeditations } from '../data/calendarData';
import MeditationPlayer from './MeditationPlayer';
import { useUserStats } from '../hooks/useUserStats';

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

export default function TodayView({ todayInfo, onOpenCalendar }) {
  const [showFullMeditation, setShowFullMeditation] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  
  const { stats, recordMeditation } = useUserStats();

  const { herb, solarTerm, theme, seasonColor, meditation, dayOfYear, date } = todayInfo;
  const meditationSrc = getMeditationPath(herb.name);
  
  // 檢查今日是否已完成冥想
  const isTodayCompleted = stats.lastMeditationDate === new Date().toDateString();
  
  // 冥想完成處理
  const handleMeditationComplete = (herbName, minutes) => {
    recordMeditation(herbName, minutes);
    setShowCompletionMessage(true);
    setTimeout(() => setShowCompletionMessage(false), 3000);
  };
  
  const formatDate = (d) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return d.toLocaleDateString('zh-TW', options);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-8rem)] flex flex-col"
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
      
      {/* 今日已完成標記 */}
      {isTodayCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 mt-2 mb-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">今日冥想已完成</span>
        </motion.div>
      )}
      {/* 日期與節氣區 */}
      <div className="text-center py-6 px-4">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 mb-1"
        >
          第 {dayOfYear} 天
        </motion.p>
        <h2 className="text-xl font-serif text-gray-800 mb-3">
          {formatDate(date)}
        </h2>
        
        {/* 節氣圖騰 */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-3"
        >
          <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-cream-50">
            <img 
              src={getImagePath(solarTerm.name)}
              alt={solarTerm.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage-50 to-sage-100 text-3xl">🌱</div>';
              }}
            />
          </div>
        </motion.div>
        
        <div className="flex items-center justify-center gap-3">
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: theme.color }}
          >
            {solarTerm.name}
          </span>
          <span className="text-sm text-gray-600">{theme.theme}</span>
        </div>
      </div>

      {/* 今日藥材卡片 */}
      <motion.div 
        className="mx-4 bg-white rounded-2xl shadow-lg overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* 藥材圖片區 */}
        <div 
          className={`h-56 bg-gradient-to-br ${seasonColor.bg} flex items-center justify-center relative overflow-hidden`}
        >
          <div className="relative z-10">
            <div className="w-44 h-44 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
              <img 
                src={getHerbImagePath(herb.name)}
                alt={herb.name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl">🌿</div>';
                }}
              />
            </div>
          </div>
        </div>

        {/* 藥材資訊 */}
        <div className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-3xl font-serif font-bold text-gray-800 mb-1">
              {herb.name}
            </h3>
            <p className="text-lg text-gray-600">{herb.effect}</p>
          </div>

          {/* 冥想音頻播放器切換按鈕 */}
          {meditationSrc && (
            <div className="mb-4">
              <button
                onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-sage-50 to-terracotta-50 rounded-xl hover:from-sage-100 hover:to-terracotta-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-sage-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {herb.name}・觀想冥想音頻
                  </span>
                </div>
                <motion.div animate={{ rotate: showAudioPlayer ? 180 : 0 }}>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.div>
              </button>

              {/* 展開的音頻播放器 */}
              <AnimatePresence>
                {showAudioPlayer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
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
            </div>
          )}

          {/* 冥想文字 */}
          <motion.div 
            className="bg-gray-50 rounded-xl p-4 cursor-pointer"
            onClick={() => setShowFullMeditation(!showFullMeditation)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">今日冥想</span>
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
                  className="text-gray-700 whitespace-pre-line leading-relaxed"
                >
                  {meditation}
                </motion.p>
              ) : (
                <motion.p
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-700 line-clamp-3"
                >
                  {meditation.split('\n').slice(0, 3).join('\n')}...
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* 查看日曆按鈕 */}
      <div className="flex-1 flex items-end justify-center pb-6 pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCalendar}
          className="px-6 py-3 bg-gray-800 text-white rounded-full text-sm font-medium shadow-lg"
        >
          查看完整日曆
        </motion.button>
      </div>
    </motion.div>
  );
}
