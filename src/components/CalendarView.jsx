import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { herbImages } from '../data/calendarData';

// 藥材 emoji 映射
const herbEmojis = {
  "補氣": "🌿",
  "補血": "🔴",
  "活血": "🌸",
  "安神": "💜",
  "清熱": "💧",
  "滋陰": "🫧",
  "理氣": "🌾",
  "健脾": "🟡",
  "default": "🌱"
};

// 根據藥材功效取得 emoji
const getHerbEmoji = (herb) => {
  if (!herb?.effect) return herbEmojis.default;
  if (herb.effect.includes('補氣') || herb.effect.includes('益氣')) return herbEmojis['補氣'];
  if (herb.effect.includes('補血') || herb.effect.includes('養血')) return herbEmojis['補血'];
  if (herb.effect.includes('活血') || herb.effect.includes('化瘀')) return herbEmojis['活血'];
  if (herb.effect.includes('安神') || herb.effect.includes('寧心')) return herbEmojis['安神'];
  if (herb.effect.includes('清熱') || herb.effect.includes('利濕')) return herbEmojis['清熱'];
  if (herb.effect.includes('滋陰')) return herbEmojis['滋陰'];
  if (herb.effect.includes('理氣')) return herbEmojis['理氣'];
  if (herb.effect.includes('健脾')) return herbEmojis['健脾'];
  return herbEmojis.default;
};

