import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TodayView({ todayInfo, onOpenCalendar }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
  const [showFullMeditation, setShowFullMeditation] = useState(false);

  // 呼吸引導計時器
  useEffect(() => {
    if (!isPlaying) return;
    
    const phases = [
      { name: 'inhale', duration: 4000 },
      { name: 'hold', duration: 4000 },
      { name: 'exhale', duration: 6000 }
    ];
    
    let currentIndex = 0;
    
    const cycle = () => {
      setBreathPhase(phases[currentIndex].name);
      currentIndex = (currentIndex + 1) % phases.length;
    };
    
    cycle();
    const interval = setInterval(() => {
      cycle();
    }, phases.reduce((sum, p) => sum + p.duration, 0) / 3);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  const { herb, solarTerm, theme, seasonColor, meditation, dayOfYear, date } = todayInfo;
  
  const formatDate = (d) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return d.toLocaleDateString('zh-TW', options);
  };

  const breathText = {
    inhale: '吸氣',
    hold: '屏息',
    exhale: '呼氣'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* 日期與節氣區 */}
      <div className="text-center py-6 px-4">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 mb-1"
        >
          第 {dayOfYear} 天
        </motion.p>
        <h2 className="text-xl font-serif text-gray-800 mb-2">
          {formatDate(date)}
        </h2>
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
          className={`h-48 bg-gradient-to-br ${seasonColor.bg} flex items-center justify-center relative overflow-hidden`}
        >
          <motion.div
            animate={isPlaying ? {
              scale: breathPhase === 'inhale' ? 1.2 : breathPhase === 'hold' ? 1.2 : 1,
            } : {}}
            transition={{ duration: breathPhase === 'exhale' ? 6 : 4, ease: "easeInOut" }}
            className="relative z-10"
          >
            <div className="w-32 h-32 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <img 
                src={`/herbs/${herb.id}.png`}
                alt={herb.name}
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-24 h-24 items-center justify-center text-4xl">
                🌿
              </div>
            </div>
          </motion.div>

          {/* 呼吸引導文字 */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-4 left-0 right-0 text-center"
              >
                <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-gray-700 font-medium">
                  {breathText[breathPhase]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 藥材資訊 */}
        <div className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-3xl font-serif font-bold text-gray-800 mb-1">
              {herb.name}
            </h3>
            <p className="text-lg text-gray-600">{herb.effect}</p>
          </div>

          {/* 播放控制 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                isPlaying 
                  ? 'bg-gray-800 text-white' 
                  : `bg-gradient-to-r ${seasonColor.bg.replace('from-', 'from-').replace('-50', '-500').replace('-100', '-400')} text-white`
              }`}
              style={!isPlaying ? { background: `linear-gradient(135deg, ${seasonColor.primary}, ${seasonColor.secondary})` } : {}}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </motion.button>
            
            {isPlaying && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5 text-gray-600" />
              </motion.button>
            )}
          </div>

          {/* 冥想文字 */}
          <motion.div 
            className="bg-gray-50 rounded-xl p-4 cursor-pointer"
            onClick={() => setShowFullMeditation(!showFullMeditation)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">今日冥想</span>
              <motion.div
                animate={{ rotate: showFullMeditation ? 180 : 0 }}
              >
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
