import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarView({ 
  calendarDays, 
  selectedDate, 
  monthSolarTerms,
  onSelectDate, 
  onPrevMonth, 
  onNextMonth, 
  onGoToToday 
}) {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  const monthName = selectedDate.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long' 
  });

  const seasonColors = {
    "春": { bg: "bg-green-50", dot: "bg-green-500", text: "text-green-700" },
    "夏": { bg: "bg-red-50", dot: "bg-red-500", text: "text-red-700" },
    "秋": { bg: "bg-orange-50", dot: "bg-orange-500", text: "text-orange-700" },
    "冬": { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-700" }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6"
    >
      {/* 月份導航 */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onPrevMonth}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </motion.button>
        
        <div className="text-center">
          <h2 className="text-xl font-serif font-bold text-gray-800">{monthName}</h2>
          {monthSolarTerms.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-1">
              {monthSolarTerms.map(term => (
                <span 
                  key={term.name}
                  className={`text-xs px-2 py-0.5 rounded-full ${seasonColors[term.season]?.bg} ${seasonColors[term.season]?.text}`}
                >
                  {term.name} ({new Date(term.date).getDate()}日)
                </span>
              ))}
            </div>
          )}
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onNextMonth}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>

      {/* 回到今天按鈕 */}
      <div className="flex justify-center mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onGoToToday}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full text-sm"
        >
          <CalendarIcon className="w-4 h-4" />
          今天
        </motion.button>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const season = day.solarTerm?.season || "春";
          const colors = seasonColors[season] || seasonColors["春"];
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          
          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectDate(day.date)}
              className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center
                transition-all duration-200
                ${!day.isCurrentMonth ? 'opacity-30' : ''}
                ${day.isSelected ? `${colors.bg} ring-2 ring-offset-1` : 'hover:bg-gray-50'}
                ${day.isToday ? 'ring-2 ring-gray-300' : ''}
              `}
              style={day.isSelected ? { ringColor: colors.dot.replace('bg-', '#').replace('-500', '') } : {}}
            >
              <span className={`
                text-sm font-medium
                ${day.isSelected ? colors.text : ''}
                ${!day.isSelected && isWeekend ? (index % 7 === 0 ? 'text-red-400' : 'text-blue-400') : ''}
                ${!day.isSelected && !isWeekend ? 'text-gray-700' : ''}
              `}>
                {day.date.getDate()}
              </span>
              
              {/* 藥材指示點 */}
              <div 
                className={`w-1.5 h-1.5 rounded-full mt-0.5 ${colors.dot}`}
                title={day.herb?.name || ''}
              />
              
              {/* 節氣標記 */}
              {monthSolarTerms.some(t => 
                new Date(t.date).getDate() === day.date.getDate() && 
                day.isCurrentMonth
              ) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* 圖例 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium text-gray-600 mb-3">季節顏色</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(seasonColors).map(([season, colors]) => (
            <div key={season} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
              <span className="text-sm text-gray-600">{season}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-sm text-gray-600">節氣</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