// 取得藥材圖片路徑
const getHerbImagePath = (herbName) => {
  const imagePath = herbImages[herbName];
  if (!imagePath) return null;
  const cleanPath = imagePath.replace(/^\.\//, '');
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

export default function CalendarView({ 
  calendarDays, 
  selectedDate, 
  monthSolarTerms,
  onSelectDate, 
  onPrevMonth, 
  onNextMonth, 
  onGoToToday 
}) {
  const [viewMode, setViewMode] = useState('month'); // month or week
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  const monthName = selectedDate.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long' 
  });

  // 取得當前季節
  const getCurrentSeason = () => {
    const month = selectedDate.getMonth() + 1;
    if (month >= 3 && month <= 5) return { name: '春', theme: '生發' };
    if (month >= 6 && month <= 8) return { name: '夏', theme: '養長' };
    if (month >= 9 && month <= 11) return { name: '秋', theme: '收斂' };
    return { name: '冬', theme: '養藏' };
  };

  const season = getCurrentSeason();

  const seasonColors = {
    "春": { bg: "bg-green-50", dot: "bg-green-500", text: "text-green-700", gradient: "from-green-600 to-emerald-600" },
    "夏": { bg: "bg-red-50", dot: "bg-red-500", text: "text-red-700", gradient: "from-red-500 to-orange-500" },
    "秋": { bg: "bg-orange-50", dot: "bg-orange-500", text: "text-orange-700", gradient: "from-amber-500 to-orange-500" },
    "冬": { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-700", gradient: "from-teal-600 to-blue-600" }
  };

  // 找到當前選中日期的藥材資料
  const selectedDayData = useMemo(() => {
    return calendarDays.find(day => 
      day.date.getDate() === selectedDate.getDate() && 
      day.isCurrentMonth
    );
  }, [calendarDays, selectedDate]);

  // 檢查是否是節氣日
  const getTermForDay = (day) => {
    if (!day.isCurrentMonth) return null;
    return monthSolarTerms.find(t => 
      new Date(t.date).getDate() === day.date.getDate()
    );
  };

  // 週視圖的日期過濾
  const displayDays = useMemo(() => {
    if (viewMode === 'month') return calendarDays;
    
    // 找到選中日期所在的那一週
    const selectedIndex = calendarDays.findIndex(d => 
      d.date.getDate() === selectedDate.getDate() && d.isCurrentMonth
    );
    const weekStart = Math.floor(selectedIndex / 7) * 7;
    return calendarDays.slice(weekStart, weekStart + 7);
  }, [calendarDays, selectedDate, viewMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-4rem)]"
    >
      {/* 沉浸式頭部區域 */}
      <div className={`bg-gradient-to-r ${seasonColors[season.name]?.gradient || seasonColors['冬'].gradient} text-white px-4 py-5 rounded-b-3xl`}>
        {/* 月份導航 */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPrevMonth}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold">{monthName}</h1>
            <p className="text-white/70 text-sm">{season.name}季 · {season.theme}</p>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onNextMonth}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 節氣標籤 */}
        {monthSolarTerms.length > 0 && (
          <div className="flex gap-2 justify-center">
            {monthSolarTerms.map(term => (
              <div 
                key={term.name}
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs flex items-center gap-1.5"
              >
                <span className={`w-2 h-2 rounded-full ${
                  term.season === '春' ? 'bg-green-300' :
                  term.season === '夏' ? 'bg-red-300' :
                  term.season === '秋' ? 'bg-orange-300' :
                  'bg-blue-300'
                }`}></span>
                {term.name} {new Date(term.date).getDate()}日
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 視圖切換與今天按鈕 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('month')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
              viewMode === 'month' 
                ? 'bg-white shadow-sm text-teal-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            月
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
              viewMode === 'week' 
                ? 'bg-white shadow-sm text-teal-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            週
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onGoToToday}
          className="bg-teal-600 text-white px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-sm hover:bg-teal-700 transition-colors"
        >
          <CalendarIcon className="w-4 h-4" />
          今天
        </motion.button>
      </div>

      {/* 日曆區域 */}
      <div className="px-4">
        {/* 星期標題 */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day, index) => (
            <div 
              key={day} 
              className={`text-center text-xs font-medium py-2 ${
                index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期格子 */}
        <div className={`grid grid-cols-7 gap-1 ${viewMode === 'week' ? 'mb-4' : ''}`}>
          {displayDays.map((day, index) => {
            const daySeasonColors = seasonColors[day.solarTerm?.season] || seasonColors[season.name];
            const isWeekend = index % 7 === 0 || index % 7 === 6;
            const term = getTermForDay(day);
            const isSolarTermDay = !!term;
            const herbEmoji = day.herb ? getHerbEmoji(day.herb) : null;
            
            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectDate(day.date)}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center
                  transition-all duration-200
                  ${!day.isCurrentMonth ? 'opacity-30' : ''}
                  ${day.isSelected ? 'bg-teal-600 text-white shadow-lg scale-105' : 'bg-white hover:bg-gray-50'}
                  ${isSolarTermDay && !day.isSelected ? 'ring-2 ring-offset-1 ring-blue-400' : ''}
                  ${day.isToday && !day.isSelected ? 'ring-2 ring-gray-300' : ''}
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${day.isSelected ? 'text-white' : ''}
                  ${!day.isSelected && day.isToday ? 'text-teal-600 font-bold' : ''}
                  ${!day.isSelected && !day.isToday && isWeekend ? (index % 7 === 0 ? 'text-red-400' : 'text-blue-400') : ''}
                  ${!day.isSelected && !day.isToday && !isWeekend ? 'text-gray-700' : ''}
                `}>
                  {day.date.getDate()}
                </span>
                
                {/* 藥材 emoji 指示 */}
                {herbEmoji && day.isCurrentMonth && (
                  <span className={`text-[10px] mt-0.5 ${day.isSelected ? 'opacity-80' : ''}`}>
                    {herbEmoji}
                  </span>
                )}

                {/* 節氣標記 */}
                {isSolarTermDay && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    day.isSelected ? 'bg-white text-teal-600' : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    節
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 選中日期詳情卡片 */}
      <AnimatePresence mode="wait">
        {selectedDayData && (
          <motion.div
            key={selectedDate.toDateString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 mt-4 pb-24"
          >
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-xs">已選日期</p>
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                  </h3>
                </div>
                {(() => {
                  const term = monthSolarTerms.find(t => 
                    new Date(t.date).getDate() === selectedDate.getDate()
                  );
                  return term ? (
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {term.name}
                    </span>
                  ) : null;
                })()}
              </div>
              
              {selectedDayData.herb ? (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                    {getHerbImagePath(selectedDayData.herb.name) ? (
                      <img 
                        src={getHerbImagePath(selectedDayData.herb.name)}
                        alt={selectedDayData.herb.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-2xl">${getHerbEmoji(selectedDayData.herb)}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{getHerbEmoji(selectedDayData.herb)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{selectedDayData.herb.name}</p>
                    <p className="text-gray-500 text-sm">{selectedDayData.herb.effect}</p>
                  </div>
                  <div className="text-gray-400">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">此日尚無藥材資料</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 圖例 */}
      <div className="px-4 mt-2 mb-24">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">📖 日曆圖例</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-600 rounded-lg shadow-sm"></div>
              <span className="text-gray-600">已選日期</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-lg ring-2 ring-blue-400 ring-offset-1"></div>
              <span className="text-gray-600">節氣日</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px]">🌿</div>
              <span className="text-gray-600">有藥材資料</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px] font-bold text-yellow-900">節</div>
              <span className="text-gray-600">節氣標記</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
